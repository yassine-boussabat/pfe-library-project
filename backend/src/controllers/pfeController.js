const PFEBook = require('../models/PFEBook');
const googleDriveService = require('../services/googleDriveService');
const localAiService = require('../services/localAiService');
const thumbnailService = require('../services/thumbnailService');

const syncFromGoogleDrive = async (req, res) => {
  if (!googleDriveService.isEnabled) {
    return res.status(400).json({ error: 'Google Drive service not available. Check your credentials.' });
  }

  const files = await googleDriveService.listPDFFiles();
  let processed = 0;
  let errors = 0;
  let skipped = 0;
  const BATCH_SIZE = 3;

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (file) => {
      try {
        const existing = await PFEBook.findOne({ googleDriveId: file.id });
        if (existing) {
          return { type: 'skipped', file: file.name };
        }

        const pdfStream = await googleDriveService.downloadFile(file.id);
        const chunks = [];
        pdfStream.on('data', chunk => chunks.push(chunk));
        await new Promise((resolve, reject) => {
          pdfStream.on('end', resolve);
          pdfStream.on('error', reject);
        });
        const pdfBuffer = Buffer.concat(chunks);

        let text = '';
        try {
          const textPromise = localAiService.extractTextFromPDF(pdfBuffer);
          text = await Promise.race([
            textPromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Text extraction timeout')), 20000)
            )
          ]);
        } catch {
          text = 'Text extraction failed';
        }

        const aiResult = await localAiService.generateSummaryAndKeywords(text, file.name);

        const bookData = {
          googleDriveId: file.id,
          title: file.name.replace('.pdf', ''),
          author: aiResult.author || 'Unknown Author',
          year: aiResult.year || new Date().getFullYear(),
          department: aiResult.department || 'Informatique',
          summary: aiResult.summary || 'No summary available',
          keywords: aiResult.keywords || ['Informatique'],
          thumbnailPath: null,
          downloadUrl: googleDriveService.getDownloadUrl(file.id),
          fileSize: parseInt(file.size) || 0,
          lastModified: new Date(file.modifiedTime)
        };

        const pfeBook = new PFEBook(bookData);
        const savedBook = await pfeBook.save();

        setImmediate(async () => {
          try {
            if (file.thumbnailLink) {
              const localThumbnailPath = await thumbnailService.downloadAndSaveGoogleThumbnail(
                file.thumbnailLink,
                file.id
              );
              if (localThumbnailPath) {
                await PFEBook.findByIdAndUpdate(savedBook._id, { thumbnailPath: localThumbnailPath });
              }
            }
          } catch {}
        });

        return { type: 'processed', file: file.name };
      } catch {
        return { type: 'error', file: file.name };
      }
    });

    const batchResults = await Promise.all(batchPromises);

    batchResults.forEach(result => {
      switch (result.type) {
        case 'processed': processed++; break;
        case 'skipped': skipped++; break;
        case 'error': errors++; break;
      }
    });

    if (i + BATCH_SIZE < files.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  res.json({
    message: `Sync completed successfully! ${processed} processed, ${skipped} skipped, ${errors} errors`,
    total: files.length,
    processed,
    skipped,
    errors,
    successRate: ((processed / files.length) * 100).toFixed(1) + '%'
  });
};

const fixThumbnails = async (req, res) => {
  const booksToFix = await PFEBook.find({
    $or: [
      { thumbnailPath: { $regex: /googleusercontent\.com/ } },
      { thumbnailPath: null },
      { thumbnailPath: { $exists: false } },
      { thumbnailPath: '' }
    ]
  });

  let fixed = 0;
  const allFiles = await googleDriveService.listPDFFiles();

  for (const book of booksToFix) {
    try {
      const driveFile = allFiles.find(f => f.id === book.googleDriveId);
      if (driveFile && driveFile.thumbnailLink) {
        const localThumbnailPath = await thumbnailService.downloadAndSaveGoogleThumbnail(
          driveFile.thumbnailLink,
          book.googleDriveId
        );
        if (localThumbnailPath) {
          await PFEBook.findByIdAndUpdate(book._id, { thumbnailPath: localThumbnailPath });
          fixed++;
        }
      }
    } catch {}
  }

  res.json({
    success: true,
    message: `Downloaded and saved ${fixed} thumbnails locally`,
    fixed,
    total: booksToFix.length
  });
};

const getAllBooks = async (req, res) => {
  const { search, department, year, keywords } = req.query;
  let query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } }
    ];
  }

  if (department) {
    query.department = { $regex: department, $options: 'i' };
  }

  if (year) {
    query.year = parseInt(year);
  }

  if (keywords) {
    const keywordArray = keywords.split(',').map(k => k.trim());
    query.keywords = { $in: keywordArray };
  }

  const books = await PFEBook.find(query).sort({ createdAt: -1 });
  res.json(books);
};

const getFilters = async (req, res) => {
  const allDepartments = [
    'Informatique',
    'Génie Électrique',
    'Génie Mécanique',
    'Génie Civil',
    'Sciences des Données',
    'Gestion et Administration',
    'Télécommunications'
  ];

  const [years, keywords] = await Promise.all([
    PFEBook.distinct('year'),
    PFEBook.distinct('keywords')
  ]);

  res.json({
    departments: allDepartments,
    years: years.sort((a, b) => b - a),
    keywords: keywords.filter(k => k)
  });
};

const getBookById = async (req, res) => {
  const book = await PFEBook.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
};

module.exports = {
  syncFromGoogleDrive,
  fixThumbnails,
  getAllBooks,
  getFilters,
  getBookById
};

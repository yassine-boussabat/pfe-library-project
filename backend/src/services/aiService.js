const pdf = require('pdf-parse');

class AIService {
  async extractTextFromPDF(pdfBuffer) {
    try {
      const data = await pdf(pdfBuffer);
      return data.text;
    } catch (error) {
      return 'PDF text extraction failed';
    }
  }

  async generateSummaryAndKeywords(text, filename = '') {
    try {
      const filenameInfo = this.extractInfoFromFilename(filename);
      const subject = this.extractSubject(text);
      const department = this.extractDepartment(text);
      const keywords = this.extractKeywords(text);
      
      return { 
        summary: subject || 'No subject found in document',
        keywords,
        department: department || 'Computer Science',
        author: filenameInfo.author,
        year: filenameInfo.year
      };
    } catch (error) {
      return {
        summary: "Final year project documentation",
        keywords: ["Computer Science", "Final Project"],
        department: "Computer Science",
        author: "Unknown Author",
        year: 2025
      };
    }
  }

  extractInfoFromFilename(filename) {
    let author = 'Unknown Author';
    let year = 2025;

    try {
      const cleanName = filename.replace(/\.pdf$/i, '').trim();
      const yearAuthorPattern = /(\d{4})\s*-\s*(.+)$/i;
      const match = cleanName.match(yearAuthorPattern);
      
      if (match) {
        year = parseInt(match[1]) || 2025;
        author = match[2].trim();
        
        if (author) {
          author = author
            .replace(/[^\w\s\-'.,]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (author.length > 0) {
            author = author
              .split(' ')
              .map(word => {
                if (word.length > 0) {
                  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
                return word;
              })
              .join(' ');
          }
        }
      }
    } catch (error) {
    }

    return { author, year };
  }

  extractSubject(text) {
    try {
      const textLines = text.split('\n');
      let subject = '';

      const subjectPatterns = [
        /sujet\s*:(.+)/i,
        /subject\s*:(.+)/i,
        /titre\s*:(.+)/i,
        /title\s*:(.+)/i,
        /projet\s*:(.+)/i,
        /project\s*:(.+)/i,
        /thème\s*:(.+)/i,
        /theme\s*:(.+)/i
      ];

      for (const line of textLines) {
        for (const pattern of subjectPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            subject = match[1].trim();
            
            subject = subject
              .replace(/[^\w\s\-.,()]/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            
            if (subject.length > 200) {
              const sentences = subject.split(/[.!?]+/);
              subject = sentences[0].trim() + (sentences.length > 1 ? '.' : '');
            }
            
            if (subject.length > 10) {
              return subject;
            }
          }
        }
      }

      const firstParagraphs = textLines.slice(0, 50).join(' ');
      const sentences = firstParagraphs.split(/[.!?]+/);
      
      for (const sentence of sentences) {
        if (sentence.length > 50 && sentence.length < 300) {
          if (sentence.toLowerCase().includes('projet') || 
              sentence.toLowerCase().includes('étude') ||
              sentence.toLowerCase().includes('développement') ||
              sentence.toLowerCase().includes('system') ||
              sentence.toLowerCase().includes('application')) {
            subject = sentence.trim();
            return subject;
          }
        }
      }
    } catch (error) {
    }

    return 'sujet de project non spécifié , voir le pdf pour plus de détails';
  }

  extractDepartment(text) {
    const textLower = text.toLowerCase();
    
    const departmentMap = {
      'Computer Science': [
        'informatique', 'computer science', 'software', 'programming', 
        'développement', 'web', 'mobile', 'application', 'système',
        'database', 'réseau', 'network', 'intelligence artificielle',
        'machine learning', 'data science', 'cybersécurité', 'sécurité'
      ],
      'Electrical Engineering': [
        'électrique', 'electrical', 'électronique', 'electronic',
        'circuit', 'automation', 'automatisation', 'robotique', 'robot'
      ],
      'Mechanical Engineering': [
        'mécanique', 'mechanical', 'industriel', 'industrial',
        'fabrication', 'manufacturing', 'production'
      ],
      'Civil Engineering': [
        'civil', 'construction', 'bâtiment', 'génie civil',
        'infrastructure', 'travaux publics'
      ],
      'Business Administration': [
        'gestion', 'management', 'business', 'économie', 'finance',
        'marketing', 'administration', 'commerce'
      ],
      'Telecommunications': [
        'télécommunication', 'telecommunication', 'communication',
        'signal', 'wireless', 'radio', '5g', '4g', 'antenna'
      ]
    };

    let bestMatch = 'Computer Science';
    let maxScore = 0;

    for (const [department, keywords] of Object.entries(departmentMap)) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, 'gi');
        const matches = textLower.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = department;
      }
    }

    return bestMatch;
  }

  extractKeywords(text) {
    const textLower = text.toLowerCase();
    const foundKeywords = new Set();

    const keywordMap = {
      'JavaScript': ['javascript', 'js', 'node.js', 'nodejs', 'react', 'vue', 'angular'],
      'Python': ['python', 'django', 'flask', 'pandas', 'numpy'],
      'Java': ['java', 'spring', 'hibernate'],
      'PHP': ['php', 'laravel', 'symfony'],
      'C#': ['c#', 'csharp', '.net', 'asp.net'],
      'C++': ['c++', 'cpp'],
      
      'Web Development': ['web', 'website', 'html', 'css', 'frontend', 'backend'],
      'Mobile Development': ['mobile', 'android', 'ios', 'app', 'flutter', 'react native'],
      'Machine Learning': ['machine learning', 'ml', 'ai', 'intelligence artificielle', 'neural network', 'deep learning'],
      'Data Science': ['data science', 'analytics', 'big data', 'data mining', 'visualization'],
      'Database': ['database', 'mysql', 'postgresql', 'mongodb', 'sql', 'nosql'],
      'Security': ['security', 'sécurité', 'cybersécurité', 'encryption', 'authentication'],
      'Cloud Computing': ['cloud', 'aws', 'azure', 'google cloud', 'docker', 'kubernetes'],
      'IoT': ['iot', 'internet of things', 'sensor', 'arduino', 'raspberry pi'],
      'Blockchain': ['blockchain', 'cryptocurrency', 'bitcoin', 'smart contract'],
      'Game Development': ['game', 'gaming', 'unity', 'unreal', 'jeu'],
      
      'E-commerce': ['e-commerce', 'ecommerce', 'online shop', 'boutique en ligne'],
      'Healthcare': ['healthcare', 'medical', 'santé', 'hospital', 'patient'],
      'Education': ['education', 'learning', 'école', 'université', 'student'],
      'Finance': ['finance', 'banking', 'payment', 'fintech'],
      'Logistics': ['logistics', 'supply chain', 'inventory', 'warehouse']
    };

    for (const [category, terms] of Object.entries(keywordMap)) {
      for (const term of terms) {
        if (textLower.includes(term.toLowerCase())) {
          foundKeywords.add(category);
          break;
        }
      }
    }

    const result = Array.from(foundKeywords).slice(0, 8);
    
    return result.length > 0 ? result : ['Computer Science', 'Final Project'];
  }

  extractMetadataFromText(text) {
    return {
      author: 'Unknown Author',
      department: 'Computer Science',
      year: 2025
    };
  }
}

module.exports = new AIService();

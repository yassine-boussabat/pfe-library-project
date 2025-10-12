# PFE Book Showcase Website

A modern web application for showcasing Final Year Project (PFE) books with AI-powered content analysis and search capabilities.

## Features

- **Beautiful Card-Based Display**: Each PFE book is displayed as an elegant card with thumbnail, description, and metadata
- **Advanced Search & Filtering**: Search by title, author, keywords, department, and year
- **AI-Powered Content Analysis**: Automatic keyword extraction and summary generation from PDF content
- **PDF Download**: Direct download functionality for each book
- **Responsive Design**: Optimized for desktop and mobile viewing
- **Admin-Managed Content**: Books are imported and processed by administrators using Google Drive API

## Architecture

### Frontend (React + TypeScript)
- Modern React application with TypeScript for type safety
- Tailwind CSS for responsive, beautiful styling
- Component-based architecture with reusable UI elements
- Custom hooks for state management and data fetching

### Backend Integration
- Google Drive API for PDF import and management
- AI services (OpenAI/Claude) for content analysis
- Supabase for database and file storage
- Automated PDF processing pipeline

## Admin Workflow

1. **Import PDFs**: Admin uses Google Drive API to import PDFs from specified folders
2. **AI Processing**: System automatically:
   - Extracts first page as thumbnail
   - Analyzes PDF content with AI
   - Generates keywords and summaries
   - Extracts metadata (title, author, year, department)
3. **Database Storage**: Processed books are stored in Supabase with all metadata
4. **Public Access**: Users can browse, search, and download books through the web interface

## Technical Implementation

### PDF Processing Pipeline
```
Google Drive PDF → Download → Extract Thumbnail → Extract Text → AI Analysis → Store Metadata → Public Display
```

### AI Analysis
- Extracts 5-8 relevant keywords for search optimization
- Generates 2-3 sentence summaries
- Identifies project categories and themes
- Processes content in multiple languages

### Search & Discovery
- Full-text search across titles, authors, and content
- Tag-based filtering system
- Department and year categorization
- Keyword-driven recommendations

## Setup Requirements

### Environment Variables
```
GOOGLE_DRIVE_API_KEY=your_drive_api_key
OPENAI_API_KEY=your_openai_key  # or Claude API key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Dependencies
- Google Drive API v3
- PDF processing libraries (pdf-parse, pdf2pic)
- AI service integration (OpenAI/Claude)
- Supabase client
- Image processing for thumbnails

## Usage

### For Users
1. Browse the collection using the card-based interface
2. Use search and filters to find specific projects
3. Click on any book card to download the PDF
4. Explore related projects through keyword tags

### For Administrators
1. Use the AdminService to import PDFs from Google Drive folders
2. Monitor AI processing results and adjust parameters as needed
3. Manage book metadata and categories
4. Update content and refresh AI analysis when needed

## Future Enhancements

- Advanced AI categorization and tagging
- User favorites and reading lists
- Citation generation and academic referencing
- Multi-language support for international projects
- Analytics dashboard for usage tracking
- Automated quality scoring for projects
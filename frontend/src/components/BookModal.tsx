import * as React from 'react';
import { X, Download, Calendar, User, Building2, Tag, FileText, Clock} from 'lucide-react';
import { PFEBook } from '../services/driveService';

interface BookModalProps {
  book: PFEBook | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (book: PFEBook) => void;
}

const BookModal: React.FC<BookModalProps> = ({ book, isOpen, onClose, onDownload }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = originalOverflow || 'auto';
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, onClose]);

  if (!isOpen || !book) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-fit max-h-[90vh] flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start rounded-t-xl flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
              {book.title}
            </h2>
            <p className="text-sm text-gray-500">Project Details</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable content with hidden scrollbar using Tailwind */}
        <div className="p-6 flex-1 min-h-0 overflow-y-auto scrollbar-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-6 overflow-hidden border border-gray-200">
                {book.thumbnailPath ? (
                  <>
                    <img 
                      src={book.thumbnailPath}
                      alt={`${book.title} - Preview`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.pdf-fallback');
                        if (fallback) {
                          (fallback as HTMLElement).classList.remove('hidden');
                          (fallback as HTMLElement).classList.add('flex');
                        }
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded shadow">
                      Preview
                    </div>
                  </>
                ) : null}
                
                <div className={`pdf-fallback absolute inset-0 ${book.thumbnailPath ? 'hidden' : 'flex'} items-center justify-center h-full`}>
                  <div className="text-center">
                    <div className="relative mb-4">
                      <FileText className="w-20 h-20 mx-auto text-gray-400" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-12 bg-red-500 rounded-sm flex items-center justify-center">
                          <span className="text-white text-sm font-bold">PDF</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-base font-medium text-gray-600">PDF Document</span>
                    <p className="text-sm text-gray-400 mt-1">No preview available</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => onDownload(book)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>
              </div>

              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">File Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Size:</span>
                    <span className="font-medium">{formatFileSize(book.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">PDF Document</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Added:</span>
                    <span className="font-medium">{formatDate(book.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Modified:</span>
                    <span className="font-medium">{formatDate(book.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Author</p>
                        <p className="text-base text-gray-900">{book.author}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Year</p>
                        <p className="text-base text-gray-900">{book.year}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {book.department}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Added to Library</p>
                        <p className="text-base text-gray-900">{formatDate(book.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {book.summary || 'No summary available for this project.'}
                  </p>
                </div>
              </div>

              {book.keywords && book.keywords.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Keywords & Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {book.keywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <Tag className="h-3 w-3" />
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookModal;

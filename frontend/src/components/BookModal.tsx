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
    if (bytes === 0) return '0 Octets';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[96vh] md:max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header - Mobile Optimized */}
        <div className="bg-blue-600 px-4 md:px-6 py-3 md:py-4 flex justify-between items-start rounded-t-xl flex-shrink-0">
          <div className="flex-1 pr-2">
            <h2 className="text-base md:text-xl font-bold text-white mb-1 line-clamp-2 leading-tight">
              {book.title}
            </h2>
            <p className="text-blue-100 text-xs">Détails du projet</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 transition-colors p-1.5 md:p-2 rounded-lg flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Mobile Scrollable, Desktop Fits */}
        <div className="p-3 md:p-5 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
            {/* Left Column - Mobile Stack */}
            <div className="lg:col-span-1 flex flex-col">
              <div className="relative h-48 md:h-56 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-3 overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                {book.thumbnailPath ? (
                  <>
                    <img 
                      src={book.thumbnailPath}
                      alt={`${book.title} - Aperçu`}
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
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded shadow">
                      Aperçu
                    </div>
                  </>
                ) : null}
                
                <div className={`pdf-fallback absolute inset-0 ${book.thumbnailPath ? 'hidden' : 'flex'} items-center justify-center h-full`}>
                  <div className="text-center">
                    <div className="relative mb-3">
                      <FileText className="w-12 md:w-16 h-12 md:h-16 mx-auto text-gray-400" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 md:w-8 h-8 md:h-10 bg-red-500 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">PDF</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Document PDF</span>
                    <p className="text-xs text-gray-400 mt-1">Aucun aperçu disponible</p>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => onDownload(book)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md mb-3 flex-shrink-0"
              >
                <Download className="h-4 w-4" />
                Télécharger le PDF
              </button>

              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex-shrink-0">
                <h4 className="font-semibold text-gray-900 mb-2 text-xs">Informations sur le fichier</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taille :</span>
                    <span className="font-medium text-gray-900">{formatFileSize(book.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format :</span>
                    <span className="font-medium text-gray-900">PDF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ajouté le :</span>
                    <span className="font-medium text-gray-900 text-xs break-words">{formatDate(book.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Mobile Stack */}
            <div className="lg:col-span-2 flex flex-col space-y-3 md:space-y-4">
              {/* Project Info */}
              <div className="flex-shrink-0">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">Informations sur le projet</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500">Auteur</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{book.author}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Année</p>
                      <p className="text-sm font-semibold text-gray-900">{book.year}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <Building2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">Département</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-full">
                        {book.department}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500">Ajouté</p>
                      <p className="text-xs font-semibold text-gray-900 break-words">{formatDate(book.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="flex-shrink-0">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Résumé du projet</h3>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {book.summary || 'Aucun résumé disponible pour ce projet.'}
                  </p>
                </div>
              </div>

              {/* Keywords */}
              {book.keywords && book.keywords.length > 0 && (
                <div className="flex-shrink-0">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Mots-clés & Technologies
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {book.keywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-200"
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

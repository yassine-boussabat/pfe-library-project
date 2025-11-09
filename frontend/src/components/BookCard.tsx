import * as React from 'react';
import { PFEBook } from '../services/driveService';
import { Calendar, User, Download, Tag, FileText, Eye, Heart } from 'lucide-react';

interface BookCardProps {
  book: PFEBook;
  isFavorite: boolean;
  onDownload: (book: PFEBook) => void;
  onViewDetails: (book: PFEBook) => void;
  onToggleFavorite: (bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  isFavorite,
  onDownload, 
  onViewDetails,
  onToggleFavorite 
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Octets';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 overflow-hidden border border-gray-200 flex-shrink-0">
          {book.thumbnailPath ? (
            <>
              <img 
                src={book.thumbnailPath}
                alt={`${book.title} - Aperçu`}
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  console.log(`Miniature échouée pour : ${book.title}`);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.pdf-fallback');
                  if (fallback) {
                    (fallback as HTMLElement).classList.remove('hidden');
                    (fallback as HTMLElement).classList.add('flex');
                  }
                }}
                onLoad={() => {
                  console.log(` Miniature chargée pour : ${book.title}`);
                }}
              />
              <div className="absolute top-2 right-2 bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded shadow">
                Aperçu
              </div>
            </>
          ) : null}
          
          <div className={`pdf-fallback absolute inset-0 ${book.thumbnailPath ? 'hidden' : 'flex'} items-center justify-center h-full`}>
            <div className="text-center">
              <div className="relative mb-3">
                <FileText className="w-16 h-16 mx-auto text-gray-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-10 bg-red-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600">Document PDF</span>
              <p className="text-xs text-gray-400 mt-1">Aucun aperçu disponible</p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(book._id);
            }}
            className="absolute top-2 left-2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110 z-10"
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart 
              className={`h-5 w-5 transition-colors ${
                isFavorite 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            />
          </button>
        </div>

        <div className="h-16 mb-3 flex items-start">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-3 overflow-hidden">
            {book.title}
          </h3>
        </div>

        <div className="h-12 mb-4 space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{book.author}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{book.year}</span>
          </div>
        </div>

        <div className="h-8 mb-4 flex items-start">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-full">
            {book.department}
          </span>
        </div>

        <div className="h-20 mb-4">
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 overflow-hidden">
            {book.summary || 'Aucun résumé disponible.'}
          </p>
        </div>

        <div className="h-12 mb-4 overflow-hidden">
          {book.keywords && book.keywords.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {book.keywords.slice(0, 2).map((keyword, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors truncate max-w-24">
                  <Tag className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{keyword}</span>
                </span>
              ))}
              {book.keywords.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  +{book.keywords.length - 2}
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-400">Aucun mot-clé disponible</div>
          )}
        </div>

        <div className="flex-1"></div>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-sm text-gray-500">
              <Download className="h-4 w-4 mr-1" />
              <span>Document PDF</span>
              <span className="ml-2">{formatFileSize(book.fileSize)}</span>
            </div>
          </div>

          <button
            onClick={() => onDownload(book)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </button>

          <button
            onClick={() => onViewDetails(book)}
            className="w-full mt-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Voir Plus
          </button>

          <div className="text-xs text-gray-400 mt-2 text-center">
            Ajouté : {new Date(book.createdAt).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { FileText, MapPin, Image as ImageIcon, Phone, Mail, User } from 'lucide-react';

type InformationItem = {
  _id: any;
  title: string;
  description?: string;
  type: 'factsheet' | 'teesheet' | 'activity' | 'contact';
  fileUrl?: string;
  fileType?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactPosition?: string;
  createdAt: number;
  isPublished: boolean;
};

const NewsFeed: React.FC = () => {
  const information = useQuery(api.information.getPublishedInformation);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewDialog, setPreviewDialog] = useState<{ url: string; type: string; title: string } | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'factsheet': return <FileText className="w-5 h-5" />;
      case 'teesheet': return <MapPin className="w-5 h-5" />;
      case 'activity': return <ImageIcon className="w-5 h-5" />;
      case 'contact': return <Phone className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'factsheet': return 'Fact Sheet';
      case 'teesheet': return 'Tee Sheet';
      case 'activity': return 'Activity';
      case 'contact': return 'Contact';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'factsheet': return 'bg-blue-500';
      case 'teesheet': return 'bg-green-500';
      case 'activity': return 'bg-purple-500';
      case 'contact': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleFileView = (fileUrl: string, fileType?: string, title?: string) => {
    setPreviewDialog({ url: fileUrl, type: fileType || 'image', title: title || 'Preview' });
  };

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl p-5 shadow-xl border border-gray-800">
        <h2 className="text-white font-bold text-xl mb-1">Informasi</h2>
        <p className="text-gray-400 text-sm">Fact Sheet, Tee Sheet, Activity, dan Contact</p>
      </div>

      {/* Information List */}
      <div className="space-y-4">
        {!information ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Memuat informasi...</p>
          </div>
        ) : information.length === 0 ? (
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl p-8 text-center border border-gray-800">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-white font-semibold mb-2">Belum Ada Informasi</h3>
            <p className="text-gray-400 text-sm">Informasi akan muncul di sini</p>
          </div>
        ) : (
          information.map((item: InformationItem) => (
            <div
              key={item._id}
              className="bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black rounded-2xl overflow-hidden shadow-xl border border-gray-800"
            >
              {/* Type Badge */}
              <div className="p-4 pb-0">
                <div className={`inline-flex items-center gap-2 ${getTypeColor(item.type)} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg`}>
                  {getTypeIcon(item.type)}
                  {getTypeLabel(item.type)}
                </div>
              </div>

              {/* Content based on type */}
              {item.type === 'contact' ? (
                // Contact Card
                <div className="p-5 space-y-4">
                  <h3 className="text-white font-bold text-lg">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  )}
                  
                  <div className="space-y-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-3 text-gray-300">
                      <div className="w-10 h-10 bg-red-900/40 rounded-full flex items-center justify-center border border-red-800/40">
                        <User className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{item.contactName}</p>
                        {item.contactPosition && (
                          <p className="text-gray-400 text-sm">{item.contactPosition}</p>
                        )}
                      </div>
                    </div>
                    
                    <a 
                      href={`tel:${item.contactPhone}`}
                      className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-3 rounded-xl hover:bg-gray-800/40"
                    >
                      <div className="w-10 h-10 bg-green-900/40 rounded-full flex items-center justify-center border border-green-800/40">
                        <Phone className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Telepon</p>
                        <p className="text-white font-medium">{item.contactPhone}</p>
                      </div>
                    </a>
                    
                    <a 
                      href={`mailto:${item.contactEmail}`}
                      className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-3 rounded-xl hover:bg-gray-800/40"
                    >
                      <div className="w-10 h-10 bg-blue-900/40 rounded-full flex items-center justify-center border border-blue-800/40">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-white font-medium break-all">{item.contactEmail}</p>
                      </div>
                    </a>
                  </div>
                </div>
              ) : (
                // File-based Information (factsheet, teesheet, activity)
                <>
                  {/* Preview Image/PDF */}
                  {item.fileUrl && (
                    <div 
                      className="relative h-48 overflow-hidden border-b border-gray-800 cursor-pointer group"
                      onClick={() => handleFileView(item.fileUrl!, item.fileType, item.title)}
                    >
                      {item.fileType === 'pdf' ? (
                        <>
                          <iframe
                            src={`${item.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full pointer-events-none"
                            title={item.title}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-active:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-red-900/90 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                              Tap untuk memperbesar
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={item.fileUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-active:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-red-900/90 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                              Tap untuk memperbesar
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                    {item.description && (
                      <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                    )}
                    
                    {/* View/Download Button */}
                    {item.fileUrl && (
                      <button
                        onClick={() => handleFileView(item.fileUrl!, item.fileType, item.title)}
                        className="w-full bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-red-900/50 flex items-center justify-center gap-2 border border-red-900/40"
                      >
                        {item.fileType === 'pdf' ? (
                          <>
                            <FileText className="w-5 h-5" />
                            Lihat PDF
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5" />
                            Lihat Gambar
                          </>
                        )}
                      </button>
                    )}
                    
                    <div className="flex items-center text-gray-500 text-xs pt-2 border-t border-gray-800">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { 
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Preview Dialog */}
      {previewDialog && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-900/80 to-red-800/80 text-white px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-lg truncate flex-1">{previewDialog.title}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewDialog(null);
              }}
              className="p-2 hover:bg-red-950/40 rounded-lg transition-colors ml-2 flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {previewDialog.type === 'pdf' ? (
              <iframe
                src={previewDialog.url}
                className="w-full h-full"
                title={previewDialog.title}
              />
            ) : (
              <div className="flex items-center justify-center h-full p-4">
                <img
                  src={previewDialog.url}
                  alt={previewDialog.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-[#2e2e2e]/95 to-[#1a1a1a]/95 px-4 py-3 flex gap-2">
            <a
              href={previewDialog.url}
              download
              className="flex-1 bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-red-900/40"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewDialog(null);
              }}
              className="px-6 border-2 border-gray-700/60 bg-gray-800/60 text-gray-300 py-3 rounded-xl font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Modal (Legacy - kept for backward compatibility) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default NewsFeed;

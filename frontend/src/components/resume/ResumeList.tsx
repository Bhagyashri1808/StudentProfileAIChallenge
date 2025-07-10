import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { type UploadedFile } from '../../types/profile';

interface ResumeListProps {
  resumes: UploadedFile[];
  onResumeDeleted: (fileId: number) => void;
  onPrimaryChanged: (fileId: number) => void;
}

const ResumeList: React.FC<ResumeListProps> = ({ 
  resumes, 
  onResumeDeleted, 
  onPrimaryChanged 
}) => {
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState('');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return (
        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    setLoading(prev => ({ ...prev, [file.id]: true }));
    setError('');

    try {
      const blob = await apiService.downloadFile(file.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setLoading(prev => ({ ...prev, [file.id]: false }));
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!confirm(`Are you sure you want to delete "${file.file_name}"?`)) {
      return;
    }

    setLoading(prev => ({ ...prev, [file.id]: true }));
    setError('');

    try {
      await apiService.deleteFile(file.id);
      onResumeDeleted(file.id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setLoading(prev => ({ ...prev, [file.id]: false }));
    }
  };

  const handleSetPrimary = async (file: UploadedFile) => {
    if (file.is_primary) return;

    setLoading(prev => ({ ...prev, [file.id]: true }));
    setError('');

    try {
      await apiService.setPrimaryResume(file.id);
      onPrimaryChanged(file.id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to set primary resume');
    } finally {
      setLoading(prev => ({ ...prev, [file.id]: false }));
    }
  };

  if (resumes.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">My Resumes</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500">No resumes uploaded yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">My Resumes</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage your uploaded resumes
        </p>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {resumes.map((file) => (
            <div
              key={file.id}
              className={`border rounded-lg p-4 ${
                file.is_primary ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.file_type)}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                      {file.file_name}
                      {file.is_primary && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Primary
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file_size)} • Uploaded {formatDate(file.upload_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!file.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(file)}
                      disabled={loading[file.id]}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                    >
                      Set Primary
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDownload(file)}
                    disabled={loading[file.id]}
                    className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    {loading[file.id] ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(file)}
                    disabled={loading[file.id]}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeList;
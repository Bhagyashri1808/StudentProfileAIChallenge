import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { type UploadedFile } from '../../types/profile';
import ResumeUpload from './ResumeUpload';
import ResumeList from './ResumeList';
import Loading from '../common/Loading';

interface ResumeManagerProps {
  onNavigateBack?: () => void;
}

const ResumeManager: React.FC<ResumeManagerProps> = ({ onNavigateBack }) => {
  const [resumes, setResumes] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getResumes();
      setResumes(data.files);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUploadComplete = (file: UploadedFile) => {
    setResumes(prev => {
      // Mark all existing resumes as non-primary since new upload is primary
      const updatedResumes = prev.map(resume => ({ ...resume, is_primary: false }));
      return [file, ...updatedResumes];
    });
  };

  const handleResumeDeleted = (fileId: number) => {
    setResumes(prev => prev.filter(resume => resume.id !== fileId));
  };

  const handlePrimaryChanged = (fileId: number) => {
    setResumes(prev => prev.map(resume => ({
      ...resume,
      is_primary: resume.id === fileId
    })));
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchResumes}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Manager</h1>
              <p className="text-gray-600 mt-2">Upload and manage your resumes</p>
            </div>
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Upload Section */}
          <ResumeUpload onUploadComplete={handleUploadComplete} />
          
          {/* Resume List */}
          <ResumeList
            resumes={resumes}
            onResumeDeleted={handleResumeDeleted}
            onPrimaryChanged={handlePrimaryChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeManager;
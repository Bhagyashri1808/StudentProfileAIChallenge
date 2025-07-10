import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StudentProfile from '../profile/StudentProfile';
import ResumeManager from '../resume/ResumeManager';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | 'resume'>('dashboard');

  const getNavButtonClass = (viewName: 'dashboard' | 'profile' | 'resume') => {
    return `px-3 py-2 rounded-md text-sm font-medium ${
      currentView === viewName
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-500 hover:text-gray-700'
    }`;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  if (currentView === 'profile') {
    return <StudentProfile onNavigateBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'resume') {
    return <ResumeManager onNavigateBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Student Profile System
              </h1>
              {user.role === 'student' && (
                <nav className="flex space-x-4">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={getNavButtonClass('dashboard')}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentView('profile')}
                    className={getNavButtonClass('profile')}
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => setCurrentView('resume')}
                    className={getNavButtonClass('resume')}
                  >
                    Resume
                  </button>
                </nav>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, {user.firstName} {user.lastName}
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Welcome back!
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Status */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Profile Status
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Active
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Role-specific card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {user.role === 'teacher' ? (
                      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Account Type
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 capitalize">
                        {user.role}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps Section */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {user.role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
                </h2>
                
                {user.role === 'teacher' ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">Welcome to your teacher dashboard! Here's what you can do:</p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Create and manage student surveys
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        View student profiles and goals
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Analyze class skills and interests
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Generate student group suggestions
                      </li>
                    </ul>
                    <div className="mt-4">
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-3">
                        Create Survey
                      </button>
                      <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                        View Students
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">Welcome to your student dashboard! Here's what you can do:</p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        Complete your profile with goals and interests
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        Upload and manage your resume
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        Take surveys assigned by teachers
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        Track your skill development
                      </li>
                    </ul>
                    <div className="mt-4">
                      <button 
                        onClick={() => setCurrentView('profile')}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-3"
                      >
                        Complete Profile
                      </button>
                      <button 
                        onClick={() => setCurrentView('resume')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Upload Resume
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
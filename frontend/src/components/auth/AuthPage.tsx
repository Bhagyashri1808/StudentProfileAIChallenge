import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Student Profile System
          </h1>
          <p className="text-gray-600">
            Track goals, interests, and skill levels for personalized learning
          </p>
        </div>

        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}

        <div className="mt-8 text-center">
          <div className="text-sm text-gray-500">
            <p className="mb-2">Demo Accounts:</p>
            <p>Teacher: teacher@example.com / password123</p>
            <p>Student: student@example.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
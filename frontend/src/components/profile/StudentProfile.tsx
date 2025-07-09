import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { type StudentProfile, type Goal, type Skill, type Interest } from '../../types/profile';
import ProfileForm from './ProfileForm';
import GoalsSection from './GoalsSection';
import SkillsSection from './SkillsSection';
import InterestsSection from './InterestsSection';
import Loading from '../common/Loading';

interface StudentProfilePageProps {
  onNavigateBack?: () => void;
}

const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ onNavigateBack }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProfile();
      setProfile(data.profile);
      setGoals(data.goals);
      setSkills(data.skills);
      setInterests(data.interests);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
  };

  const handleGoalAdded = (newGoal: Goal) => {
    setGoals(prev => [newGoal, ...prev]);
  };

  const handleGoalUpdated = (updatedGoal: Goal) => {
    setGoals(prev => prev.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal));
  };

  const handleGoalDeleted = (goalId: number) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const handleSkillAdded = (newSkill: Skill) => {
    setSkills(prev => [...prev, newSkill]);
  };

  const handleSkillDeleted = (skillId: number) => {
    setSkills(prev => prev.filter(skill => skill.id !== skillId));
  };

  const handleInterestAdded = (newInterest: Interest) => {
    setInterests(prev => [...prev, newInterest]);
  };

  const handleInterestDeleted = (interestId: number) => {
    setInterests(prev => prev.filter(interest => interest.id !== interestId));
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
            onClick={fetchProfile}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
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
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your profile, goals, skills, and interests</p>
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
          {/* Profile Information */}
          <ProfileForm
            profile={profile}
            onProfileUpdated={handleProfileUpdate}
          />

          {/* Goals Section */}
          <GoalsSection
            goals={goals}
            onGoalAdded={handleGoalAdded}
            onGoalUpdated={handleGoalUpdated}
            onGoalDeleted={handleGoalDeleted}
          />

          {/* Skills Section */}
          <SkillsSection
            skills={skills}
            onSkillAdded={handleSkillAdded}
            onSkillDeleted={handleSkillDeleted}
          />

          {/* Interests Section */}
          <InterestsSection
            interests={interests}
            onInterestAdded={handleInterestAdded}
            onInterestDeleted={handleInterestDeleted}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
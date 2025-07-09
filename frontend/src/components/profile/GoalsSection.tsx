import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { type Goal, type CreateGoalRequest } from '../../types/profile';

interface GoalsSectionProps {
  goals: Goal[];
  onGoalAdded: (goal: Goal) => void;
  onGoalUpdated: (goal: Goal) => void;
  onGoalDeleted: (goalId: number) => void;
}

const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  onGoalAdded,
  onGoalUpdated,
  onGoalDeleted,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateGoalRequest>({
    type: 'short_term',
    title: '',
    description: '',
    priority: 'medium',
    targetDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.addGoal({
        ...formData,
        targetDate: formData.targetDate || undefined,
        description: formData.description || undefined,
      });
      onGoalAdded(response.goal);
      setFormData({
        type: 'short_term',
        title: '',
        description: '',
        priority: 'medium',
        targetDate: '',
      });
      setShowAddForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add goal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (goalId: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await apiService.deleteGoal(goalId);
      onGoalDeleted(goalId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete goal');
    }
  };

  const handleStatusChange = async (goal: Goal, newStatus: 'active' | 'completed' | 'paused') => {
    try {
      const response = await apiService.updateGoal(goal.id, { ...goal, status: newStatus });
      onGoalUpdated(response.goal);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update goal');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Goals</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
          >
            {showAddForm ? 'Cancel' : 'Add Goal'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="short_term">Short-term</option>
                  <option value="long_term">Long-term</option>
                  <option value="academic">Academic</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter goal title"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your goal..."
                />
              </div>

              <div>
                <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  id="targetDate"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Goal'}
              </button>
            </div>
          </form>
        )}

        {goals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No goals yet. Add your first goal to get started!</p>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(goal.priority)}`}>
                      {goal.priority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                  <span className="capitalize">{goal.type.replace('_', ' ')}</span>
                  {goal.targetDate && (
                    <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  )}
                </div>

                {goal.description && (
                  <p className="text-gray-700 mb-3">{goal.description}</p>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {goal.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(goal, 'completed')}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Mark Complete
                      </button>
                    )}
                    {goal.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(goal, 'paused')}
                        className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                      >
                        Pause
                      </button>
                    )}
                    {goal.status === 'paused' && (
                      <button
                        onClick={() => handleStatusChange(goal, 'active')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Resume
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsSection;
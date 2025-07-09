import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { type Interest, type CreateInterestRequest } from '../../types/profile';

interface InterestsSectionProps {
  interests: Interest[];
  onInterestAdded: (interest: Interest) => void;
  onInterestDeleted: (interestId: number) => void;
}

const InterestsSection: React.FC<InterestsSectionProps> = ({
  interests,
  onInterestAdded,
  onInterestDeleted,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateInterestRequest>({
    category: 'academic',
    name: '',
    description: '',
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
      const response = await apiService.addInterest({
        ...formData,
        description: formData.description || undefined,
      });
      onInterestAdded(response.interest);
      setFormData({
        category: 'academic',
        name: '',
        description: '',
      });
      setShowAddForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add interest');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (interestId: number) => {
    if (!confirm('Are you sure you want to delete this interest?')) return;

    try {
      await apiService.deleteInterest(interestId);
      onInterestDeleted(interestId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete interest');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'extracurricular':
        return 'bg-green-100 text-green-800';
      case 'hobby':
        return 'bg-yellow-100 text-yellow-800';
      case 'industry':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedInterests = interests.reduce((acc, interest) => {
    if (!acc[interest.category]) {
      acc[interest.category] = [];
    }
    acc[interest.category].push(interest);
    return acc;
  }, {} as Record<string, Interest[]>);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Interests</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
          >
            {showAddForm ? 'Cancel' : 'Add Interest'}
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
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="academic">Academic</option>
                  <option value="extracurricular">Extracurricular</option>
                  <option value="hobby">Hobby</option>
                  <option value="industry">Industry</option>
                </select>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Machine Learning, Photography, Music"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your interest..."
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Interest'}
              </button>
            </div>
          </form>
        )}

        {interests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No interests yet. Add your interests to help others understand what motivates you!</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedInterests).map(([category, categoryInterests]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryInterests.map((interest) => (
                    <div
                      key={interest.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{interest.name}</h4>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(interest.category)}`}>
                            {interest.category}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(interest.id)}
                          className="text-red-500 hover:text-red-700 text-sm ml-2"
                        >
                          ×
                        </button>
                      </div>
                      
                      {interest.description && (
                        <p className="text-gray-600 text-sm mt-2">{interest.description}</p>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Added: {new Date(interest.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestsSection;
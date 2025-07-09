import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { type Skill, type CreateSkillRequest } from '../../types/profile';

interface SkillsSectionProps {
  skills: Skill[];
  onSkillAdded: (skill: Skill) => void;
  onSkillDeleted: (skillId: number) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  onSkillAdded,
  onSkillDeleted,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateSkillRequest>({
    category: 'technical',
    name: '',
    proficiencyLevel: 'beginner',
    acquiredDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const response = await apiService.addSkill({
        ...formData,
        acquiredDate: formData.acquiredDate || undefined,
      });
      onSkillAdded(response.skill);
      setFormData({
        category: 'technical',
        name: '',
        proficiencyLevel: 'beginner',
        acquiredDate: '',
      });
      setShowAddForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (skillId: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      await apiService.deleteSkill(skillId);
      onSkillDeleted(skillId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete skill');
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      case 'advanced':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Skills</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
          >
            {showAddForm ? 'Cancel' : 'Add Skill'}
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
                  <option value="technical">Technical</option>
                  <option value="soft">Soft Skills</option>
                  <option value="language">Language</option>
                  <option value="tools">Tools</option>
                </select>
              </div>

              <div>
                <label htmlFor="proficiencyLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Proficiency Level
                </label>
                <select
                  id="proficiencyLevel"
                  name="proficiencyLevel"
                  value={formData.proficiencyLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., JavaScript, Communication, Spanish"
                />
              </div>

              <div>
                <label htmlFor="acquiredDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Acquired Date (Optional)
                </label>
                <input
                  type="date"
                  id="acquiredDate"
                  name="acquiredDate"
                  value={formData.acquiredDate}
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
                {loading ? 'Adding...' : 'Add Skill'}
              </button>
            </div>
          </form>
        )}

        {skills.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No skills yet. Add your first skill to showcase your abilities!</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                  {category === 'soft' ? 'Soft Skills' : category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{skill.name}</h4>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProficiencyColor(skill.proficiencyLevel)}`}>
                          {skill.proficiencyLevel}
                        </span>
                        {skill.isVerified && (
                          <span className="text-green-500 text-sm">✓ Verified</span>
                        )}
                      </div>
                      
                      {skill.acquiredDate && (
                        <p className="text-xs text-gray-500 mt-2">
                          Acquired: {new Date(skill.acquiredDate).toLocaleDateString()}
                        </p>
                      )}
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

export default SkillsSection;
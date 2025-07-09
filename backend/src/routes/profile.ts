import express from 'express';
import { db } from '../config/sqlite-database';
import { requireAuth, requireStudent, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get student profile
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    
    // Get student profile
    const profile = await db.get(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [user.id]
    );

    if (!profile) {
      res.status(404).json({
        error: 'Profile not found',
        message: 'Student profile not found'
      });
      return;
    }

    // Get goals, skills, and interests
    const goals = await db.all(
      'SELECT * FROM goals WHERE student_profile_id = ? ORDER BY created_at DESC',
      [profile.id]
    );

    const skills = await db.all(
      'SELECT * FROM skills WHERE student_profile_id = ? ORDER BY category, name',
      [profile.id]
    );

    const interests = await db.all(
      'SELECT * FROM interests WHERE student_profile_id = ? ORDER BY category, name',
      [profile.id]
    );

    res.json({
      profile,
      goals,
      skills,
      interests
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'An error occurred while fetching the profile'
    });
  }
});

// Update student profile
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { studentId, yearLevel, major, bio } = req.body;

    // Get existing profile
    const profile = await db.get(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [user.id]
    );

    if (!profile) {
      res.status(404).json({
        error: 'Profile not found',
        message: 'Student profile not found'
      });
      return;
    }

    // Update profile
    await db.run(
      'UPDATE student_profiles SET student_id = ?, year_level = ?, major = ?, bio = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [studentId || null, yearLevel || null, major || null, bio || null, user.id]
    );

    // Get updated profile
    const updatedProfile = await db.get(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating the profile'
    });
  }
});

// Add goal
router.post('/goals', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { type, title, description, priority, targetDate } = req.body;

    // Validate required fields
    if (!type || !title || !priority) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Type, title, and priority are required'
      });
      return;
    }

    // Get student profile
    const profile = await db.get(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [user.id]
    );

    if (!profile) {
      res.status(404).json({
        error: 'Profile not found',
        message: 'Student profile not found'
      });
      return;
    }

    // Add goal
    const result = await db.run(
      'INSERT INTO goals (student_profile_id, type, title, description, priority, target_date) VALUES (?, ?, ?, ?, ?, ?)',
      [profile.id, type, title, description || null, priority, targetDate || null]
    );

    // Get created goal
    const goal = await db.get(
      'SELECT * FROM goals WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      message: 'Goal added successfully',
      goal
    });

  } catch (error) {
    console.error('Add goal error:', error);
    res.status(500).json({
      error: 'Failed to add goal',
      message: 'An error occurred while adding the goal'
    });
  }
});

// Update goal
router.put('/goals/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const goalId = parseInt(req.params.id);
    const { type, title, description, priority, targetDate, status } = req.body;

    // Get student profile
    const profile = await db.get(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [user.id]
    );

    if (!profile) {
      res.status(404).json({
        error: 'Profile not found',
        message: 'Student profile not found'
      });
      return;
    }

    // Check if goal belongs to user
    const goal = await db.get(
      'SELECT * FROM goals WHERE id = ? AND student_profile_id = ?',
      [goalId, profile.id]
    );

    if (!goal) {
      res.status(404).json({
        error: 'Goal not found',
        message: 'Goal not found or does not belong to you'
      });
      return;
    }

    // Update goal
    await db.run(
      'UPDATE goals SET type = ?, title = ?, description = ?, priority = ?, target_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [type, title, description || null, priority, targetDate || null, status || 'active', goalId]
    );

    // Get updated goal
    const updatedGoal = await db.get(
      'SELECT * FROM goals WHERE id = ?',
      [goalId]
    );

    res.json({
      message: 'Goal updated successfully',
      goal: updatedGoal
    });

  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      error: 'Failed to update goal',
      message: 'An error occurred while updating the goal'
    });
  }
});

// Delete goal
router.delete('/goals/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const goalId = parseInt(req.params.id);

    // Get student profile
    const profile = await db.get(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [user.id]
    );

    if (!profile) {
      res.status(404).json({
        error: 'Profile not found',
        message: 'Student profile not found'
      });
      return;
    }

    // Check if goal belongs to user
    const goal = await db.get(
      'SELECT * FROM goals WHERE id = ? AND student_profile_id = ?',
      [goalId, profile.id]
    );

    if (!goal) {
      res.status(404).json({
        error: 'Goal not found',
        message: 'Goal not found or does not belong to you'
      });
      return;
    }

    // Delete goal
    await db.run('DELETE FROM goals WHERE id = ?', [goalId]);

    res.json({ message: 'Goal deleted successfully' });

  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      error: 'Failed to delete goal',
      message: 'An error occurred while deleting the goal'
    });
  }
});

// Add skill
router.post('/skills', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { category, name, proficiencyLevel, acquiredDate } = req.body;

    // Validate required fields
    if (!category || !name || !proficiencyLevel) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Category, name, and proficiency level are required'
      });
      return;
    }

    // Get student profile
    const profile = await db.get(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [user.id]
    );

    if (!profile) {
      res.status(404).json({
        error: 'Profile not found',
        message: 'Student profile not found'
      });
      return;
    }

    // Add skill
    const result = await db.run(
      'INSERT INTO skills (student_profile_id, category, name, proficiency_level, acquired_date) VALUES (?, ?, ?, ?, ?)',
      [profile.id, category, name, proficiencyLevel, acquiredDate || null]
    );

    // Get created skill
    const skill = await db.get(
      'SELECT * FROM skills WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      message: 'Skill added successfully',
      skill
    });

  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      error: 'Failed to add skill',
      message: 'An error occurred while adding the skill'
    });
  }
});

// Delete skill
router.delete('/skills/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const skillId = parseInt(req.params.id);

    // Get student profile
    const profile = await db.get(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [user.id]
    );

    if (!profile) {
      res.status(404).json({
        error: 'Profile not found',
        message: 'Student profile not found'
      });
      return;
    }

    // Check if skill belongs to user
    const skill = await db.get(
      'SELECT * FROM skills WHERE id = ? AND student_profile_id = ?',
      [skillId, profile.id]
    );

    if (!skill) {
      res.status(404).json({
        error: 'Skill not found',
        message: 'Skill not found or does not belong to you'
      });
      return;
    }

    // Delete skill
    await db.run('DELETE FROM skills WHERE id = ?', [skillId]);

    res.json({ message: 'Skill deleted successfully' });

  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      error: 'Failed to delete skill',
      message: 'An error occurred while deleting the skill'
    });
  }
});

// Add interest
router.post('/interests', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { category, name, description } = req.body;

    // Validate required fields
    if (!category || !name) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Category and name are required'
      });
      return;
    }

    // Get student profile
    const profile = await db.get(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [user.id]
    );

    if (!profile) {
      res.status(404).json({
        error: 'Profile not found',
        message: 'Student profile not found'
      });
      return;
    }

    // Add interest
    const result = await db.run(
      'INSERT INTO interests (student_profile_id, category, name, description) VALUES (?, ?, ?, ?)',
      [profile.id, category, name, description || null]
    );

    // Get created interest
    const interest = await db.get(
      'SELECT * FROM interests WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      message: 'Interest added successfully',
      interest
    });

  } catch (error) {
    console.error('Add interest error:', error);
    res.status(500).json({
      error: 'Failed to add interest',
      message: 'An error occurred while adding the interest'
    });
  }
});

// Delete interest
router.delete('/interests/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const interestId = parseInt(req.params.id);

    // Get student profile
    const profile = await db.get(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [user.id]
    );

    if (!profile) {
      res.status(404).json({
        error: 'Profile not found',
        message: 'Student profile not found'
      });
      return;
    }

    // Check if interest belongs to user
    const interest = await db.get(
      'SELECT * FROM interests WHERE id = ? AND student_profile_id = ?',
      [interestId, profile.id]
    );

    if (!interest) {
      res.status(404).json({
        error: 'Interest not found',
        message: 'Interest not found or does not belong to you'
      });
      return;
    }

    // Delete interest
    await db.run('DELETE FROM interests WHERE id = ?', [interestId]);

    res.json({ message: 'Interest deleted successfully' });

  } catch (error) {
    console.error('Delete interest error:', error);
    res.status(500).json({
      error: 'Failed to delete interest',
      message: 'An error occurred while deleting the interest'
    });
  }
});

export default router;
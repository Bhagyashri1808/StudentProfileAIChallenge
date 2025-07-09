import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/sqlite-database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, first name, last name, and role are required'
      });
      return;
    }

    // Validate role
    if (!['teacher', 'student'].includes(role)) {
      res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be either "teacher" or "student"'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await db.run(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, firstName, lastName, role]
    );

    const userId = result.lastID;

    // If student, create student profile
    if (role === 'student') {
      await db.run(
        'INSERT INTO student_profiles (user_id) VALUES (?)',
        [userId]
      );
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Registration error details:', (error as Error).message);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
      return;
    }

    // Find user
    const user = await db.get(
      'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = ?',
      [email]
    );

    console.log('Login attempt for email:', email);
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
      return;
    }

    // Check if user is active
    if (!(user as any).is_active) {
      res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been disabled'
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, (user as any).password_hash);
    
    console.log('Password verification result:', isValidPassword);

    if (!isValidPassword) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
      return;
    }

    // Create session
    req.session.userId = (user as any).id;
    req.session.email = (user as any).email;
    req.session.role = (user as any).role;
    req.session.firstName = (user as any).first_name;
    req.session.lastName = (user as any).last_name;

    res.json({
      message: 'Login successful',
      user: {
        id: (user as any).id,
        email: (user as any).email,
        firstName: (user as any).first_name,
        lastName: (user as any).last_name,
        role: (user as any).role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// User logout
router.post('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        message: 'An error occurred during logout'
      });
      return;
    }

    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/me', requireAuth, (req: AuthenticatedRequest, res): void => {
  res.json({
    user: req.user
  });
});

// Change password
router.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        error: 'Missing fields',
        message: 'Current password and new password are required'
      });
      return;
    }

    // Get current user's password hash
    const user = await db.get(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user!.id]
    );

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      });
      return;
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, (user as any).password_hash);

    if (!isValidPassword) {
      res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
      return;
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.run(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, req.user!.id]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'An error occurred while changing password'
    });
  }
});

export default router;
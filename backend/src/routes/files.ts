import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { db } from '../config/sqlite-database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF and DOCX files for resumes
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  }
});

// Upload resume
router.post('/upload/resume', requireAuth, upload.single('resume'), async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const file = req.file;

    if (!file) {
      res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
      return;
    }

    // Generate file hash
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Check if file already exists
    const existingFile = await db.get(
      'SELECT id FROM uploaded_files WHERE user_id = ? AND file_hash = ?',
      [user.id, fileHash]
    );

    if (existingFile) {
      res.status(409).json({
        error: 'File already exists',
        message: 'This file has already been uploaded'
      });
      return;
    }

    // Mark any existing primary resume as non-primary
    await db.run(
      'UPDATE uploaded_files SET is_primary = FALSE WHERE user_id = ? AND file_category = "resume"',
      [user.id]
    );

    // Insert new file
    const result = await db.run(
      'INSERT INTO uploaded_files (user_id, file_name, file_type, file_size, file_data, file_hash, is_primary, file_category) VALUES (?, ?, ?, ?, ?, ?, TRUE, "resume")',
      [user.id, file.originalname, file.mimetype, file.size, file.buffer, fileHash]
    );

    // Get the inserted file info (without the blob data)
    const uploadedFile = await db.get(
      'SELECT id, file_name, file_type, file_size, file_hash, upload_date, is_primary, file_category FROM uploaded_files WHERE id = ?',
      [result.lastID]
    );

    res.json({
      message: 'Resume uploaded successfully',
      file: uploadedFile
    });

  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          error: 'File too large',
          message: 'File size must be less than 10MB'
        });
        return;
      }
    }
    
    res.status(500).json({
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Failed to upload file'
    });
  }
});

// Get user's uploaded files
router.get('/resumes', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    
    const files = await db.all(
      'SELECT id, file_name, file_type, file_size, file_hash, upload_date, is_primary, file_category FROM uploaded_files WHERE user_id = ? AND file_category = "resume" ORDER BY upload_date DESC',
      [user.id]
    );

    res.json({
      files
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      error: 'Failed to fetch files',
      message: 'An error occurred while fetching your files'
    });
  }
});

// Download file
router.get('/download/:fileId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const fileId = parseInt(req.params.fileId);

    if (isNaN(fileId)) {
      res.status(400).json({
        error: 'Invalid file ID',
        message: 'File ID must be a number'
      });
      return;
    }

    const file = await db.get(
      'SELECT file_name, file_type, file_data FROM uploaded_files WHERE id = ? AND user_id = ?',
      [fileId, user.id]
    );

    if (!file) {
      res.status(404).json({
        error: 'File not found',
        message: 'The requested file was not found'
      });
      return;
    }

    // Set appropriate headers
    res.setHeader('Content-Type', file.file_type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);
    
    // Send the file data
    res.send(file.file_data);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Download failed',
      message: 'An error occurred while downloading the file'
    });
  }
});

// Delete file
router.delete('/:fileId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const fileId = parseInt(req.params.fileId);

    if (isNaN(fileId)) {
      res.status(400).json({
        error: 'Invalid file ID',
        message: 'File ID must be a number'
      });
      return;
    }

    // Check if file exists and belongs to user
    const file = await db.get(
      'SELECT id, is_primary FROM uploaded_files WHERE id = ? AND user_id = ?',
      [fileId, user.id]
    );

    if (!file) {
      res.status(404).json({
        error: 'File not found',
        message: 'The requested file was not found'
      });
      return;
    }

    // Delete the file
    await db.run(
      'DELETE FROM uploaded_files WHERE id = ? AND user_id = ?',
      [fileId, user.id]
    );

    res.json({
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: 'An error occurred while deleting the file'
    });
  }
});

// Set primary resume
router.put('/:fileId/primary', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const fileId = parseInt(req.params.fileId);

    if (isNaN(fileId)) {
      res.status(400).json({
        error: 'Invalid file ID',
        message: 'File ID must be a number'
      });
      return;
    }

    // Check if file exists and belongs to user
    const file = await db.get(
      'SELECT id FROM uploaded_files WHERE id = ? AND user_id = ? AND file_category = "resume"',
      [fileId, user.id]
    );

    if (!file) {
      res.status(404).json({
        error: 'File not found',
        message: 'The requested resume was not found'
      });
      return;
    }

    // Mark all user's resumes as non-primary
    await db.run(
      'UPDATE uploaded_files SET is_primary = FALSE WHERE user_id = ? AND file_category = "resume"',
      [user.id]
    );

    // Mark selected file as primary
    await db.run(
      'UPDATE uploaded_files SET is_primary = TRUE WHERE id = ? AND user_id = ?',
      [fileId, user.id]
    );

    res.json({
      message: 'Primary resume updated successfully'
    });

  } catch (error) {
    console.error('Set primary error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'An error occurred while updating the primary resume'
    });
  }
});

export default router;
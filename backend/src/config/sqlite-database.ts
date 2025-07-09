import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

// Enable verbose mode for development
const sqlite = sqlite3.verbose();

export class Database {
  private db: sqlite3.Database;
  private initialized = false;
  public run: (sql: string, params?: any[]) => Promise<any>;
  public get: (sql: string, params?: any[]) => Promise<any>;
  public all: (sql: string, params?: any[]) => Promise<any>;

  constructor() {
    this.db = new sqlite.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database at:', dbPath);
      }
    });

    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON');

    // Promisify database methods with proper context
    this.run = (sql: string, params?: any[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params || [], function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    };

    this.get = promisify(this.db.get.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const schema = `
      -- Users table (both teachers and students)
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role VARCHAR(10) CHECK(role IN ('teacher', 'student')) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

      -- Student profiles
      CREATE TABLE IF NOT EXISTS student_profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          student_id VARCHAR(50),
          year_level VARCHAR(50),
          major VARCHAR(100),
          bio TEXT,
          profile_photo_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_student_profiles_student_id ON student_profiles(student_id);

      -- Goals
      CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_profile_id INTEGER NOT NULL,
          type VARCHAR(20) CHECK(type IN ('short_term', 'long_term', 'academic', 'personal')) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          priority VARCHAR(10) CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
          target_date DATE,
          status VARCHAR(15) CHECK(status IN ('active', 'completed', 'paused')) DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_goals_student_profile_id ON goals(student_profile_id);
      CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(type);
      CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);

      -- Skills
      CREATE TABLE IF NOT EXISTS skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_profile_id INTEGER NOT NULL,
          category VARCHAR(20) CHECK(category IN ('technical', 'soft', 'language', 'tools')) NOT NULL,
          name VARCHAR(100) NOT NULL,
          proficiency_level VARCHAR(15) CHECK(proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) NOT NULL,
          is_verified BOOLEAN DEFAULT 0,
          acquired_date DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_skills_student_profile_id ON skills(student_profile_id);
      CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
      CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);

      -- Interests
      CREATE TABLE IF NOT EXISTS interests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_profile_id INTEGER NOT NULL,
          category VARCHAR(20) CHECK(category IN ('academic', 'extracurricular', 'hobby', 'industry')) NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_interests_student_profile_id ON interests(student_profile_id);
      CREATE INDEX IF NOT EXISTS idx_interests_category ON interests(category);

      -- Surveys
      CREATE TABLE IF NOT EXISTS surveys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          teacher_id INTEGER NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          is_template BOOLEAN DEFAULT 0,
          template_name VARCHAR(100),
          is_active BOOLEAN DEFAULT 1,
          open_date DATETIME,
          close_date DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_surveys_teacher_id ON surveys(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_surveys_is_active ON surveys(is_active);

      -- Survey questions
      CREATE TABLE IF NOT EXISTS survey_questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          survey_id INTEGER NOT NULL,
          question_text TEXT NOT NULL,
          question_type VARCHAR(20) CHECK(question_type IN ('multiple_choice', 'rating', 'short_text', 'long_text', 'yes_no', 'date')) NOT NULL,
          options TEXT, -- JSON string for multiple choice options
          is_required BOOLEAN DEFAULT 0,
          order_index INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON survey_questions(survey_id);
      CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON survey_questions(order_index);

      -- Survey responses
      CREATE TABLE IF NOT EXISTS survey_responses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          survey_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          question_id INTEGER NOT NULL,
          response_text TEXT,
          response_rating INTEGER,
          response_date DATE,
          submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
      CREATE INDEX IF NOT EXISTS idx_survey_responses_student_id ON survey_responses(student_id);
      CREATE INDEX IF NOT EXISTS idx_survey_responses_question_id ON survey_responses(question_id);

      -- File storage (for resumes and other documents)
      CREATE TABLE IF NOT EXISTS uploaded_files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_type VARCHAR(50) NOT NULL,
          file_size INTEGER NOT NULL,
          file_data BLOB NOT NULL,
          file_hash VARCHAR(64) NOT NULL,
          upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_primary BOOLEAN DEFAULT 0,
          file_category VARCHAR(20) CHECK(file_category IN ('resume', 'profile_photo', 'document')) DEFAULT 'document',
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON uploaded_files(user_id);
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_file_hash ON uploaded_files(file_hash);
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_category ON uploaded_files(file_category);

      -- Sessions table for express-session
      CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR(255) PRIMARY KEY,
          sess TEXT NOT NULL,
          expire DATETIME NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);
    `;

    // Split schema into individual statements and execute
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      try {
        await this.run(statement);
      } catch (error) {
        console.error('Error executing schema statement:', error);
        throw error;
      }
    }

    this.initialized = true;
    console.log('Database schema initialized successfully');
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.get('SELECT 1 as test');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

// Create and export database instance
export const db = new Database();

export default db;
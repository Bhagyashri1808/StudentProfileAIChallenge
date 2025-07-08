# Database Setup

## MariaDB Installation

### macOS (using Homebrew)
```bash
brew install mariadb
brew services start mariadb
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mariadb-server
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### Windows
Download from: https://mariadb.org/download/

## Initial Setup

1. Secure the installation:
```bash
sudo mysql_secure_installation
```

2. Create database and user:
```sql
CREATE DATABASE student_profile;
CREATE USER 'student_app'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON student_profile.* TO 'student_app'@'localhost';
FLUSH PRIVILEGES;
```

3. Update backend/.env with database credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=student_app
DB_PASSWORD=your_password
DB_NAME=student_profile
```

## Schema (To be implemented)

The database schema will include tables for:
- users (teachers and students)
- student_profiles
- surveys
- survey_responses
- uploaded_files (with BLOB storage)
- goals
- skills
- interests
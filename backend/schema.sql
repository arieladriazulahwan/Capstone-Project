-- Create database if not exists
CREATE DATABASE IF NOT EXISTS bahasa_kaili;
USE bahasa_kaili;

-- Users table (common fields for siswa and guru)
CREATE TABLE IF NOT EXISTS users (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('siswa', 'guru') NOT NULL DEFAULT 'siswa',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    last_login DATE DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Student profiles (only for siswa)
CREATE TABLE IF NOT EXISTS student_profiles (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    xp INT(11) NOT NULL DEFAULT 0,
    level INT(11) NOT NULL DEFAULT 1,
    streak INT(11) NOT NULL DEFAULT 0,
    title VARCHAR(50) NOT NULL DEFAULT 'Pemula',
    dialect VARCHAR(50) NOT NULL DEFAULT 'ledo',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (id),
    UNIQUE KEY user_profile_unique (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Student progress per dialect (only for siswa)
CREATE TABLE IF NOT EXISTS student_progress (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    dialect VARCHAR(50) NOT NULL DEFAULT 'ledo',
    progress LONGTEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (id),
    UNIQUE KEY user_dialect_unique (user_id, dialect),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  timer INT,
  code VARCHAR(10) UNIQUE NOT NULL
);

-- Room questions table
CREATE TABLE IF NOT EXISTS room_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  type VARCHAR(50),
  question TEXT,
  image LONGTEXT,
  answer LONGTEXT,
  answer_type VARCHAR(50),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Room options table
CREATE TABLE IF NOT EXISTS room_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  option_text TEXT,
  FOREIGN KEY (question_id) REFERENCES room_questions(id) ON DELETE CASCADE
);

-- Room blocks table
CREATE TABLE IF NOT EXISTS room_blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  block_text TEXT,
  FOREIGN KEY (question_id) REFERENCES room_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  vocab_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_vocab_unique (user_id, vocab_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


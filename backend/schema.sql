-- Create database if not exists
CREATE DATABASE IF NOT EXISTS bahasa_kaili;
USE bahasa_kaili;

-- Users table
CREATE TABLE users (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) DEFAULT NULL,
    username VARCHAR(100) DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL,
    role ENUM('siswa', 'guru') DEFAULT 'siswa',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    xp INT(11) DEFAULT 0,
    level INT(11) DEFAULT 1,
    streak INT(11) DEFAULT 0,
    last_login DATE DEFAULT NULL,
    title VARCHAR(50) DEFAULT 'Pemula',
    progress LONGTEXT DEFAULT NULL,
    dialect VARCHAR(50) DEFAULT 'ledo',
    PRIMARY KEY (id),
    UNIQUE KEY (username)
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
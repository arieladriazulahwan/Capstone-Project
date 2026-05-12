-- Create database if not exists
CREATE DATABASE IF NOT EXISTS bahasa_kaili;
USE bahasa_kaili;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'siswa',
  progress TEXT,
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  title VARCHAR(255),
  streak INT DEFAULT 0,
  dialect VARCHAR(50)
);

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
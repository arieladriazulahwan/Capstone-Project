-- =========================================================
-- Database: bahasa_kaili
-- Catatan ERD:
-- - Tabel users menjadi pusat akun siswa, guru, dan admin.
-- - Data materi/latihan/quiz dari file JSON disalin ke tabel seed JSON.
-- - Room guru memakai relasi rooms -> room_questions -> room_options/room_blocks.
-- - Jawaban siswa di room tersimpan di room_attempts dan room_attempt_answers.
-- =========================================================

CREATE DATABASE IF NOT EXISTS bahasa_kaili;
USE bahasa_kaili;

-- =========================================================
-- AKUN DAN PROFIL
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'siswa',
  is_blocked TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login DATE DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  streak INT NOT NULL DEFAULT 0,
  title VARCHAR(255) NOT NULL DEFAULT 'Pemula',
  dialect VARCHAR(50) NOT NULL DEFAULT 'ledo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_profile_unique (user_id),
  CONSTRAINT fk_student_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS student_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  dialect VARCHAR(50) NOT NULL DEFAULT 'ledo',
  progress LONGTEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_dialect_unique (user_id, dialect),
  CONSTRAINT fk_student_progress_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- DATA KOSAKATA DARI JSON
-- =========================================================

CREATE TABLE IF NOT EXISTS vocab_entries (
  id INT PRIMARY KEY,
  subject VARCHAR(255),
  indonesia LONGTEXT NOT NULL,
  category VARCHAR(255),
  raw_json LONGTEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS vocab_translations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vocab_id INT NOT NULL,
  dialect VARCHAR(50) NOT NULL,
  word LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX vocab_translations_lookup (dialect),
  CONSTRAINT fk_vocab_translations_vocab
    FOREIGN KEY (vocab_id) REFERENCES vocab_entries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  vocab_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_vocab_unique (user_id, vocab_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_vocab
    FOREIGN KEY (vocab_id) REFERENCES vocab_entries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- DATA LESSON / PRACTICE / QUIZ DARI JSON
-- =========================================================

CREATE TABLE IF NOT EXISTS lesson_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dialect VARCHAR(50) NOT NULL,
  bab VARCHAR(50) NOT NULL,
  item_order INT NOT NULL DEFAULT 0,
  indo LONGTEXT,
  kaili LONGTEXT,
  tipe VARCHAR(255),
  category VARCHAR(255),
  image LONGTEXT,
  raw_json LONGTEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX lesson_items_lookup (dialect, bab, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS practice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dialect VARCHAR(50) NOT NULL,
  bab VARCHAR(50) NOT NULL,
  item_order INT NOT NULL DEFAULT 0,
  category VARCHAR(255),
  question LONGTEXT NOT NULL,
  answer LONGTEXT,
  image LONGTEXT,
  raw_json LONGTEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX practice_items_lookup (dialect, bab, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS practice_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  practice_id INT NOT NULL,
  option_order INT NOT NULL DEFAULT 0,
  option_text LONGTEXT NOT NULL,
  CONSTRAINT fk_practice_options_item
    FOREIGN KEY (practice_id) REFERENCES practice_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS quiz_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_id INT,
  dialect VARCHAR(50) NOT NULL,
  bab VARCHAR(50) NOT NULL,
  item_order INT NOT NULL DEFAULT 0,
  category VARCHAR(255),
  question LONGTEXT NOT NULL,
  answer LONGTEXT,
  image LONGTEXT,
  raw_json LONGTEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX quiz_items_lookup (dialect, bab, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS quiz_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  option_order INT NOT NULL DEFAULT 0,
  option_text LONGTEXT NOT NULL,
  CONSTRAINT fk_quiz_options_item
    FOREIGN KEY (quiz_id) REFERENCES quiz_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS quiz_blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  block_order INT NOT NULL DEFAULT 0,
  block_text LONGTEXT NOT NULL,
  CONSTRAINT fk_quiz_blocks_item
    FOREIGN KEY (quiz_id) REFERENCES quiz_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- ROOM KUIS GURU
-- =========================================================

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  timer INT,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX rooms_teacher_lookup (teacher_id),
  CONSTRAINT fk_rooms_teacher
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS room_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  type VARCHAR(50),
  question TEXT,
  image LONGTEXT,
  answer LONGTEXT,
  answer_type VARCHAR(50),
  CONSTRAINT fk_room_questions_room
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS room_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  option_text TEXT,
  CONSTRAINT fk_room_options_question
    FOREIGN KEY (question_id) REFERENCES room_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS room_blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  block_text TEXT,
  CONSTRAINT fk_room_blocks_question
    FOREIGN KEY (question_id) REFERENCES room_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS room_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  user_id INT NOT NULL,
  score INT DEFAULT 0,
  total INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX room_attempts_room_lookup (room_id),
  INDEX room_attempts_user_lookup (user_id),
  CONSTRAINT fk_room_attempts_room
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_room_attempts_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS room_attempt_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  answer LONGTEXT,
  is_correct TINYINT(1) DEFAULT 0,
  INDEX room_attempt_answers_attempt_lookup (attempt_id),
  INDEX room_attempt_answers_question_lookup (question_id),
  CONSTRAINT fk_room_attempt_answers_attempt
    FOREIGN KEY (attempt_id) REFERENCES room_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_room_attempt_answers_question
    FOREIGN KEY (question_id) REFERENCES room_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

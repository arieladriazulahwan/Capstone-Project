const createJsonDataTables = async (db) => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS vocab_entries (
      id INT PRIMARY KEY,
      subject VARCHAR(255),
      indonesia LONGTEXT NOT NULL,
      category VARCHAR(255),
      raw_json LONGTEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS vocab_translations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vocab_id INT NOT NULL,
      dialect VARCHAR(50) NOT NULL,
      word LONGTEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vocab_id) REFERENCES vocab_entries(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS lesson_items (
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
    )`,
    `CREATE TABLE IF NOT EXISTS practice_items (
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
    )`,
    `CREATE TABLE IF NOT EXISTS practice_options (
      id INT AUTO_INCREMENT PRIMARY KEY,
      practice_id INT NOT NULL,
      option_order INT NOT NULL DEFAULT 0,
      option_text LONGTEXT NOT NULL,
      FOREIGN KEY (practice_id) REFERENCES practice_items(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_items (
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
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_options (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quiz_id INT NOT NULL,
      option_order INT NOT NULL DEFAULT 0,
      option_text LONGTEXT NOT NULL,
      FOREIGN KEY (quiz_id) REFERENCES quiz_items(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_blocks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quiz_id INT NOT NULL,
      block_order INT NOT NULL DEFAULT 0,
      block_text LONGTEXT NOT NULL,
      FOREIGN KEY (quiz_id) REFERENCES quiz_items(id) ON DELETE CASCADE
    )`,
  ];

  for (const query of queries) {
    await db.promise().query(query);
  }
};

module.exports = createJsonDataTables;

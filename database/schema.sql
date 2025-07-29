-- HomeFlow Database Schema

-- Users table (Firebase UID reference)
CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       firebase_uid VARCHAR(255) UNIQUE NOT NULL,
                       email VARCHAR(255) NOT NULL,
                       display_name VARCHAR(255),
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reminders/Events table
CREATE TABLE reminders (
                           id INT AUTO_INCREMENT PRIMARY KEY,
                           user_id INT NOT NULL,
                           title VARCHAR(255) NOT NULL,
                           description TEXT,
                           reminder_date DATETIME NOT NULL,
                           priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                           is_completed BOOLEAN DEFAULT FALSE,
                           reminder_type ENUM('reminder', 'event') DEFAULT 'reminder',
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Todo Lists table
CREATE TABLE todos (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       user_id INT NOT NULL,
                       title VARCHAR(255) NOT NULL,
                       description TEXT,
                       is_completed BOOLEAN DEFAULT FALSE,
                       priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                       due_date DATE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Budget/Expenses table
CREATE TABLE expenses (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          user_id INT NOT NULL,
                          title VARCHAR(255) NOT NULL,
                          amount DECIMAL(10, 2) NOT NULL,
                          category VARCHAR(100),
                          expense_date DATE NOT NULL,
                          description TEXT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Budget Settings table
CREATE TABLE budget_settings (
                                 id INT AUTO_INCREMENT PRIMARY KEY,
                                 user_id INT NOT NULL,
                                 monthly_budget DECIMAL(10, 2) NOT NULL DEFAULT 0,
                                 current_month_spent DECIMAL(10, 2) DEFAULT 0,
                                 budget_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                 UNIQUE KEY unique_user_month (user_id, budget_month)
);

-- Database creation script for StudyQuest
CREATE DATABASE IF NOT EXISTS studyquest;
USE studyquest;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    xp INT DEFAULT 0,
    streak INT DEFAULT 0,
    daily_budget INT DEFAULT 3,
    compulsory_single TINYINT(1) DEFAULT 0,
    last_active_date VARCHAR(10) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    weekly_hours INT NOT NULL,
    preferred_days_count INT NOT NULL,
    PRIMARY KEY (id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- History table
CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date VARCHAR(10) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    completed TINYINT(1) DEFAULT 1,
    hours_completed FLOAT NOT NULL,
    is_revision TINYINT(1) DEFAULT 0,
    timestamp BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

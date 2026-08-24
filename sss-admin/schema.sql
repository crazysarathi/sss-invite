-- Admin database for the Salem Super Smashers invitation site.
-- Run with: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS smashers_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smashers_admin;

-- Admin login accounts (separate from site guests).
CREATE TABLE IF NOT EXISTS admin_users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- One row per RSVP submission from the site's "Save your spot" form.
-- Slots are capped at SLOT_CAPACITY registrations each (see config.php) —
-- enforced server-side in api/rsvp_submit.php, reflected to guests via
-- api/slot_availability.php.
CREATE TABLE IF NOT EXISTS users (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    email      VARCHAR(150) NOT NULL,
    whatsapp   VARCHAR(30)  NOT NULL,
    attendance ENUM('yes','no') NOT NULL DEFAULT 'yes',
    guests     TINYINT UNSIGNED NOT NULL DEFAULT 1,
    slot       VARCHAR(50)  DEFAULT NULL,
    interest   ENUM('pickle','pilates','both','matcha') DEFAULT NULL,
    message    TEXT,
    theme      VARCHAR(50)  DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (email),
    INDEX (created_at),
    INDEX (slot),
    INDEX (interest)
) ENGINE=InnoDB;

-- Payment records, tracked per guest by the admin (no online payment
-- gateway is wired up on the site, so these are recorded manually).
CREATE TABLE IF NOT EXISTS payments (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    amount     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    method     ENUM('cash','upi','card','bank_transfer','other') NOT NULL DEFAULT 'upi',
    status     ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
    reference  VARCHAR(100) DEFAULT NULL,
    notes      VARCHAR(255) DEFAULT NULL,
    paid_at    DATETIME DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (user_id),
    INDEX (status)
) ENGINE=InnoDB;

-- Default admin login: username "admin", password "admin123".
-- Change this password after first login (see admin/README.md).
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2y$10$knkICXFsc3Wt3K5qaXWtWuvyjkMWfppvX50sdVnCDTa8J7lDDhA2K')
ON DUPLICATE KEY UPDATE username = username;

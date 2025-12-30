-- ============================================
-- UniServe MVP Database Schema
-- Version: 1.0
-- Date: December 27, 2025
-- ============================================

-- Create database with UTF8MB4 support
CREATE DATABASE IF NOT EXISTS uniserve_mvp_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE uniserve_mvp_db;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NULL,
    language VARCHAR(10) DEFAULT 'en',
    user_type ENUM('NEW', 'RETURNING', 'ACTIVE', 'INACTIVE') DEFAULT 'NEW',
    first_seen DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    last_active DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    UNIQUE INDEX uk_phone_number (phone_number),
    INDEX idx_user_type (user_type),
    INDEX idx_last_active (last_active)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: user_preferences
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    preference_key VARCHAR(50) NOT NULL,
    preference_value TEXT NULL,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    UNIQUE INDEX uk_user_preference (user_id, preference_key),
    INDEX idx_preference_key (preference_key),
    
    FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE: sessions
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    source VARCHAR(50) NULL,
    channel VARCHAR(50) DEFAULT 'WHATSAPP',
    start_time DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    end_time DATETIME(3) NULL,
    duration_seconds INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSON NULL,
    
    INDEX idx_session_user (user_id),
    INDEX idx_session_source (source),
    INDEX idx_session_active (is_active),
    
    FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE: session_flows
-- ============================================
CREATE TABLE IF NOT EXISTS session_flows (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id CHAR(36) NOT NULL,
    flow_step VARCHAR(50) NOT NULL,
    step_order INT NOT NULL,
    step_timestamp DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    step_data JSON NULL,
    
    INDEX idx_flow_session (session_id),
    INDEX idx_flow_step (flow_step),
    
    FOREIGN KEY (session_id) REFERENCES sessions(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE: chat_messages
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id CHAR(36) NOT NULL,
    sender ENUM('USER', 'BOT', 'AGENT') NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    content_payload JSON NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    
    INDEX idx_chat_session (session_id),
    INDEX idx_chat_created (created_at),
    INDEX idx_chat_unread (is_read),
    
    FOREIGN KEY (session_id) REFERENCES sessions(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE: analytics_events
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id CHAR(36) NULL,
    user_id CHAR(36) NULL,
    event_category VARCHAR(50) NOT NULL,
    event_action VARCHAR(50) NOT NULL,
    event_label VARCHAR(255) NULL,
    event_value INT NULL,
    metadata JSON NULL,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    
    INDEX idx_events_category_action (event_category, event_action),
    INDEX idx_events_created (created_at),
    INDEX idx_events_user (user_id),
    INDEX idx_events_session (session_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE: dashboard_metrics
-- ============================================
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    metric_date DATE NOT NULL,
    metric_name VARCHAR(50) NOT NULL,
    metric_category VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    breakdown JSON NULL,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    
    UNIQUE INDEX uk_metric_date_name (metric_date, metric_name),
    INDEX idx_metric_category (metric_category),
    INDEX idx_metric_date (metric_date)
) ENGINE=InnoDB;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update user last_active on analytics events
DELIMITER //

CREATE TRIGGER IF NOT EXISTS update_user_last_active
AFTER INSERT ON analytics_events
FOR EACH ROW
BEGIN
    IF NEW.user_id IS NOT NULL THEN
        UPDATE users 
        SET last_active = NEW.created_at 
        WHERE id = NEW.user_id;
    END IF;
END//

DELIMITER ;

-- ============================================
-- Sample Data for Testing
-- ============================================

INSERT INTO users (id, phone_number, name, language, user_type) VALUES
('550e8400-e29b-41d4-a716-446655440001', '+919876543210', 'Rajesh Kumar', 'hi', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440002', '+919876543211', 'Priya Sharma', 'en', 'RETURNING'),
('550e8400-e29b-41d4-a716-446655440003', '+919876543212', 'Amit Patel', 'gu', 'NEW');

INSERT INTO user_preferences (user_id, preference_key, preference_value) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'notifications_enabled', 'true'),
('550e8400-e29b-41d4-a716-446655440001', 'preferred_time_slot', 'morning'),
('550e8400-e29b-41d4-a716-446655440002', 'interests', '["fashion", "electronics"]'),
('550e8400-e29b-41d4-a716-446655440003', 'communication_frequency', 'weekly');

INSERT INTO sessions (id, user_id, source, channel, start_time, is_active) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'QR_CODE', 'WHATSAPP', NOW(), TRUE),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'DIRECT_LINK', 'WHATSAPP', NOW() - INTERVAL 1 HOUR, FALSE);

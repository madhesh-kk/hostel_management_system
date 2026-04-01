-- ============================================================
-- Hostel Management System - MySQL Schema
-- Run this in MySQL Workbench before starting Spring Boot
-- ============================================================

CREATE DATABASE IF NOT EXISTS hostel_management;
USE hostel_management;

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(50) NOT NULL UNIQUE,
  capacity INT NOT NULL DEFAULT 2,
  occupied INT NOT NULL DEFAULT 0,
  floor INT NOT NULL,
  room_type VARCHAR(50) NOT NULL DEFAULT 'standard',
  status VARCHAR(50) NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_room_number (room_number),
  INDEX idx_status (status)
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  room_number VARCHAR(50),
  course VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  guardian_name VARCHAR(255) NOT NULL,
  guardian_phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student_room (room_number),
  INDEX idx_student_email (email)
);

-- Users table (admin accounts)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- NOTE: Admin user is auto-seeded by Spring Boot on first startup
-- Email: adminhostel@gmail.com | Password: passhostel

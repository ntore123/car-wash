-- Database update script to ensure all tables have the correct structure
-- This script can be run safely multiple times

-- Add CreatedAt and UpdatedAt columns to User table if they don't exist
ALTER TABLE User 
ADD COLUMN IF NOT EXISTS CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add CreatedAt and UpdatedAt columns to Car table if they don't exist
ALTER TABLE Car 
ADD COLUMN IF NOT EXISTS CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add CreatedAt and UpdatedAt columns to Package table if they don't exist
ALTER TABLE Package 
ADD COLUMN IF NOT EXISTS CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add CreatedAt and UpdatedAt columns to ServicePackage table if they don't exist
ALTER TABLE ServicePackage 
ADD COLUMN IF NOT EXISTS CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add CreatedAt and UpdatedAt columns to Payment table if they don't exist
ALTER TABLE Payment 
ADD COLUMN IF NOT EXISTS CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update ID column sizes to accommodate custom IDs
ALTER TABLE Package MODIFY COLUMN PackageNumber VARCHAR(50) NOT NULL;
ALTER TABLE ServicePackage MODIFY COLUMN RecordNumber VARCHAR(50) NOT NULL;
ALTER TABLE Payment MODIFY COLUMN PaymentNumber VARCHAR(50) NOT NULL;

-- Ensure foreign key references are also updated
ALTER TABLE ServicePackage MODIFY COLUMN PackageNumber VARCHAR(50) NOT NULL;
ALTER TABLE Payment MODIFY COLUMN RecordNumber VARCHAR(50) NOT NULL;

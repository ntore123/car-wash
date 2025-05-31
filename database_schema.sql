-- Package table with custom ID
CREATE TABLE Package (
    PackageNumber VARCHAR(50) PRIMARY KEY,
    PackageName VARCHAR(100) NOT NULL,
    PackageDescription TEXT,
    PackagePrice DECIMAL(10, 2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Car table with validation constraints
CREATE TABLE Car (
    PlateNumber VARCHAR(20) PRIMARY KEY,
    CarType VARCHAR(50) NOT NULL,
    CarSize VARCHAR(20) NOT NULL,
    DriverName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_car_type CHECK (CarType IN ('Sedan', 'SUV', 'Hatchback', 'Truck', 'Van', 'Motorcycle', 'Other')),
    CONSTRAINT chk_car_size CHECK (CarSize IN ('Small', 'Medium', 'Large', 'Extra Large')),
    CONSTRAINT chk_phone_format CHECK (PhoneNumber REGEXP '^[0-9+\\-\\s()]+$')
);

-- ServicePackage table with custom ID
CREATE TABLE ServicePackage (
    RecordNumber VARCHAR(50) PRIMARY KEY,
    ServiceDate DATE NOT NULL,
    PlateNumber VARCHAR(20) NOT NULL,
    PackageNumber VARCHAR(50) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (PlateNumber) REFERENCES Car(PlateNumber) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (PackageNumber) REFERENCES Package(PackageNumber) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Payment table with custom ID
CREATE TABLE Payment (
    PaymentNumber VARCHAR(50) PRIMARY KEY,
    AmountPaid DECIMAL(10, 2) NOT NULL,
    PaymentDate DATE NOT NULL,
    RecordNumber VARCHAR(50) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_amount_positive CHECK (AmountPaid > 0),
    FOREIGN KEY (RecordNumber) REFERENCES ServicePackage(RecordNumber) ON DELETE CASCADE ON UPDATE CASCADE
);

-- User table for system access (preserve existing data)
CREATE TABLE IF NOT EXISTS User (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_username_length CHECK (LENGTH(Username) >= 3)
);
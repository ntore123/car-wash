const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

// Custom ID generators
const generateRecordId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

  return `RC-${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

const generatePackageId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

  return `PK-${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

const generatePaymentId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

  return `PY-${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};
const bcrypt = require('bcrypt');
const { pool, testConnection } = require('./config/db');
const { initializeDatabase } = require('./config/initDb');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'car-wash-management-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
};

// Validation helpers
const validateRequired = (fields, data) => {
  const missing = fields.filter(field => !data[field]);
  return missing.length === 0 ? null : `Missing required fields: ${missing.join(', ')}`;
};

const validatePlateNumber = (plateNumber) => {
  if (!plateNumber || typeof plateNumber !== 'string' || plateNumber.trim().length === 0) {
    return 'Plate number is required and must be a non-empty string';
  }
  if (plateNumber.length > 20) {
    return 'Plate number must be 20 characters or less';
  }
  return null;
};

const validateCarType = (carType) => {
  const validTypes = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Van', 'Motorcycle', 'Other'];
  if (!validTypes.includes(carType)) {
    return `Car type must be one of: ${validTypes.join(', ')}`;
  }
  return null;
};

const validateCarSize = (carSize) => {
  const validSizes = ['Small', 'Medium', 'Large', 'Extra Large'];
  if (!validSizes.includes(carSize)) {
    return `Car size must be one of: ${validSizes.join(', ')}`;
  }
  return null;
};

const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return 'Phone number is required';
  }
  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (!phoneRegex.test(phoneNumber)) {
    return 'Phone number contains invalid characters';
  }
  return null;
};

const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return 'Amount must be a positive number';
  }
  return null;
};

const validateDate = (date) => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date format';
  }
  return null;
};

const validateCustomId = (id, type) => {
  let pattern;
  let errorMessage;

  switch (type) {
    case 'package':
      pattern = /^PK-\d{17}$/;
      errorMessage = 'Invalid Package ID format';
      break;
    case 'record':
      pattern = /^RC-\d{17}$/;
      errorMessage = 'Invalid Record ID format';
      break;
    case 'payment':
      pattern = /^PY-\d{17}$/;
      errorMessage = 'Invalid Payment ID format';
      break;
    default:
      return 'Invalid ID type';
  }

  if (!pattern.test(id)) {
    return errorMessage;
  }
  return null;
};

// ==================== USER ROUTES ====================

// Register route (public)
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    // Validate required fields
    const validation = validateRequired(['username', 'password', 'confirmPassword'], req.body);
    if (validation) {
      return res.status(400).json({ success: false, message: validation });
    }

    // Validate username length
    if (username.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT UserID FROM User WHERE Username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.query(
      'INSERT INTO User (Username, Password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    // Get created user (without password)
    const [newUser] = await pool.query(
      'SELECT UserID, Username FROM User WHERE UserID = ?',
      [result.insertId]
    );

    // Automatically log in the user after registration
    req.session.userId = newUser[0].UserID;
    req.session.username = newUser[0].Username;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: newUser[0]
    });
  } catch (error) {
    console.error('Error in POST /api/users/register:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login route
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    const validation = validateRequired(['username', 'password'], req.body);
    if (validation) {
      return res.status(400).json({ success: false, message: validation });
    }

    // Get user from database
    const [rows] = await pool.query('SELECT * FROM User WHERE Username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.Password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Set user in session
    req.session.userId = user.UserID;
    req.session.username = user.Username;

    // Remove password from response
    const { Password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error in POST /api/users/login:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout route
app.post('/api/users/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
});

// Get current user
app.get('/api/users/me', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [rows] = await pool.query('SELECT UserID, Username FROM User WHERE UserID = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error in GET /api/users/me:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users (admin only)
app.get('/api/users', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT UserID, Username FROM User ORDER BY UserID DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new user (admin only)
app.post('/api/users', isAuthenticated, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    const validation = validateRequired(['username', 'password'], req.body);
    if (validation) {
      return res.status(400).json({ success: false, message: validation });
    }

    // Validate username length
    if (username.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT UserID FROM User WHERE Username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.query(
      'INSERT INTO User (Username, Password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    // Get created user
    const [newUser] = await pool.query(
      'SELECT UserID, Username FROM User WHERE UserID = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newUser[0] });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== CAR ROUTES ====================

// Get all cars
app.get('/api/cars', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Car ORDER BY CreatedAt DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in GET /api/cars:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get car by plate number
app.get('/api/cars/:plateNumber', isAuthenticated, async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;
    const [rows] = await pool.query('SELECT * FROM Car WHERE PlateNumber = ?', [plateNumber]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(`Error in GET /api/cars/${req.params.plateNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new car
app.post('/api/cars', isAuthenticated, async (req, res) => {
  try {
    const { plateNumber, carType, carSize, driverName, phoneNumber } = req.body;

    // Validate required fields
    const validation = validateRequired(['plateNumber', 'carType', 'carSize', 'driverName', 'phoneNumber'], req.body);
    if (validation) {
      return res.status(400).json({ success: false, message: validation });
    }

    // Validate individual fields
    const plateValidation = validatePlateNumber(plateNumber);
    if (plateValidation) {
      return res.status(400).json({ success: false, message: plateValidation });
    }

    const typeValidation = validateCarType(carType);
    if (typeValidation) {
      return res.status(400).json({ success: false, message: typeValidation });
    }

    const sizeValidation = validateCarSize(carSize);
    if (sizeValidation) {
      return res.status(400).json({ success: false, message: sizeValidation });
    }

    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (phoneValidation) {
      return res.status(400).json({ success: false, message: phoneValidation });
    }

    // Validate driver name
    if (!driverName || driverName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Driver name is required' });
    }

    // Check if car already exists
    const [existingCars] = await pool.query('SELECT PlateNumber FROM Car WHERE PlateNumber = ?', [plateNumber]);
    if (existingCars.length > 0) {
      return res.status(400).json({ success: false, message: 'Car with this plate number already exists' });
    }

    // Create car
    await pool.query(
      'INSERT INTO Car (PlateNumber, CarType, CarSize, DriverName, PhoneNumber) VALUES (?, ?, ?, ?, ?)',
      [plateNumber, carType, carSize, driverName, phoneNumber]
    );

    // Get created car
    const [newCar] = await pool.query('SELECT * FROM Car WHERE PlateNumber = ?', [plateNumber]);

    res.status(201).json({ success: true, data: newCar[0] });
  } catch (error) {
    console.error('Error in POST /api/cars:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a car
app.put('/api/cars/:plateNumber', isAuthenticated, async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;
    const { carType, carSize, driverName, phoneNumber } = req.body;

    // Validate required fields
    const validation = validateRequired(['carType', 'carSize', 'driverName', 'phoneNumber'], req.body);
    if (validation) {
      return res.status(400).json({ success: false, message: validation });
    }

    // Validate individual fields
    const typeValidation = validateCarType(carType);
    if (typeValidation) {
      return res.status(400).json({ success: false, message: typeValidation });
    }

    const sizeValidation = validateCarSize(carSize);
    if (sizeValidation) {
      return res.status(400).json({ success: false, message: sizeValidation });
    }

    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (phoneValidation) {
      return res.status(400).json({ success: false, message: phoneValidation });
    }

    // Validate driver name
    if (!driverName || driverName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Driver name is required' });
    }

    // Check if car exists
    const [existingCars] = await pool.query('SELECT PlateNumber FROM Car WHERE PlateNumber = ?', [plateNumber]);
    if (existingCars.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    // Update car
    await pool.query(
      'UPDATE Car SET CarType = ?, CarSize = ?, DriverName = ?, PhoneNumber = ? WHERE PlateNumber = ?',
      [carType, carSize, driverName, phoneNumber, plateNumber]
    );

    // Get updated car
    const [updatedCar] = await pool.query('SELECT * FROM Car WHERE PlateNumber = ?', [plateNumber]);

    res.json({ success: true, data: updatedCar[0] });
  } catch (error) {
    console.error(`Error in PUT /api/cars/${req.params.plateNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a car
app.delete('/api/cars/:plateNumber', isAuthenticated, async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;

    // Check if car exists
    const [existingCars] = await pool.query('SELECT PlateNumber FROM Car WHERE PlateNumber = ?', [plateNumber]);
    if (existingCars.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    // Delete car (cascade will handle related records)
    await pool.query('DELETE FROM Car WHERE PlateNumber = ?', [plateNumber]);

    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    console.error(`Error in DELETE /api/cars/${req.params.plateNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== PACKAGE ROUTES ====================

// Get all packages
app.get('/api/packages', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Package ORDER BY CreatedAt DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in GET /api/packages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get package by number
app.get('/api/packages/:packageNumber', isAuthenticated, async (req, res) => {
  try {
    const packageNumber = req.params.packageNumber;

    // Validate custom ID format
    const idValidation = validateCustomId(packageNumber, 'package');
    if (idValidation) {
      return res.status(400).json({ success: false, message: idValidation });
    }

    const [rows] = await pool.query('SELECT * FROM Package WHERE PackageNumber = ?', [packageNumber]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(`Error in GET /api/packages/${req.params.packageNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new package
app.post('/api/packages', isAuthenticated, async (req, res) => {
  try {
    const { packageName, packageDescription, packagePrice } = req.body;

    // Validate required fields
    const validation = validateRequired(['packageName', 'packagePrice'], req.body);
    if (validation) {
      return res.status(400).json({ success: false, message: validation });
    }

    // Validate package name
    if (!packageName || packageName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Package name is required' });
    }

    // Validate package price
    const priceValidation = validateAmount(packagePrice);
    if (priceValidation) {
      return res.status(400).json({ success: false, message: priceValidation });
    }

    // Generate custom ID for package number
    const packageNumber = generatePackageId();

    // Create package
    await pool.query(
      'INSERT INTO Package (PackageNumber, PackageName, PackageDescription, PackagePrice) VALUES (?, ?, ?, ?)',
      [packageNumber, packageName, packageDescription || '', parseFloat(packagePrice)]
    );

    // Get created package
    const [newPackage] = await pool.query('SELECT * FROM Package WHERE PackageNumber = ?', [packageNumber]);

    res.status(201).json({ success: true, data: newPackage[0] });
  } catch (error) {
    console.error('Error in POST /api/packages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a package
app.put('/api/packages/:packageNumber', isAuthenticated, async (req, res) => {
  try {
    const packageNumber = req.params.packageNumber;
    const { packageName, packageDescription, packagePrice } = req.body;

    // Validate custom ID format
    const idValidation = validateCustomId(packageNumber, 'package');
    if (idValidation) {
      return res.status(400).json({ success: false, message: idValidation });
    }

    // Validate required fields
    const validation = validateRequired(['packageName', 'packagePrice'], req.body);
    if (validation) {
      return res.status(400).json({ success: false, message: validation });
    }

    // Validate package name
    if (!packageName || packageName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Package name is required' });
    }

    // Validate package price
    const priceValidation = validateAmount(packagePrice);
    if (priceValidation) {
      return res.status(400).json({ success: false, message: priceValidation });
    }

    // Check if package exists
    const [existingPackages] = await pool.query('SELECT PackageNumber FROM Package WHERE PackageNumber = ?', [packageNumber]);
    if (existingPackages.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    // Update package
    await pool.query(
      'UPDATE Package SET PackageName = ?, PackageDescription = ?, PackagePrice = ? WHERE PackageNumber = ?',
      [packageName, packageDescription || '', parseFloat(packagePrice), packageNumber]
    );

    // Get updated package
    const [updatedPackage] = await pool.query('SELECT * FROM Package WHERE PackageNumber = ?', [packageNumber]);

    res.json({ success: true, data: updatedPackage[0] });
  } catch (error) {
    console.error(`Error in PUT /api/packages/${req.params.packageNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a package
app.delete('/api/packages/:packageNumber', isAuthenticated, async (req, res) => {
  try {
    const packageNumber = req.params.packageNumber;

    // Validate custom ID format
    const idValidation = validateCustomId(packageNumber, 'package');
    if (idValidation) {
      return res.status(400).json({ success: false, message: idValidation });
    }

    // Check if package exists
    const [existingPackages] = await pool.query('SELECT PackageNumber FROM Package WHERE PackageNumber = ?', [packageNumber]);
    if (existingPackages.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    // Delete package (cascade will handle related records)
    await pool.query('DELETE FROM Package WHERE PackageNumber = ?', [packageNumber]);

    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    console.error(`Error in DELETE /api/packages/${req.params.packageNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



// ==================== SERVICE ROUTES ====================

// Get all services
app.get('/api/services', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, c.DriverName, c.CarType, c.CarSize, p.PackageName, p.PackageDescription, p.PackagePrice
      FROM ServicePackage s
      JOIN Car c ON s.PlateNumber = c.PlateNumber
      JOIN Package p ON s.PackageNumber = p.PackageNumber
      ORDER BY s.CreatedAt DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in GET /api/services:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get service by record number
app.get('/api/services/:recordNumber', isAuthenticated, async (req, res) => {
  try {
    const recordNumber = req.params.recordNumber;

    // Validate custom ID format
    const idValidation = validateCustomId(recordNumber, 'record');
    if (idValidation) {
      return res.status(400).json({ success: false, message: idValidation });
    }

    const [rows] = await pool.query(`
      SELECT s.*, c.DriverName, c.CarType, c.CarSize, p.PackageName, p.PackageDescription, p.PackagePrice
      FROM ServicePackage s
      JOIN Car c ON s.PlateNumber = c.PlateNumber
      JOIN Package p ON s.PackageNumber = p.PackageNumber
      WHERE s.RecordNumber = ?
    `, [recordNumber]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service record not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(`Error in GET /api/services/${req.params.recordNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new service
app.post('/api/services', isAuthenticated, async (req, res) => {
  try {
    const { serviceDate, plateNumber, packageNumber } = req.body;

    // Validate required fields
    const validation = validateRequired(['serviceDate', 'plateNumber', 'packageNumber'], req.body);
    if (validation) {
      return res.status(400).json({ success: false, message: validation });
    }

    // Validate date
    const dateValidation = validateDate(serviceDate);
    if (dateValidation) {
      return res.status(400).json({ success: false, message: dateValidation });
    }

    // Validate plate number
    const plateValidation = validatePlateNumber(plateNumber);
    if (plateValidation) {
      return res.status(400).json({ success: false, message: plateValidation });
    }

    // Validate package number custom ID
    const packageIdValidation = validateCustomId(packageNumber, 'package');
    if (packageIdValidation) {
      return res.status(400).json({ success: false, message: packageIdValidation });
    }

    // Check if car exists
    const [cars] = await pool.query('SELECT PlateNumber FROM Car WHERE PlateNumber = ?', [plateNumber]);
    if (cars.length === 0) {
      return res.status(400).json({ success: false, message: 'Car not found' });
    }

    // Check if package exists
    const [packages] = await pool.query('SELECT PackageNumber FROM Package WHERE PackageNumber = ?', [packageNumber]);
    if (packages.length === 0) {
      return res.status(400).json({ success: false, message: 'Package not found' });
    }

    // Generate custom ID for record number
    const recordNumber = generateRecordId();

    // Create service
    await pool.query(
      'INSERT INTO ServicePackage (RecordNumber, ServiceDate, PlateNumber, PackageNumber) VALUES (?, ?, ?, ?)',
      [recordNumber, serviceDate, plateNumber, packageNumber]
    );

    // Get created service with joined data
    const [newService] = await pool.query(`
      SELECT s.*, c.DriverName, c.CarType, c.CarSize, p.PackageName, p.PackageDescription, p.PackagePrice
      FROM ServicePackage s
      JOIN Car c ON s.PlateNumber = c.PlateNumber
      JOIN Package p ON s.PackageNumber = p.PackageNumber
      WHERE s.RecordNumber = ?
    `, [recordNumber]);

    res.status(201).json({ success: true, data: newService[0] });
  } catch (error) {
    console.error('Error in POST /api/services:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a service
app.put('/api/services/:recordNumber', isAuthenticated, async (req, res) => {
  try {
    const recordNumber = req.params.recordNumber;
    const { serviceDate, plateNumber, packageNumber } = req.body;

    // Validate UUID format
    const uuidValidation = validateUUID(recordNumber);
    if (uuidValidation) {
      return res.status(400).json({ success: false, message: uuidValidation });
    }

    // Validate required fields
    const validation = validateRequired(['serviceDate', 'plateNumber', 'packageNumber'], req.body);
    if (validation) {
      return res.status(400).json({ success: false, message: validation });
    }

    // Validate date
    const dateValidation = validateDate(serviceDate);
    if (dateValidation) {
      return res.status(400).json({ success: false, message: dateValidation });
    }

    // Validate plate number
    const plateValidation = validatePlateNumber(plateNumber);
    if (plateValidation) {
      return res.status(400).json({ success: false, message: plateValidation });
    }

    // Validate package number UUID
    const packageUuidValidation = validateUUID(packageNumber);
    if (packageUuidValidation) {
      return res.status(400).json({ success: false, message: packageUuidValidation });
    }

    // Check if service exists
    const [existingServices] = await pool.query('SELECT RecordNumber FROM ServicePackage WHERE RecordNumber = ?', [recordNumber]);
    if (existingServices.length === 0) {
      return res.status(404).json({ success: false, message: 'Service record not found' });
    }

    // Check if car exists
    const [cars] = await pool.query('SELECT PlateNumber FROM Car WHERE PlateNumber = ?', [plateNumber]);
    if (cars.length === 0) {
      return res.status(400).json({ success: false, message: 'Car not found' });
    }

    // Check if package exists
    const [packages] = await pool.query('SELECT PackageNumber FROM Package WHERE PackageNumber = ?', [packageNumber]);
    if (packages.length === 0) {
      return res.status(400).json({ success: false, message: 'Package not found' });
    }

    // Update service
    await pool.query(
      'UPDATE ServicePackage SET ServiceDate = ?, PlateNumber = ?, PackageNumber = ? WHERE RecordNumber = ?',
      [serviceDate, plateNumber, packageNumber, recordNumber]
    );

    // Get updated service with joined data
    const [updatedService] = await pool.query(`
      SELECT s.*, c.DriverName, c.CarType, c.CarSize, p.PackageName, p.PackageDescription, p.PackagePrice
      FROM ServicePackage s
      JOIN Car c ON s.PlateNumber = c.PlateNumber
      JOIN Package p ON s.PackageNumber = p.PackageNumber
      WHERE s.RecordNumber = ?
    `, [recordNumber]);

    res.json({ success: true, data: updatedService[0] });
  } catch (error) {
    console.error(`Error in PUT /api/services/${req.params.recordNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a service
app.delete('/api/services/:recordNumber', isAuthenticated, async (req, res) => {
  try {
    const recordNumber = req.params.recordNumber;

    // Validate UUID format
    const uuidValidation = validateUUID(recordNumber);
    if (uuidValidation) {
      return res.status(400).json({ success: false, message: uuidValidation });
    }

    // Check if service exists
    const [existingServices] = await pool.query('SELECT RecordNumber FROM ServicePackage WHERE RecordNumber = ?', [recordNumber]);
    if (existingServices.length === 0) {
      return res.status(404).json({ success: false, message: 'Service record not found' });
    }

    // Delete service (cascade will handle related records)
    await pool.query('DELETE FROM ServicePackage WHERE RecordNumber = ?', [recordNumber]);

    res.json({ success: true, message: 'Service record deleted successfully' });
  } catch (error) {
    console.error(`Error in DELETE /api/services/${req.params.recordNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get services by car plate number
app.get('/api/services/car/:plateNumber', isAuthenticated, async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;
    const [rows] = await pool.query(`
      SELECT s.*, c.DriverName, c.CarType, c.CarSize, p.PackageName, p.PackageDescription, p.PackagePrice
      FROM ServicePackage s
      JOIN Car c ON s.PlateNumber = c.PlateNumber
      JOIN Package p ON s.PackageNumber = p.PackageNumber
      WHERE s.PlateNumber = ?
      ORDER BY s.CreatedAt DESC
    `, [plateNumber]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(`Error in GET /api/services/car/${req.params.plateNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get services by date range
app.get('/api/services/date-range/:startDate/:endDate', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    // Validate dates
    const startDateValidation = validateDate(startDate);
    if (startDateValidation) {
      return res.status(400).json({ success: false, message: `Start date: ${startDateValidation}` });
    }

    const endDateValidation = validateDate(endDate);
    if (endDateValidation) {
      return res.status(400).json({ success: false, message: `End date: ${endDateValidation}` });
    }

    const [rows] = await pool.query(`
      SELECT s.*, c.DriverName, c.CarType, c.CarSize, p.PackageName, p.PackageDescription, p.PackagePrice
      FROM ServicePackage s
      JOIN Car c ON s.PlateNumber = c.PlateNumber
      JOIN Package p ON s.PackageNumber = p.PackageNumber
      WHERE s.ServiceDate BETWEEN ? AND ?
      ORDER BY s.ServiceDate DESC
    `, [startDate, endDate]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(`Error in GET /api/services/date-range/${req.params.startDate}/${req.params.endDate}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== PAYMENT ROUTES ====================

// Get all payments
app.get('/api/payments', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, s.ServiceDate, s.PlateNumber, c.DriverName, c.CarType, pkg.PackageName, pkg.PackagePrice
      FROM Payment p
      JOIN ServicePackage s ON p.RecordNumber = s.RecordNumber
      JOIN Car c ON s.PlateNumber = c.PlateNumber
      JOIN Package pkg ON s.PackageNumber = pkg.PackageNumber
      ORDER BY p.CreatedAt DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in GET /api/payments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payment by number
app.get('/api/payments/:paymentNumber', isAuthenticated, async (req, res) => {
  try {
    const paymentNumber = req.params.paymentNumber;

    // Validate custom ID format
    const paymentIdValidation = validateCustomId(paymentNumber, 'payment');
    if (paymentIdValidation) {
      return res.status(400).json({ success: false, message: paymentIdValidation });
    }

    const [rows] = await pool.query(`
      SELECT p.*, s.ServiceDate, s.PlateNumber, c.DriverName, c.CarType, pkg.PackageName, pkg.PackagePrice
      FROM Payment p
      JOIN ServicePackage s ON p.RecordNumber = s.RecordNumber
      JOIN Car c ON s.PlateNumber = c.PlateNumber
      JOIN Package pkg ON s.PackageNumber = pkg.PackageNumber
      WHERE p.PaymentNumber = ?
    `, [paymentNumber]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(`Error in GET /api/payments/${req.params.paymentNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new payment
app.post('/api/payments', isAuthenticated, async (req, res) => {
  try {
    const { amountPaid, paymentDate, recordNumber } = req.body;

    // Validate required fields
    const validation = validateRequired(['amountPaid', 'paymentDate', 'recordNumber'], req.body);
    if (validation) {
      return res.status(400).json({ success: false, message: validation });
    }

    // Validate amount
    const amountValidation = validateAmount(amountPaid);
    if (amountValidation) {
      return res.status(400).json({ success: false, message: amountValidation });
    }

    // Validate date
    const dateValidation = validateDate(paymentDate);
    if (dateValidation) {
      return res.status(400).json({ success: false, message: dateValidation });
    }

    // Validate record number custom ID
    const recordIdValidation = validateCustomId(recordNumber, 'record');
    if (recordIdValidation) {
      return res.status(400).json({ success: false, message: recordIdValidation });
    }

    // Check if service record exists
    const [services] = await pool.query('SELECT RecordNumber FROM ServicePackage WHERE RecordNumber = ?', [recordNumber]);
    if (services.length === 0) {
      return res.status(400).json({ success: false, message: 'Service record not found' });
    }

    // Generate custom ID for payment number
    const paymentNumber = generatePaymentId();

    // Create payment
    await pool.query(
      'INSERT INTO Payment (PaymentNumber, AmountPaid, PaymentDate, RecordNumber) VALUES (?, ?, ?, ?)',
      [paymentNumber, parseFloat(amountPaid), paymentDate, recordNumber]
    );

    // Get created payment with joined data
    const [newPayment] = await pool.query(`
      SELECT p.*, s.ServiceDate, s.PlateNumber, c.DriverName, c.CarType, pkg.PackageName, pkg.PackagePrice
      FROM Payment p
      JOIN ServicePackage s ON p.RecordNumber = s.RecordNumber
      JOIN Car c ON s.PlateNumber = c.PlateNumber
      JOIN Package pkg ON s.PackageNumber = pkg.PackageNumber
      WHERE p.PaymentNumber = ?
    `, [paymentNumber]);

    res.status(201).json({ success: true, data: newPayment[0] });
  } catch (error) {
    console.error('Error in POST /api/payments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payments by service record number
app.get('/api/payments/service/:recordNumber', isAuthenticated, async (req, res) => {
  try {
    const recordNumber = req.params.recordNumber;

    // Validate custom ID format
    const recordIdValidation = validateCustomId(recordNumber, 'record');
    if (recordIdValidation) {
      return res.status(400).json({ success: false, message: recordIdValidation });
    }

    const [rows] = await pool.query(`
      SELECT p.*, s.ServiceDate, s.PlateNumber, c.DriverName, c.CarType, pkg.PackageName, pkg.PackagePrice
      FROM Payment p
      JOIN ServicePackage s ON p.RecordNumber = s.RecordNumber
      JOIN Car c ON s.PlateNumber = c.PlateNumber
      JOIN Package pkg ON s.PackageNumber = pkg.PackageNumber
      WHERE p.RecordNumber = ?
      ORDER BY p.CreatedAt DESC
    `, [recordNumber]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(`Error in GET /api/payments/service/${req.params.recordNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payments by date range
app.get('/api/payments/date-range/:startDate/:endDate', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    // Validate dates
    const startDateValidation = validateDate(startDate);
    if (startDateValidation) {
      return res.status(400).json({ success: false, message: `Start date: ${startDateValidation}` });
    }

    const endDateValidation = validateDate(endDate);
    if (endDateValidation) {
      return res.status(400).json({ success: false, message: `End date: ${endDateValidation}` });
    }

    const [rows] = await pool.query(`
      SELECT p.*, s.ServiceDate, s.PlateNumber, c.DriverName, c.CarType, pkg.PackageName, pkg.PackageDescription, pkg.PackagePrice
      FROM Payment p
      JOIN ServicePackage s ON p.RecordNumber = s.RecordNumber
      JOIN Car c ON s.PlateNumber = c.PlateNumber
      JOIN Package pkg ON s.PackageNumber = pkg.PackageNumber
      WHERE p.PaymentDate BETWEEN ? AND ?
      ORDER BY p.PaymentDate DESC
    `, [startDate, endDate]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(`Error in GET /api/payments/date-range/${req.params.startDate}/${req.params.endDate}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get total revenue by date range
app.get('/api/payments/revenue/:startDate/:endDate', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    // Validate dates
    const startDateValidation = validateDate(startDate);
    if (startDateValidation) {
      return res.status(400).json({ success: false, message: `Start date: ${startDateValidation}` });
    }

    const endDateValidation = validateDate(endDate);
    if (endDateValidation) {
      return res.status(400).json({ success: false, message: `End date: ${endDateValidation}` });
    }

    const [rows] = await pool.query(`
      SELECT SUM(AmountPaid) as totalRevenue
      FROM Payment
      WHERE PaymentDate BETWEEN ? AND ?
    `, [startDate, endDate]);

    const totalRevenue = rows[0].totalRevenue || 0;
    res.json({ success: true, data: { totalRevenue } });
  } catch (error) {
    console.error(`Error in GET /api/payments/revenue/${req.params.startDate}/${req.params.endDate}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== DASHBOARD ROUTES ====================

// Get dashboard statistics
app.get('/api/dashboard', isAuthenticated, async (req, res) => {
  try {
    // Get total cars
    const [carCount] = await pool.query('SELECT COUNT(*) as totalCars FROM Car');

    // Get total services
    const [serviceCount] = await pool.query('SELECT COUNT(*) as totalServices FROM ServicePackage');

    // Get total revenue
    const [revenueSum] = await pool.query('SELECT SUM(AmountPaid) as totalRevenue FROM Payment');

    // Get popular packages
    const [popularPackages] = await pool.query(`
      SELECT p.PackageName, COUNT(s.PackageNumber) as serviceCount
      FROM Package p
      LEFT JOIN ServicePackage s ON p.PackageNumber = s.PackageNumber
      GROUP BY p.PackageNumber, p.PackageName
      ORDER BY serviceCount DESC
      LIMIT 5
    `);

    const stats = {
      totalCars: carCount[0].totalCars,
      totalServices: serviceCount[0].totalServices,
      totalRevenue: revenueSum[0].totalRevenue || 0,
      popularPackages: popularPackages
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error in GET /api/dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get revenue by date range
app.get('/api/dashboard/revenue/:startDate/:endDate', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    // Validate dates
    const startDateValidation = validateDate(startDate);
    if (startDateValidation) {
      return res.status(400).json({ success: false, message: `Start date: ${startDateValidation}` });
    }

    const endDateValidation = validateDate(endDate);
    if (endDateValidation) {
      return res.status(400).json({ success: false, message: `End date: ${endDateValidation}` });
    }

    const [rows] = await pool.query(`
      SELECT DATE(p.PaymentDate) as date, SUM(p.AmountPaid) as revenue
      FROM Payment p
      WHERE p.PaymentDate BETWEEN ? AND ?
      GROUP BY DATE(p.PaymentDate)
      ORDER BY date ASC
    `, [startDate, endDate]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(`Error in GET /api/dashboard/revenue/${req.params.startDate}/${req.params.endDate}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get service statistics by date range
app.get('/api/dashboard/services/:startDate/:endDate', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    // Validate dates
    const startDateValidation = validateDate(startDate);
    if (startDateValidation) {
      return res.status(400).json({ success: false, message: `Start date: ${startDateValidation}` });
    }

    const endDateValidation = validateDate(endDate);
    if (endDateValidation) {
      return res.status(400).json({ success: false, message: `End date: ${endDateValidation}` });
    }

    const [rows] = await pool.query(`
      SELECT DATE(s.ServiceDate) as date, COUNT(*) as serviceCount
      FROM ServicePackage s
      WHERE s.ServiceDate BETWEEN ? AND ?
      GROUP BY DATE(s.ServiceDate)
      ORDER BY date ASC
    `, [startDate, endDate]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(`Error in GET /api/dashboard/services/${req.params.startDate}/${req.params.endDate}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get package popularity statistics
app.get('/api/dashboard/packages/popularity', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.PackageName, p.PackagePrice, COUNT(s.PackageNumber) as usageCount
      FROM Package p
      LEFT JOIN ServicePackage s ON p.PackageNumber = s.PackageNumber
      GROUP BY p.PackageNumber, p.PackageName, p.PackagePrice
      ORDER BY usageCount DESC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in GET /api/dashboard/packages/popularity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== REPORTS ROUTES ====================

// Get daily report by date
app.get('/api/reports/:date', isAuthenticated, async (req, res) => {
  try {
    const date = req.params.date;

    // Validate date
    const dateValidation = validateDate(date);
    if (dateValidation) {
      return res.status(400).json({ success: false, message: dateValidation });
    }

    const [rows] = await pool.query(`
      SELECT
        s.PlateNumber,
        c.DriverName,
        c.CarType,
        c.CarSize,
        p.PackageName,
        p.PackageDescription,
        p.PackagePrice,
        pay.AmountPaid,
        pay.PaymentDate,
        s.ServiceDate
      FROM ServicePackage s
      JOIN Car c ON s.PlateNumber = c.PlateNumber
      JOIN Package p ON s.PackageNumber = p.PackageNumber
      LEFT JOIN Payment pay ON s.RecordNumber = pay.RecordNumber
      WHERE DATE(s.ServiceDate) = ?
      ORDER BY s.ServiceDate ASC
    `, [date]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(`Error in GET /api/reports/${req.params.date}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Car Wash Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/users',
      cars: '/api/cars',
      packages: '/api/packages',
      services: '/api/services',
      payments: '/api/payments',
      dashboard: '/api/dashboard',
      reports: '/api/reports'
    }
  });
});

// 404 handler for API routes
app.use('/api', (req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      requestedPath: req.originalUrl,
      method: req.method,
      availableEndpoints: {
        auth: '/api/users',
        cars: '/api/cars',
        packages: '/api/packages',
        services: '/api/services',
        payments: '/api/payments',
        dashboard: '/api/dashboard',
        reports: '/api/reports'
      }
    });
  }
});

// Global 404 handler for non-API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.originalUrl,
    method: req.method
  });
});

// Start the server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Test database connection
    const connected = await testConnection();

    if (!connected) {
      console.error('Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();

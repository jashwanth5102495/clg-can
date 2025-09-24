import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG and PNG files are allowed'));
    }
  }
});

// Get all cars with filters
router.get('/', async (req, res) => {
  try {
    const { brand, location, minPrice, maxPrice, fuelType, transmission, seats } = req.query;
    
    let filter = {
      availability_status: 'available'
    };

    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    // Price filter (in INR)
    if (minPrice || maxPrice) {
      filter.price_per_day = {};
      if (minPrice) filter.price_per_day.$gte = Number(minPrice);
      if (maxPrice) filter.price_per_day.$lte = Number(maxPrice);
    }
    if (fuelType) filter.fuel_type = fuelType;
    if (transmission) filter.transmission = transmission;
    if (seats) filter.seats = Number(seats);

    const cars = await Car.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(cars);
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cars by owner (for car owners to see their own cars)
router.get('/my-cars', authenticateToken, async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user.userId })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(cars);
  } catch (error) {
    console.error('Get my cars error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single car
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid car ID format' });
    }

    const car = await Car.findById(req.params.id).populate('owner', 'name email phone');
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check car availability
router.post('/check-availability', async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;

    const conflictingBookings = await Booking.find({
      car_id: carId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          start_date: { $gte: startDate, $lte: endDate }
        },
        {
          end_date: { $gte: startDate, $lte: endDate }
        },
        {
          $and: [
            { start_date: { $lte: startDate } },
            { end_date: { $gte: endDate } }
          ]
        }
      ]
    });

    const isAvailable = conflictingBookings.length === 0;
    res.json({ available: isAvailable });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new car (Car owners and Admin)
router.post('/', authenticateToken, upload.single('image'), [
  body('model').notEmpty().withMessage('Model is required'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('price_per_day').isFloat({ min: 830, max: 83000 }).withMessage('Price per day must be between ₹830 and ₹83,000'),
  body('location').notEmpty().withMessage('Location is required'),
  body('fuel_type').isIn(['petrol', 'diesel', 'electric', 'hybrid']).withMessage('Valid fuel type is required'),
  body('transmission').isIn(['manual', 'automatic']).withMessage('Valid transmission type is required'),
  body('seats').isInt({ min: 2, max: 8 }).withMessage('Seats must be between 2 and 8')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin or renter
    if (req.user.role !== 'admin' && req.user.role !== 'renter') {
      return res.status(403).json({ message: 'Only car owners and admins can add cars' });
    }

    const carData = {
      ...req.body,
      owner: req.user.userId,
      image_url: req.file ? `/uploads/${req.file.filename}` : null
    };

    const car = new Car(carData);
    await car.save();
    
    // Populate owner info for response
    await car.populate('owner', 'name email phone');
    
    res.status(201).json({ message: 'Car added successfully', car });
  } catch (error) {
    console.error('Add car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update car (Admin only)
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    }

    const car = await Car.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car updated successfully', car });
  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete car (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
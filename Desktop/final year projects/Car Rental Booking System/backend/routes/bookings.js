import express from 'express';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import User from '../models/User.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create booking
router.post('/', authenticateToken, [
  body('car_id').notEmpty().withMessage('Valid car ID is required'),
  body('start_date').isDate().withMessage('Valid start date is required'),
  body('end_date').isDate().withMessage('Valid end date is required'),
  body('total_price').isFloat({ min: 0 }).withMessage('Valid total price is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { car_id, start_date, end_date, total_price } = req.body;

    // Validate dates
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (new Date(start_date) < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    // Check if car exists and is available
    const car = await Car.findById(car_id);
    if (!car || car.availability_status !== 'available') {
      return res.status(400).json({ message: 'Car is not available' });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      car_id,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          start_date: { $gte: start_date, $lte: end_date }
        },
        {
          end_date: { $gte: start_date, $lte: end_date }
        },
        {
          $and: [
            { start_date: { $lte: start_date } },
            { end_date: { $gte: end_date } }
          ]
        }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({ message: 'Car is not available for selected dates' });
    }

    // Validate provided total price against calculated price
    const days = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
    const calculated_price = days * car.price_per_day;
    
    if (Math.abs(total_price - calculated_price) > 1) {
      return res.status(400).json({ message: 'Invalid total price' });
    }

    // Create booking
    const booking = new Booking({
      user_id: req.user.id,
      car_id,
      start_date,
      end_date,
      total_price,
      pickup_location: car.location, // Use car's location as default
      dropoff_location: car.location // Use car's location as default
    });
    await booking.save();

    // Include car and user details in response
    const bookingWithDetails = await Booking.findById(booking._id)
      .populate('car_id', null, Car)
      .populate('user_id', 'name email', User);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: bookingWithDetails
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/user/:id', authenticateToken, async (req, res) => {
  try {
    // Users can only access their own bookings, admins can access any
    if (req.user.role !== 'admin' && req.user.id != req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bookings = await Booking.find({ user_id: req.params.id })
      .populate('car_id', null, Car)
      .populate('user_id', 'name email', User)
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bookings by car ID
router.get('/car/:carId', async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      car_id: req.params.carId,
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('user_id', 'name email', User)
      .sort({ start_date: 1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get car bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('car_id', null, Car)
      .populate('user_id', 'name email', User)
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // If booking is cancelled, make car available again
    if (status === 'cancelled') {
      await Car.findByIdAndUpdate(
        booking.car_id,
        { availability_status: 'available' }
      );
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('car_id', null, Car)
      .populate('user_id', 'name email', User);

    res.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
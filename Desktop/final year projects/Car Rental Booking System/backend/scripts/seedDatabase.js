import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Car from '../models/Car.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Car.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    
    const users = await User.create([
      {
        name: 'John Customer',
        email: 'customer@example.com',
        password: hashedPassword,
        phone: '+1234567890',
        role: 'user'
      },
      {
        name: 'Sarah Renter',
        email: 'renter@example.com',
        password: hashedPassword,
        phone: '+1234567891',
        role: 'renter'
      },
      {
        name: 'Mike Owner',
        email: 'owner@example.com',
        password: hashedPassword,
        phone: '+1234567892',
        role: 'renter'
      },
      {
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        password: hashedAdminPassword,
        phone: '+1234567893',
        role: 'admin'
      }
    ]);

    console.log('Created sample users');

    // Get renter users for car ownership
    const renters = users.filter(user => user.role === 'renter');

    // Create sample cars
    const cars = await Car.create([
      {
        model: 'Camry',
        brand: 'Toyota',
        year: 2022,
        price_per_day: 3735, // ₹3,735 per day
        location: 'Mumbai, Maharashtra',
        availability_status: 'available',
        image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
        features: 'Air Conditioning, GPS, Bluetooth, Backup Camera',
        fuel_type: 'petrol',
        transmission: 'automatic',
        seats: 5,
        owner: renters[0]._id
      },
      {
        model: 'Civic',
        brand: 'Honda',
        year: 2023,
        price_per_day: 3320, // ₹3,320 per day
        location: 'Delhi, Delhi',
        availability_status: 'available',
        image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
        features: 'Air Conditioning, GPS, Bluetooth, Lane Assist',
        fuel_type: 'petrol',
        transmission: 'manual',
        seats: 5,
        owner: renters[0]._id
      },
      {
        model: 'Model 3',
        brand: 'Tesla',
        year: 2023,
        price_per_day: 7055, // ₹7,055 per day
        location: 'Bangalore, Karnataka',
        availability_status: 'available',
        image_url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
        features: 'Autopilot, Supercharging, Premium Audio, Glass Roof',
        fuel_type: 'electric',
        transmission: 'automatic',
        seats: 5,
        owner: renters[1]._id
      },
      {
        model: 'X5',
        brand: 'BMW',
        year: 2022,
        price_per_day: 6225, // ₹6,225 per day
        location: 'Chennai, Tamil Nadu',
        availability_status: 'available',
        image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
        features: 'Leather Seats, Panoramic Roof, Navigation, Premium Sound',
        fuel_type: 'petrol',
        transmission: 'automatic',
        seats: 7,
        owner: renters[1]._id
      },
      {
        model: 'Mustang',
        brand: 'Ford',
        year: 2023,
        price_per_day: 5395, // ₹5,395 per day
        location: 'Hyderabad, Telangana',
        availability_status: 'available',
        image_url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80',
        features: 'Sport Mode, Premium Audio, Convertible, Performance Package',
        fuel_type: 'petrol',
        transmission: 'manual',
        seats: 4,
        owner: renters[0]._id
      },
      {
        model: 'Prius',
        brand: 'Toyota',
        year: 2022,
        price_per_day: 2905, // ₹2,905 per day
        location: 'Pune, Maharashtra',
        availability_status: 'available',
        image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
        features: 'Hybrid Engine, Eco Mode, Backup Camera, Bluetooth',
        fuel_type: 'hybrid',
        transmission: 'automatic',
        seats: 5,
        owner: renters[1]._id
      }
    ]);

    console.log('Created sample cars');
    console.log(`Seeded database with ${users.length} users and ${cars.length} cars`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
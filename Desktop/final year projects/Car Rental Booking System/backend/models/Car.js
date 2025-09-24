import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
    maxlength: 100
  },
  brand: {
    type: String,
    required: true,
    maxlength: 50
  },
  year: {
    type: Number,
    required: true
  },
  price_per_day: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true,
    maxlength: 100
  },
  availability_status: {
    type: String,
    enum: ['available', 'booked', 'maintenance'],
    default: 'available'
  },
  image_url: {
    type: String,
    maxlength: 255
  },
  features: {
    type: String
  },
  fuel_type: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    default: 'petrol'
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    default: 'manual'
  },
  seats: {
    type: Number,
    default: 4
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Car = mongoose.model('Car', carSchema);

export default Car;
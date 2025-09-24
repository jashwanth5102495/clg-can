import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    maxlength: 255
  },
  phone: {
    type: String,
    required: true,
    maxlength: 20
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'renter'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
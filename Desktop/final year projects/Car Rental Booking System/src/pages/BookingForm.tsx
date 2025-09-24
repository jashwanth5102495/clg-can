import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Fuel, Settings, ArrowLeft, AlertCircle } from 'lucide-react';
import { carsApi, bookingsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../utils/currency';

interface Car {
  id: string;
  model: string;
  brand: string;
  price_per_day: number;
  image_url: string;
}

const BookingForm: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState<{ available: boolean } | null>(null);
  
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    pickup_location: '',
    dropoff_location: ''
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchCarDetails();
  }, [carId]);

  useEffect(() => {
    if (formData.start_date && formData.end_date && car) {
      checkAvailability();
    }
  }, [formData.start_date, formData.end_date, car]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const response = await carsApi.getById(carId!);
      setCar(response.data);
      // Pre-fill pickup location with car's location
      setFormData(prev => ({
        ...prev,
        pickup_location: response.data.location,
        dropoff_location: response.data.location
      }));
    } catch (error) {
      console.error('Error fetching car details:', error);
      setError('Failed to load car details');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      const response = await carsApi.checkAvailability({
        carId: carId!,
        startDate: formData.start_date,
        endDate: formData.end_date
      });
      setAvailability(response.data);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotalPrice = () => {
    if (!car || !formData.start_date || !formData.end_date) return 0;
    
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return days > 0 ? days * car.price_per_day : 0;
  };

  const getDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return days > 0 ? days : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!availability?.available) {
        throw new Error('Car is not available for selected dates');
      }

      const response = await bookingsApi.create({
        car_id: carId!,
        ...formData
      });

      // Redirect to payment page
      navigate(`/payment/${response.data.booking.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Car Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const days = getDays();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Car Details
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Book Your Car</h1>
            <p className="text-gray-600">Complete the form below to book your rental</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
            {/* Car Info */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6">
                <img
                  src={car.image_url ? `http://localhost:5000${car.image_url}` : 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {car.brand} {car.model}
                </h3>
                <div className="flex items-center text-blue-600 mb-4">
                  <DollarSign className="h-5 w-5 mr-1" />
                  <span className="text-xl font-bold">{formatINR(car.price_per_day)}</span>
                  <span className="text-gray-600 ml-1">per day</span>
                </div>

                {/* Booking Summary */}
                {days > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{days} day{days > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily rate:</span>
                        <span className="font-medium">{formatINR(car.price_per_day)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-blue-600">{formatINR(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        required
                        min={today}
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.start_date}
                        onChange={handleChange}
                      />
                      <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Return Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="end_date"
                        name="end_date"
                        required
                        min={formData.start_date || today}
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.end_date}
                        onChange={handleChange}
                      />
                      <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Availability Check */}
                {availability && formData.start_date && formData.end_date && (
                  <div className={`p-4 rounded-md ${availability.available ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {availability.available ? '✓ Car is available for selected dates' : '✗ Car is not available for selected dates'}
                  </div>
                )}

                {/* Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="pickup_location" className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="pickup_location"
                        name="pickup_location"
                        required
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter pickup location"
                        value={formData.pickup_location}
                        onChange={handleChange}
                      />
                      <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dropoff_location" className="block text-sm font-medium text-gray-700 mb-2">
                      Drop-off Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="dropoff_location"
                        name="dropoff_location"
                        required
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter drop-off location"
                        value={formData.dropoff_location}
                        onChange={handleChange}
                      />
                      <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={submitting || !availability?.available || days === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    {submitting ? 'Creating Booking...' : `Proceed to Payment (${totalPrice > 0 ? formatINR(totalPrice) : 'Calculate'})`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
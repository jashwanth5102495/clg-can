import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Fuel, Settings, ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { carsApi, bookingsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../utils/currency';

interface Car {
  id: string;
  model: string;
  brand: string;
  year: number;
  price_per_day: number;
  location: string;
  image_url: string;
  fuel_type: string;
  transmission: string;
  seats: number;
  features: string;
  availability_status: string;
}

interface Booking {
  id: number;
  start_date: string;
  end_date: string;
  status: string;
}

const BookCar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  
  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCarDetails();
    fetchExistingBookings();
  }, [id, user]);

  useEffect(() => {
    calculateTotal();
  }, [startDate, endDate, car]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const response = await carsApi.getById(id!);
      setCar(response.data);
    } catch (error) {
      console.error('Error fetching car details:', error);
      setError('Failed to load car details');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingBookings = async () => {
    try {
      const response = await bookingsApi.getByCarId(id!);
      setExistingBookings(response.data.filter((booking: Booking) => 
        booking.status === 'confirmed' || booking.status === 'pending'
      ));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const calculateTotal = () => {
    if (startDate && endDate && car) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        setTotalDays(diffDays);
        setTotalPrice(diffDays * car.price_per_day);
      } else {
        setTotalDays(0);
        setTotalPrice(0);
      }
    }
  };

  const isDateAvailable = (date: string) => {
    const checkDate = new Date(date);
    return !existingBookings.some(booking => {
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      return checkDate >= bookingStart && checkDate <= bookingEnd;
    });
  };

  const isDateRangeAvailable = () => {
    if (!startDate || !endDate) return true;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (!isDateAvailable(d.toISOString().split('T')[0])) {
        return false;
      }
    }
    return true;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date');
      return;
    }

    if (new Date(startDate) < new Date()) {
      setError('Start date cannot be in the past');
      return;
    }

    if (!isDateRangeAvailable()) {
      setError('Selected dates are not available');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');
      
      await bookingsApi.create({
        car_id: parseInt(id!),
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice
      });

      setSuccess('Booking confirmed successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setError(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinEndDate = () => {
    if (!startDate) return getMinDate();
    const start = new Date(startDate);
    start.setDate(start.getDate() + 1);
    return start.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Car Not Found</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            Browse Cars
          </Link>
        </div>
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Car Details
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Car Summary */}
          <div className="bg-blue-50 p-6 border-b">
            <div className="flex items-center space-x-4">
              <img
                src={car.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=200&q=80'}
                alt={`${car.brand} ${car.model}`}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=200&q=80';
                }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {car.brand} {car.model}
                </h1>
                <p className="text-gray-600">{car.year}</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatINR(car.price_per_day)} per day
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-green-800">{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-6">
              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={getMinDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={getMinEndDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Availability Status */}
              {startDate && endDate && (
                <div className={`p-4 rounded-lg border ${
                  isDateRangeAvailable() 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center">
                    {isDateRangeAvailable() ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-800">Available for selected dates</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-red-800">Not available for selected dates</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              {totalDays > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{totalDays} day{totalDays > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per day:</span>
                      <span className="font-medium">{formatINR(car.price_per_day)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">{formatINR(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={bookingLoading || !isDateRangeAvailable() || totalDays === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg"
              >
                {bookingLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Calendar className="h-5 w-5 inline mr-2" />
                    Confirm Booking
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCar;
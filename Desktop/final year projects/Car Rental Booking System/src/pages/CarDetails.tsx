import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Users, Fuel, Settings, Calendar, Star, ArrowLeft, IndianRupee } from 'lucide-react';
import { carsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../utils/currency';

interface Car {
  _id: string;
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

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

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

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Car Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">{error || 'The car you are looking for does not exist.'}</p>
          <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            Browse Cars
          </Link>
        </div>
      </div>
    );
  }

  const features = car.features ? car.features.split(',').map(f => f.trim()) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Cars
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Car Image */}
            <div className="aspect-w-16 aspect-h-12">
              <img
                src={car.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-96 lg:h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>

            {/* Car Details */}
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {car.brand} {car.model}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">{car.year}</p>
                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    car.availability_status === 'available' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {car.availability_status === 'available' ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6 transition-colors">
                <div className="flex items-center justify-center">
                  <IndianRupee className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-2" />
                  <div className="text-center">
                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{formatINR(car.price_per_day)}</span>
                    <p className="text-gray-600 dark:text-gray-300">per day</p>
                  </div>
                </div>
              </div>

              {/* Car Specifications */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">{car.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <Fuel className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fuel Type</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{car.fuel_type}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Seats</p>
                    <p className="font-medium text-gray-900 dark:text-white">{car.seats} people</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Transmission</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{car.transmission}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3"></div>
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Now Button */}
              <div className="space-y-4">
                {car.availability_status === 'available' ? (
                  <button
                    onClick={handleBookNow}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg"
                  >
                    <Calendar className="h-5 w-5 inline mr-2" />
                    Book Now
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white font-medium py-4 px-6 rounded-lg cursor-not-allowed text-lg"
                  >
                    Currently Unavailable
                  </button>
                )}
                
                {!user && (
                  <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                    <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      Sign in
                    </Link>{' '}
                    to book this car
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
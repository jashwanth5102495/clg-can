import React, { useState } from 'react';
import { Upload, Car, DollarSign, MapPin, Calendar, Fuel, Settings, Users } from 'lucide-react';

interface CarListingFormProps {
  onSubmit: (carData: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface CarFormData {
  model: string;
  brand: string;
  year: number;
  price_per_day: number;
  location: string;
  fuel_type: string;
  transmission: string;
  seats: number;
  features: string;
}

const CarListingForm: React.FC<CarListingFormProps> = ({ onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState<CarFormData>({
    model: '',
    brand: '',
    year: new Date().getFullYear(),
    price_per_day: 2000,
    location: '',
    fuel_type: 'petrol',
    transmission: 'manual',
    seats: 4,
    features: ''
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
    'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
    'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'price_per_day' || name === 'seats' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }
    if (formData.price_per_day < 830 || formData.price_per_day > 83000) {
      newErrors.price_per_day = 'Price must be between ₹830 and ₹83,000';
    }
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!selectedImage) newErrors.image = 'Car image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value.toString());
    });
    
    if (selectedImage) {
      submitData.append('image', selectedImage);
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting car listing:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Car className="w-6 h-6 text-blue-600" />
          List Your Car
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Car Image *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Car preview"
                  className="mx-auto h-48 w-auto rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <label htmlFor="image-upload" className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Click to upload
                  </label>
                  <span> or drag and drop</span>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
        </div>

        {/* Car Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Brand *
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g., Toyota, Honda, Maruti"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.brand && <p className="text-sm text-red-600">{errors.brand}</p>}
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Model *
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              placeholder="e.g., Camry, City, Swift"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.model && <p className="text-sm text-red-600">{errors.model}</p>}
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Year *
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              min="1990"
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.year && <p className="text-sm text-red-600">{errors.year}</p>}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Price per Day (₹) *
            </label>
            <input
              type="number"
              name="price_per_day"
              value={formData.price_per_day}
              onChange={handleInputChange}
              min="830"
              max="83000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.price_per_day && <p className="text-sm text-red-600">{errors.price_per_day}</p>}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Location *
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a city</option>
              {indianCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
          </div>

          {/* Fuel Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Fuel className="w-4 h-4" />
              Fuel Type *
            </label>
            <select
              name="fuel_type"
              value={formData.fuel_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Transmission */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Transmission *
            </label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </div>

          {/* Seats */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Seats *
            </label>
            <select
              name="seats"
              value={formData.seats}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num} Seats</option>
              ))}
            </select>
          </div>
        </div>

        {/* Features/Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Features & Description
          </label>
          <textarea
            name="features"
            value={formData.features}
            onChange={handleInputChange}
            rows={4}
            placeholder="Describe your car's features, condition, and any special amenities (e.g., Air Conditioning, GPS, Bluetooth, etc.)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Listing Car...' : 'List My Car'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarListingForm;
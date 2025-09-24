import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Check, X, ArrowLeft } from 'lucide-react';
import { bookingsApi, paymentsApi } from '../services/api';

interface Booking {
  id: number;
  total_price: number;
  start_date: string;
  end_date: string;
  pickup_location: string;
  dropoff_location: string;
  car: {
    brand: string;
    model: string;
    image_url: string;
  };
}

const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    message: string;
    transactionId?: string;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      // Since we don't have a direct endpoint for single booking, we'll need to get it from user bookings
      // For now, we'll create the booking object from the form data stored in localStorage or from the API
      setError('Unable to fetch booking details. Please try again.');
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!bookingId) return;
    
    setProcessing(true);
    setError('');

    try {
      const response = await paymentsApi.create({
        booking_id: parseInt(bookingId),
        method: paymentMethod
      });

      const { payment, message } = response.data;
      
      setPaymentResult({
        success: payment.status === 'completed',
        message,
        transactionId: payment.transaction_id
      });

      if (payment.status === 'completed') {
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Payment Success/Failure Result
  if (paymentResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {paymentResult.success ? (
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-4">{paymentResult.message}</p>
                {paymentResult.transactionId && (
                  <p className="text-sm text-gray-500 mb-6">
                    Transaction ID: {paymentResult.transactionId}
                  </p>
                )}
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <p className="text-green-800 text-sm">
                    Your booking has been confirmed! Redirecting to dashboard...
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
                <p className="text-gray-600 mb-6">{paymentResult.message}</p>
                <button
                  onClick={() => setPaymentResult(null)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 text-gray-600 hover:text-gray-900 text-sm underline"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Simplified payment form since we can't fetch booking details
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
            <p className="text-gray-600">Secure payment processing</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <CreditCard className="h-8 w-8 text-gray-700" />
                  </div>
                  <p className="font-medium text-gray-900">Credit/Debit Card</p>
                  <p className="text-sm text-gray-600">Pay with your card</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    paymentMethod === 'cash'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Banknote className="h-8 w-8 text-gray-700" />
                  </div>
                  <p className="font-medium text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay when you pick up</p>
                </button>
              </div>
            </div>

            {/* Payment Form (Simulated) */}
            {paymentMethod === 'card' && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Card Details (Demo)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value="1234 5678 9012 3456"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value="12/25"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value="123"
                      readOnly
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  * This is a demo payment form. Card details are pre-filled for testing.
                </p>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="mb-8 p-6 bg-yellow-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Cash Payment Instructions</h4>
                <p className="text-gray-700">
                  You will pay in cash when you pick up the vehicle. Please bring the exact amount 
                  or be prepared for change. Your booking will be confirmed upon payment.
                </p>
              </div>
            )}

            {/* Process Payment Button */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg"
            >
              {processing ? 'Processing Payment...' : `Process ${paymentMethod === 'card' ? 'Card' : 'Cash'} Payment`}
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              By proceeding, you agree to our terms and conditions. This is a simulated payment system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
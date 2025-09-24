# Car Rental Booking System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+91-9876543210",
  "role": "user" // optional, defaults to "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91-9876543210",
      "role": "user",
      "isActive": true
    },
    "token": "jwt-token-here"
  },
  "message": "User registered successfully"
}
```

### Login User
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwt-token-here"
  },
  "message": "Login successful"
}
```

## Car Endpoints

### Get All Cars
**GET** `/cars`

Retrieve all available cars with optional filtering.

**Query Parameters:**
- `brand` (string): Filter by car brand
- `location` (string): Filter by location
- `minPrice` (number): Minimum price per day in INR
- `maxPrice` (number): Maximum price per day in INR
- `fuelType` (string): Filter by fuel type (petrol/diesel/electric/hybrid)
- `transmission` (string): Filter by transmission (manual/automatic)
- `seats` (number): Filter by number of seats

**Example Request:**
```
GET /cars?brand=Toyota&location=Mumbai&minPrice=2000&maxPrice=5000
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "model": "Camry",
      "brand": "Toyota",
      "year": 2023,
      "price_per_day": 2905,
      "location": "Mumbai",
      "availability_status": "available",
      "image_url": "/uploads/car1.jpg",
      "fuel_type": "petrol",
      "transmission": "automatic",
      "seats": 5,
      "features": "AC, GPS, Bluetooth"
    }
  ]
}
```

### Get Car by ID
**GET** `/cars/:id`

Retrieve details of a specific car.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "model": "Camry",
    "brand": "Toyota",
    "year": 2023,
    "price_per_day": 2905,
    "location": "Mumbai",
    "availability_status": "available",
    "image_url": "/uploads/car1.jpg",
    "fuel_type": "petrol",
    "transmission": "automatic",
    "seats": 5,
    "features": "AC, GPS, Bluetooth"
  }
}
```

### Check Car Availability
**POST** `/cars/check-availability`

Check if a car is available for specific dates.

**Request Body:**
```json
{
  "carId": 1,
  "startDate": "2024-02-01",
  "endDate": "2024-02-05"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "conflictingBookings": []
  }
}
```

### Add New Car (Admin Only)
**POST** `/cars`

Add a new car to the system.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `model` (string): Car model
- `brand` (string): Car brand
- `year` (number): Manufacturing year
- `price_per_day` (number): Daily rental price in INR (830-83000)
- `location` (string): Car location
- `fuel_type` (string): petrol/diesel/electric/hybrid
- `transmission` (string): manual/automatic
- `seats` (number): Number of seats
- `features` (string): Car features
- `image` (file): Car image file

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "model": "Swift",
    "brand": "Maruti",
    "year": 2023,
    "price_per_day": 1660,
    "location": "Delhi",
    "availability_status": "available",
    "image_url": "/uploads/car2.jpg",
    "fuel_type": "petrol",
    "transmission": "manual",
    "seats": 5,
    "features": "AC, Music System"
  },
  "message": "Car added successfully"
}
```

### Update Car (Admin Only)
**PUT** `/cars/:id`

Update car details.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "model": "Swift Dzire",
  "price_per_day": 1830,
  "availability_status": "maintenance"
}
```

### Delete Car (Admin Only)
**DELETE** `/cars/:id`

Delete a car from the system.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Car deleted successfully"
}
```

## Booking Endpoints

### Create Booking
**POST** `/bookings`

Create a new car booking.

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Request Body:**
```json
{
  "carId": 1,
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "pickupLocation": "Mumbai Airport",
  "dropoffLocation": "Mumbai Central"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "car_id": 1,
    "start_date": "2024-02-01",
    "end_date": "2024-02-05",
    "total_price": 11620,
    "status": "pending",
    "pickup_location": "Mumbai Airport",
    "dropoff_location": "Mumbai Central"
  },
  "message": "Booking created successfully"
}
```

### Get User Bookings
**GET** `/bookings/user/:userId`

Get all bookings for a specific user.

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "start_date": "2024-02-01",
      "end_date": "2024-02-05",
      "total_price": 11620,
      "status": "confirmed",
      "pickup_location": "Mumbai Airport",
      "dropoff_location": "Mumbai Central",
      "Car": {
        "model": "Camry",
        "brand": "Toyota",
        "image_url": "/uploads/car1.jpg"
      }
    }
  ]
}
```

### Get All Bookings (Admin Only)
**GET** `/bookings`

Get all bookings in the system.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

### Update Booking Status (Admin Only)
**PUT** `/bookings/:id`

Update booking status.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

## Payment Endpoints

### Process Payment
**POST** `/payments`

Process payment for a booking.

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Request Body:**
```json
{
  "bookingId": 1,
  "amount": 11620,
  "method": "card",
  "cardDetails": {
    "number": "4111111111111111",
    "expiry": "12/25",
    "cvv": "123",
    "name": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 1,
    "amount": 11620,
    "method": "card",
    "status": "completed",
    "transaction_id": "txn_1234567890"
  },
  "message": "Payment processed successfully"
}
```

### Get Payment Details
**GET** `/payments/:bookingId`

Get payment details for a booking.

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

## User Management Endpoints (Admin Only)

### Get All Users
**GET** `/users`

Get all users in the system.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

### Toggle User Status
**PUT** `/users/:id/toggle-status`

Block or unblock a user.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

### Get Dashboard Statistics
**GET** `/users/dashboard/stats`

Get admin dashboard statistics.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalCars": 25,
    "totalBookings": 89,
    "totalRevenue": 245670,
    "activeBookings": 12,
    "availableCars": 18
  }
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

## Rate Limiting

API requests are limited to 100 requests per minute per IP address.

## File Upload

Car images are uploaded to the `/uploads` directory with the following constraints:
- Maximum file size: 5MB
- Allowed formats: JPG, JPEG, PNG, GIF
- Files are renamed with timestamp to avoid conflicts

## Currency

All monetary values in the API are in Indian Rupees (INR). The frontend automatically formats these values with the ₹ symbol using the `formatINR` utility function.
# Car Rental Booking System

A comprehensive full-stack car rental booking system built with React.js frontend and Node.js/Express backend. Features include user authentication, car browsing, booking management, payment simulation, and admin dashboard. All pricing is displayed in Indian Rupees (₹).

## 🚀 Features

### User Features
- **Authentication**: JWT-based login and registration with password hashing
- **Car Browsing**: Advanced filtering by brand, location, price, fuel type, transmission
- **Booking System**: Date selection with availability checking and price calculation
- **Payment Simulation**: Mock payment processing with card and cash options
- **Dashboard**: Personal booking history and management

### Admin Features
- **Dashboard**: Statistics overview with key metrics
- **Car Management**: Full CRUD operations with image upload
- **Booking Management**: View and update booking statuses
- **User Management**: Block/unblock users and view user statistics

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Availability**: Dynamic car availability checking
- **File Upload**: Car image management with local storage
- **Database Relations**: Proper foreign key relationships
- **API Security**: JWT middleware protection
- **Error Handling**: Comprehensive error management

## 🛠 Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Lucide React for icons
- Custom currency formatting utilities for INR

### Backend
- Node.js with Express.js
- MySQL with Sequelize ORM
- JWT for authentication
- bcryptjs for password hashing
- Multer for file uploads
- CORS for cross-origin requests

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- Git

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database credentials:
     ```
     DB_HOST=localhost
     DB_USER=your_mysql_username
     DB_PASS=your_mysql_password
     DB_NAME=car_rental
     JWT_SECRET=your-super-secret-jwt-key
     ```

4. Create MySQL database:
   ```sql
   CREATE DATABASE car_rental;
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:5000

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## 🗄 Database Schema

### Users Table
- `id` (Primary Key, Auto Increment)
- `name` (String, Not Null)
- `email` (String, Unique, Not Null)
- `password` (String, Hashed, Not Null)
- `phone` (String, Not Null)
- `role` (Enum: user/admin, Default: user)
- `isActive` (Boolean, Default: true)

### Cars Table
- `id` (Primary Key, Auto Increment)
- `model` (String, Not Null)
- `brand` (String, Not Null)
- `year` (Integer, Not Null)
- `price_per_day` (Decimal, Not Null, in INR)
- `location` (String, Not Null)
- `availability_status` (Enum: available/booked/maintenance)
- `image_url` (String, Nullable)
- `fuel_type` (Enum: petrol/diesel/electric/hybrid)
- `transmission` (Enum: manual/automatic)
- `seats` (Integer, Default: 4)
- `features` (Text, Nullable)

### Bookings Table
- `id` (Primary Key, Auto Increment)
- `user_id` (Foreign Key → Users)
- `car_id` (Foreign Key → Cars)
- `start_date` (Date, Not Null)
- `end_date` (Date, Not Null)
- `total_price` (Decimal, Not Null, in INR)
- `status` (Enum: pending/confirmed/cancelled/completed)
- `pickup_location` (String, Not Null)
- `dropoff_location` (String, Not Null)

### Payments Table
- `id` (Primary Key, Auto Increment)
- `booking_id` (Foreign Key → Bookings)
- `amount` (Decimal, Not Null, in INR)
- `method` (Enum: card/cash)
- `status` (Enum: pending/completed/failed)
- `transaction_id` (String, Nullable)

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Cars
- `GET /api/cars` - Get all available cars (with filters)
- `GET /api/cars/:id` - Get single car details
- `POST /api/cars/check-availability` - Check car availability
- `POST /api/cars` - Add new car (Admin only)
- `PUT /api/cars/:id` - Update car (Admin only)
- `DELETE /api/cars/:id` - Delete car (Admin only)

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/user/:id` - Get user's bookings
- `GET /api/bookings` - Get all bookings (Admin only)
- `PUT /api/bookings/:id` - Update booking status (Admin only)

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments/:bookingId` - Get payment details

### Users
- `GET /api/users` - Get all users (Admin only)
- `PUT /api/users/:id/toggle-status` - Block/unblock user (Admin only)
- `GET /api/users/dashboard/stats` - Get dashboard statistics (Admin only)

## 🎨 Design Features

- **Modern UI**: Clean, professional design with smooth animations
- **Responsive Layout**: Optimized for mobile, tablet, and desktop
- **Color System**: Consistent blue (#3B82F6) and emerald (#10B981) palette
- **Interactive Elements**: Hover effects, loading states, and micro-interactions
- **Accessibility**: Proper focus states and keyboard navigation
- **Typography**: Clear hierarchy with readable font sizes

## 👤 Demo Accounts

### Admin Account
- Email: admin@example.com
- Password: admin123

### User Account
- Email: user@example.com
- Password: user123

## 🚦 Usage

1. **Browse Cars**: Visit homepage to view available cars with filtering options
2. **Register/Login**: Create account or login with demo credentials
3. **Book Car**: Select car, choose dates, and complete booking form
4. **Make Payment**: Choose payment method and complete transaction
5. **Manage Bookings**: View booking history in user dashboard
6. **Admin Panel**: Access admin features for managing cars, bookings, and users

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured cross-origin resource sharing
- **Route Protection**: Middleware-based route authentication
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: Custom breakpoints for tablet and desktop
- **Navigation**: Mobile-friendly hamburger menu
- **Tables**: Responsive tables with horizontal scrolling
- **Forms**: Touch-friendly form inputs

## 🧪 Testing

The application includes comprehensive error handling and validation:
- Form validation on both frontend and backend
- Database constraint enforcement
- API error responses with proper HTTP status codes
- User feedback for all operations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

For detailed information about the project, please refer to the following comprehensive documentation:

### **📖 Core Documentation**
- **[System Overview](docs/SYSTEM_OVERVIEW.md)** - Complete system workflow and how everything works together
- **[Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)** - Detailed technical implementation, data flow, and architecture
- **[API Documentation](docs/API.md)** - Complete API reference with endpoints and examples
- **[Setup Guide](docs/SETUP.md)** - Step-by-step installation and configuration
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[User Guide](docs/USER_GUIDE.md)** - Comprehensive user manual with troubleshooting

### **📋 Additional Resources**
- **[Changelog](CHANGELOG.md)** - Version history and migration notes
- **[Contributing Guidelines](#contributing)** - How to contribute to the project

### **🔍 Quick Navigation**
- **New to the project?** Start with [System Overview](docs/SYSTEM_OVERVIEW.md)
- **Want technical details?** Check [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- **Setting up locally?** Follow the [Setup Guide](docs/SETUP.md)
- **Deploying to production?** Use the [Deployment Guide](docs/DEPLOYMENT.md)
- **Need API reference?** See [API Documentation](docs/API.md)
- **User having issues?** Refer to [User Guide](docs/USER_GUIDE.md)

## 🙏 Acknowledgments

- Icons by [Lucide React](https://lucide.dev/)
- Stock images from [Pexels](https://pexels.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
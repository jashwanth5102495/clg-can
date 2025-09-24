# Car Rental Booking System - Setup Guide

This guide will help you set up the Car Rental Booking System on your local machine for development and testing purposes.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v16.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version` and `npm --version`

- **MySQL** (v8.0 or higher)
  - Download from [mysql.com](https://dev.mysql.com/downloads/mysql/)
  - Or use XAMPP/WAMP for Windows users

- **Git** (for cloning the repository)
  - Download from [git-scm.com](https://git-scm.com/)

### Optional but Recommended
- **MySQL Workbench** (for database management)
- **Postman** (for API testing)
- **VS Code** (recommended code editor)

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd car-rental-booking-system
```

### 2. Database Setup

#### Option A: Using MySQL Command Line
1. Open MySQL command line or MySQL Workbench
2. Create a new database:
```sql
CREATE DATABASE car_rental;
USE car_rental;
```

#### Option B: Using XAMPP/WAMP
1. Start Apache and MySQL services
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Create a new database named `car_rental`

### 3. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration
1. Create a `.env` file in the backend directory:
```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

2. Edit the `.env` file with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=car_rental
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

#### Database Migration and Seeding
1. Start the backend server (this will create tables automatically):
```bash
npm run dev
```

2. In a new terminal, seed the database with sample data:
```bash
node scripts/seedDatabase.js
```

The backend server should now be running on `http://localhost:5000`

### 4. Frontend Setup

Open a new terminal and navigate to the project root:
```bash
cd ..
```

#### Install Dependencies
```bash
npm install
```

#### Start Development Server
```bash
npm run dev
```

The frontend should now be running on `http://localhost:5173`

## Verification

### 1. Check Backend API
Open your browser and visit:
- `http://localhost:5000/api/cars` - Should return a list of cars
- `http://localhost:5000/api/health` - Should return server status

### 2. Check Frontend
Open your browser and visit:
- `http://localhost:5173` - Should display the car rental homepage

### 3. Test Login
Use these demo accounts to test the system:

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**User Account:**
- Email: `user@example.com`
- Password: `user123`

## Project Structure

```
car-rental-booking-system/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── scripts/           # Database seeding scripts
│   ├── uploads/           # File upload directory
│   ├── .env               # Environment variables
│   ├── package.json       # Backend dependencies
│   └── server.js          # Main server file
├── src/                   # React frontend
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   └── main.tsx          # Main React entry point
├── docs/                 # Documentation
├── package.json          # Frontend dependencies
└── README.md            # Project overview
```

## Development Workflow

### Running Both Servers
For development, you'll need to run both frontend and backend servers:

1. **Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

2. **Terminal 2 - Frontend:**
```bash
npm run dev
```

### Making Changes
- Backend changes will automatically restart the server (using nodemon)
- Frontend changes will automatically refresh the browser (using Vite HMR)

## Common Issues and Solutions

### Issue 1: Database Connection Error
**Error:** `SequelizeConnectionError: Access denied for user`

**Solution:**
1. Check your MySQL credentials in `.env`
2. Ensure MySQL service is running
3. Verify the database `car_rental` exists

### Issue 2: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

2. Or change the port in `.env`:
```env
PORT=5001
```

### Issue 3: Module Not Found
**Error:** `Cannot find module 'xyz'`

**Solution:**
1. Delete `node_modules` and `package-lock.json`
2. Reinstall dependencies:
```bash
npm install
```

### Issue 4: CORS Error
**Error:** `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:**
- This should be automatically handled by the backend CORS configuration
- If issues persist, check the CORS settings in `backend/server.js`

### Issue 5: File Upload Issues
**Error:** File uploads not working

**Solution:**
1. Ensure the `uploads` directory exists in the backend folder
2. Check file permissions
3. Verify the file size is under 5MB

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| DB_HOST | MySQL host | localhost | Yes |
| DB_USER | MySQL username | root | Yes |
| DB_PASS | MySQL password | - | Yes |
| DB_NAME | Database name | car_rental | Yes |
| DB_PORT | MySQL port | 3306 | No |
| JWT_SECRET | JWT signing secret | - | Yes |
| PORT | Server port | 5000 | No |
| NODE_ENV | Environment | development | No |

## Database Schema

The application will automatically create the following tables:
- `users` - User accounts and authentication
- `cars` - Car inventory and details
- `bookings` - Rental bookings
- `payments` - Payment transactions

## API Testing

Use Postman or similar tools to test the API endpoints:

1. Import the API collection (if available)
2. Set the base URL to `http://localhost:5000/api`
3. For protected routes, add the JWT token to the Authorization header

## Production Deployment

For production deployment, consider:

1. **Environment Variables:**
   - Use strong JWT secrets
   - Configure production database
   - Set NODE_ENV=production

2. **Security:**
   - Enable HTTPS
   - Configure proper CORS origins
   - Set up rate limiting
   - Use environment-specific secrets

3. **Database:**
   - Use a production MySQL instance
   - Set up regular backups
   - Configure connection pooling

4. **File Storage:**
   - Consider using cloud storage (AWS S3, Cloudinary)
   - Set up CDN for static assets

## Support

If you encounter any issues during setup:

1. Check the console logs for error messages
2. Verify all prerequisites are installed correctly
3. Ensure all environment variables are set properly
4. Check the GitHub issues page for known problems

## Next Steps

After successful setup:
1. Explore the admin dashboard at `/admin`
2. Test the booking flow as a regular user
3. Review the API documentation in `docs/API.md`
4. Customize the application for your specific needs
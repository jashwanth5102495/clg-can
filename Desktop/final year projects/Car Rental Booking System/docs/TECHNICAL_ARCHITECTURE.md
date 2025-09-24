# Technical Architecture & Implementation Guide

## 🏗️ **System Architecture Overview**

The Car Rental Booking System is built using a modern **3-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   React.js      │  │   TypeScript    │  │ Tailwind CSS │ │
│  │   Frontend      │  │   Type Safety   │  │   Styling    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Express.js    │  │   JWT Auth      │  │   Multer     │ │
│  │   REST API      │  │   Middleware    │  │ File Upload  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │     MySQL       │  │   Sequelize     │  │ File System  │ │
│  │   Database      │  │      ORM        │  │   Storage    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technology Stack Deep Dive**

### **Frontend Technologies**

#### **1. React.js 18.3.1**
- **Purpose**: Component-based UI library for building interactive user interfaces
- **Key Features Used**:
  - Functional Components with Hooks
  - State Management with useState, useEffect
  - Context API for global state (AuthContext)
  - React Router for client-side routing

#### **2. TypeScript 5.5.3**
- **Purpose**: Static type checking for JavaScript
- **Benefits**:
  - Compile-time error detection
  - Better IDE support with IntelliSense
  - Interface definitions for API responses
  - Type-safe props and state management

#### **3. Tailwind CSS 3.4.1**
- **Purpose**: Utility-first CSS framework
- **Configuration**:
  ```javascript
  // tailwind.config.js
  module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        colors: {
          primary: '#3B82F6',
          secondary: '#10B981'
        }
      }
    }
  }
  ```

#### **4. Vite 5.4.8**
- **Purpose**: Fast build tool and development server
- **Features**:
  - Hot Module Replacement (HMR)
  - Fast cold start
  - Optimized production builds
  - TypeScript support out of the box

#### **5. Lucide React**
- **Purpose**: Beautiful, customizable SVG icons
- **Usage**: Consistent iconography across the application

### **Backend Technologies**

#### **1. Node.js with Express.js 4.19.2**
- **Purpose**: Server-side JavaScript runtime and web framework
- **Architecture Pattern**: RESTful API design
- **Middleware Stack**:
  ```javascript
  app.use(cors())           // Cross-Origin Resource Sharing
  app.use(express.json())   // JSON body parsing
  app.use(express.static()) // Static file serving
  app.use('/uploads', ...)  // File upload handling
  ```

#### **2. MySQL 8.0**
- **Purpose**: Relational database management system
- **Configuration**:
  ```javascript
  // config/database.js
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false
    }
  )
  ```

#### **3. Sequelize ORM 6.37.3**
- **Purpose**: Object-Relational Mapping for MySQL
- **Features**:
  - Model definitions with associations
  - Migration support
  - Query optimization
  - Data validation

#### **4. JWT (jsonwebtoken 9.0.2)**
- **Purpose**: Stateless authentication
- **Implementation**:
  ```javascript
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
  ```

#### **5. bcrypt 5.1.1**
- **Purpose**: Password hashing and security
- **Usage**: Salt rounds of 10 for optimal security/performance balance

---

## 📊 **Database Schema & Relationships**

### **Entity Relationship Diagram**

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      Users      │       │      Cars       │       │    Bookings     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ username        │       │ model           │       │ user_id (FK)    │
│ email           │       │ brand           │       │ car_id (FK)     │
│ password_hash   │       │ year            │       │ start_date      │
│ role            │       │ price_per_day   │       │ end_date        │
│ is_blocked      │       │ location        │       │ total_price     │
│ created_at      │       │ image_url       │       │ status          │
│ updated_at      │       │ fuel_type       │       │ created_at      │
└─────────────────┘       │ transmission    │       │ updated_at      │
         │                │ seats           │       └─────────────────┘
         │                │ owner_id (FK)   │                │
         │                │ is_available    │                │
         │                │ created_at      │                │
         │                │ updated_at      │                │
         │                └─────────────────┘                │
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
                        ┌─────────────────┐
                        │    Payments     │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ booking_id (FK) │
                        │ amount          │
                        │ payment_method  │
                        │ status          │
                        │ transaction_id  │
                        │ created_at      │
                        │ updated_at      │
                        └─────────────────┘
```

### **Table Definitions**

#### **Users Table**
```sql
CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'renter', 'admin') DEFAULT 'user',
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### **Cars Table**
```sql
CREATE TABLE Cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  model VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL, -- In INR
  location VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid') NOT NULL,
  transmission ENUM('Manual', 'Automatic') NOT NULL,
  seats INT NOT NULL,
  owner_id INT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES Users(id)
);
```

#### **Bookings Table**
```sql
CREATE TABLE Bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  car_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL, -- In INR
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (car_id) REFERENCES Cars(id)
);
```

#### **Payments Table**
```sql
CREATE TABLE Payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL, -- In INR
  payment_method ENUM('card', 'cash') NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES Bookings(id)
);
```

---

## 🔄 **Data Flow Architecture**

### **1. Authentication Flow**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  Frontend   │    │   Backend   │    │  Database   │
│  (Browser)  │    │   React     │    │  Express    │    │   MySQL     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Login Form     │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. POST /auth/login                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 3. Query User     │
       │                   │                   ├──────────────────►│
       │                   │                   │ 4. User Data      │
       │                   │                   │◄──────────────────┤
       │                   │                   │ 5. Verify Password│
       │                   │                   │ 6. Generate JWT   │
       │                   │ 7. JWT Token      │                   │
       │                   │◄──────────────────┤                   │
       │ 8. Store Token    │                   │                   │
       │◄──────────────────┤                   │                   │
       │ 9. Redirect       │                   │                   │
       │◄──────────────────┤                   │                   │
```

### **2. Car Booking Flow**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  Frontend   │    │   Backend   │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Browse Cars    │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. GET /cars      │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 3. Query Cars     │
       │                   │                   ├──────────────────►│
       │                   │                   │ 4. Cars Data      │
       │                   │                   │◄──────────────────┤
       │                   │ 5. Cars List      │                   │
       │                   │◄──────────────────┤                   │
       │ 6. Display Cars   │                   │                   │
       │◄──────────────────┤                   │                   │
       │                   │                   │                   │
       │ 7. Select Car     │                   │                   │
       ├──────────────────►│                   │                   │
       │ 8. Booking Form   │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 9. POST /bookings │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 10. Create Booking│
       │                   │                   ├──────────────────►│
       │                   │                   │ 11. Booking ID    │
       │                   │                   │◄──────────────────┤
       │                   │ 12. Booking Data  │                   │
       │                   │◄──────────────────┤                   │
       │ 13. Payment Page  │                   │                   │
       │◄──────────────────┤                   │                   │
```

### **3. Payment Processing Flow**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  Frontend   │    │   Backend   │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Payment Form   │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. POST /payments │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 3. Validate Data  │
       │                   │                   │ 4. Process Payment│
       │                   │                   │ 5. Create Payment │
       │                   │                   ├──────────────────►│
       │                   │                   │ 6. Update Booking │
       │                   │                   ├──────────────────►│
       │                   │                   │ 7. Payment Result │
       │                   │                   │◄──────────────────┤
       │                   │ 8. Success/Error  │                   │
       │                   │◄──────────────────┤                   │
       │ 9. Confirmation   │                   │                   │
       │◄──────────────────┤                   │                   │
```

---

## 🔐 **Security Implementation**

### **1. Authentication & Authorization**

#### **JWT Token Structure**
```javascript
// Token Payload
{
  "userId": 123,
  "role": "user",
  "iat": 1640995200,
  "exp": 1641081600
}
```

#### **Middleware Implementation**
```javascript
// middleware/auth.js
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

### **2. Password Security**
```javascript
// Password hashing during registration
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Password verification during login
const isValidPassword = await bcrypt.compare(password, user.password_hash);
```

### **3. Input Validation**
```javascript
// Example validation for car creation
const validateCar = (req, res, next) => {
  const { model, brand, year, price_per_day } = req.body;
  
  if (!model || model.length < 2) {
    return res.status(400).json({ error: 'Model must be at least 2 characters' });
  }
  
  if (price_per_day < 830 || price_per_day > 83000) {
    return res.status(400).json({ error: 'Price must be between ₹830 and ₹83,000' });
  }
  
  next();
};
```

### **4. CORS Configuration**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

## 📁 **File Structure & Organization**

### **Frontend Structure**
```
src/
├── components/           # Reusable UI components
│   └── Navbar.tsx       # Navigation component
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Authentication state management
├── pages/               # Page components (routes)
│   ├── Home.tsx         # Landing page with car listings
│   ├── Login.tsx        # User authentication
│   ├── Register.tsx     # User registration
│   ├── CarDetails.tsx   # Individual car details
│   ├── BookingForm.tsx  # Booking creation form
│   ├── PaymentPage.tsx  # Payment processing
│   ├── UserDashboard.tsx    # User booking management
│   ├── RenterDashboard.tsx  # Renter car management
│   └── AdminDashboard.tsx   # Admin system management
├── services/            # API communication
│   └── api.ts          # Axios-based API client
├── utils/              # Utility functions
│   └── currency.ts     # INR formatting utilities
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

### **Backend Structure**
```
backend/
├── config/             # Configuration files
│   └── database.js     # Database connection setup
├── middleware/         # Express middleware
│   └── auth.js         # JWT authentication middleware
├── models/             # Sequelize model definitions
│   ├── User.js         # User model
│   ├── Car.js          # Car model
│   ├── Booking.js      # Booking model
│   ├── Payment.js      # Payment model
│   └── associations.js # Model relationships
├── routes/             # API route handlers
│   ├── auth.js         # Authentication endpoints
│   ├── cars.js         # Car management endpoints
│   ├── bookings.js     # Booking management endpoints
│   ├── payments.js     # Payment processing endpoints
│   └── users.js        # User management endpoints
├── scripts/            # Utility scripts
│   └── seedDatabase.js # Database seeding script
├── uploads/            # File upload storage
├── server.js           # Express server setup
└── package.json        # Dependencies and scripts
```

---

## 🌐 **API Endpoints & Data Exchange**

### **Authentication Endpoints**

#### **POST /auth/register**
```javascript
// Request
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user"
}

// Response
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### **POST /auth/login**
```javascript
// Request
{
  "email": "john@example.com",
  "password": "securePassword123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### **Car Management Endpoints**

#### **GET /cars**
```javascript
// Query Parameters
?brand=Toyota&location=Mumbai&minPrice=2000&maxPrice=5000&fuelType=Petrol

// Response
{
  "cars": [
    {
      "id": 1,
      "model": "Camry",
      "brand": "Toyota",
      "year": 2022,
      "price_per_day": 2905,
      "location": "Mumbai",
      "image_url": "/uploads/toyota-camry.jpg",
      "fuel_type": "Petrol",
      "transmission": "Automatic",
      "seats": 5,
      "is_available": true
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

#### **POST /cars** (Admin/Renter only)
```javascript
// Request (multipart/form-data)
{
  "model": "Civic",
  "brand": "Honda",
  "year": 2023,
  "price_per_day": 3320,
  "location": "Delhi",
  "fuel_type": "Petrol",
  "transmission": "Manual",
  "seats": 5,
  "image": [File object]
}

// Response
{
  "message": "Car added successfully",
  "car": {
    "id": 2,
    "model": "Civic",
    "brand": "Honda",
    "year": 2023,
    "price_per_day": 3320,
    "location": "Delhi",
    "image_url": "/uploads/honda-civic-1640995200.jpg",
    "fuel_type": "Petrol",
    "transmission": "Manual",
    "seats": 5,
    "owner_id": 1,
    "is_available": true
  }
}
```

### **Booking Management Endpoints**

#### **POST /bookings**
```javascript
// Request
{
  "car_id": 1,
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "total_price": 11620
}

// Response
{
  "message": "Booking created successfully",
  "booking": {
    "id": 1,
    "user_id": 1,
    "car_id": 1,
    "start_date": "2024-02-01",
    "end_date": "2024-02-05",
    "total_price": 11620,
    "status": "pending",
    "car": {
      "model": "Camry",
      "brand": "Toyota",
      "image_url": "/uploads/toyota-camry.jpg"
    }
  }
}
```

### **Payment Processing Endpoints**

#### **POST /payments**
```javascript
// Request
{
  "booking_id": 1,
  "payment_method": "card",
  "card_number": "4111111111111111",
  "expiry_month": "12",
  "expiry_year": "2025",
  "cvv": "123",
  "cardholder_name": "John Doe"
}

// Response
{
  "message": "Payment processed successfully",
  "payment": {
    "id": 1,
    "booking_id": 1,
    "amount": 11620,
    "payment_method": "card",
    "status": "completed",
    "transaction_id": "txn_1640995200123"
  }
}
```

---

## 💰 **Currency System Implementation**

### **Currency Utilities**
```typescript
// src/utils/currency.ts
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatINRNumber = (amount: number): string => {
  return new Intl.NumberFormat('en-IN').format(amount);
};
```

### **Usage Examples**
```typescript
// In React components
import { formatINR } from '../utils/currency';

// Display price
<span>{formatINR(2905)}</span> // Output: ₹2,905

// In forms
<label>Price per Day (₹)</label>
<input 
  type="number" 
  min="830" 
  max="83000"
  placeholder="Enter price in INR"
/>
```

### **Backend Validation**
```javascript
// Price validation in backend
const validatePrice = (price) => {
  const minPrice = 830;   // ₹830 (≈ $10)
  const maxPrice = 83000; // ₹83,000 (≈ $1000)
  
  if (price < minPrice || price > maxPrice) {
    throw new Error(`Price must be between ₹${minPrice} and ₹${maxPrice}`);
  }
};
```

---

## 🔄 **State Management**

### **Frontend State Architecture**

#### **1. AuthContext Implementation**
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and set user
      verifyToken(token);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### **2. Component State Management**
```typescript
// Example: Home.tsx state management
const Home: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    fuelType: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCars();
  }, [filters]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await carsApi.getCars(filters);
      setCars(response.cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };
};
```

---

## 🚀 **Performance Optimizations**

### **1. Frontend Optimizations**

#### **Code Splitting**
```typescript
// Lazy loading for better performance
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const RenterDashboard = lazy(() => import('./pages/RenterDashboard'));

// Usage with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <AdminDashboard />
</Suspense>
```

#### **Image Optimization**
```typescript
// Optimized image loading
<img 
  src={car.image_url} 
  alt={`${car.brand} ${car.model}`}
  loading="lazy"
  className="w-full h-48 object-cover"
  onError={(e) => {
    e.currentTarget.src = '/placeholder-car.jpg';
  }}
/>
```

### **2. Backend Optimizations**

#### **Database Query Optimization**
```javascript
// Efficient queries with includes
const getCarsWithOwner = async () => {
  return await Car.findAll({
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'username']
      }
    ],
    where: { is_available: true },
    order: [['created_at', 'DESC']],
    limit: 20
  });
};
```

#### **Caching Strategy**
```javascript
// Simple in-memory caching for frequently accessed data
const cache = new Map();

const getCachedCars = async (filters) => {
  const cacheKey = JSON.stringify(filters);
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const cars = await Car.findAll(/* query */);
  cache.set(cacheKey, cars);
  
  // Cache expiry
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000); // 5 minutes
  
  return cars;
};
```

---

## 🧪 **Testing Strategy**

### **Frontend Testing**
```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';

describe('Login Component', () => {
  test('renders login form', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Assert API call or navigation
  });
});
```

### **Backend Testing**
```javascript
// Example API test
const request = require('supertest');
const app = require('../server');

describe('Auth Endpoints', () => {
  test('POST /auth/register creates new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    };

    const response = await request(app)
      .post('/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.user.email).toBe(userData.email);
  });

  test('POST /auth/login returns JWT token', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body.token).toBeDefined();
    expect(response.body.user).toBeDefined();
  });
});
```

---

## 🔧 **Development Workflow**

### **1. Environment Setup**
```bash
# Frontend development
npm install
npm run dev  # Starts Vite dev server on http://localhost:5173

# Backend development
cd backend
npm install
npm run dev  # Starts Express server on http://localhost:3000
```

### **2. Database Management**
```bash
# Create database
mysql -u root -p
CREATE DATABASE car_rental_db;

# Run migrations (if using migrations)
npx sequelize-cli db:migrate

# Seed database
node backend/scripts/seedDatabase.js
```

### **3. Build Process**
```bash
# Frontend production build
npm run build
npm run preview  # Preview production build

# Backend production setup
cd backend
npm install --production
NODE_ENV=production node server.js
```

---

## 📊 **Monitoring & Logging**

### **Error Handling**
```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});
```

### **Request Logging**
```javascript
// Custom logging middleware
const logRequests = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

app.use(logRequests);
```

---

## 🔮 **Future Enhancements**

### **Planned Features**
1. **Real-time Notifications**: WebSocket integration for booking updates
2. **Payment Gateway Integration**: Razorpay/Stripe integration
3. **Mobile App**: React Native implementation
4. **Advanced Analytics**: Dashboard with charts and metrics
5. **Multi-language Support**: i18n implementation
6. **Map Integration**: Google Maps for location selection
7. **Rating System**: User reviews and ratings
8. **Chat Support**: Real-time customer support

### **Technical Improvements**
1. **Microservices Architecture**: Split into smaller services
2. **Redis Caching**: Implement Redis for better caching
3. **Docker Containerization**: Full containerization
4. **CI/CD Pipeline**: Automated testing and deployment
5. **Load Balancing**: Handle high traffic
6. **Database Optimization**: Query optimization and indexing

---

This comprehensive technical documentation covers every aspect of how the Car Rental Booking System works, from the high-level architecture down to specific implementation details. The system is designed with modern best practices, security considerations, and scalability in mind.
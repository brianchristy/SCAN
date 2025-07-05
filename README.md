# **SCAN - Senior Citizen Assistance Network**

## **Overview**
SCAN (Senior Citizen Assistance Network) is a comprehensive platform designed to connect senior citizens with volunteers willing to offer assistance in various areas such as companionship, housekeeping, gardening, medical assistance, and more. The platform creates a supportive community that enhances the quality of life for senior citizens while providing meaningful opportunities for volunteers.

---

## **Key Features**

### **For Citizens (Senior Citizens)**
- **Secure Registration & Login:** Email verification and JWT-based authentication
- **Help Request Management:** Create, view, and cancel help requests
- **Real-time Notifications:** Email notifications for request acceptance and completion
- **Completion Code System:** 6-digit verification code for request completion
- **Request Scheduling:** Schedule requests at least 3 hours in advance
- **Profile Management:** Update personal information and preferences

### **For Volunteers**
- **Volunteer Registration:** Apply to become a volunteer with admin approval
- **Request Browsing:** View available help requests in their area
- **Request Acceptance:** Accept and manage assigned requests
- **Completion Verification:** Enter completion codes to mark requests as done
- **Profile Management:** Update skills, availability, and personal information

### **For Administrators**
- **User Management:** Approve/reject volunteer applications, manage user accounts
- **Request Oversight:** Monitor all help requests and their status
- **System Management:** Override completion codes, cancel requests, manage platform
- **Analytics Dashboard:** View platform statistics and user activities

---

## **Application Workflow**

### **1. User Registration & Authentication**
```
Citizen/Volunteer Registration → Email Verification → Login → Role-based Dashboard
```

### **2. Help Request Lifecycle**
```
Citizen Creates Request → 3+ Hours Advance Scheduling → Request Available to Volunteers → 
Volunteer Accepts → Email Notification to Citizen → 6-digit Code Generated → 
Request Execution → Code Verification → Request Completion
```

### **3. Volunteer Application Process**
```
Volunteer Registration → Admin Review → Approval/Rejection → Email Notification → 
Access to Volunteer Dashboard
```

### **4. Request Management Rules**
- **Scheduling:** Requests must be scheduled at least 3 hours in advance
- **Cancellation:** Citizens can cancel requests up to 2 hours before scheduled time
- **Expiration:** Unaccepted requests automatically expire after scheduled time
- **Completion:** Requires 6-digit verification code (bypassed for admins)

### **5. Automated Processes**
- **Email Notifications:** Request acceptance, completion, expiration
- **Request Cleanup:** Expired requests automatically cleared with email notifications
- **Session Management:** Persistent authentication with localStorage

---

## **Technologies Used**

### **Frontend**
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive design
- **Zustand** for state management
- **React Router DOM** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Framer Motion** for animations
- **Lucide React** for icons

### **Backend**
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email services
- **Day.js** for date/time handling
- **Bcryptjs** for password hashing
- **CORS** for cross-origin requests

### **Development Tools**
- **ESLint** for code linting
- **Nodemon** for development server
- **Cross-env** for environment variables
- **PostCSS** and **Autoprefixer** for CSS processing

---

## **Setup Instructions**

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### **Installation Steps**

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/brianchristy/SCAN.git
   cd SCAN
   ```

2. **Install Dependencies:**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. **Environment Configuration:**
   
   Create `.env` file in the backend directory:
   ```env
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret-key
   EMAIL_USER=your-email-address
   EMAIL_PASS=your-email-app-password
   FRONTEND_URL=http://localhost:5173
   PORT=5000
   ```

4. **Start the Application:**
   ```bash
   # Start backend server
   cd backend
   node index.js
   
   # In a new terminal, start frontend
   cd frontend
   npm run dev
   ```

5. **Access the Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### **Live Demo**
- **Hosted Application:** [https://scan-app.onrender.com](https://scan-app.onrender.com)
- **Frontend Repository:** [https://github.com/brianchristy/SCAN/tree/master/frontend](https://github.com/brianchristy/SCAN/tree/master/frontend)

---

## **Test Accounts**

For testing purposes, the following accounts are available with restricted profile editing capabilities:

### **Citizen Test Account**
- **Email:** `citizen@gmail.com`
- **Password:** <span title="Click to reveal" style="cursor: pointer; user-select: none; background: #374151; padding: 2px 6px; border-radius: 4px; font-family: monospace;" onclick="this.textContent='Citizen@123'; this.style.background='#059669'; this.title='Password revealed!'">••••••••••</span> *(Click to reveal)*
- **Role:** Citizen
- **Profile Restrictions:** Name and contact number fields are locked and cannot be edited

### **Volunteer Test Account**
- **Email:** `volunteer@gmail.com`
- **Password:** <span title="Click to reveal" style="cursor: pointer; user-select: none; background: #374151; padding: 2px 6px; border-radius: 4px; font-family: monospace;" onclick="this.textContent='Volunteer@123'; this.style.background='#059669'; this.title='Password revealed!'">••••••••••</span> *(Click to reveal)*
- **Role:** Volunteer
- **Profile Restrictions:** Name and contact number fields are locked, but skills and location can still be updated

### **Test Account Features**
- ✅ **Login Access:** Both accounts can log in normally
- ✅ **Dashboard Access:** Full access to respective dashboards
- ✅ **Help Request System:** Can create and manage help requests (citizen)
- ✅ **Volunteer Services:** Can browse and accept requests (volunteer)
- 🔒 **Profile Restrictions:** Name and contact number are protected from editing
- ⚠️ **Visual Indicators:** Lock icons and warning messages indicate restricted fields

### **Testing Scenarios**
1. **Login Testing:** Use these accounts to test the login system
2. **Role-based Access:** Verify different dashboard access for each role
3. **Profile Update Restrictions:** Test that restricted fields cannot be modified
4. **Help Request Flow:** Test the complete help request lifecycle
5. **UI/UX Testing:** Verify visual indicators for restricted fields

---

## **Project Structure**

```
SCAN/
├── backend/
│   ├── controllers/     # Business logic handlers
│   ├── db/             # Database connection
│   ├── middleware/     # Authentication & validation
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── utils/          # Helper functions
│   └── index.js        # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application pages
│   │   ├── store/      # Zustand state management
│   │   └── utils/      # Frontend utilities
│   ├── public/         # Static assets
│   └── package.json
└── README.md
```

---

## **API Endpoints**

### **Authentication**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### **Help Requests**
- `POST /api/auth/help` - Create help request
- `POST /api/auth/vhelp` - Accept help request (volunteer)
- `POST /api/auth/mark-completed` - Mark request as completed
- `GET /api/auth/products` - Get available requests (volunteer)

### **User Management**
- `PUT /api/auth/update-profile` - Update user profile
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

---

## **Security Features**
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Email verification for new accounts
- Role-based access control
- CORS protection
- Input validation and sanitization

---

## **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## **License**

This project is licensed under the MIT License. See the [LICENSE](https://choosealicense.com/licenses/mit/) file for details.

---

## **Contact**

- **Project Owner:** [brianchristy](https://github.com/brianchristy)
- **Email:** brianchristopher170804@gmail.com
- **GitHub Repository:** [SCAN Project](https://github.com/brianchristy/SCAN)

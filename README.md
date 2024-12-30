# **Volunteer Assistance Network**

## **Overview**
The Volunteer Assistance Network is a platform designed to connect senior citizens and caregivers with volunteers willing to offer assistance in various areas, such as companionship, housekeeping, gardening, and more. The goal is to create a supportive community that enhances the quality of life for all its members.

---

## **Features**
- **User Authentication:** Secure login and registration with email verification.
- **Role-Based Access:** Dedicated dashboards for seniors, caregivers, volunteers, and admins.
- **Profile Management:** Users can update their profiles with personal details and preferences.
- **Request Submission:** Seniors and caregivers can submit requests for assistance.
- **Task Management:** Volunteers can view and manage tasks based on their skills.
- **Admin Dashboard:** Admins can monitor user activities and manage the platform.
- **Interactive UI:** A responsive and user-friendly interface for all users.

---

## **Technologies Used**
- **Frontend:** React, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **State Management:** Zustand (authStore)  
- **Authentication:** JWT (JSON Web Token)  
- **Email Service:** Mailtrap  
- **Environment:** Node.js, Postman (for API testing)  

---

## **Setup Instructions**

### **Prerequisites**
Ensure you have the following installed:
- Node.js
- MongoDB
- Git

### **Steps to Run the Project**

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/volunteer-assistance-network.git
   cd volunteer-assistance-network
   ```
   
2. **Install Dependencies:**
   
    • For the backend:
      ```bash
      cd backend
      npm install
      ```
      
    • For the frontend:
      ```bash
      cd frontend
      npm install
      ```
   
4. **Setup Environment Variables:**
   
    • In the backend folder, create a .env file and add the following:
   
      ```env
      MONGO_URI=your-mongodb-uri
      JWT_SECRET=your-jwt-secret
      EMAIL_USER=your-email-user
      EMAIL_PASS=your-email-password
      ```
      
    • Replace the placeholders with your actual values.


4. **Run the Application:**
   
    • Start the backend:
      ```bash
      cd backend
      npm start
      ```
   • Start the frontend:
      ```bash
      cd frontend
      npm run dev
      ```

5. **Access the Application: Open your browser and navigate to:**
   
   ```arduino
   http://localhost:3000
   ```

---

## **Project Structure**

### **Backend**
- **Controllers:** Handles business logic.
- **Routes:** Defines API endpoints.
- **Models:** MongoDB schemas for users, requests, etc.
- **Middleware:** Authentication and request validation.
- **Utilities:** Helper functions like email verification.

### **Frontend**
- **Pages:** Individual pages like Login, Dashboard, Profile, etc.
- **Components:** Reusable UI components.
- **Store:** Zustand state management for authentication and profile updates.

---

## **Contributing**

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

---

## **License**

This project is licensed under the **MIT License**.  
See the `LICENSE` file for more details.

---

## **Contact**

For any queries or suggestions, feel free to reach out:

- **Project Owner:** [brianchristy](https://github.com/brianchristy)  
- **Email:** brianchristopher170804@gmail.com  
- **GitHub Repository:** [SCAN Project](https://github.com/brianchristy/SCAN)

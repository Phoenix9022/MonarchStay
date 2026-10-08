# 👑 MonarchStay Hotel Booking System

![Stunning Glassmorphism UI](https://img.shields.io/badge/UI-Glassmorphism-blueviolet?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

A simple, yet stunningly beautiful full-stack Hotel Room Booking System built for a college/lab project. It features a completely custom, premium glassmorphism dark-mode UI with dynamic animated backgrounds, powered by a robust REST API backend.

## 🚀 Live Demo

**[View the Live Application Here!](https://hotel-booking-system-gyr5.onrender.com)**



## ✨ Features

- **Premium UI:** Custom Glassmorphism design with animated orbs and moving cinematic backgrounds.
- **Room Management:** Add new hotel rooms with specific room numbers, types (Single, Double, Deluxe, Suite), and prices.
- **Smart Booking System:** Search for available rooms by date. The system automatically prevents double-booking and date overlaps!
- **Dynamic Statuses:** Real-time Room Directory that instantly updates room availability based on current active bookings.
- **RESTful API:** Clean frontend-backend separation via Express.js.

## 🛠️ Technology Stack

**Frontend:**
- React (via Vite)
- Vanilla CSS3 (Custom Glassmorphism, CSS Animations)
- FontAwesome Icons

**Backend & Database:**
- Node.js & Express.js
- SQLite3 (Local `hotel.db` database)

## 💻 Local Installation

To run this project locally on your machine:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hotel-booking-system.git
   cd hotel-booking-system
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies & Build**
   ```bash
   cd client
   npm install
   npm run build
   cd ..
   ```

4. **Start the Server**
   ```bash
   npm start
   ```

5. **View the App**
   Open your browser and navigate to `http://localhost:3000`.

## 📡 API Endpoints

- `GET /api/rooms` - Retrieve all rooms and their current booking status.
- `GET /api/rooms/available` - Search for rooms without booking overlaps.
- `POST /api/rooms` - Add a new room.
- `GET /api/bookings` - Retrieve all active bookings.
- `POST /api/bookings` - Create a new booking (requires date validation).
- `DELETE /api/bookings/:id` - Cancel a booking and reset sequences if empty.

---
*Developed as a full-stack college project demonstration.*

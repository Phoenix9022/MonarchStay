# Hotel Room Booking System

A simple but complete full-stack hotel room booking system built for a college/lab project.

## Technologies
- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Express.js
- SQLite

## Features
- Add rooms
- View rooms
- Search available rooms
- Book rooms
- View bookings
- Cancel bookings
- Prevent double booking

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## API Documentation

### 1. Add Room
`POST /api/rooms`
Request:
```json
{
  "room_no": 101,
  "type": "Single",
  "price": 1500
}
```
Response:
```json
{
  "id": 1,
  "room_no": 101,
  "type": "Single",
  "price": 1500,
  "status": "Available"
}
```

### 2. Get All Rooms
`GET /api/rooms`
Response:
```json
[
  {
    "id": 1,
    "room_no": 101,
    "type": "Single",
    "price": 1500,
    "status": "Available"
  }
]
```

### 3. Search Available Rooms
`GET /api/rooms/available?type=Single&checkIn=2026-10-10&checkOut=2026-10-12`
Response: Array of available room objects.

### 4. Create Booking
`POST /api/bookings`
Request:
```json
{
  "room_id": 1,
  "guest_name": "John",
  "check_in": "2026-10-10",
  "check_out": "2026-10-12"
}
```
Response:
```json
{
  "message": "Room booked successfully",
  "bookingId": 1
}
```

### 5. Get Bookings
`GET /api/bookings`
Response:
```json
[
  {
    "booking_id": 1,
    "room_no": 101,
    "type": "Single",
    "guest_name": "John",
    "check_in": "2026-10-10",
    "check_out": "2026-10-12"
  }
]
```

### 6. Cancel Booking
`DELETE /api/bookings/:id`
Response:
```json
{
  "message": "Booking cancelled successfully"
}
```

const express = require('express');
const { openDb, initializeDb } = require('./database/db');

const app = express();
const PORT = 3000;

const path = require('path');

app.use(express.json());
// Serve React Production Frontend
app.use(express.static(path.join(__dirname, 'client/dist')));

let db;

// Initialize Database on server start
initializeDb().then(database => {
    db = database;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database', err);
});

// API Routes

// 1. Add Room
app.post('/api/rooms', async (req, res) => {
    const { room_no, type, price } = req.body;
    
    if (!room_no || !type || !price) {
        return res.status(400).json({ error: 'Room number, type, and price are required' });
    }
    
    if (price <= 0) {
        return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    try {
        const result = await db.run(
            'INSERT INTO Rooms (room_no, type, price) VALUES (?, ?, ?)',
            [room_no, type, price]
        );
        const newRoom = await db.get('SELECT * FROM Rooms WHERE id = ?', [result.lastID]);
        res.status(201).json(newRoom);
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Room number already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Get All Rooms
app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await db.all('SELECT * FROM Rooms');
        
        // Compute dynamic status based on current date
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Find bookings that cover today or are in the future
        const activeBookings = await db.all(`
            SELECT room_id FROM Bookings
            WHERE check_out > ?
        `, [today]);
        
        const bookedRoomIds = activeBookings.map(b => b.room_id);
        
        const roomsWithStatus = rooms.map(room => ({
            ...room,
            status: bookedRoomIds.includes(room.id) ? 'Booked' : 'Available'
        }));

        res.status(200).json(roomsWithStatus);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Search Available Rooms
app.get('/api/rooms/available', async (req, res) => {
    const { type, checkIn, checkOut } = req.query;

    if (!type || !checkIn || !checkOut) {
        return res.status(400).json({ error: 'Type, checkIn, and checkOut are required' });
    }
    
    if (checkOut <= checkIn) {
        return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    try {
        // Find rooms that match type, AND are NOT in a list of rooms booked during this period
        // Overlap condition: existing_check_in < new_check_out AND existing_check_out > new_check_in
        const availableRooms = await db.all(`
            SELECT * FROM Rooms
            WHERE type = ? 
            AND id NOT IN (
                SELECT room_id FROM Bookings
                WHERE check_in < ? AND check_out > ?
            )
        `, [type, checkOut, checkIn]); 

        res.status(200).json(availableRooms);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Create Booking
app.post('/api/bookings', async (req, res) => {
    const { room_id, guest_name, check_in, check_out } = req.body;

    if (!room_id || !guest_name || !check_in || !check_out) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (check_out <= check_in) {
        return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    try {
        // 1. Check if room exists
        const room = await db.get('SELECT * FROM Rooms WHERE id = ?', [room_id]);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // 2. Prevent Double Booking
        const overlap = await db.get(`
            SELECT * FROM Bookings
            WHERE room_id = ? 
            AND check_in < ? 
            AND check_out > ?
        `, [room_id, check_out, check_in]);

        if (overlap) {
            return res.status(409).json({ error: 'Room is already booked for the selected dates' });
        }

        // 3. Create Booking
        const result = await db.run(`
            INSERT INTO Bookings (room_id, guest_name, check_in, check_out)
            VALUES (?, ?, ?, ?)
        `, [room_id, guest_name, check_in, check_out]);

        res.status(201).json({ message: 'Room booked successfully', bookingId: result.lastID });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 5. Get Bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await db.all(`
            SELECT b.id as booking_id, r.room_no, r.type, b.guest_name, b.check_in, b.check_out
            FROM Bookings b
            JOIN Rooms r ON b.room_id = r.id
            ORDER BY b.check_in ASC
        `);
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 6. Cancel Booking
app.delete('/api/bookings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await db.get('SELECT * FROM Bookings WHERE id = ?', [id]);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        await db.run('DELETE FROM Bookings WHERE id = ?', [id]);

        // Reset auto-increment ID to 1 when no bookings are left
        const countRes = await db.get('SELECT COUNT(*) as count FROM Bookings');
        if (countRes.count === 0) {
            await db.run("DELETE FROM sqlite_sequence WHERE name='Bookings'");
        }

        res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send all non-API requests to the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

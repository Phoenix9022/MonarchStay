// Utility Functions
function showMessage(msg, isError = false) {
    const msgBox = document.getElementById('message-box');
    msgBox.textContent = msg;
    msgBox.className = 'message-box'; // reset classes
    msgBox.classList.add(isError ? 'message-error' : 'message-success');
    msgBox.classList.remove('hidden');

    setTimeout(() => {
        msgBox.classList.add('hidden');
    }, 5000);
}

// 1. Add Room
document.getElementById('add-room-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const room_no = document.getElementById('new-room-no').value;
    const type = document.getElementById('new-room-type').value;
    const price = document.getElementById('new-room-price').value;

    if (price <= 0) {
        showMessage('Price must be greater than 0', true);
        return;
    }

    try {
        const res = await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_no, type, price })
        });
        const data = await res.json();

        if (res.ok) {
            showMessage('Room added successfully');
            document.getElementById('add-room-form').reset();
            loadRooms(); // Refresh room list
        } else {
            showMessage(data.error || 'Failed to add room', true);
        }
    } catch (err) {
        showMessage('Error connecting to server', true);
    }
});

// 2. Load Rooms
async function loadRooms() {
    try {
        const res = await fetch('/api/rooms');
        const rooms = await res.json();
        
        const tbody = document.getElementById('rooms-tbody');
        tbody.innerHTML = '';
        
        if (rooms.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No rooms available</td></tr>';
            return;
        }

        rooms.forEach(room => {
            const tr = document.createElement('tr');
            
            const statusClass = room.status === 'Available' ? 'status-available' : 'status-booked';
            
            tr.innerHTML = `
                <td>${room.room_no}</td>
                <td>${room.type}</td>
                <td>₹${room.price}</td>
                <td class="${statusClass}">${room.status}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Failed to load rooms');
    }
}

// 3. Search Available Rooms
document.getElementById('search-rooms-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const type = document.getElementById('search-room-type').value;
    const checkIn = document.getElementById('search-check-in').value;
    const checkOut = document.getElementById('search-check-out').value;

    if (checkOut <= checkIn) {
        showMessage('Check-out date must be after check-in date', true);
        return;
    }

    try {
        const res = await fetch(`/api/rooms/available?type=${type}&checkIn=${checkIn}&checkOut=${checkOut}`);
        const rooms = await res.json();
        
        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = '';

        if (!res.ok) {
            showMessage(rooms.error || 'Search failed', true);
            return;
        }

        if (rooms.length === 0) {
            resultsDiv.innerHTML = '<p style="color:red; font-weight:bold;">No rooms available for the selected dates.</p>';
            return;
        }

        rooms.forEach(room => {
            const roomDiv = document.createElement('div');
            roomDiv.className = 'room-card';
            roomDiv.innerHTML = `
                <div>
                    <strong>Room ${room.room_no}</strong><br>
                    ${room.type}<br>
                    ₹${room.price}/night
                </div>
                <button onclick="openBookingForm(${room.id}, ${room.room_no}, '${room.type}', '${checkIn}', '${checkOut}')">Book This Room</button>
            `;
            resultsDiv.appendChild(roomDiv);
        });

    } catch (err) {
        showMessage('Error searching rooms', true);
    }
});

// 4. Booking Form Logic
window.openBookingForm = function(id, roomNo, type, checkIn, checkOut) {
    document.getElementById('booking-section').classList.remove('hidden');
    
    document.getElementById('book-room-id').value = id;
    document.getElementById('book-room-info').value = `Room ${roomNo} (${type})`;
    document.getElementById('book-check-in').value = checkIn;
    document.getElementById('book-check-out').value = checkOut;
    
    // Scroll to booking form
    document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' });
}

window.closeBookingForm = function() {
    document.getElementById('booking-section').classList.add('hidden');
    document.getElementById('booking-form').reset();
}

// Submit Booking
document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const room_id = document.getElementById('book-room-id').value;
    const guest_name = document.getElementById('book-guest-name').value;
    const check_in = document.getElementById('book-check-in').value;
    const check_out = document.getElementById('book-check-out').value;

    try {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_id, guest_name, check_in, check_out })
        });
        const data = await res.json();

        if (res.ok) {
            showMessage('Room booked successfully!');
            closeBookingForm();
            
            // Clear search results so they don't show the just-booked room as available
            document.getElementById('search-results').innerHTML = '';
            
            loadRooms();
            loadBookings();
        } else {
            showMessage(data.error || 'Failed to book room', true);
        }
    } catch (err) {
        showMessage('Error booking room', true);
    }
});

// 5. Load Bookings
async function loadBookings() {
    try {
        const res = await fetch('/api/bookings');
        const bookings = await res.json();
        
        const tbody = document.getElementById('bookings-tbody');
        tbody.innerHTML = '';
        
        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No bookings found</td></tr>';
            return;
        }

        bookings.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${b.booking_id}</td>
                <td>${b.room_no}</td>
                <td>${b.type}</td>
                <td>${b.guest_name}</td>
                <td>${b.check_in}</td>
                <td>${b.check_out}</td>
                <td><button class="btn-danger" onclick="cancelBooking(${b.booking_id})"><i class="fa-solid fa-trash-can"></i> Remove</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Failed to load bookings');
    }
}

// 6. Cancel Booking
window.cancelBooking = async function(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    try {
        const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
        const data = await res.json();
        
        if (res.ok) {
            showMessage('Booking cancelled successfully');
            loadRooms();
            loadBookings();
        } else {
            showMessage(data.error || 'Failed to cancel booking', true);
        }
    } catch (err) {
        showMessage('Error cancelling booking', true);
    }
}

// Initialization on load
window.onload = () => {
    loadRooms();
    loadBookings();
};

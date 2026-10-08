import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchResults, setSearchResults] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Forms State
  const [newRoom, setNewRoom] = useState({ room_no: '', type: 'Single', price: '' });
  const [searchParams, setSearchParams] = useState({ type: 'Single', checkIn: '', checkOut: '' });

  // Booking Modal State
  const [bookingState, setBookingState] = useState(null);
  const [guestName, setGuestName] = useState('');

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => {
      setToasts(t => t.filter(toast => toast.id !== id));
    }, 4000);
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(data);
    } catch (e) {
      addToast('Error fetching rooms', 'error');
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data);
    } catch (e) {
      addToast('Error fetching bookings', 'error');
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (newRoom.price <= 0) return addToast('Price must be > 0', 'error');

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom)
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Room added successfully');
        setNewRoom({ room_no: '', type: 'Single', price: '' });
        fetchRooms();
      } else {
        addToast(data.error, 'error');
      }
    } catch (e) {
      addToast('Server error', 'error');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchParams.checkOut <= searchParams.checkIn) {
      return addToast('Check-out must be after check-in', 'error');
    }

    try {
      const res = await fetch(`/api/rooms/available?type=${searchParams.type}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data);
        if (data.length === 0) addToast('No rooms available for these dates', 'error');
      } else {
        addToast(data.error, 'error');
      }
    } catch (e) {
      addToast('Search failed', 'error');
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        room_id: bookingState.room.id,
        guest_name: guestName,
        check_in: bookingState.checkIn,
        check_out: bookingState.checkOut
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        addToast('Room booked successfully!');
        setBookingState(null);
        setGuestName('');
        setSearchResults(null);
        fetchRooms();
        fetchBookings();
      } else {
        addToast(data.error, 'error');
      }
    } catch (e) {
      addToast('Booking failed', 'error');
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Remove this booking permanently?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        addToast('Booking removed!');
        fetchRooms();
        fetchBookings();
      } else {
        addToast(data.error, 'error');
      }
    } catch (e) {
      addToast('Failed to remove', 'error');
    }
  };

  return (
    <>
      <div className="moving-bg"></div>
      <div className="app-container">
      <header className="header">
        <h1>MonarchStay</h1>
        <p>Your Home Away From Home</p>
      </header>

      {/* Featured Rooms Hero */}
      <div className="hero-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px', animation: 'slideUpFade 0.6s ease-out' }}>
        <div className="hero-card" style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <img src="/room1.jpg" alt="Luxury Suite" style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} className="hero-img" />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '30px 20px 20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>The Skyline Suite</h3>
            <p style={{ color: '#cbd5e1', margin: '5px 0 0' }}>Breathtaking city views with premium amenities.</p>
          </div>
        </div>
        <div className="hero-card" style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <img src="/room2.jpg" alt="Ocean Deluxe" style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} className="hero-img" />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '30px 20px 20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Oceanfront Deluxe</h3>
            <p style={{ color: '#cbd5e1', margin: '5px 0 0' }}>Wake up to the sound of waves and morning sunlight.</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Search Section */}
        <div className="glass-panel" style={{ animationDelay: '0.1s' }}>
          <h2 className="panel-title"><i className="fa-solid fa-magnifying-glass"></i> Find Available Rooms</h2>
          <form onSubmit={handleSearch}>
            <div className="form-group">
              <label>Room Type</label>
              <select value={searchParams.type} onChange={e => setSearchParams({ ...searchParams, type: e.target.value })}>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </select>
            </div>
            <div className="grid-2" style={{ gap: '15px', marginBottom: '0' }}>
              <div className="form-group">
                <label>Check-in</label>
                <input type="date" required value={searchParams.checkIn} onChange={e => setSearchParams({ ...searchParams, checkIn: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Check-out</label>
                <input type="date" required value={searchParams.checkOut} onChange={e => setSearchParams({ ...searchParams, checkOut: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn"><i className="fa-solid fa-search"></i> Search Rooms</button>
          </form>

          {searchResults && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Results</h3>
              {searchResults.length === 0 ? (
                <div className="empty-state">
                  <i className="fa-regular fa-face-frown"></i>
                  <p>Fully Booked!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {searchResults.map(room => (
                    <div key={room.id} className="room-card">
                      <div className="room-details">
                        <h3>Room {room.room_no}</h3>
                        <span style={{ color: 'var(--text-muted)' }}>{room.type}</span>
                        <span style={{ color: 'var(--success)' }}>₹{room.price} / night</span>
                      </div>
                      <button className="btn" style={{ width: 'auto' }} onClick={() => setBookingState({ room, checkIn: searchParams.checkIn, checkOut: searchParams.checkOut })}>
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Room Section */}
        <div className="glass-panel" style={{ animationDelay: '0.2s', alignSelf: 'start' }}>
          <h2 className="panel-title"><i className="fa-solid fa-plus-circle"></i> Add New Room</h2>
          <form onSubmit={handleAddRoom}>
            <div className="form-group">
              <label>Room Number</label>
              <input type="number" required value={newRoom.room_no} onChange={e => setNewRoom({ ...newRoom, room_no: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Room Type</label>
              <select value={newRoom.type} onChange={e => setNewRoom({ ...newRoom, type: e.target.value })}>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price per Night (₹)</label>
              <input type="number" min="1" required value={newRoom.price} onChange={e => setNewRoom({ ...newRoom, price: e.target.value })} />
            </div>
            <button type="submit" className="btn"><i className="fa-solid fa-save"></i> Save Room</button>
          </form>
        </div>
      </div>

      {/* Booking Form Modal / Inline */}
      {bookingState && (
        <div className="glass-panel" style={{ animationDelay: '0s', marginBottom: '30px', border: '1px solid var(--primary)', boxShadow: 'var(--glow)' }}>
          <h2 className="panel-title"><i className="fa-solid fa-calendar-check"></i> Finalize Booking - Room {bookingState.room.room_no}</h2>
          <form onSubmit={submitBooking}>
            <div className="grid-3">
              <div className="form-group">
                <label>Guest Name</label>
                <input type="text" required value={guestName} onChange={e => setGuestName(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label>Check-in</label>
                <input type="date" disabled value={bookingState.checkIn} />
              </div>
              <div className="form-group">
                <label>Check-out</label>
                <input type="date" disabled value={bookingState.checkOut} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button type="submit" className="btn"><i className="fa-solid fa-check"></i> Confirm</button>
              <button type="button" className="btn btn-secondary" onClick={() => setBookingState(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tables Section */}
      <div className="glass-panel" style={{ animationDelay: '0.3s' }}>
        <h2 className="panel-title"><i className="fa-solid fa-list"></i> Active Bookings</h2>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Room No</th>
                <th>Type</th>
                <th>Guest</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No active bookings</td></tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.booking_id}>
                    <td>#{b.booking_id}</td>
                    <td>{b.room_no}</td>
                    <td>{b.type}</td>
                    <td>{b.guest_name}</td>
                    <td>{b.check_in}</td>
                    <td>{b.check_out}</td>
                    <td>
                      <button className="btn btn-danger" onClick={() => cancelBooking(b.booking_id)}>
                        <i className="fa-solid fa-trash-can"></i> Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel" style={{ animationDelay: '0.4s', marginTop: '30px' }}>
        <h2 className="panel-title"><i className="fa-solid fa-bed"></i> Room Directory</h2>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Room No</th>
                <th>Type</th>
                <th>Price/Night</th>
                <th>Current Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>No rooms added</td></tr>
              ) : (
                rooms.map(room => (
                  <tr key={room.id}>
                    <td>{room.room_no}</td>
                    <td>{room.type}</td>
                    <td>₹{room.price}</td>
                    <td>
                      <span className={`status-badge ${room.status === 'Available' ? 'status-available' : 'status-booked'}`}>
                        <i className={`fa-solid ${room.status === 'Available' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                        {room.status === 'Booked' ? 'Occupied' : room.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}`}></i>
            {toast.msg}
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

export default App;

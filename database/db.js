const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function openDb() {
  return open({
    filename: './hotel.db',
    driver: sqlite3.Database
  });
}

async function initializeDb() {
  const db = await openDb();

  await db.exec('PRAGMA foreign_keys = ON');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_no INTEGER UNIQUE NOT NULL,
      type TEXT NOT NULL,
      price REAL NOT NULL,
      status TEXT DEFAULT 'Available'
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      guest_name TEXT NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES Rooms (id)
    )
  `);

  // Insert sample data only if Rooms table is empty
  const roomCount = await db.get('SELECT COUNT(*) as count FROM Rooms');
  if (roomCount.count === 0) {
    await db.exec(`
      INSERT INTO Rooms (room_no, type, price) VALUES
      (101, 'Single', 1500),
      (102, 'Double', 2000),
      (103, 'Deluxe', 3000),
      (104, 'Suite', 5000)
    `);
  }

  return db;
}

module.exports = { openDb, initializeDb };

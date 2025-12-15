require('dotenv').config({ path: __dirname + '/../.env' });
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Bounding box for Granada, Spain
const LAT_MIN = 37.16;
const LAT_MAX = 37.22;
const LON_MIN = -3.63;
const LON_MAX = -3.55;

// Helper: generate random decimal within a range
function randomDecimal(min, max, decimals) {
    const val = Math.random() * (max - min) + min;
    return parseFloat(val.toFixed(decimals));
}

async function seedLocations() {
    for (let i = 1; i <= 100; i++) {
        const latitude = randomDecimal(LAT_MIN, LAT_MAX, 5);
        const longitude = randomDecimal(LON_MIN, LON_MAX, 5);

        try {
            await db.query(
                `INSERT INTO locations (latitude, longitude, created_at)
                 VALUES (?, ?, NOW())`,
                [latitude, longitude]
            );
            console.log(`Location ${i} inserted: ${latitude}, ${longitude}`);
        } catch (err) {
            console.error(`Error inserting location ${i}:`, err);
        }
    }

    console.log("Seeding of 100 locations completed.");
    process.exit(0);
}

seedLocations().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});

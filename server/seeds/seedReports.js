require('dotenv').config({ path: __dirname + '/../.env' });
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Categories
const categories = ["road", "lighting", "hygiene", "furniture", "traffic-signs", "parks"];

// Sample titles & descriptions per category
const samples = {
    road: [
        { title: "Pothole in street", description: "There is a large pothole that could damage vehicles." },
        { title: "Cracked pavement", description: "Sidewalk is cracked, dangerous for pedestrians." }
    ],
    lighting: [
        { title: "Broken street light", description: "Street light is out, area is dark at night." },
        { title: "Flickering lamp", description: "Lamp flickers, needs repair." }
    ],
    hygiene: [
        { title: "Trash not collected", description: "Overflowing trash bins, unpleasant smell." },
        { title: "Graffiti needs cleaning", description: "Walls are covered in graffiti, looks untidy." }
    ],
    furniture: [
        { title: "Broken bench in park", description: "Public bench is broken, cannot be used safely." },
        { title: "Damaged table", description: "Picnic table is damaged and unsafe." }
    ],
    "traffic-signs": [
        { title: "Missing stop sign", description: "Stop sign is missing at intersection, dangerous." },
        { title: "Faded speed limit", description: "Speed limit sign is unreadable, needs repainting." }
    ],
    parks: [
        { title: "Park needs maintenance", description: "Grass overgrown, playground equipment damaged." },
        { title: "Playground hazard", description: "Swing set broken, risk of injury." }
    ]
};

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedReports() {
    try {
        // Debug: check connection and env
        console.log("Connecting to database:", process.env.DB_NAME);

        const [users] = await db.query("SELECT id FROM users");
        const [locations] = await db.query("SELECT id FROM locations");

        if (!users.length || !locations.length) {
            console.error("Users or locations table is empty!");
            process.exit(1);
        }

        for (const user of users) {
            const reportsCount = randomInt(4, 5);

            for (let i = 0; i < reportsCount; i++) {
                const location = locations[randomInt(0, locations.length - 1)];
                const category = categories[randomInt(0, categories.length - 1)];
                const sample = samples[category][randomInt(0, samples[category].length - 1)];

                // Insert report
                await db.query(
                    `INSERT INTO reports (user_id, location_id, category, title, description, created_at)
                     VALUES (?, ?, ?, ?, ?, NOW())`,
                    [user.id, location.id, category, sample.title, sample.description]
                );

                console.log(`Report inserted: User ${user.id}, Location ${location.id}, ${category}`);
            }
        }

        console.log("Seeding of reports completed.");
        process.exit(0);

    } catch (err) {
        console.error("Seed error:", err);

        // Extra debug: show error fields
        if (err.sqlMessage) console.error("SQL Error Message:", err.sqlMessage);
        process.exit(1);
    }
}

seedReports();

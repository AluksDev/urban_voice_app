const bcrypt = require('bcryptjs');
const validator = require("validator");
require('dotenv').config({ path: __dirname + '/../.env' });


const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});
async function seedUsers() {
    const PASSWORD = "testtest";
    const SALT_ROUNDS = 10;

    const hashedPsw = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

    for (let i = 1; i <= 50; i++) {
        const name = `Test${i}`;
        const surname = `User${i}`;
        const email = `test${i}@test.com`;

        const trimmedName = validator.trim(name);
        const trimmedSurname = validator.trim(surname);
        const trimmedEmail = validator.trim(email).toLowerCase();

        try {
            await db.query(
                `INSERT INTO users (name, surname, email, hashed_psw, created_at)
                 VALUES (?, ?, ?, ?, NOW())`,
                [trimmedName, trimmedSurname, trimmedEmail, hashedPsw]
            );

            console.log(`User ${email} created`);
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                console.log(`User ${email} already exists, skipping`);
            } else {
                throw err;
            }
        }
    }

    console.log("Seeding completed");
    process.exit(0);
}

seedUsers().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});

require('dotenv').config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const path = require("path");

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

app.use((req, res, next) => {
    req.db = pool;
    next();
})
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const reportRoutes = require("./routes/reports");
app.use("/reports", reportRoutes);

const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

const locationRoutes = require("./routes/locations");
app.use("/locations", locationRoutes);

const statsRoutes = require("./routes/stats");
app.use("/stats", statsRoutes);

const userRoutes = require("./routes/user");
app.use("/user", userRoutes);

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

const announcementRoutes = require("./routes/announcements");
app.use("/announcements", announcementRoutes);

if (process.env.NODE_ENV === "production") {
    const clientPath = path.join(__dirname, "../client/dist");

    app.use(express.static(clientPath));

    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(clientPath, "index.html"));
    });
}
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port 3001");
});
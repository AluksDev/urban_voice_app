require('dotenv').config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const path = require("path");

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
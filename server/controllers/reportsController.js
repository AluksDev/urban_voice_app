const validator = require('validator');

exports.newReport = async (req, res) => {
    const { title, category, description, lat, lon } = req.body;
    const userId = req.user.id;
    const photoUrl = req.file ? `/uploads/reports/${req.file.filename}` : null;
    const allowedCategories = [
        "road",
        "lighting",
        "hygiene",
        "furniture",
        "traffic-signs",
        "parks"
    ];
    try {
        const trimmedTitle = validator.trim(title || "");
        const trimmedCategory = validator.trim(category || "");
        const trimmedDescription = validator.trim(description || "");
        const trimmedLat = validator.trim(lat || "");
        const trimmedLon = validator.trim(lon || "");

        if (!allowedCategories.includes(trimmedCategory)) {
            return res.status(400).json({
                message: "Invalid category",
                success: false
            })
        }

        if (!validator.isLength(trimmedTitle, { min: 1, max: 2000 }) || !validator.isLength(trimmedCategory, { min: 1, max: 2000 }) || !validator.isLength(trimmedDescription, { min: 1, max: 2000 })) {
            return res.status(400).json({
                message: "Invalid inputs",
                success: false
            })
        }

        if (!validator.isDecimal(trimmedLat) || !validator.isDecimal(trimmedLon)) {
            return res.status(400).json({
                message: "Latitude and longitude must be numbers",
                success: false
            });
        }

        const floatLat = parseFloat(trimmedLat);
        const floatLon = parseFloat(trimmedLon);

        if (floatLat < -90 || floatLat > 90 || floatLon < -180 || floatLon > 180) {
            return res.status(400).json({
                message: "Invalid coordinates",
                success: false
            })
        }
        const roundedLat = Number(floatLat.toFixed(5));
        const roundedLon = Number(floatLon.toFixed(5));
        const delta = 0.00001; // ~1 meter
        let [rows] = await req.db.query(
            "SELECT * FROM locations WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?",
            [roundedLat - delta, roundedLat + delta, roundedLon - delta, roundedLon + delta]
        );
        let locationId = null;
        if (rows.length > 0) {
            locationId = rows[0].id;
        } else {
            let [locationResult] = await req.db.query("INSERT INTO locations (latitude, longitude, created_at) VALUES (?, ?, NOW())", [roundedLat, roundedLon]);
            if (locationResult.affectedRows === 1) {
                locationId = locationResult.insertId;
            } else {
                return res.status(500).json({
                    success: false,
                    message: "Error in DB"
                })
            }
        }
        let [reportResult] = await req.db.query("INSERT INTO reports (user_id, location_id, title, description, category, photo_url, status, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())", [userId, locationId, trimmedTitle, trimmedDescription, trimmedCategory, photoUrl]);
        if (reportResult.affectedRows === 1) {
            res.status(201).json({
                success: true,
                message: "Report created successfully",
                reportId: reportResult.insertId
            })
        } else {
            return res.status(500).json({
                success: false,
                message: "Error in DB"
            })
        }
    } catch (e) {
        console.error("Error in adding report", e);
        return res.status(500).json({
            success: false,
            message: "Error in handling new report"
        })
    }
}

exports.userReports = async (req, res) => {
    const userId = req.user.id ?? null;
    let [rows] = await req.db.query("SELECT * FROM users WHERE id=?", [userId]);
    if (rows.length == 0) {
        return res.status(400).json({
            success: false,
            message: "User doen't exists"
        })
    }
    let [reports] = await req.db.query("SELECT * FROM reports WHERE user_id = ?", [userId]);
    if (reports.length == 0) {
        return res.status(400).json({
            success: false,
            message: "No reports from this user"
        })
    }
    return res.status(200).json({
        success: true,
        reports: reports
    })
}

exports.searchReports = async (req, res) => {
    const { title = "", category = "", status = "", date = "", sort = "" } = req.query;
    const userId = req.user.id;

    const allowedSortFields = ["title", "category", "status", "created_at"];
    let orderBy = "created_at"; // default column
    let order = "DESC";          // default order

    if (sort && allowedSortFields.includes(sort)) {
        orderBy = sort;

        // Set default order depending on column
        if (sort === "title" || sort === "category") {
            order = "ASC"; // A → Z
        } else {
            order = "DESC"; // newest first for date/status
        }
    }

    // Base query
    let sql = `
        SELECT * FROM reports
        WHERE user_id = ?
    `;

    let params = [userId];

    // Add filters only if they exist
    if (title) {
        sql += " AND title LIKE ?";
        params.push(`%${title}%`);
    }

    if (category) {
        sql += " AND category LIKE ?";
        params.push(`%${category}%`);
    }

    if (status) {
        sql += " AND status LIKE ?";
        params.push(`%${status}%`);
    }

    if (date) {
        sql += " AND DATE(created_at) >= ?";
        params.push(date);
    }

    sql += ` ORDER BY ${orderBy} ${order}`;
    const [rows] = await req.db.query(sql, params);

    return res.status(200).json({
        success: true,
        reports: rows
    });
};
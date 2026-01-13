const { param } = require("../routes/admin");

exports.allReports = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, code: "FORBIDDEN" });
    }
    const [reports] = await req.db.query("SELECT * from reports");
    if (!reports) {
        return res.status(500).json({ success: false, code: "DB_ERROR" });
    }
    return res.status(200).json({ success: true, reports });
}

exports.allUsers = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, code: "FORBIDDEN" });
    }
    const [users] = await req.db.query("SELECT id, name, surname, email, role, photo_url, created_at, updated_at FROM users");
    if (!users) {
        return res.status(500).json({ success: false, code: "DB_ERROR" });
    }
    return res.status(200).json({ success: true, users });
}

exports.updateStatus = async (req, res) => {
    console.log("Updating status");
    console.log("id: " + req.params.id);
    console.log("new status: " + req.body.status);
}
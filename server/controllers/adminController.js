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
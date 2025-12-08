exports.getReportStats = async (req, res) => {
    try {
        let [result] = await req.db.query("SELECT * FROM reports");
        if (result.length == 0) {
            return res.status(400).json({
                success: false,
                message: "No reports found"
            })
        }
        return res.status(200).json({
            success: true,
            reports: result
        })
    } catch (e) {
        console.error(e);
    }
}

exports.getLatestReports = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit || 3);
        if (limit <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid limit"
            })
        }
        let [result] = await req.db.query("SELECT * FROM reports ORDER BY created_at DESC LIMIT ?", [limit]);
        if (result.length == 0) {
            return res.status(400).json({
                success: false,
                message: "No reports found"
            })
        }
        return res.status(200).json({
            success: true,
            reports: result
        })
    } catch (e) {
        console.error(e);
    }
}
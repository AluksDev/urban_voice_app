exports.getAnnouncements = async (req, res) => {
    const [announcements] = await req.db.query("SELECT * FROM announcements WHERE is_published = 1 AND archived_at IS NULL ORDER BY updated_at DESC");
    if (announcements.length == 0) {
        return res.status(400).json({
            success: false,
            code: "NO_ANNOUNCEMENTS",
        });
    }
    return res.status(200).json({
        success: true,
        announcements: announcements,
    });
};
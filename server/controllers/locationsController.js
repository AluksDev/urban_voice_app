exports.getLocations = async (req, res) => {
    let [locations] = await req.db.query("SELECT l.id, l.latitude, l.longitude, r.title, r.description FROM locations l LEFT JOIN reports r ON l.id = r.location_id");
    if (locations.length == 0) {
        return res.status(400).json({
            success: false,
            message: "No locations found"
        })
    }
    return res.status(200).json({
        success: true,
        locations: locations
    })
}
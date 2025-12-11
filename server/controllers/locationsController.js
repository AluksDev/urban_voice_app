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

exports.getReportLocation = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        })
    }
    if (!req.params.locationId) {
        return res.status(400).json({
            success: false,
            message: "Missing location id"
        })
    }
    const locationId = req.params.locationId;
    let [coordinates] = await req.db.query("SELECT latitude, longitude FROM locations WHERE id = ?", [locationId]);
    if (coordinates.length == 0) {
        return res.status(400).json({
            success: false,
            message: "No location found"
        })
    }
    return res.status(200).json({
        success: true,
        latitude: coordinates[0].latitude,
        longitude: coordinates[0].longitude
    })
}
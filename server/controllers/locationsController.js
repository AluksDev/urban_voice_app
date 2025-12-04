exports.getLocations = async (req, res) => {
    let [locations] = await req.db.query("SELECT * FROM locations");
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
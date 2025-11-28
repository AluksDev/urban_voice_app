exports.getCoordsFromAddress = async (req, res) => {
    const address = req.query.q;
    try {
        const apiRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=5&addressdetails=1`);
        if (!apiRes.ok) {
            throw new Error("Error in response");
        }
        const data = await apiRes.json();
        console.log(data);
        return res.status(200).json({
            success: true,
            message: "Addresses fetched correctly",
            locations: data
        })
    } catch (e) {
        console.error("Error in getting coords from address", e);
    }
}
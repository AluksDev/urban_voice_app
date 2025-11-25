const jwt = require('jsonwebtoken');

// Auth middleware: verifies JWT and attaches user row to req.user
module.exports = async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        let token = null;

        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) return res.status(401).json({ success: false, message: 'Token missing' });

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not set');
            return res.status(500).json({ success: false, message: 'Server configuration error' });
        }

        // verify will throw for invalid/expired token
        const decoded = jwt.verify(token, secret);

        // decoded should contain user id
        if (!decoded || !decoded.id) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        // confirm user still exists in DB
        // req.db is expected to exist (other controllers do the same)
        const [rows] = await req.db.query('SELECT id, name, surname, email, role FROM users WHERE id = ?', [decoded.id]);
        if (!rows || rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid token (user not found)' });
        }

        // attach user and token for downstream handlers
        req.user = rows[0];
        req.token = token;
        next();
    } catch (err) {
        // handle jwt-specific errors as 401
        if (err && (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError')) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
        console.error('Auth middleware error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

import jwt from 'jsonwebtoken'

const adminAuth = async (req, res, next) => {
    try {
        // Accept tokens via Authorization: Bearer <token> or header `token`
        let rawToken = req.headers.authorization || req.headers.token || '';
        let token = rawToken;
        if (typeof rawToken === 'string' && rawToken.toLowerCase().startsWith('bearer ')) {
            token = rawToken.slice(7).trim();
        }
        if (!token) {
            return res.json({ success: false, message: "Not Authorized Login Again" });
        }

        // Support secret rotation via optional JWT_SECRET_FALLBACK
        const secretsToTry = [process.env.JWT_SECRET, process.env.JWT_SECRET_FALLBACK].filter(Boolean);
        let decoded;
        let lastError;
        for (const secret of secretsToTry) {
            try {
                decoded = jwt.verify(token, secret);
                break;
            } catch (e) {
                lastError = e;
            }
        }
        if (!decoded) throw lastError || new Error('Unauthorized');
        
        if (!decoded.isAdmin || decoded.email !== process.env.ADMIN_EMAIL) {
            return res.json({ success: false, message: "Not Authorized Login Again" });
        }

        // Add admin info to request for use in routes
        req.admin = decoded;
        next();
    } catch (error) {
        console.log(error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.json({ success: false, message: "Invalid token. Please login again." });
        }
        if (error instanceof jwt.TokenExpiredError) {
            return res.json({ success: false, message: "Token expired. Please login again." });
        }
        res.json({ success: false, message: error.message });
    }
}
export default adminAuth
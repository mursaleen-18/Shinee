import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import instanceId from '../config/serverInstance.js'

const authUser = async (req, res, next) => {
    // Support both Authorization: Bearer <token> and custom header `token`
    let rawToken = req.headers.authorization || req.headers.token || '';
    let token = rawToken;
    if (typeof rawToken === 'string' && rawToken.toLowerCase().startsWith('bearer ')) {
        token = rawToken.slice(7).trim();
    }

    if (!token) {
        return res.json({ success: false, message: "Not Authorized Login Again" })
    }
    try {
        // Support secret rotation via optional JWT_SECRET_FALLBACK
        const secretsToTry = [process.env.JWT_SECRET, process.env.JWT_SECRET_FALLBACK].filter(Boolean);
        let token_decode;
        let lastError;
        for (const secret of secretsToTry) {
            try {
                token_decode = jwt.verify(token, secret);
                break;
            } catch (e) {
                lastError = e;
            }
        }
    if (!token_decode) throw lastError || new Error('Unauthorized');
    // Check tokenVersion to support logout-all
    const user = await userModel.findById(token_decode.id).select('tokenVersion');
    if (!user) return res.json({ success: false, message: 'User not found' });
    const tokenVersionFromToken = token_decode.tokenVersion || 0;
    if (user.tokenVersion !== tokenVersionFromToken) return res.json({ success: false, message: 'Token expired. Please login again.' });
    // Validate server instance id - this ensures tokens are invalid after server restart
    if (token_decode.instanceId !== instanceId) return res.json({ success: false, message: 'Server restarted — please login again.' });
    req.body.userId = token_decode.id
    next()
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}
export default authUser



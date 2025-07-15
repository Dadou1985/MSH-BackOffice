import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';
export function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            return next();
        }
        catch (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
    }
    return res.status(401).json({ message: 'Authorization token missing' });
}

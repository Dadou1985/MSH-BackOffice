import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
}

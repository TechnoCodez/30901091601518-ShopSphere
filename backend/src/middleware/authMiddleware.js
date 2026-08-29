const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({ 
                where: { id: decoded.id },
            select: { id: true, name: true, email: true, role: true }
            });

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user;
            return next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    }
    return res.status(401).json({ message: 'Not authorized, no token provided' });
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
        }
        next();
    };
}


module.exports = { protect, authorizeRoles };
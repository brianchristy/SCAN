// const isAdmin = (req, res, next) => {
//     if (req.user && req.user.role === 'admin') {
//         next();
//     } else {
//         res.status(403).json({ message: 'Access denied: Admins only' });
//     }
// };

// module.exports = { isAdmin };

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.admin = await Admin.findById(decoded.id).select('-password');
            if (!req.admin || !req.admin.isAdmin) {
                return res.status(401).json({ message: 'Not authorized as admin' });
            }

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protectAdmin };

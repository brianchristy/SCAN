// const Admin = require('../models/Admin');
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

// const loginAdmin = async (req, res) => {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (admin && (await bcrypt.compare(password, admin.password))) {
//         res.json({
//             _id: admin._id,
//             name: admin.name,
//             email: admin.email,
//             token: jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
//         });
//     } else {
//         res.status(401).json({ message: 'Invalid credentials' });
//     }
// };

// const getUsers = async (req, res) => {
//     try {
//         const users = await User.find({});
//         res.json(users);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching users' });
//     }
// };

// module.exports = { loginAdmin, getUsers };

const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await bcrypt.compare(password, admin.password))) {
        res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            isAdmin: admin.isAdmin,
            token: generateToken(admin._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

const getAdminDashboard = (req, res) => {
    if (req.admin) {
        res.json({ message: 'Welcome to the Admin Dashboard', admin: req.admin });
    } else {
        res.status(401).json({ message: 'Not authorized' });
    }
};

module.exports = { loginAdmin, getAdminDashboard, generateToken };

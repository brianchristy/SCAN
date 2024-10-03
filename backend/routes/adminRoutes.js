// const express = require('express');
// const { loginAdmin } = require('../controllers/adminController');
// const router = express.Router();

// router.post('/login', loginAdmin);

// module.exports = router;

const express = require('express');
const { loginAdmin, getAdminDashboard } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', loginAdmin);

router.get('/dashboard', protectAdmin, getAdminDashboard);

module.exports = router;

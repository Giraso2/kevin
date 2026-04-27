const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getDashboard, getGrades, getAttendance, getAssignments } = require('../controllers/studentController');

router.use(protect);
router.use(roleCheck('student'));

router.get('/dashboard', getDashboard);
router.get('/grades', getGrades);
router.get('/attendance', getAttendance);
router.get('/assignments', getAssignments);

module.exports = router;
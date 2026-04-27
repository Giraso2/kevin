const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Placeholder controller functions
const getDashboard = (req, res) => {
  res.json({ message: 'Parent dashboard endpoint' });
};

const getChildren = (req, res) => {
  res.json({ message: 'Get children endpoint' });
};

const getChildGrades = (req, res) => {
  res.json({ message: `Get grades for child ${req.params.childId}` });
};

const getChildAttendance = (req, res) => {
  res.json({ message: `Get attendance for child ${req.params.childId}` });
};

router.use(protect);
router.use(roleCheck('parent'));

router.get('/dashboard', getDashboard);
router.get('/children', getChildren);
router.get('/children/:childId/grades', getChildGrades);
router.get('/children/:childId/attendance', getChildAttendance);

module.exports = router;
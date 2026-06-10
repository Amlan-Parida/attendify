const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');

// @desc    Get all subjects for the logged-in user
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects', error: error.message });
  }
};

// @desc    Create a new subject
const createSubject = async (req, res) => {
  try {
    const { name, classesPerWeek, daysOfWeek, slots, defaultWeight, minAttendance, color, autoMarkPresent } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    const subject = await Subject.create({
      user: req.user._id,
      name,
      classesPerWeek: classesPerWeek || 3,
      daysOfWeek: daysOfWeek || [],
      slots: slots || [],
      defaultWeight: defaultWeight || 1,
      minAttendance: minAttendance ?? 75,
      color: color || '#6366f1',
      autoMarkPresent: !!autoMarkPresent,
    });

    res.status(201).json(subject);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A subject with this name already exists' });
    }
    console.error('Failed to create subject:', error);
    res.status(500).json({ message: `Failed to create subject: ${error.message}` });
  }
};

// @desc    Update a subject
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const { name, classesPerWeek, daysOfWeek, slots, defaultWeight, minAttendance, color, autoMarkPresent } = req.body;
    if (name !== undefined) subject.name = name;
    if (classesPerWeek !== undefined) subject.classesPerWeek = classesPerWeek;
    if (daysOfWeek !== undefined) subject.daysOfWeek = daysOfWeek;
    if (slots !== undefined) subject.slots = slots;
    if (defaultWeight !== undefined) subject.defaultWeight = defaultWeight;
    if (minAttendance !== undefined) subject.minAttendance = minAttendance;
    if (color !== undefined) subject.color = color;
    if (autoMarkPresent !== undefined) subject.autoMarkPresent = !!autoMarkPresent;

    const updated = await subject.save();
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A subject with this name already exists' });
    }
    res.status(500).json({ message: 'Failed to update subject', error: error.message });
  }
};

// @desc    Delete a subject (and all its attendance records)
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Cascade delete all attendance records for this subject
    await Attendance.deleteMany({ subject: subject._id, user: req.user._id });
    await subject.deleteOne();

    res.json({ message: 'Subject and all attendance records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subject', error: error.message });
  }
};

// @desc    Clear all subjects and attendance data for a user
// @route   DELETE /api/subjects/clear
// @access  Private
const clearAllSubjects = async (req, res) => {
  try {
    // Delete all attendance records for the user
    await Attendance.deleteMany({ user: req.user._id });
    
    // Delete all subjects for the user
    await Subject.deleteMany({ user: req.user._id });
    
    res.json({ message: 'All subjects and attendance records cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear account data', error: error.message });
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject, clearAllSubjects };

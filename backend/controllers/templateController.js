const AcademicTemplate = require('../models/AcademicTemplate');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Search for an academic template
// @route   GET /api/templates/search?college=&year=&section=
// @access  Private
const searchTemplate = async (req, res) => {
  try {
    const { college, year, section } = req.query;
    if (!college || !year || !section) {
      return res.status(400).json({ message: 'College, year, and section are required' });
    }

    const template = await AcademicTemplate.findOne({
      college: college.toLowerCase(),
      year: year.toLowerCase(),
      section: section.toLowerCase(),
    }).populate('creator', 'name');

    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search templates', error: error.message });
  }
};

// @desc    Create a new academic template
// @route   POST /api/templates
// @access  Private
const createTemplate = async (req, res) => {
  try {
    const { college, year, section, subjects, holidays } = req.body;

    if (!college || !year || !section || !subjects || subjects.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or subjects' });
    }

    const existing = await AcademicTemplate.findOne({
      college: college.toLowerCase(),
      year: year.toLowerCase(),
      section: section.toLowerCase(),
    });

    if (existing) {
      return res.status(409).json({ message: 'Template for this college/year/section already exists' });
    }

    const template = await AcademicTemplate.create({
      college,
      year,
      section,
      subjects,
      holidays: holidays || [],
      creator: req.user._id,
      isVerified: false,
    });

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create template', error: error.message });
  }
};

// @desc    Clone template and complete onboarding
// @route   POST /api/templates/:id/clone
// @access  Private
const cloneTemplate = async (req, res) => {
  try {
    const template = await AcademicTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.onboardingComplete) {
      return res.status(400).json({ message: 'User has already completed onboarding' });
    }

    // Clone subjects
    const createdSubjects = [];
    for (const sub of template.subjects) {
      const newSub = await Subject.create({
        user: user._id,
        name: sub.name,
        classesPerWeek: sub.classesPerWeek,
        daysOfWeek: sub.daysOfWeek || [],
        slots: sub.slots || [],
        minAttendance: sub.minAttendance,
        color: sub.color,
      });
      createdSubjects.push(newSub);
    }

    // Clone holidays
    if (template.holidays && template.holidays.length > 0) {
      for (const subject of createdSubjects) {
        for (const holiday of template.holidays) {
          const date = new Date(holiday.date);
          date.setUTCHours(0, 0, 0, 0);

          await Attendance.findOneAndUpdate(
            { user: user._id, subject: subject._id, date: date },
            { status: 'Holiday', note: holiday.name || 'Template Holiday' },
            { upsert: true, new: true, runValidators: true }
          );
        }
      }
    }

    // Update user profile
    user.college = template.college;
    user.year = template.year;
    user.section = template.section;
    user.onboardingComplete = true;
    await user.save();

    res.json({ message: 'Template cloned successfully', subjectsCount: createdSubjects.length });
  } catch (error) {
    console.error('Clone error:', error);
    res.status(500).json({ message: 'Failed to clone template', error: error.message });
  }
};

// @desc    Skip template cloning and complete onboarding manually
// @route   POST /api/templates/skip
// @access  Private
const skipOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.onboardingComplete = true;
    await user.save();
    res.json({ message: 'Onboarding marked as complete' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to skip onboarding', error: error.message });
  }
};

// @desc    Publish a template from user's current data
// @route   POST /api/templates/publish
// @access  Private
const publishTemplate = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.college || !user.year || !user.section) {
      return res.status(400).json({
        message: 'You must set your college, year, and section in settings before publishing a template',
      });
    }

    const existing = await AcademicTemplate.findOne({
      college: user.college,
      year: user.year,
      section: user.section,
    });

    if (existing) {
      return res.status(409).json({ message: 'A template for your college/year/section already exists' });
    }

    const subjects = await Subject.find({ user: user._id });
    if (subjects.length === 0) {
      return res.status(400).json({ message: 'You must have subjects to create a template' });
    }

    const holidayRecords = await Attendance.find({ user: user._id, status: 'Holiday' });
    const holidays = holidayRecords.map((h) => ({
      date: h.date.toISOString().split('T')[0],
      name: h.note || 'Holiday',
    }));

    const template = await AcademicTemplate.create({
      college: user.college,
      year: user.year,
      section: user.section,
      subjects: subjects.map((s) => ({
        name: s.name,
        classesPerWeek: s.classesPerWeek,
        daysOfWeek: s.daysOfWeek,
        slots: s.slots || [],
        minAttendance: s.minAttendance,
        color: s.color,
      })),
      holidays,
      creator: user._id,
      isVerified: false,
    });

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Failed to publish template', error: error.message });
  }
};

module.exports = { searchTemplate, createTemplate, cloneTemplate, skipOnboarding, publishTemplate };

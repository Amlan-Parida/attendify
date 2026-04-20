const scanImage = async (req, res) => {
  try {
    const { mode } = req.body;
    const isSubjects = mode === 'subjects';
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1500));

    if (isSubjects) {
      return res.json({
        raw_text: "Mock timetable detected (Gemini disabled)",
        subjects: [
          { name: "Mock Subject 1", classesPerWeek: 3, daysOfWeek: [1, 3], minAttendance: 75, color: "#6366f1" },
          { name: "Mock Subject 2", classesPerWeek: 2, daysOfWeek: [2, 4], minAttendance: 75, color: "#10b981" }
        ],
        text: "Mock text extracted from document"
      });
    } else {
      return res.json({
        raw_text: "Mock holidays detected",
        holidays: [
          { name: "Mock Holiday", date: new Date().toISOString().split('T')[0] }
        ],
        text: "Mock text extracted from document"
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to process file', error: error.message });
  }
};

const summarizeText = async (req, res) => {
  try {
    await new Promise(r => setTimeout(r, 1500));
    return res.json({
      overview: "This is a mock summary because the AI integration is temporarily disabled.",
      takeaways: ["Feature temporarily disabled", "Provide GEMINI_API_KEY to enable"],
      sentiment: "Neutral",
      readingTime: "1 min"
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to summarize text', error: error.message });
  }
};

module.exports = { scanImage, summarizeText };

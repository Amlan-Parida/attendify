// Polyfill for DOMMatrix which is missing in Vercel Node.js environments
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix { constructor() {} };
}

const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const AcademicDocument = require('../models/AcademicDocument');

// Helper to convert buffer to generative part for Gemini
function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

// Generate content using fallback mechanism to handle 503/429 errors from Google
const generateWithFallback = async (prompt, part = null) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the backend environment.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try 2.5-flash, then 3.5-flash, then standard flash-latest, then lite models, then pro models
  const models = [
    'gemini-2.5-flash', 
    'gemini-3.5-flash', 
    'gemini-flash-latest', 
    'gemini-3.1-flash-lite', 
    'gemini-2.0-flash-lite', 
    'gemini-2.5-pro'
  ];
  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`Attempting generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const contents = part ? [prompt, part] : prompt;
      const result = await model.generateContent(contents);
      return result;
    } catch (error) {
      console.error(`Model ${modelName} failed:`, error.message);
      lastError = error;
      // If error is auth-related (e.g. invalid key or blocked), stop and throw
      if (error.status === 400 || error.status === 403) {
        throw error;
      }
    }
  }

  throw new Error(`AI processing failed after trying all fallback models. Last error: ${lastError ? lastError.message : 'Unknown error'}`);
};

// Extractor function using appropriate libraries based on mimetype
const extractTextFromFile = async (buffer, mimeType) => {
  if (mimeType === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  
  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  }

  if (mimeType.startsWith('image/')) {
    const imagePart = bufferToGenerativePart(buffer, mimeType);
    const prompt = 'Please extract all the text from this image as accurately as possible. Output only the extracted text.';
    const result = await generateWithFallback(prompt, imagePart);
    const response = await result.response;
    return response.text();
  }

  throw new Error('Unsupported file type for text extraction');
};

const scanImage = async (req, res) => {
  try {
    const { mode } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (mode === 'extract_only') {
      const extractedText = await extractTextFromFile(file.buffer, file.mimetype);
      
      const doc = await AcademicDocument.create({
        user: req.user._id,
        fileName: file.originalname,
        fileType: file.mimetype,
        extractedText: extractedText
      });

      return res.json({
        documentId: doc._id,
        text: extractedText,
        message: 'Document processed and saved successfully.'
      });
    }

    const isSubjects = mode === 'subjects';
    const prompt = `
      You are an expert academic data scientist. 
      ANALYSIS TASK:
      1. Carefully examine the provided document (timetable schedule or academic holiday list).
      2. If it's a schedule (timetable):
         - Group theory and lab components of the same subject under a SINGLE subject entry (e.g., "CN" and "CN LAB" must be grouped under a single subject named "CN"). Do NOT create separate subject entries for theory and lab versions of the same course.
         - Carefully map the rows (Days: MONDAY = 1, TUESDAY = 2, WEDNESDAY = 3, THURSDAY = 4, FRIDAY = 5, SATURDAY = 6, SUNDAY = 0) and column headers (Time slots, e.g., "7.45AM-8.30AM") to find the exact days and times each class is held.
         - For each class cell, create a slot in the subject's 'slots' array:
           - 'day': number (0 for Sunday, 1 for Monday, 2 for Tuesday, 3 for Wednesday, 4 for Thursday, 5 for Friday, 6 for Saturday)
           - 'startTime': string in 24-hour format "HH:MM" (e.g., "07:45", "15:45")
           - 'endTime': string in 24-hour format "HH:MM" (e.g., "08:30", "17:15")
           - 'type': string, either "Theory" or "Lab" (if the slot is a Lab, set to "Lab", otherwise "Theory")
           - 'weight': number, calculated based on college rules:
             * For Theory slots: weight = class duration in hours (e.g., a 1-hour class = 1, a 2-hour class = 2).
             * For Lab slots: weight = 1 point regardless of duration (e.g., a 2-hour lab = 1).
         - Also populate the legacy fields on the subject:
           - 'classesPerWeek': total number of slots
           - 'daysOfWeek': array of unique day numbers where slots exist
      3. If it's a list of holidays, return a 'holidays' array of { name: string, date: string (YYYY-MM-DD) }.

      Return ONLY a JSON object. No markdown code blocks, just raw JSON.
      JSON STRUCTURE:
      {
        "subjects": [
          {
            "name": "CN",
            "classesPerWeek": 3,
            "daysOfWeek": [1, 2, 4],
            "slots": [
              { "day": 1, "startTime": "15:45", "endTime": "16:30", "type": "Theory", "weight": 2 },
              { "day": 2, "startTime": "15:45", "endTime": "17:15", "type": "Lab", "weight": 1 },
              { "day": 4, "startTime": "10:45", "endTime": "11:30", "type": "Theory", "weight": 2 }
            ]
          }
        ],
        "holidays": []
      }
    `;

    let result;
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      const docPart = bufferToGenerativePart(file.buffer, file.mimetype);
      result = await generateWithFallback(prompt, docPart);
    } else {
      const extractedText = await extractTextFromFile(file.buffer, file.mimetype);
      result = await generateWithFallback(prompt, extractedText);
    }

    const response = await result.response;
    let text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    const parsedData = JSON.parse(text);
    return res.json(parsedData);

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ message: 'Failed to process file', error: error.message });
  }
};

const summarizeText = async (req, res) => {
  try {
    const { documentId, text } = req.body;
    let sourceText = text;
    let doc = null;

    if (documentId) {
      doc = await AcademicDocument.findOne({ _id: documentId, user: req.user._id });
      if (!doc) return res.status(404).json({ message: 'Document not found' });
      sourceText = doc.extractedText;
    }

    if (!sourceText) {
      return res.status(400).json({ message: 'Text or documentId is required for summarization' });
    }

    const prompt = `
      Summarize the following academic text. Provide an executive overview, key takeaways (max 5 bullet points), a sentiment (e.g., Urgent, Positive, Neutral), and estimated reading time.
      Return ONLY a JSON object. No markdown code blocks.
      {
        "overview": "Brief overview here",
        "takeaways": ["Point 1", "Point 2"],
        "sentiment": "Neutral",
        "readingTime": "X min"
      }

      Text to summarize:
      ${sourceText}
    `;

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    let responseText = response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) responseText = jsonMatch[0];

    const summaryData = JSON.parse(responseText);

    if (doc) {
      doc.summary = summaryData;
      await doc.save();
    }

    return res.json(summaryData);
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ message: 'Failed to summarize text', error: error.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const docs = await AcademicDocument.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const doc = await AcademicDocument.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete document', error: error.message });
  }
};

module.exports = { scanImage, summarizeText, getDocuments, deleteDocument };

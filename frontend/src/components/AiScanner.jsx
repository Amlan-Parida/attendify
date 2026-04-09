import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import toast from 'react-hot-toast';
import { UploadCloud, AlertCircle, Loader2, Sparkles, FileText, X } from 'lucide-react';

export default function AiScanner({ onDataParsed, mode }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        return toast.error('File must be under 10MB');
      }
      setFile(selected);
      
      if (selected.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selected);
      } else {
        setPreview('document');
      }
    }
  };

  // Helper to convert file to Google Generative AI part
  async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  const handleScan = async () => {
    if (!file) return;
    
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      return toast.error('Gemini API Key is not configured in .env');
    }

    setLoading(true);
    const isSubjects = mode === 'subjects';

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an expert academic data scientist. 
        ANALYSIS TASK:
        1. Carefully examine the provided ${file.type.startsWith('image/') ? 'image' : 'document'}.
        2. Extract ${isSubjects ? 'subjects and their schedules' : 'holiday names and dates'}.
        3. If it's a schedule, return a 'subjects' array where each subject has:
           - 'name': string
           - 'slots': array of { day: number (0=Sun, 1=Mon...), startTime: string (HH:MM), endTime: string (HH:MM), type: string (Theory/Lab), weight: number (2 for Theory, 1 for Lab) }
        4. If it's holidays, return a 'holidays' array of { name: string, date: string (YYYY-MM-DD) }.

        Return ONLY a JSON object. No markdown.
        JSON STRUCTURE:
        {
          "subjects": [],
          "holidays": [],
          "raw_text": "Brief overview"
        }
      `;

      let result;
      if (file.type.startsWith('image/')) {
        const imagePart = await fileToGenerativePart(file);
        result = await model.generateContent([prompt, imagePart]);
      } else {
        // For documents, we try to pass them if supported, otherwise notify
        // Note: Gemini 1.5 Flash supports some doc types as parts
        const docPart = await fileToGenerativePart(file);
        result = await model.generateContent([prompt, docPart]);
      }

      const response = await result.response;
      let text = response.text();
      
      // Clean JSON if Gemini wrapped it in markdown code blocks
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) text = jsonMatch[0];

      const parsedData = JSON.parse(text);
      onDataParsed(parsedData);
      
      setFile(null);
      setPreview(null);
      toast.success('AI Successfully extracted your data!');
    } catch (err) {
      console.error('Scan Error:', err);
      toast.error('Scan failed. Try an image or enter manually.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-center">
      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-8 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
        >
          <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Upload {mode === 'subjects' ? 'Schedule' : 'Holidays'}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
            Supports Images & PDF
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,application/pdf" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm aspect-[4/3] flex items-center justify-center bg-slate-50 dark:bg-slate-950/50 p-4">
            {preview === 'document' ? (
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto shadow-glow-sm">
                  <FileText className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">{file.name}</p>
                </div>
              </div>
            ) : (
              <img src={preview} alt="Upload preview" className="object-contain w-full h-full rounded-lg" />
            )}
            
            {!loading && (
              <button 
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-4 right-4 w-8 h-8 bg-white dark:bg-slate-900 text-slate-500 rounded-xl shadow-lg flex items-center justify-center hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button 
            onClick={handleScan} 
            disabled={loading} 
            className="btn-premium w-full h-14 flex justify-center items-center gap-3 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Synchronizing Intelligence...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze {mode === 'subjects' ? 'Schedule' : 'Holidays'}
              </>
            )}
          </button>
        </div>
      )}
      
      <div className="bg-indigo-600/5 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl flex gap-3 text-left border border-indigo-600/10">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
          <strong>Elite Tip:</strong> Clear images of your timetable yield the highest accuracy for AI extraction.
        </p>
      </div>
    </div>
  );
}

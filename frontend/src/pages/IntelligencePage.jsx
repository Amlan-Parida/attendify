import React, { useState, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Sparkles, FileText, UploadCloud, Loader2, CheckCircle2, 
  ArrowRight, Brain, BookOpen, Clock, Trash2, ChevronRight, X
} from 'lucide-react';

export default function IntelligencePage() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) return toast.error('File too large (>10MB)');
      setFile(selected);
      handleExtract(selected);
    }
  };

  const handleExtract = async (selectedFile) => {
    setLoading(true);
    setSummary(null);
    setExtractedText('');
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('mode', 'extract_only');

    try {
      const { data } = await api.post('/ai/scan', formData);
      // We'll update the backend to return 'text' in the response for 'extract_only' mode
      if (data.text) {
        setExtractedText(data.text);
        toast.success('Document parsed successfully!');
      } else {
        // Fallback: If it's a timetable, we might have subjects instead of raw text
        setExtractedText('Timetable data detected. subjects: ' + JSON.stringify(data.subjects || data.holidays));
        toast.success('Data identified!');
      }
    } catch (err) {
      toast.error('Failed to parse document');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!extractedText) return;
    setSummarizing(true);
    try {
      const { data } = await api.post('/ai/summarize', { text: extractedText });
      setSummary(data);
      toast.success('Summary generated!');
    } catch (err) {
      toast.error('Summarization failed');
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-aurora p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-glow-sm">
                <Brain className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Intelligence Hub</h1>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Extract & Summarize Academic Protocols</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-indigo-600/10 rounded-full border border-indigo-600/20 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
               Powered by Gemini 1.5 Elite
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Uploader & Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-8 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/5 shadow-xl">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-indigo-600" /> Source Document
              </h2>
              
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-10 text-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group"
                >
                  <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4 group-hover:scale-110 transition-transform shadow-glow-sm">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">Drop your Syllabus or Notes</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Supports PDF, DOCX, Images</p>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt,image/*" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-600/5 rounded-2xl border border-indigo-600/20 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ready for Intelligence Scan</p>
                      </div>
                    </div>
                    <button onClick={() => { setFile(null); setExtractedText(''); setSummary(null); }} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {loading && (
              <div className="glass-card p-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Decrypting Document...</p>
              </div>
            )}

            {extractedText && (
              <div className="glass-card p-8 bg-white/80 dark:bg-slate-900/80 animate-slide-up h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" /> Extracted Text
                  </h2>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{extractedText.length} Characters</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5">
                  {extractedText}
                </div>
                <button 
                  onClick={handleSummarize} 
                  disabled={summarizing}
                  className="btn-premium w-full h-14 mt-6 flex items-center justify-center gap-2"
                >
                  {summarizing ? (
                    <> <Loader2 className="w-4 h-4 animate-spin" /> Distilling Insights... </>
                  ) : (
                    <> <Sparkles className="w-4 h-4" /> Summarize Document </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: AI Insights */}
          <div className="lg:col-span-7">
            {summary ? (
              <div className="glass-card p-10 bg-white/90 dark:bg-slate-900/90 border-indigo-600/20 shadow-glow-sm animate-scale-in space-y-8 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">AI Insights</h2>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Context-Aware Summary</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[18px] font-black text-indigo-600 leading-none">{summary.readingTime}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Est. Reading</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <BookOpen className="w-3 h-3" /> Executive Overview
                    </h3>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/5 italic">
                      "{summary.overview}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> Key Takeaways
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {summary.takeaways.map((point, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-indigo-500/50 transition-all group">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 group-hover:scale-110 transition-transform">
                            {i + 1}
                          </div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sentiment:</span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        summary.sentiment === 'Urgent' ? 'bg-red-500/10 text-red-500' : 
                        summary.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-500' : 
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {summary.sentiment}
                      </span>
                    </div>
                    <button onClick={() => window.print()} className="text-[9px] font-black text-indigo-600 hover:underline uppercase tracking-widest">
                      Export Report
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center glass-card bg-white/30 dark:bg-slate-900/30 border-dashed border-2 border-slate-200 dark:border-white/10 rounded-[3rem]">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-400 mb-8 animate-pulse">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Insights Yet</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[240px] leading-relaxed">
                  Upload a document and initialize the protocol to generate context-aware academic summaries.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

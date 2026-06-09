import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Sparkles, FileText, UploadCloud, Loader2, CheckCircle2, 
  Brain, BookOpen, Trash2, X, Clock
} from 'lucide-react';

export default function IntelligencePage() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get('/ai/documents');
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

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
    setCurrentDocId(null);
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('mode', 'extract_only');

    try {
      const { data } = await api.post('/ai/scan', formData);
      if (data.text) {
        setExtractedText(data.text);
        if (data.documentId) setCurrentDocId(data.documentId);
        toast.success('Document parsed successfully!');
        fetchDocuments(); // Refresh to show newly saved document
      } else {
        setExtractedText('Timetable data detected. subjects: ' + JSON.stringify(data.subjects || data.holidays));
        toast.success('Data identified!');
      }
    } catch (err) {
      toast.error('Failed to parse document');
    } finally {
      setLoading(false);
      // Reset input value so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSummarize = async () => {
    if (!extractedText) return;
    setSummarizing(true);
    try {
      const payload = currentDocId ? { documentId: currentDocId } : { text: extractedText };
      const { data } = await api.post('/ai/summarize', payload);
      setSummary(data);
      toast.success('Summary generated!');
      fetchDocuments(); // Refresh to get updated summary in history
    } catch (err) {
      toast.error('Summarization failed');
    } finally {
      setSummarizing(false);
    }
  };

  const loadDocument = (doc) => {
    setFile({ name: doc.fileName });
    setExtractedText(doc.extractedText);
    setSummary(doc.summary || null);
    setCurrentDocId(doc._id);
  };

  const deleteDocument = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/documents/${id}`);
      toast.success('Document deleted');
      if (currentDocId === id) {
        setFile(null);
        setExtractedText('');
        setSummary(null);
        setCurrentDocId(null);
      }
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to delete document');
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
          
          {/* Left Column: Uploader & History */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <div className="glass-card p-6 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/5 shadow-xl">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-indigo-600" /> Source Document
              </h2>
              
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-8 text-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group"
                >
                  <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-3 group-hover:scale-110 transition-transform shadow-glow-sm">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">Drop Syllabus or Notes</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Supports PDF, DOCX, Images</p>
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
                    <button onClick={() => { setFile(null); setExtractedText(''); setSummary(null); setCurrentDocId(null); }} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Document History */}
            <div className="glass-card flex-1 p-6 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/5 shadow-xl flex flex-col min-h-[300px]">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> Document History
              </h2>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {documents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No past documents found</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div 
                      key={doc._id} 
                      onClick={() => loadDocument(doc)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${currentDocId === doc._id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{doc.fileName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {new Date(doc.createdAt).toLocaleDateString()}
                            {doc.summary && " • Summarized"}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => deleteDocument(doc._id, e)} 
                          className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Middle Column: Extracted Text */}
          <div className="lg:col-span-4">
            {loading ? (
              <div className="glass-card p-12 h-[500px] flex flex-col items-center justify-center space-y-4 animate-pulse">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Decrypting Document...</p>
              </div>
            ) : extractedText ? (
              <div className="glass-card p-6 bg-white/80 dark:bg-slate-900/80 animate-slide-up h-[600px] flex flex-col shadow-xl border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" /> Extracted Text
                  </h2>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{extractedText.length} Chars</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5">
                  {extractedText}
                </div>
                {!summary && (
                  <button 
                    onClick={handleSummarize} 
                    disabled={summarizing}
                    className="btn-premium w-full h-12 mt-4 flex items-center justify-center gap-2 text-sm"
                  >
                    {summarizing ? (
                      <> <Loader2 className="w-4 h-4 animate-spin" /> Distilling Insights... </>
                    ) : (
                      <> <Sparkles className="w-4 h-4" /> Summarize Document </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="glass-card h-[600px] flex flex-col items-center justify-center p-12 text-center bg-white/30 dark:bg-slate-900/30 border-dashed border-2 border-slate-200 dark:border-white/10 shadow-xl">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Document Scanned</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[200px] leading-relaxed">
                  Upload a document or select one from your history to view its extracted text.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: AI Insights */}
          <div className="lg:col-span-4">
            {summarizing ? (
              <div className="glass-card h-[600px] p-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Generating AI Insights...</p>
              </div>
            ) : summary ? (
              <div className="glass-card p-8 bg-white/90 dark:bg-slate-900/90 border-indigo-600/20 shadow-glow-sm animate-scale-in space-y-6 h-[600px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">AI Insights</h2>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Context-Aware Summary</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-indigo-600 leading-none">{summary.readingTime}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Est. Reading</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <BookOpen className="w-3 h-3" /> Executive Overview
                    </h3>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5 italic">
                      "{summary.overview}"
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> Key Takeaways
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {summary.takeaways.map((point, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5 hover:border-indigo-500/50 transition-all group">
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black flex-shrink-0 group-hover:scale-110 transition-transform">
                            {i + 1}
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sentiment:</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      summary.sentiment === 'Urgent' ? 'bg-red-500/10 text-red-500' : 
                      summary.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-500' : 
                      'bg-slate-500/10 text-slate-500'
                    }`}>
                      {summary.sentiment}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card h-[600px] flex flex-col items-center justify-center p-12 text-center bg-white/30 dark:bg-slate-900/30 border-dashed border-2 border-slate-200 dark:border-white/10 shadow-xl">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Insights Yet</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[240px] leading-relaxed">
                  Extract a document to generate context-aware academic summaries.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

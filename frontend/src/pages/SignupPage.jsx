import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Sparkles, Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const SLIDES = [
  {
    tag: 'Begin Deployment',
    title: <>Future-Proof <span className="text-glow">Academics</span>.</>,
    desc: 'Join the elite circle of students using data to stay ahead. Registration is open and free.',
    checklist: ['Unlimited Subject Tracking', 'Real-time Engagement Analytics']
  },
  {
    tag: 'Strategic Safety',
    title: <>Bunk <span className="text-glow">Smarter</span>.</>,
    desc: 'Our predictive algorithms calculate your safety margin so you never miss a critical threshold.',
    checklist: ['Precision Safety Margin', 'Automated Attendance Logs']
  },
  {
    tag: 'Elite Status',
    title: <>Dominate the <span className="text-glow">Curriculum</span>.</>,
    desc: 'Access crowdsourced templates and AI-powered timetable scanning for instant setup.',
    checklist: ['AI Timetable OCR', 'Community Templates']
  }
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const { verifyOtp, resendOtp } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signup({ name: formData.name, email: formData.email, password: formData.password });
      if (res.requiresVerification) {
        setShowOtpModal(true);
        toast.success(res.message || 'OTP Sent to email');
      } else {
        toast.success('Account Created! Initializing Onboarding...');
        navigate('/onboarding');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Focus next
    if (value !== '' && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      return toast.error('Please enter a valid 6-digit OTP');
    }
    
    setVerifyLoading(true);
    try {
      await verifyOtp({ email: formData.email, otp: otpString });
      setShowOtpModal(false);
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email: formData.email });
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-950 font-sans selection:bg-indigo-500/30 fixed inset-0">
      {/* Visual Side (Left) - Elite Intel Aesthetic */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="w-12 h-1 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              <span className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">Tactical Registration</span>
            </div>

            <div className="relative min-h-[320px]">
              {SLIDES.map((slide, i) => (
                <div 
                  key={i}
                  className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    i === activeSlide 
                      ? 'opacity-100 translate-x-0 blur-0' 
                      : 'opacity-0 -translate-x-12 blur-xl pointer-events-none'
                  }`}
                >
                  <span className="inline-block px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">
                    {slide.tag}
                  </span>
                  <h2 className="text-7xl font-black text-white leading-[0.9] tracking-tighter mb-8">
                    {slide.title}
                  </h2>
                  <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-lg mb-10">
                    {slide.desc}
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {slide.checklist.map((item, j) => (
                      <div key={j} className="flex items-center gap-4 group/item">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center transition-all group-hover/item:border-indigo-500/50">
                          <Check className="w-3 h-3 text-indigo-400" />
                        </div>
                        <span className="text-sm font-bold text-slate-300 tracking-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Slide Navigation */}
            <div className="flex gap-3 mt-12">
              {SLIDES.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === activeSlide ? 'w-12 bg-indigo-500' : 'w-3 bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Stats UI Component */}
        <div className="absolute bottom-12 right-12 animate-float">
          <div className="glass-card p-6 border-white/5 bg-white/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Network</p>
                <p className="text-lg font-black text-white tracking-tighter">Live Deployment</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-8 h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 animate-pulse-slow" style={{ width: `${Math.random() * 100}%`, animationDelay: `${i * 0.5}s` }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 md:p-16 relative bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent)] pointer-events-none"></div>
        
        <div className="w-full max-w-md relative z-10 animate-fade-in-up py-4">
          <div className="mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-glow rotate-3 hover:rotate-6 transition-transform duration-500">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-1">
              Create <span className="text-indigo-500">Account</span>.
            </h1>
            <p className="text-slate-400 font-bold tracking-tight text-sm">
              Join the future of academic intelligence.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  className="premium-input pl-14 h-14 text-sm"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Secure Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  className="premium-input pl-14 h-14 text-sm"
                  placeholder="name@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Encryption Key</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="premium-input pl-14 pr-12 h-14 text-sm"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full h-14 text-base group"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deploying...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    Initialize Protocol <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-slate-500 font-bold tracking-tight text-sm">
            Already registered?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-indigo-400 hover:text-indigo-300 transition-colors hover:underline decoration-2 underline-offset-4"
            >
              Sign In
            </button>
          </p>

          <div className="mt-8 pt-4 border-t border-slate-900 flex justify-between items-center">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Attendify v2.0 Elite</p>
            <div className="flex gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Network Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 w-screen h-screen z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md bg-white dark:bg-slate-900 shadow-glow-lg border-white/20 p-8 rounded-3xl animate-slide-up relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-inner">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Verify your email</h2>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8">
                We've sent a 6-digit code to <span className="text-indigo-600 dark:text-indigo-400">{formData.email}</span>
              </p>

              <form onSubmit={handleVerifyOtp} className="w-full space-y-8">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="btn-premium w-full h-14 text-base"
                >
                  {verifyLoading ? 'Verifying...' : 'Complete Registration'}
                </button>
              </form>

              <p className="mt-8 text-sm font-bold text-slate-500 dark:text-slate-400">
                Didn't receive the code?{' '}
                <button 
                  onClick={handleResendOtp}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline underline-offset-4 transition-colors"
                >
                  Resend OTP
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

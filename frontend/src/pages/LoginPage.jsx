import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, 
  Zap, Target, ShieldCheck, BrainCircuit, Globe, KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const SLIDES = [
  {
    tag: 'Academic Intelligence',
    title: <>Precision <span className="text-glow">Tracking</span> Redefined.</>,
    desc: 'The intelligent dashboard that keeps you ahead of the curve. Predict, manage, and excel with real-time data.',
    features: [
      { icon: Target, label: 'Goal Oriented', desc: 'Predict required sessions' },
      { icon: Zap, label: 'Instant Sync', desc: 'Real-time classmate pulse' },
    ]
  },
  {
    tag: 'Smart Prediction',
    title: <>Master Your <span className="text-glow">Future</span> Attendance.</>,
    desc: 'Our AI-driven engine calculates exactly how many classes you can skip while staying safe above your target.',
    features: [
      { icon: BrainCircuit, label: 'AI Simulations', desc: 'What-if skip analysis' },
      { icon: ShieldCheck, label: 'Risk Aware', desc: 'Automated health alerts' },
    ]
  },
  {
    tag: 'Community Driven',
    title: <>Seamless <span className="text-glow">Curriculum</span> Sharing.</>,
    desc: 'Join a network of students. Share college templates, holiday lists, and class schedules instantly.',
    features: [
      { icon: Globe, label: 'Crowdsourced', desc: 'Universal college templates' },
      { icon: Sparkles, label: 'Elite UX', desc: 'High-fidelity interface' },
    ]
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyLoading, setVerifyLoading] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const { login, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res?.requiresVerification) {
        setShowOtpModal(true);
        toast.error('Please verify your email first. We sent a new code.');
        await resendOtp({ email });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.message === 'Please verify your email address first') {
        setShowOtpModal(true);
        toast.error('Please verify your email. Sending a new code...');
        await resendOtp({ email });
      } else {
        toast.error(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) {
      document.getElementById(`login-otp-${index + 1}`)?.focus();
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
      await verifyOtp({ email, otp: otpString });
      setShowOtpModal(false);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email });
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error('Enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.success('OTP sent to your email');
      setForgotStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotOtp || !newPassword) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email: forgotEmail, otp: forgotOtp, newPassword });
      toast.success('Password reset successfully! You can now log in.');
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotEmail('');
      setForgotOtp('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white dark:bg-[#020617] fixed inset-0">
      {/* Background Aurora Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-100">
        <div className="absolute top-0 -left-1/4 w-[70%] h-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-0 -right-1/4 w-[70%] h-full bg-violet-500/10 dark:bg-violet-600/5 blur-[120px] rounded-full animate-pulse-slow"></div>
      </div>

      {/* Left Panel - Dynamic Feature Carousel */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] p-20 relative overflow-hidden">
        {/* Subtle mesh background for the left panel specifically */}
        <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark opacity-40"></div>
        
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-4 group">
          <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-glow-sm group-hover:rotate-6 transition-transform duration-700">
            <GraduationCap className="w-8 h-8" />
          </div>
          <span className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter">
            Attend<span className="text-indigo-600">ify</span>
            <span className="ml-2 px-2 py-0.5 rounded-md bg-indigo-600/10 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-600/20">v2.1 Elite</span>
          </span>
        </div>

        {/* Carousel Content */}
        <div className="relative z-10 flex-1 overflow-hidden">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlide;
            const offset = (idx - currentSlide) * 100;

            return (
              <div
                key={idx}
                style={{ transform: `translateX(${offset}%)` }}
                className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-center ${
                  isActive ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-600/5 dark:bg-white/5 border border-indigo-600/20 dark:border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-3 h-3" /> {slide.tag}
                  </div>
                  <h1 className="text-6xl font-black tracking-tighter leading-[0.85] text-slate-950 dark:text-white">
                    {slide.title}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-bold max-w-lg leading-relaxed">
                    {slide.desc}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 max-w-xl">
                    {slide.features.map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="glass-card p-6 border-white/80 dark:border-white/5 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-500 group/item">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 mb-4 group-hover/item:scale-110 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all duration-500 shadow-sm">
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className="font-black text-sm text-slate-950 dark:text-white mb-1 uppercase tracking-tight">{label}</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Indicators & Footer */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex gap-3">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-700 ${
                  idx === currentSlide ? 'w-16 bg-indigo-600' : 'w-4 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">© 2025 Intelligence Labs</p>
            <p className="text-[9px] font-bold text-indigo-600/50 uppercase tracking-widest mt-1">Authorized Access Only</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Card */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md relative">
          {/* Subtle decoration */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-600/20 blur-3xl rounded-full animate-pulse"></div>
          
          <div className="glass-card p-8 md:p-10 animate-slide-up bg-white/90 dark:bg-slate-900/60 shadow-glow-lg border-white/50 dark:border-white/10 overflow-hidden group">
            {/* Inner top glow line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            
            <div className="space-y-2 mb-8 text-center">
              <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter">Operator Sign-in</h2>
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                <p className="text-slate-500 font-bold text-xs">Synchronizing academic data...</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Universal ID</label>
                <div className="relative group/input">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-indigo-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@terminal.edu"
                    className="premium-input pl-16 h-14 text-sm"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Access Key</label>
                  <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] font-black uppercase tracking-[0.1em] text-indigo-500 hover:text-indigo-400 focus:outline-none">Forgot?</button>
                </div>
                <div className="relative group/input">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-indigo-600 transition-colors" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="premium-input pl-16 pr-16 h-14 text-sm"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={loading} className="btn-premium w-full h-14 text-base group">
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      Initialize Session <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4 text-center">
              <p className="text-slate-500 font-bold text-xs">
                Unregistered user?{' '}
                <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-black hover:underline underline-offset-8 decoration-2">
                  Create Identity
                </Link>
              </p>
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
                We've sent a 6-digit code to <span className="text-indigo-600 dark:text-indigo-400">{email}</span>
              </p>

              <form onSubmit={handleVerifyOtp} className="w-full space-y-8">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`login-otp-${index}`}
                      type="text"
                      maxLength="1"
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          document.getElementById(`login-otp-${index - 1}`)?.focus();
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
                  {verifyLoading ? 'Verifying...' : 'Complete Verification'}
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 w-screen h-screen z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="absolute inset-0" onClick={() => { setShowForgotModal(false); setForgotStep(1); }}></div>
          <div className="glass-card w-full max-w-md bg-white dark:bg-slate-900 shadow-glow-lg border-white/20 p-8 rounded-3xl animate-slide-up relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-inner">
                <KeyRound className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Reset Password</h2>
              
              {forgotStep === 1 ? (
                <>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8">
                    Enter your email address and we'll send you an OTP to reset your password.
                  </p>
                  <form onSubmit={handleForgotPassword} className="w-full space-y-6">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@terminal.edu"
                      className="premium-input w-full h-14"
                      required
                    />
                    <button type="submit" disabled={loading} className="btn-premium w-full h-14">
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8">
                    Enter the OTP sent to <span className="text-indigo-500">{forgotEmail}</span> and your new password.
                  </p>
                  <form onSubmit={handleResetPassword} className="w-full space-y-6">
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="6-digit OTP"
                      maxLength="6"
                      className="premium-input w-full h-14 tracking-widest text-center text-lg font-black"
                      required
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password (min 6 chars)"
                      minLength="6"
                      className="premium-input w-full h-14"
                      required
                    />
                    <button type="submit" disabled={loading} className="btn-premium w-full h-14">
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

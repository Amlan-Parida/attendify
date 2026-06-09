import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter a complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ email, otp: otpString });
      navigate('/onboarding');
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    
    setResending(true);
    try {
      await resendOtp({ email });
      setTimeLeft(60);
    } catch (err) {
      // Error handled by context
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-950 font-sans selection:bg-indigo-500/30 p-4">
      {/* Background Aurora Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-50">
        <div className="absolute top-1/4 -left-1/4 w-[70%] h-full bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-0 -right-1/4 w-[70%] h-full bg-violet-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 md:p-10 animate-fade-in-up bg-white/5 shadow-glow-lg border-white/10 overflow-hidden text-center relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
          
          <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>

          <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Verify Email</h2>
          <p className="text-slate-400 font-bold tracking-tight text-sm mb-8 leading-relaxed">
            We've sent a 6-digit security code to<br/>
            <span className="text-indigo-400">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-black text-white bg-slate-900/50 border border-slate-700/50 rounded-xl focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                />
              ))}
            </div>

            <button 
              type="submit" 
              disabled={loading || otp.join('').length !== 6} 
              className="btn-premium w-full h-14 text-base group disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  Confirm Identity <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-2">
            <button
              onClick={handleResend}
              disabled={timeLeft > 0 || resending}
              className={`flex items-center gap-2 text-sm font-bold tracking-tight transition-colors ${
                timeLeft > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              {timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Resend Verification Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

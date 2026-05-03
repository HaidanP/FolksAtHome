import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/FolksAtHomeLogo.png';
import BackgroundVideo from './BackgroundVideo';

export default function DashboardLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    try {
      const user = await login(email.trim(), password);
      navigate(user.role === 'member' ? '/dashboard/member' : '/dashboard/volunteer');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    }
  };

  const inputStyle = {
    background: '#F9FAFB', border: '1.5px solid #F3F4F6',
    color: '#1F1F1F', transition: 'border-color 0.2s, background 0.2s',
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative">
      <BackgroundVideo src="https://replicate.delivery/xezq/NUWPKTCjGcphHtBY0ayR1Astrxufr1hgwLfhRf6uCcD40o7sA/tmpasgj_qvt.mp4" />

      {/* Navbar */}
      <div className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-6 shrink-0">
        <nav className="liquid-glass rounded-xl px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 sm:gap-2 bg-transparent border-none cursor-pointer">
            <img src={logo} alt="" className="h-6 sm:h-8 w-auto" />
            <span className="text-base sm:text-2xl font-semibold tracking-tight text-white leading-none">Folks at Home</span>
          </button>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8l4-4" /></svg>
            Back
          </button>
        </nav>
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 24px 80px rgba(236,72,153,0.18),0 8px 32px rgba(0,0,0,0.12)' }}>
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right,#F9A8D4,#EC4899,#F9A8D4)' }} />
            <div className="px-7 pt-6 pb-7">
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: '#EC4899' }}>Portal</p>
              <h1 className="font-serif text-2xl font-normal mb-5" style={{ color: '#1F1F1F', letterSpacing: '-0.02em' }}>Sign in to your account.</h1>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#9CA3AF' }}>Email</label>
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#F9A8D4'; e.currentTarget.style.background = '#FFF5F9'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#F3F4F6'; e.currentTarget.style.background = '#F9FAFB'; }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#9CA3AF' }}>Password</label>
                  <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#F9A8D4'; e.currentTarget.style.background = '#FFF5F9'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#F3F4F6'; e.currentTarget.style.background = '#F9FAFB'; }} />
                </div>
                {error && <p className="error-in text-xs font-medium" style={{ color: '#EF4444' }}>{error}</p>}
                <button type="submit"
                  className="w-full py-3 rounded-xl text-sm font-bold tracking-wide border-none cursor-pointer transition-all duration-200 hover:opacity-90 mt-1"
                  style={{ background: 'linear-gradient(135deg,#EC4899 0%,#F472B6 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(236,72,153,0.35)' }}>
                  Sign In
                </button>
              </form>
            </div>
          </div>
          <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Questions? <a href="mailto:info@folksathome.org" className="underline" style={{ color: 'rgba(249,168,212,0.75)' }}>info@folksathome.org</a>
          </p>
        </div>
      </div>
    </div>
  );
}

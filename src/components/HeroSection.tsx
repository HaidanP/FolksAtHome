import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedHeading from './AnimatedHeading';
import FadeIn from './FadeIn';
import CountUp from './CountUp';
import logo from '../assets/FolksAtHomeLogo.png';

function AccountModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<'member' | 'volunteer' | null>(null);

  const handleNext = () => {
    if (!selected) return;
    onClose();
    if (selected === 'member') {
      navigate('/membership/auth', { state: { tab: 'login' } });
    } else {
      navigate('/volunteer', { state: { tab: 'login' } });
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,8,5,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 400,
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Pink top bar */}
        <div style={{ height: 5, background: 'linear-gradient(to right, #F9A8D4, #EC4899, #F9A8D4)' }} />

        <div style={{ padding: '24px 28px 28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#EC4899', marginBottom: 4 }}>
                Account
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0, letterSpacing: '-0.02em' }}>
                Who are you?
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>

          {/* Role tiles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {([
              {
                id: 'member' as const,
                label: 'Member',
                desc: "I'm a community member who needs support.",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12z"/>
                    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
                  </svg>
                ),
              },
              {
                id: 'volunteer' as const,
                label: 'Volunteer',
                desc: "I'm a volunteer who helps community members.",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-8-5.2-8-10.4a4.6 4.6 0 0 1 8-3.1 4.6 4.6 0 0 1 8 3.1C20 15.8 12 21 12 21z"/>
                  </svg>
                ),
              },
            ]).map(opt => {
              const on = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    borderRadius: 14, cursor: 'pointer', textAlign: 'left', border: 'none',
                    background: on ? '#FFF5F9' : '#F9FAFB',
                    outline: on ? '2px solid #EC4899' : '2px solid transparent',
                    transition: 'all 0.15s',
                    color: on ? '#EC4899' : '#6B7280',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: on ? '#FCE7F3' : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}>
                    {opt.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: on ? '#EC4899' : '#1A1A1A', margin: 0, marginBottom: 2 }}>
                      {opt.label}
                    </p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>
                      {opt.desc}
                    </p>
                  </div>
                  {on && (
                    <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M3 8l3.5 3.5L13 4" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={!selected}
            style={{
              width: '100%', padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700,
              border: 'none', cursor: selected ? 'pointer' : 'not-allowed',
              background: selected ? 'linear-gradient(135deg, #EC4899, #F472B6)' : '#F3F4F6',
              color: selected ? '#fff' : '#D1D5DB',
              boxShadow: selected ? '0 4px 16px rgba(236,72,153,0.35)' : 'none',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            Sign In
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const [showAccount, setShowAccount] = useState(false);
  return (
    <section className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="https://replicate.delivery/xezq/LngNdLUYW0rtJ92MWXdji9Y4h8lbZpMLWYWk4H6VYVz7VXnF/tmp7ro52pc7.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Bottom scrim */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)',
        }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Navbar */}
        <div className="px-4 sm:px-6 md:px-12 lg:px-16 pt-4 sm:pt-6">
          <nav className="liquid-glass rounded-xl px-3 sm:px-4 py-2 flex items-center justify-between gap-3 relative">
            {/* Logo + wordmark */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <img src={logo} alt="Folks at Home logo" className="h-6 sm:h-7 md:h-8 w-auto" />
              <span className="text-base sm:text-lg md:text-2xl font-semibold tracking-tight text-white leading-none">Folks at Home</span>
            </div>

            {/* Center links — hidden on mobile, visible md+ */}
            <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
              {[
                { label: 'Mission',  id: 'mission'  },
                { label: 'Services', id: 'services' },
                { label: 'Join',     id: 'join'     },
                { label: 'Coverage', id: 'coverage' },
              ].map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm text-white transition-colors duration-200 hover:text-gray-300 bg-transparent border-none cursor-pointer"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Account + Donate */}
            <div className="shrink-0 flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowAccount(true)}
                className="text-xs sm:text-sm font-semibold text-white/80 hover:text-white bg-transparent border-none cursor-pointer transition-colors duration-200 px-1"
              >
                Account
              </button>
              <a href="https://www.paypal.com/donate/?cmd=_s-xclick&hosted_button_id=GW7PKCG8N8Q7C" target="_blank" rel="noopener noreferrer" className="btn-donate text-xs sm:text-sm px-3 sm:px-6">Donate</a>
            </div>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="px-4 sm:px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-8 sm:pb-12 lg:pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-8">
            {/* Heading + subheadline */}
            <div className="max-w-lg">
              <AnimatedHeading
                text={"A ride, a visit,\na hand."}
                className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal mb-3 sm:mb-4 text-white"
                initialDelay={200}
                charDelay={30}
                textShadow="0 1px 3px rgba(0,0,0,0.6)"
              />
              <FadeIn delay={800} duration={1000}>
                <p className="text-sm sm:text-base md:text-lg text-white/90">
                  We pair the Sewanee community with volunteers who give rides, friendly visits, and everyday help.
                </p>
              </FadeIn>
            </div>

            {/* Metrics — stacks below on mobile/tablet, floats right on lg */}
            <FadeIn delay={1100} duration={1000} className="shrink-0 lg:ml-8">
              <div className="metrics-glass rounded-2xl inline-flex divide-x divide-white/15">
                {[
                  { target: 17,   suffix: '+', label: 'Years on the Mountain', delay: 1200 },
                  { target: 60,   suffix: '+', label: 'Active members',         delay: 1350 },
                  { target: 1200, suffix: '+', label: 'Rides & visits/year',    delay: 1500,
                    formatter: (n: number) => n >= 1000
                      ? `${Math.floor(n / 1000)},${String(n % 1000).padStart(3, '0')}`
                      : String(n) },
                ].map((metric) => (
                  <div key={metric.label} className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                    <div
                      className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-none"
                      style={{ textShadow: '0 0 14px rgba(255,255,255,0.3)' }}
                    >
                      <CountUp
                        target={metric.target}
                        suffix={metric.suffix}
                        duration={1600}
                        delay={metric.delay}
                        formatter={metric.formatter}
                      />
                    </div>
                    <div className="mt-1 sm:mt-1.5 text-[8px] sm:text-[10px] font-medium tracking-widest uppercase text-white/65">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
      {showAccount && <AccountModal onClose={() => setShowAccount(false)} />}
    </section>
  );
}

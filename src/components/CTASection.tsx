import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import ServicesModal from './ServicesModal';

export default function CTASection() {
  const navigate = useNavigate();
  const { ref, inView } = useInView(0.1);
  const [showServices, setShowServices] = useState(false);

  return (
    <section
      ref={ref}
      className="w-full h-full flex flex-col overflow-hidden"
      style={{
        background: '#F5EED6',
        opacity: inView ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      {showServices && <ServicesModal onClose={() => setShowServices(false)} />}

      <div className="section-video" style={{ background: '#1a1a1a' }}>
        <video className="absolute inset-0 w-full h-full" src="https://replicate.delivery/xezq/suMhNUvoFfRVAyFIfCOaKZdRmdNSPjM9U0sm9e4CHlfZbD2ZB/tmpf7ekarxt.mp4" autoPlay loop muted playsInline style={{ objectFit: 'cover', objectPosition: 'center' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(31,31,31,0.78) 0%, rgba(31,31,31,0.3) 60%, transparent 100%)' }} />
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 sm:px-10 md:px-16 pb-6 sm:pb-8">
          <p className="text-xs font-medium tracking-[0.2em] uppercase mb-2 sm:mb-3" style={{ color: '#F4C2C2' }}>Get Involved</p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-tight text-white" style={{ letterSpacing: '-0.02em' }}>
            Two ways to be<br />part of something good.
          </h2>
        </div>
      </div>

      <div className="flex-1 flex items-center px-4 sm:px-6 md:px-12 py-4">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          <div className="rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col" style={{ background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <span className="text-xs font-medium tracking-[0.18em] uppercase mb-2 sm:mb-3" style={{ color: '#EC4899' }}>For Members</span>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-normal leading-tight mb-2 sm:mb-3" style={{ color: '#1F1F1F', letterSpacing: '-0.02em' }}>Need a hand?</h3>
            <p className="text-xs sm:text-sm leading-relaxed mb-2 flex-1" style={{ color: '#5A5A5A' }}>Membership is open to all Sewanee area residents. Join today and let us connect you with the support you need.</p>
            <button onClick={() => setShowServices(true)} className="self-start text-xs mb-4 sm:mb-5 underline underline-offset-2 bg-transparent border-none cursor-pointer p-0 transition-opacity hover:opacity-70" style={{ color: '#EC4899' }}>
              View services &amp; programs
            </button>
            <button onClick={() => navigate('/membership')} className="self-start px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 hover:opacity-85" style={{ background: '#1F1F1F', color: '#fff' }}>
              Become a Member
            </button>
          </div>
          <div className="rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col" style={{ background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <span className="text-xs font-medium tracking-[0.18em] uppercase mb-2 sm:mb-3" style={{ color: '#EC4899' }}>For Volunteers</span>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-normal leading-tight mb-2 sm:mb-3" style={{ color: '#1F1F1F', letterSpacing: '-0.02em' }}>Want to help a neighbor?</h3>
            <p className="text-xs sm:text-sm leading-relaxed mb-2 flex-1" style={{ color: '#5A5A5A' }}>Volunteering is flexible — give what time you have. A few hours a month can make an enormous difference.</p>
            <button onClick={() => setShowServices(true)} className="self-start text-xs mb-4 sm:mb-5 underline underline-offset-2 bg-transparent border-none cursor-pointer p-0 transition-opacity hover:opacity-70" style={{ color: '#EC4899' }}>
              View services &amp; programs
            </button>
            <button onClick={() => navigate('/volunteer')} className="self-start px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 hover:opacity-85" style={{ background: '#1F1F1F', color: '#fff' }}>
              Volunteer With Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

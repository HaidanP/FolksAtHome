import { useRef } from 'react';
import { useInView } from '../hooks/useInView';

const row1 = ['The Domain', 'Tuesday at nine', 'Your neighbor\'s name', 'The long driveway', 'Still here', 'Cumberland Plateau', 'A key under the mat', 'The road home', 'By name', 'Since 2007', 'Without asking twice', 'Five miles away', 'The bluff view', 'After the rain', 'The same chair', 'Slow down'];
const row2 = ['Franklin Forest', 'Pie on the porch', 'The mountain light', 'Old growth', 'Morning fog', 'A familiar voice', 'The gravel road', 'Dogwood season', 'Before dark', 'The holler', 'Spring thaw', 'Known here', 'Fireflies', 'October leaves', 'Abbo\'s Alley', 'Muddy boots'];

export default function MissionSection() {
  const { ref, inView } = useInView(0.1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration && v.currentTime >= v.duration - 0.15) {
      v.currentTime = 0;
    }
  };

  const marqueeRow1 = [...row1, ...row1];
  const marqueeRow2 = [...row2, ...row2];

  return (
    <section
      ref={ref}
      className="w-full h-full flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #F5EED6, #EAE0C4)',
        opacity: inView ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      {/* Video — 16:9 aspect, capped height */}
      <div className="relative overflow-hidden w-full shrink-0" style={{ height: 'calc(100vw * 9 / 16)', maxHeight: '55vh', background: '#1a1a1a' }}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full"
          src="https://replicate.delivery/xezq/WJDZYvZbh2btG9ilJT5vojDifv9MfEmGUz4P0dcJeDVm996sA/tmpjz_xc3uo.mp4"
          autoPlay loop muted playsInline
          onTimeUpdate={handleTimeUpdate}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(31,31,31,0.82) 0%, rgba(31,31,31,0.3) 60%, transparent 100%)' }} />
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 sm:px-10 md:px-16 pb-6 sm:pb-8">
          <p className="text-xs font-medium tracking-[0.2em] uppercase mb-2 sm:mb-3" style={{ color: '#F4C2C2' }}>Our Mission</p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-tight text-white" style={{ letterSpacing: '-0.02em' }}>
            Home is where<br />we belong.
          </h2>
        </div>
      </div>

      {/* Marquee rows */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden gap-4 sm:gap-6">
        <div className="overflow-hidden">
          <div className="marquee-track marquee-ltr">
            {marqueeRow1.map((w, i) => (
              <span key={i} className="font-serif font-normal shrink-0" style={{ fontSize: 'clamp(1.4rem, 3.5vw, 3.5rem)', letterSpacing: '-0.03em', padding: '0 1.6rem', color: i % 3 === 0 ? '#1F1F1F' : i % 3 === 1 ? '#EC4899' : '#D4664A' }}>
                {w} <span style={{ opacity: 0.25, color: '#D4664A' }}>·</span>
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="marquee-track marquee-rtl">
            {marqueeRow2.map((w, i) => (
              <span key={i} className="font-serif italic font-normal shrink-0" style={{ fontSize: 'clamp(1rem, 2.5vw, 2.5rem)', letterSpacing: '-0.02em', padding: '0 1.6rem', color: i % 3 === 0 ? '#EC4899' : i % 3 === 1 ? '#1F1F1F' : '#D4664A', opacity: 0.5 }}>
                {w} <span style={{ opacity: 0.3 }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

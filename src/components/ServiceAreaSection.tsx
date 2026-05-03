import { useInView } from '../hooks/useInView';
import serviceAreaImg from '../assets/servicearea.png';
import phoneIcon from '../assets/phoneicon.png';
import emailIcon from '../assets/emailicon.png';

const locations = ['Sewanee', 'Monteagle', 'Sherwood Road', 'Franklin State Forest'];

export default function ServiceAreaSection() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      ref={ref}
      className="w-full h-full flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #EAE0C4, #F5EED6)',
        opacity: inView ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      <div className="section-video-tall">
        {/* Cover layer — fills container naturally */}
        <img src={serviceAreaImg} aria-hidden className="absolute inset-0 w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.6 }} />
        {/* Full image layer — shows entire image */}
        <img src={serviceAreaImg} alt="Folks at Home service area" className="absolute inset-0 w-full h-full" style={{ objectFit: 'fill', filter: 'blur(0.4px)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(31,31,31,0.8) 0%, rgba(31,31,31,0.3) 55%, transparent 100%)' }} />
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 sm:px-10 md:px-16 pb-6 sm:pb-8">
          <p className="text-xs font-medium tracking-[0.2em] uppercase mb-2 sm:mb-3" style={{ color: '#F4C2C2' }}>Where We Serve</p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-tight text-white mb-4 sm:mb-5" style={{ letterSpacing: '-0.02em' }}>The Mountain.</h2>
          <div className="flex flex-wrap gap-2">
            {locations.map((loc) => (
              <span key={loc} className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
                {loc}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start pt-5 sm:pt-6 text-center px-6 sm:px-10 md:px-16">
        <p className="font-serif text-xl sm:text-2xl md:text-3xl font-normal leading-snug mb-6 sm:mb-8" style={{ color: '#1F1F1F', letterSpacing: '-0.01em' }}>
          Live just outside this area?<br />
          <span style={{ color: '#EC4899' }}>Get in touch — we'd love to help.</span>
        </p>
        <div className="flex items-start justify-center gap-12 sm:gap-16">
          <div className="flex flex-col items-center gap-2">
            <img src={phoneIcon} alt="Phone" className="w-20 h-20 sm:w-24 sm:h-24" style={{ objectFit: 'contain' }} />
            <span className="text-sm sm:text-base font-medium" style={{ color: '#1F1F1F' }}>(931) 598-0303</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <img src={emailIcon} alt="Email" className="w-20 h-20 sm:w-24 sm:h-24" style={{ objectFit: 'contain' }} />
            <span className="text-sm sm:text-base font-medium" style={{ color: '#1F1F1F' }}>info@folksathome.org</span>
          </div>
        </div>
      </div>
    </section>
  );
}

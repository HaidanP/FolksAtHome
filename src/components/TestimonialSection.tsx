import { useInView } from '../hooks/useInView';

export default function TestimonialSection() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      ref={ref}
      className="relative w-full h-full overflow-hidden"
      style={{
        background: '#1a1208',
        opacity: inView ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      <video className="absolute inset-0 w-full h-full" src="https://replicate.delivery/xezq/TnHzZorvlbLZGRffL9HsRFFDoAZVtXj137D2spHWdw7CfA7sA/tmp2yvdm00u.mp4" autoPlay loop muted playsInline style={{ objectFit: 'cover', objectPosition: 'center' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(31,31,31,0.9) 0%, rgba(31,31,31,0.55) 50%, rgba(31,31,31,0.1) 100%)' }} />
      <div className="absolute top-0 right-0 pointer-events-none" style={{ width: 'clamp(180px, 40vw, 320px)', height: 'clamp(180px, 40vw, 320px)', background: 'radial-gradient(circle at top right, rgba(244,194,194,0.2) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 sm:px-10 md:px-16 lg:px-20 pb-10 sm:pb-14 md:pb-16">
        <div style={{ maxWidth: '48rem' }}>
          <p className="text-xs font-medium tracking-[0.2em] uppercase mb-4 sm:mb-5" style={{ color: '#F4C2C2' }}>Member Stories</p>
          <span className="font-serif leading-none select-none block mb-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'rgba(244,194,194,0.45)', lineHeight: 0.8 }}>"</span>
          <blockquote className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-snug text-white mb-4 sm:mb-6" style={{ letterSpacing: '-0.02em' }}>
            I don't know what I would do without Folks at Home. They've kept me independent — and they've become friends.
          </blockquote>
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>
            — Liz Camp, Sewanee resident since 1978
          </p>
        </div>
      </div>
    </section>
  );
}

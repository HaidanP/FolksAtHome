import { useInView } from '../hooks/useInView';

export default function DonateSection() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      ref={ref}
      className="relative w-full h-full overflow-hidden"
      style={{
        background: '#1a0a0a',
        opacity: inView ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      <video className="absolute inset-0 w-full h-full" src="https://replicate.delivery/xezq/ziTJqEZcY6bjI92M2PpUe8WBJd1czsJkcaZKufkBoLBR8gdWA/tmp6mq0mg26.mp4" autoPlay loop muted playsInline style={{ objectFit: 'cover', objectPosition: 'center' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 500px 350px at 15% 40%, rgba(244,194,194,0.3) 0%, transparent 70%), radial-gradient(ellipse 350px 250px at 80% 20%, rgba(244,194,194,0.25) 0%, transparent 60%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(31,31,31,0.78) 0%, rgba(31,31,31,0.38) 50%, rgba(31,31,31,0.08) 100%)' }} />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-14 sm:pb-20 px-6 text-center">
        <p className="text-xs font-medium tracking-[0.2em] uppercase mb-4 sm:mb-5" style={{ color: '#F4C2C2' }}>Support Our Work</p>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-white mb-4 sm:mb-5" style={{ letterSpacing: '-0.02em', maxWidth: '18ch' }}>
          Keep the Mountain taking care of the Mountain.
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-white/70 mb-6 sm:mb-8" style={{ maxWidth: '38ch' }}>
          Your gift funds rides, visits, and everyday help for Sewanee's older residents.
        </p>
        <a href="https://www.paypal.com/donate/?cmd=_s-xclick&hosted_button_id=GW7PKCG8N8Q7C" target="_blank" rel="noopener noreferrer" className="btn-donate px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base rounded-full">
          Donate Now
        </a>
      </div>
    </section>
  );
}

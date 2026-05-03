import { useInView } from '../hooks/useInView';

const services = [
  {
    title: 'Transportation',
    body: 'Need a ride to a medical appointment, pharmacy, or grocery store? Our volunteers bring you door to door.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 26h28M8 26V18l4-8h16l4 8v8" /><circle cx="13" cy="29" r="3" /><circle cx="27" cy="29" r="3" /><path d="M12 18h16M6 22h4M30 22h4" />
      </svg>
    ),
  },
  {
    title: 'Friendly Visits',
    body: 'Sometimes the best help is simply showing up. Volunteers stop by for conversation, companionship, and connection.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 34C20 34 6 25 6 15.5a7.5 7.5 0 0 1 14-3.7 7.5 7.5 0 0 1 14 3.7C34 25 20 34 20 34z" />
      </svg>
    ),
  },
  {
    title: 'Everyday Help',
    body: 'Errands, light tech support, picking up prescriptions — small tasks handled with care so you can focus on what matters.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 8v10M14 8c0-2 3-2 3 0v10M17 8c0-2 3-2 3 0v10M20 10c0-2 3-2 3 0v8l1 4c1 4-1 8-6 8s-7-4-6-8l1-4V14" />
      </svg>
    ),
  },
];

export default function ServicesSection() {
  const { ref, inView } = useInView(0.1);

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
      <div className="section-video" style={{ background: '#1a1a1a' }}>
        <video className="absolute inset-0 w-full h-full" src="https://replicate.delivery/xezq/dzT239k7vUpKKZdG2Zm3aDtRCDVieiNZcjlu2H22441bFwOLA/tmpog792wx0.mp4" autoPlay loop muted playsInline style={{ objectFit: 'cover', objectPosition: 'center' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(31,31,31,0.78) 0%, rgba(31,31,31,0.3) 60%, transparent 100%)' }} />
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 sm:px-10 md:px-16 pb-6 sm:pb-8">
          <p className="text-xs font-medium tracking-[0.2em] uppercase mb-2 sm:mb-3" style={{ color: '#F4C2C2' }}>What We Do</p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-tight text-white" style={{ letterSpacing: '-0.02em' }}>
            Simple help,<br />meaningful difference.
          </h2>
        </div>
      </div>
      <div className="flex-1 flex items-center px-4 sm:px-6 md:px-12 py-4">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
          {services.map((s) => (
            <div key={s.title} className="rounded-2xl p-4 md:p-5 lg:p-6 flex flex-col" style={{ background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div className="mb-3">{s.icon}</div>
              <h3 className="font-serif text-lg md:text-xl font-normal mb-1.5" style={{ color: '#1F1F1F' }}>{s.title}</h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#5A5A5A' }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

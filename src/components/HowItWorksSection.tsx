import { useInView } from '../hooks/useInView';

const steps = [
  { number: '01', title: 'Become a Member', body: 'Sign up online or give us a call. Membership is open to all Sewanee area residents.' },
  { number: '02', title: 'Tell Us What You Need', body: "Let us know about an upcoming appointment, errand, or visit you'd like help with." },
  { number: '03', title: 'A Neighbor Shows Up', body: "We match you with a volunteer and confirm the details. It's that simple." },
];

export default function HowItWorksSection() {
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
      <div className="section-video" style={{ background: '#1a1a1a' }}>
        <video className="absolute inset-0 w-full h-full" src="https://replicate.delivery/xezq/kU5G0IZJz7peX6Wfmt1W2TBtt6EeHVzBBzxLbG8UqDSEsA7sA/tmpr7_wqne2.mp4" autoPlay loop muted playsInline style={{ objectFit: 'cover', objectPosition: 'center' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(31,31,31,0.78) 0%, rgba(31,31,31,0.3) 60%, transparent 100%)' }} />
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 sm:px-10 md:px-16 pb-6 sm:pb-8">
          <p className="text-xs font-medium tracking-[0.2em] uppercase mb-2 sm:mb-3" style={{ color: '#F4C2C2' }}>How It Works</p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-tight text-white" style={{ letterSpacing: '-0.02em' }}>
            Easy from<br />start to finish.
          </h2>
        </div>
      </div>
      <div className="flex-1 flex items-center px-4 sm:px-6 md:px-12 py-4">
        <div className="relative w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="hidden md:block absolute top-7 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)]" style={{ borderTop: '1.5px dashed #EC4899', opacity: 0.35 }} />
          {steps.map((step) => (
            <div key={step.number} className="flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center">
              <div className="relative z-10 w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 md:mb-5" style={{ background: '#EC4899' }}>
                <span className="text-xs md:text-sm font-semibold text-white tracking-wider">{step.number}</span>
              </div>
              <div>
                <h3 className="font-serif text-lg md:text-xl font-normal mb-1 md:mb-2" style={{ color: '#1F1F1F' }}>{step.title}</h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#5A5A5A', maxWidth: '28ch' }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

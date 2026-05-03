import { useNavigate } from 'react-router-dom';
import logo from '../assets/FolksAtHomeLogo.png';
import BackgroundVideo from './BackgroundVideo';


const plans = [
  {
    name: 'Individual Service',
    annual: '$400',
    monthly: '$40',
    monthlyNote: '$480/yr',
    access: 'Full Services',
    taxDeductible: false,
    highlight: false,
  },
  {
    name: '2-Member Household Service',
    annual: '$700',
    monthly: '$70',
    monthlyNote: '$840/yr',
    access: 'Full Services',
    taxDeductible: false,
    highlight: true,
  },
  {
    name: 'Individual Sustaining',
    annual: '$400',
    monthly: null,
    monthlyNote: null,
    access: 'Programs Only',
    taxDeductible: true,
    highlight: false,
  },
  {
    name: '2-Member Household Sustaining',
    annual: '$700',
    monthly: null,
    monthlyNote: null,
    access: 'Programs Only',
    taxDeductible: true,
    highlight: false,
  },
];

export default function MembershipPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col relative">
      <BackgroundVideo src="https://replicate.delivery/xezq/lkI3mHmOAbrcO1AU4fWGTvPMhOetHZZBes2OCpd7oDsBFU7sA/tmpah9r1b9t.mp4" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <div className="px-4 sm:px-6 md:px-12 lg:px-16 pt-4 sm:pt-6">
          <nav className="liquid-glass rounded-xl px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 sm:gap-2 shrink-0 bg-transparent border-none cursor-pointer"
            >
              <img src={logo} alt="Folks at Home logo" className="h-6 sm:h-7 md:h-8 w-auto" />
              <span className="text-base sm:text-lg md:text-2xl font-semibold tracking-tight text-white leading-none">Folks at Home</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8l4-4" />
              </svg>
              Back
            </button>
          </nav>
        </div>

        {/* Header */}
        <div className="px-4 sm:px-6 md:px-12 lg:px-16 pt-12 sm:pt-16 pb-8 sm:pb-12">
          <p className="text-xs font-medium tracking-[0.2em] uppercase mb-3" style={{ color: '#F4C2C2' }}>Membership</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal leading-tight text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Join our community.
          </h1>
          <p className="text-base sm:text-lg max-w-xl" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Choose the membership that works for you. All members receive access to our volunteer network.
          </p>
        </div>

        {/* Cards */}
        <div className="flex-1 px-4 sm:px-6 md:px-12 lg:px-16 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="liquid-glass rounded-2xl p-6 sm:p-7 flex flex-col"
                style={plan.highlight ? { border: '1px solid rgba(244,194,194,0.35)', boxShadow: '0 0 32px rgba(244,194,194,0.08)' } : {}}
              >
                {plan.highlight && (
                  <span className="self-start text-[10px] font-semibold tracking-[0.18em] uppercase px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(244,194,194,0.15)', color: '#F4C2C2' }}>
                    Most Popular
                  </span>
                )}

                <h2 className="font-serif text-xl sm:text-2xl font-normal leading-snug text-white mb-6" style={{ letterSpacing: '-0.01em' }}>
                  {plan.name}
                </h2>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-serif text-4xl sm:text-5xl font-normal text-white" style={{ letterSpacing: '-0.03em' }}>{plan.annual}</span>
                    <span className="text-sm text-white/50">/yr</span>
                  </div>
                  {plan.monthly ? (
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      or {plan.monthly}/mo <span style={{ color: 'rgba(255,255,255,0.35)' }}>({plan.monthlyNote})</span>
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Annual only</p>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full flex items-center justify-center" style={{ background: 'rgba(107,142,127,0.35)' }}>
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#6B8E7F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span className="text-sm text-white/70">{plan.access}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full flex items-center justify-center" style={{ background: plan.taxDeductible ? 'rgba(107,142,127,0.35)' : 'rgba(255,255,255,0.08)' }}>
                      {plan.taxDeductible
                        ? <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#6B8E7F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M3 3l4 4M7 3l-4 4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" /></svg>
                      }
                    </span>
                    <span className="text-sm" style={{ color: plan.taxDeductible ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>
                      {plan.taxDeductible ? 'Tax deductible (may qualify)' : 'Not tax deductible'}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate('/membership/auth', { state: { plan: plan.name } })}
                  className="mt-7 w-full py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:opacity-85"
                  style={{ background: plan.highlight ? '#F4C2C2' : 'rgba(255,255,255,0.12)', color: plan.highlight ? '#1F1F1F' : '#fff', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.15)' }}
                >
                  Select Plan
                </button>
              </div>
            ))}
          </div>

          {/* Payment note */}
          <div className="mt-8 liquid-glass rounded-2xl px-6 sm:px-8 py-5">
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span className="text-white/80 font-medium">Payment methods accepted:</span> check (to P.O. Box 291, Sewanee, TN 37375), credit card via{' '}
              <a href="https://www.paypal.com/donate/?cmd=_s-xclick&hosted_button_id=GW7PKCG8N8Q7C" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#93C5FD' }}>PayPal</a>
              , cash, or bank draft.{' '}
              <span style={{ color: '#F4C2C2' }}>Financial assistance is available to qualified persons on request.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

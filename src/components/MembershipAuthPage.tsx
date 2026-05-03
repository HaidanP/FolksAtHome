import { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/FolksAtHomeLogo.png';
import { toPreviewUrl, acceptsHeic, toDataUrl } from '../utils/imageConvert';
import ServicesModal from './ServicesModal';
import BackgroundVideo from './BackgroundVideo';
import TermsModal from './TermsModal';

const plans = [
  { name: 'Individual Service',            annual: '$400', monthly: '$40/mo' },
  { name: '2-Member Household Service',    annual: '$700', monthly: '$70/mo' },
  { name: 'Individual Sustaining',         annual: '$400', monthly: null     },
  { name: '2-Member Household Sustaining', annual: '$700', monthly: null     },
];

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Account', 'Personal Info', 'Emergency Contact', 'Preferences'];

const SERVICES = [
  'Home safety inspection', 'Transportation',
  'Home maintenance',       'Auto maintenance',
  'Lawn care/landscaping',  'Home repair',
  'Tech Support',           'Financial',
  'Home health care',       'Pet care',
  'Housekeeping',           'Meal delivery',
  'Personal services',      'Other',
];

type Errors = Record<string, string>;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ── shared Field ──────────────────────────────────────────────────────────────
function Field({ label, type = 'text', placeholder, value, onChange, error, textarea }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
  error?: string; textarea?: boolean;
}) {
  const err = !!error;
  const style = {
    background: err ? '#FFF5F5' : '#F9FAFB',
    border: `1.5px solid ${err ? '#FCA5A5' : '#F3F4F6'}`,
    color: '#1F1F1F', transition: 'border-color 0.2s, background 0.2s',
  };
  const onFocus = (e: React.FocusEvent<any>) => {
    e.currentTarget.style.borderColor = err ? '#FCA5A5' : '#F9A8D4';
    e.currentTarget.style.background = err ? '#FFF5F5' : '#FFF5F9';
  };
  const onBlur = (e: React.FocusEvent<any>) => {
    e.currentTarget.style.borderColor = err ? '#FCA5A5' : '#F3F4F6';
    e.currentTarget.style.background = err ? '#FFF5F5' : '#F9FAFB';
  };
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: err ? '#EF4444' : '#9CA3AF' }}>{label}</label>
      {textarea ? (
        <textarea rows={2} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none" style={style} />
      ) : (
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={style} />
      )}
      {error && <p className="text-xs error-in" style={{ color: '#EF4444' }}>{error}</p>}
    </div>
  );
}

// ── member confirmation screen ────────────────────────────────────────────────
function MemberConfirmation({ firstName, onHome }: { firstName: string; onHome: () => void }) {
  const steps = [
    {
      title: 'Welcome call',
      desc: 'A coordinator will reach out within 2–3 business days to introduce themselves and answer any questions.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EC4899" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 3h4l1.5 4-2 1.5a11 11 0 0 0 4 4l1.5-2L17 12v4a1 1 0 0 1-1 1A14 14 0 0 1 3 4a1 1 0 0 1 1-1z"/>
        </svg>
      ),
    },
    {
      title: 'Membership packet',
      desc: "You'll receive your welcome materials and a complete guide to our services and programs.",
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EC4899" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="14" height="13" rx="2"/>
          <path d="M7 4V2M13 4V2M3 9h14M7 13h2M7 16h4"/>
        </svg>
      ),
    },
    {
      title: 'Your first request',
      desc: 'Once your membership is active you can log in and start submitting service requests right away.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EC4899" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>
          <rect x="7.5" y="11" width="5" height="7" rx="1"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <div style={{ background: '#fff', borderRadius: 28, overflow: 'hidden', boxShadow: '0 24px 80px rgba(236,72,153,0.2),0 8px 32px rgba(0,0,0,0.12)' }}>

        {/* Pink header */}
        <div style={{ background: 'linear-gradient(135deg,#EC4899 0%,#F472B6 100%)', padding: '36px 28px 28px', textAlign: 'center' }}>
          {/* House + heart illustration */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
              <path d="M8 24v18h32V24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 26L24 8l20 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24 26c0 0-8-5-8-11a5.6 5.6 0 0 1 8-5 5.6 5.6 0 0 1 8 5c0 6-8 11-8 11z" fill="rgba(255,255,255,0.45)" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 10px', lineHeight: 1.2 }}>
            You're all set{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.55, margin: 0, maxWidth: 320, marginInline: 'auto' }}>
            Your membership application has been received and is in review.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '26px 28px 30px' }}>
          <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.7, marginBottom: 26 }}>
            We're glad you're here. A Folks at Home coordinator will be in touch shortly to get everything set up for you.
          </p>

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C4BCB4', marginBottom: 20 }}>
            What happens next
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: '#FFF5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div style={{ paddingTop: 2 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 3 }}>{s.title}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={onHome}
            style={{ width: '100%', padding: '13px', borderRadius: 14, fontSize: 13, fontWeight: 700,
              background: 'linear-gradient(135deg,#EC4899,#F472B6)', color: '#fff',
              border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(236,72,153,0.35)',
              letterSpacing: '0.01em' }}>
            Back to Home
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#B5AFA8', marginTop: 16 }}>
            Questions?{' '}
            <a href="mailto:info@folksathome.org" style={{ color: '#EC4899', textDecoration: 'none', fontWeight: 600 }}>
              info@folksathome.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function MembershipAuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { plan?: string; tab?: 'register' | 'login' } | null;
  const initialPlan = locationState?.plan ?? plans[0].name;

  const { registerMember } = useAuth();
  const [tab, setTab] = useState<'register' | 'login'>(locationState?.tab ?? 'register');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [changingPlan, setChangingPlan] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [step, setStep] = useState(1);
  const [animClass, setAnimClass] = useState('step-enter-forward');
  const [stepKey, setStepKey] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [photoConverting, setPhotoConverting] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── form state ──
  const [f, setF] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', dob: '',
    streetAddress: '', city: '', state: '', zip: '',
    homePhone: '', cellPhone: '', referredBy: '',
    ecName: '', ecRelationship: '',
    ecStreetAddress: '', ecCity: '', ecState: '', ecZip: '',
    ecHomePhone: '', ecCellPhone: '', ecEmail: '',
  });
  const [contactMethods, setContactMethods] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [otherText, setOtherText] = useState('');

  const set = (k: keyof typeof f) => (v: string) => setF(p => ({ ...p, [k]: v }));

  // ── validation ──
  const validate = (s: number): Errors => {
    const e: Errors = {};
    if (s === 1) {
      if (!f.email.trim()) e.email = 'Email is required';
      else if (!isEmail(f.email)) e.email = 'Enter a valid email address';
      if (!f.password) e.password = 'Password is required';
      else if (f.password.length < 8) e.password = 'Must be at least 8 characters';
      if (!f.confirmPassword) e.confirmPassword = 'Please confirm your password';
      else if (f.password !== f.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    if (s === 2) {
      if (!f.firstName.trim()) e.firstName = 'Required';
      if (!f.lastName.trim()) e.lastName = 'Required';
      if (!f.dob) e.dob = 'Date of birth is required';
      if (!f.streetAddress.trim()) e.streetAddress = 'Address is required';
      if (!f.city.trim()) e.city = 'Required';
      if (!f.state.trim()) e.state = 'Required';
      else if (f.state.trim().length !== 2) e.state = '2 letters';
      if (!f.zip.trim()) e.zip = 'Required';
      else if (!/^\d{5}$/.test(f.zip.trim())) e.zip = '5 digits';
      if (!f.homePhone.trim() && !f.cellPhone.trim()) {
        e.homePhone = 'Enter at least one phone number';
      }
    }
    if (s === 3) {
      if (!f.ecName.trim()) e.ecName = 'Required';
      if (!f.ecRelationship.trim()) e.ecRelationship = 'Required';
      if (!f.ecHomePhone.trim() && !f.ecCellPhone.trim()) e.ecHomePhone = 'Enter at least one phone number';
      if (f.ecEmail && !isEmail(f.ecEmail)) e.ecEmail = 'Enter a valid email';
    }
    if (s === 4) {
      if (contactMethods.length === 0) e.contactMethods = 'Select at least one contact method';
      if (services.length === 0) e.services = 'Select at least one service';
      if (!agreeToTerms) e.agreeToTerms = 'You must agree to the Terms of Service';
    }
    return e;
  };

  const goTo = useCallback((next: number) => {
    if (next > step) {
      const errs = validate(step);
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    }
    setErrors({});
    setAnimClass(next > step ? 'step-enter-forward' : 'step-enter-back');
    setStep(next);
    setStepKey(k => k + 1);
  }, [step, f, contactMethods, services, agreeToTerms]);

  const handleFinalSubmit = useCallback(async () => {
    const errs = validate(TOTAL_STEPS);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setSubmitting(true);
    let avatarDataUrl: string | undefined;
    if (profilePreview) {
      try { avatarDataUrl = await toDataUrl(profilePreview); } catch { /* skip */ }
    }
    try {
      await registerMember({
        firstName: f.firstName, lastName: f.lastName,
        email: f.email, password: f.password,
        dob: f.dob || undefined,
        homePhone: f.homePhone || undefined, cellPhone: f.cellPhone || undefined,
        streetAddress: f.streetAddress || undefined,
        city: f.city || undefined, state: f.state || undefined, zip: f.zip || undefined,
        plan: selectedPlan,
        ecName: f.ecName || undefined,
        ecPhone: f.ecHomePhone || f.ecCellPhone || undefined,
        ecRelation: f.ecRelationship || undefined,
        contactMethods, services,
        avatarData: avatarDataUrl,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [validate, registerMember, f, selectedPlan, contactMethods, services, profilePreview]);

  const current = plans.find(p => p.name === selectedPlan) ?? plans[0];

  return (
    <div className="min-h-screen w-full flex flex-col relative">
      <BackgroundVideo src="https://replicate.delivery/xezq/NUWPKTCjGcphHtBY0ayR1Astrxufr1hgwLfhRf6uCcD40o7sA/tmpasgj_qvt.mp4" />

      {/* Navbar */}
      <div className="relative z-10 px-4 sm:px-6 md:px-12 pt-4 sm:pt-6 shrink-0">
        <nav className="liquid-glass rounded-xl px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 sm:gap-2 bg-transparent border-none cursor-pointer">
            <img src={logo} alt="" className="h-6 sm:h-8 w-auto" />
            <span className="text-base sm:text-2xl font-semibold tracking-tight text-white leading-none">Folks at Home</span>
          </button>
          <button onClick={() => navigate('/membership')} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8l4-4" /></svg>
            Back to Plans
          </button>
        </nav>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        {submitted ? (
          <MemberConfirmation firstName={f.firstName} onHome={() => navigate('/')} />
        ) : (
        <div className="w-full max-w-md flex flex-col gap-3">

          {/* Plan badge — only shown during registration */}
          {tab === 'register' && <div>
            <div className="rounded-2xl px-5 py-3.5 cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(249,168,212,0.3)' }}
              onClick={() => setChangingPlan(v => !v)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium tracking-[0.15em] uppercase mb-0.5" style={{ color: '#F9A8D4' }}>Selected Plan</p>
                  <p className="font-serif text-base text-white leading-snug">{current.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {current.annual}/yr{current.monthly ? ` · or ${current.monthly}` : ' · Annual only'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(236,72,153,0.2)', color: '#F9A8D4' }}>Change</span>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: changingPlan ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </div>
              </div>
            </div>
            {changingPlan && (
              <div className="mt-1.5 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.97)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                {plans.map((p, i) => (
                  <button key={p.name} onClick={() => { setSelectedPlan(p.name); setChangingPlan(false); }}
                    className="w-full flex items-center justify-between px-5 py-3 text-left border-none cursor-pointer"
                    style={{ background: p.name === selectedPlan ? '#FFF5F9' : 'transparent', borderBottom: i < plans.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#1F1F1F' }}>{p.name}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{p.annual}/yr{p.monthly ? ` · or ${p.monthly}` : ''}</p>
                    </div>
                    {p.name === selectedPlan && (
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3.5 3.5L13 5" /></svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>}

          {/* Auth card */}
          <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 24px 80px rgba(236,72,153,0.18),0 8px 32px rgba(0,0,0,0.12)' }}>
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right,#F9A8D4,#EC4899,#F9A8D4)' }} />

            <div className="px-6 sm:px-7 pt-6">
              {step === 1 && (
                <>
                  <p className="text-xs font-medium tracking-[0.2em] uppercase mb-1" style={{ color: '#EC4899' }}>Membership</p>
                  <h1 className="font-serif text-2xl sm:text-3xl font-normal mb-4" style={{ letterSpacing: '-0.02em', color: '#1F1F1F' }}>
                    {tab === 'login' ? 'Welcome back.' : 'Create your account.'}
                  </h1>
                  <div className="flex rounded-xl p-1 mb-5" style={{ background: '#F9FAFB' }}>
                    {(['register', 'login'] as const).map(t => (
                      <button key={t} onClick={() => { setTab(t); setErrors({}); }}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border-none cursor-pointer"
                        style={tab === t ? { background: '#fff', color: '#EC4899', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' } : { background: 'transparent', color: '#9CA3AF' }}>
                        {t === 'register' ? 'Register' : 'Sign In'}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {tab === 'register' && (
                <div className={step === 1 ? '-mt-2 mb-4' : 'mt-1 mb-5'}>
                  {step > 1 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: '#EC4899' }}>Step {step} of {TOTAL_STEPS}</p>
                      <p className="font-serif text-xl font-normal" style={{ color: '#1F1F1F', letterSpacing: '-0.01em' }}>{STEP_LABELS[step - 1]}</p>
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i < step ? 'linear-gradient(to right,#EC4899,#F472B6)' : '#F3F4F6' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 sm:px-7 pb-6">
              {tab === 'login' ? <LoginForm /> : (
                <>
                  <div key={stepKey} className={animClass}>
                    {step === 1 && (
                      <div className="flex flex-col gap-3.5">
                        <Field label="Email Address" type="email" placeholder="jane@example.com" value={f.email} onChange={set('email')} error={errors.email} />
                        <Field label="Password" type="password" placeholder="At least 8 characters" value={f.password} onChange={set('password')} error={errors.password} />
                        <Field label="Confirm Password" type="password" placeholder="Repeat password" value={f.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
                      </div>
                    )}

                    {step === 2 && (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="First Name" placeholder="Jane" value={f.firstName} onChange={set('firstName')} error={errors.firstName} />
                          <Field label="Last Name" placeholder="Doe" value={f.lastName} onChange={set('lastName')} error={errors.lastName} />
                        </div>
                        <Field label="Date of Birth" type="date" value={f.dob} onChange={set('dob')} error={errors.dob} />
                        <Field label="Street Address" placeholder="123 Mountain Rd" value={f.streetAddress} onChange={set('streetAddress')} error={errors.streetAddress} />
                        <div className="grid grid-cols-5 gap-2">
                          <div className="col-span-3"><Field label="City" placeholder="Sewanee" value={f.city} onChange={set('city')} error={errors.city} /></div>
                          <div className="col-span-1"><Field label="State" placeholder="TN" value={f.state} onChange={set('state')} error={errors.state} /></div>
                          <div className="col-span-1"><Field label="Zip" placeholder="37375" value={f.zip} onChange={set('zip')} error={errors.zip} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Home Phone" type="tel" placeholder="(931) 000-0000" value={f.homePhone} onChange={set('homePhone')} error={errors.homePhone} />
                          <Field label="Cell Phone" type="tel" placeholder="(931) 000-0000" value={f.cellPhone} onChange={set('cellPhone')} />
                        </div>
                        <Field label="Referred By" placeholder="How did you hear about us?" value={f.referredBy} onChange={set('referredBy')} />
                      </div>
                    )}

                    {step === 3 && (
                      <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase -mb-1" style={{ color: '#EC4899' }}>Emergency Contact</p>
                        <div className="grid grid-cols-5 gap-2">
                          <div className="col-span-3"><Field label="Full Name" placeholder="Contact name" value={f.ecName} onChange={set('ecName')} error={errors.ecName} /></div>
                          <div className="col-span-2"><Field label="Relationship" placeholder="e.g. Daughter" value={f.ecRelationship} onChange={set('ecRelationship')} error={errors.ecRelationship} /></div>
                        </div>
                        <Field label="Street Address" placeholder="123 Any Street" value={f.ecStreetAddress} onChange={set('ecStreetAddress')} />
                        <div className="grid grid-cols-5 gap-2">
                          <div className="col-span-3"><Field label="City" placeholder="City" value={f.ecCity} onChange={set('ecCity')} /></div>
                          <div className="col-span-1"><Field label="State" placeholder="TN" value={f.ecState} onChange={set('ecState')} /></div>
                          <div className="col-span-1"><Field label="Zip" placeholder="00000" value={f.ecZip} onChange={set('ecZip')} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Home Phone" type="tel" placeholder="(931) 000-0000" value={f.ecHomePhone} onChange={set('ecHomePhone')} error={errors.ecHomePhone} />
                          <Field label="Cell Phone" type="tel" placeholder="(931) 000-0000" value={f.ecCellPhone} onChange={set('ecCellPhone')} />
                        </div>
                        <Field label="Email" type="email" placeholder="contact@example.com" value={f.ecEmail} onChange={set('ecEmail')} error={errors.ecEmail} />
                      </div>
                    )}

                    {step === 4 && (
                      <div className="flex flex-col gap-4">
                        {/* Profile photo */}
                        <div className="flex flex-col items-center gap-2">
                          <button type="button" onClick={() => fileRef.current?.click()}
                            className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden cursor-pointer border-none"
                            style={{ background: profilePreview ? 'transparent' : '#FFF5F9', border: '2px dashed #F9A8D4' }}>
                            {photoConverting
                              ? <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                              : profilePreview
                                ? <img src={profilePreview} className="w-full h-full object-cover" />
                                : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                                  </svg>}
                          </button>
                          <span className="text-xs" style={{ color: photoError ? '#EF4444' : '#9CA3AF' }}>
                            {photoConverting ? 'Converting…' : photoError ? 'Could not load image' : profilePreview ? 'Tap to change' : 'Upload profile photo (optional)'}
                          </span>
                          <input ref={fileRef} type="file" accept={acceptsHeic()} className="hidden"
                            onChange={async e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setPhotoError(false);
                              setPhotoConverting(true);
                              try {
                                const url = await toPreviewUrl(file);
                                setProfilePreview(url);
                              } catch (err) {
                                console.error('[photo] conversion failed:', err);
                                setPhotoError(true);
                              } finally {
                                setPhotoConverting(false);
                              }
                            }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#9CA3AF' }}>How would you like to be contacted?</p>
                          <div className="flex gap-2 flex-wrap">
                            {['Phone', 'Mail', 'E-mail'].map(m => (
                              <button key={m} type="button" onClick={() => setContactMethods(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m])}
                                className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 border-none cursor-pointer"
                                style={contactMethods.includes(m)
                                  ? { background: 'linear-gradient(135deg,#EC4899,#F472B6)', color: '#fff', boxShadow: '0 2px 10px rgba(236,72,153,0.3)' }
                                  : { background: '#F3F4F6', color: '#6B7280' }}>
                                {m}
                              </button>
                            ))}
                          </div>
                          {errors.contactMethods && <p className="text-xs error-in mt-1.5" style={{ color: '#EF4444' }}>{errors.contactMethods}</p>}
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#9CA3AF' }}>Services you are most likely to request</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {SERVICES.map(s => (
                              <button key={s} type="button" onClick={() => setServices(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-all duration-150 border-none cursor-pointer"
                                style={services.includes(s)
                                  ? { background: '#FFF5F9', color: '#EC4899', border: '1.5px solid #F9A8D4' }
                                  : { background: '#F9FAFB', color: '#6B7280', border: '1.5px solid transparent' }}>
                                <span className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0"
                                  style={{ background: services.includes(s) ? '#EC4899' : '#E5E7EB', minWidth: 14 }}>
                                  {services.includes(s) && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                </span>
                                {s}
                              </button>
                            ))}
                          </div>
                          {services.includes('Other') && (
                            <input value={otherText} onChange={e => setOtherText(e.target.value)} placeholder="Please specify..."
                              className="mt-2 w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                              style={{ background: '#F9FAFB', border: '1.5px solid #F9A8D4', color: '#1F1F1F' }} />
                          )}
                          {errors.services && <p className="text-xs error-in mt-1.5" style={{ color: '#EF4444' }}>{errors.services}</p>}
                        </div>

                        {/* Terms of Service */}
                        <div className="flex flex-col gap-1 pt-1">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <button type="button" onClick={() => setAgreeToTerms(v => !v)}
                              className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border-none cursor-pointer transition-all duration-150"
                              style={{ background: agreeToTerms ? '#EC4899' : (errors.agreeToTerms ? '#FEE2E2' : '#F3F4F6'), minWidth: 16, border: errors.agreeToTerms ? '1.5px solid #EF4444' : 'none' }}>
                              {agreeToTerms && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            </button>
                            <span className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                              I have read and agree to the{' '}
                              <button type="button" onClick={e => { e.preventDefault(); setShowTerms(true); }}
                                className="border-none bg-transparent cursor-pointer p-0 underline transition-opacity hover:opacity-70"
                                style={{ color: '#EC4899', fontSize: 'inherit' }}>
                                Terms of Service
                              </button>
                              .
                            </span>
                          </label>
                          {errors.agreeToTerms && <p className="text-xs error-in mt-1 ml-7" style={{ color: '#EF4444' }}>{errors.agreeToTerms}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {apiError && <p className="text-xs font-medium mt-3 error-in" style={{ color: '#EF4444' }}>{apiError}</p>}
                  <div className={`flex gap-3 ${step > 1 ? 'mt-5' : 'mt-4'}`}>
                    {step > 1 && (
                      <button type="button" onClick={() => goTo(step - 1)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer hover:opacity-80 transition-all duration-200"
                        style={{ background: '#F3F4F6', color: '#6B7280' }}>
                        Back
                      </button>
                    )}
                    <button type="button" onClick={() => step < TOTAL_STEPS ? goTo(step + 1) : handleFinalSubmit()}
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide border-none cursor-pointer transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg,#EC4899 0%,#F472B6 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(236,72,153,0.35)' }}>
                      {step < TOTAL_STEPS ? 'Next' : submitting ? 'Submitting…' : 'Create Account'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button onClick={() => setShowServices(true)} className="flex items-center gap-1 text-xs bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70" style={{ color: 'rgba(249,168,212,0.85)' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5.5v.5"/></svg>
              View services &amp; programs
            </button>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Questions?{' '}
              <a href="mailto:info@folksathome.org" className="underline" style={{ color: 'rgba(249,168,212,0.75)' }}>info@folksathome.org</a>
            </p>
          </div>
        </div>
        )}
      </div>
      {showServices && <ServicesModal onClose={() => setShowServices(false)} />}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(email.trim(), password, 'member');
      navigate('/dashboard/member', { replace: true });
    } catch (e: unknown) {
      setErrors({ password: e instanceof Error ? e.message : 'Invalid email or password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Field label="Email Address" type="email" placeholder="jane@example.com" value={email} onChange={setEmail} error={errors.email} />
      <Field label="Password" type="password" placeholder="Your password" value={password} onChange={setPassword} error={errors.password} />
      <div className="flex justify-end -mt-1">
        <button type="button" className="text-xs underline bg-transparent border-none cursor-pointer" style={{ color: '#EC4899' }}>Forgot password?</button>
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 hover:opacity-90 border-none cursor-pointer mt-1 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg,#EC4899 0%,#F472B6 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(236,72,153,0.35)' }}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

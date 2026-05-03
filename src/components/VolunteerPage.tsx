import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/FolksAtHomeLogo.png';
import { toPreviewUrl, acceptsHeic, toDataUrl } from '../utils/imageConvert';
import ServicesModal from './ServicesModal';
import BackgroundVideo from './BackgroundVideo';
import TermsModal from './TermsModal';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['Morning', 'Afternoon', 'Evening'];
const TIME_LABELS = ['6am – 12pm', '12pm – 6pm', '6pm – 10pm'];
const FREQUENCY = ['Weekly', 'Bi-weekly', 'Monthly', 'As needed'];

const SKILLS = [
  'Driving & Transportation',
  'Friendly Visits',
  'Meal Delivery',
  'Lawn & Garden',
  'Home Maintenance',
  'Tech Support',
  'Housekeeping',
  'Errand Running',
  'Pet Care',
  'Home Safety Check',
  'Financial Guidance',
  'Personal Care Assist',
];

const TOTAL_STEPS = 5;
const STEP_LABELS = ['Account', 'About You', 'Availability', 'Skills', 'Commitment'];

type Errors = Partial<Record<string, string>>;

// ── shared input ──────────────────────────────────────────────────────────────
function Field({
  label, type = 'text', placeholder, value, onChange, error, textarea,
}: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
  error?: string; textarea?: boolean;
}) {
  const borderColor = error ? '#EF4444' : '#F3F4F6';
  const labelColor = error ? '#EF4444' : '#9CA3AF';
  const base = { background: '#F9FAFB', border: `1.5px solid ${borderColor}`, color: '#1F1F1F', transition: 'border-color 0.2s, background 0.2s' };
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = error ? '#EF4444' : '#F9A8D4';
    e.currentTarget.style.background = '#FFF5F9';
  };
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = error ? '#EF4444' : '#F3F4F6';
    e.currentTarget.style.background = '#F9FAFB';
  };
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: labelColor }}>{label}</label>
      {textarea ? (
        <textarea rows={3} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          onFocus={focus} onBlur={blur}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
          style={{ ...base }} />
      ) : (
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          onFocus={focus} onBlur={blur}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
          style={{ ...base }} />
      )}
      {error && <span className="error-in text-[10px] font-medium" style={{ color: '#EF4444' }}>{error}</span>}
    </div>
  );
}

// ── step 1: account ───────────────────────────────────────────────────────────
function StepAccount({
  f, set, errors,
}: {
  f: any; set: (k: string) => (v: string) => void; errors: Errors;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" placeholder="Jane" value={f.firstName} onChange={set('firstName')} error={errors.firstName} />
        <Field label="Last Name" placeholder="Doe" value={f.lastName} onChange={set('lastName')} error={errors.lastName} />
      </div>
      <Field label="Email Address" type="email" placeholder="jane@example.com" value={f.email} onChange={set('email')} error={errors.email} />
      <Field label="Password" type="password" placeholder="Create a password" value={f.password} onChange={set('password')} error={errors.password} />
      <Field label="Confirm Password" type="password" placeholder="Repeat password" value={f.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
    </div>
  );
}

// ── step 2: about you ─────────────────────────────────────────────────────────
function StepAbout({ f, set, errors }: { f: any; set: (k: string) => (v: string) => void; errors: Errors }) {
  return (
    <div className="flex flex-col gap-3.5">
      <Field label="Date of Birth" type="date" value={f.dob} onChange={set('dob')} error={errors.dob} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Home Phone" type="tel" placeholder="(931) 000-0000" value={f.homePhone} onChange={set('homePhone')} error={errors.homePhone} />
        <Field label="Cell Phone" type="tel" placeholder="(931) 000-0000" value={f.cellPhone} onChange={set('cellPhone')} error={errors.cellPhone} />
      </div>
      <Field label="Street Address" placeholder="123 Mountain Rd" value={f.streetAddress} onChange={set('streetAddress')} error={errors.streetAddress} />
      <div className="grid grid-cols-5 gap-2">
        <div className="col-span-3"><Field label="City" placeholder="Sewanee" value={f.city} onChange={set('city')} error={errors.city} /></div>
        <div className="col-span-1"><Field label="State" placeholder="TN" value={f.state} onChange={set('state')} error={errors.state} /></div>
        <div className="col-span-1"><Field label="Zip" placeholder="37375" value={f.zip} onChange={set('zip')} error={errors.zip} /></div>
      </div>
      <Field label="Tell us a little about yourself" placeholder="What motivates you to volunteer? Any background worth sharing?" value={f.bio} onChange={set('bio')} textarea />
      <Field label="Referred By" placeholder="How did you hear about us?" value={f.referredBy} onChange={set('referredBy')} />
    </div>
  );
}

// ── step 3: availability ──────────────────────────────────────────────────────
function StepAvailability({
  availability, setAvailability, frequency, setFrequency, startDate, setStartDate, errors,
}: {
  availability: Set<string>; setAvailability: React.Dispatch<React.SetStateAction<Set<string>>>;
  frequency: string; setFrequency: (v: string) => void;
  startDate: string; setStartDate: (v: string) => void;
  errors: Errors;
}) {
  const toggle = (key: string) => setAvailability(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-3"
          style={{ color: errors.availability ? '#EF4444' : '#9CA3AF' }}>When are you free?</p>
        <div className="overflow-x-auto">
          <table className="w-full text-center" style={{ minWidth: 280 }}>
            <thead>
              <tr>
                <th className="pb-2 text-[10px]" style={{ color: '#D1D5DB', width: 72 }} />
                {DAYS.map(d => (
                  <th key={d} className="pb-2 text-[10px] font-semibold" style={{ color: '#6B7280' }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMES.map((t, ti) => (
                <tr key={t}>
                  <td className="pr-2 text-[10px] font-medium text-right py-1" style={{ color: '#9CA3AF', lineHeight: '1.2' }}>
                    <div>{t}</div>
                    <div style={{ color: '#D1D5DB', fontSize: 9 }}>{TIME_LABELS[ti]}</div>
                  </td>
                  {DAYS.map(d => {
                    const key = `${d}-${t}`;
                    const on = availability.has(key);
                    return (
                      <td key={d} className="py-1 px-0.5">
                        <button type="button" onClick={() => toggle(key)}
                          className="w-7 h-7 rounded-lg mx-auto flex items-center justify-center transition-all duration-150 border-none cursor-pointer"
                          style={on
                            ? { background: 'linear-gradient(135deg,#EC4899,#F472B6)', boxShadow: '0 2px 8px rgba(236,72,153,0.35)' }
                            : { background: '#F3F4F6' }}>
                          {on && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {errors.availability && <p className="error-in text-[10px] font-medium mt-1.5" style={{ color: '#EF4444' }}>{errors.availability}</p>}
      </div>

      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-2.5"
          style={{ color: errors.frequency ? '#EF4444' : '#9CA3AF' }}>How often can you volunteer?</p>
        <div className="flex flex-wrap gap-2">
          {FREQUENCY.map(fr => (
            <button key={fr} type="button" onClick={() => setFrequency(fr)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 border-none cursor-pointer"
              style={frequency === fr
                ? { background: 'linear-gradient(135deg,#EC4899,#F472B6)', color: '#fff', boxShadow: '0 2px 10px rgba(236,72,153,0.3)' }
                : { background: '#F3F4F6', color: '#6B7280' }}>
              {fr}
            </button>
          ))}
        </div>
        {errors.frequency && <p className="error-in text-[10px] font-medium mt-1.5" style={{ color: '#EF4444' }}>{errors.frequency}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#9CA3AF' }}>Earliest start date</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
          style={{ background: '#F9FAFB', border: '1.5px solid #F3F4F6', color: '#1F1F1F' }}
          onFocus={e => { e.currentTarget.style.borderColor = '#F9A8D4'; e.currentTarget.style.background = '#FFF5F9'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#F3F4F6'; e.currentTarget.style.background = '#F9FAFB'; }} />
      </div>
    </div>
  );
}

// ── step 4: skills ────────────────────────────────────────────────────────────
function StepSkills({
  skills, setSkills, errors,
}: {
  skills: string[]; setSkills: React.Dispatch<React.SetStateAction<string[]>>; errors: Errors;
}) {
  const toggle = (s: string) => setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
        Select everything you're comfortable helping with. No experience required — just a willing heart.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {SKILLS.map(s => {
          const on = skills.includes(s);
          return (
            <button key={s} type="button" onClick={() => toggle(s)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-left transition-all duration-150 border-none cursor-pointer"
              style={on
                ? { background: '#FFF5F9', border: '1.5px solid #F9A8D4', color: '#EC4899' }
                : { background: '#F9FAFB', border: '1.5px solid transparent', color: '#6B7280' }}>
              <span className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 transition-all duration-150"
                style={{ background: on ? '#EC4899' : '#E5E7EB', minWidth: 14 }}>
                {on && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </span>
              <span className="font-medium leading-snug">{s}</span>
            </button>
          );
        })}
      </div>
      {errors.skills && <p className="error-in text-[10px] font-medium" style={{ color: '#EF4444' }}>{errors.skills}</p>}
      {skills.length > 0 && !errors.skills && (
        <p className="text-xs text-center" style={{ color: '#EC4899' }}>
          {skills.length} skill{skills.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}

// ── step 5: commitment ────────────────────────────────────────────────────────
function StepCommitment({
  f, set, errors,
  hasLicense, setHasLicense, hasTransport, setHasTransport,
  bgCheck, setBgCheck, terms, setTerms, onViewTerms,
  preview, setPreview, converting, setConverting, photoError, setPhotoError, fileRef,
}: {
  f: any; set: (k: string) => (v: string) => void; errors: Errors;
  hasLicense: boolean | null; setHasLicense: (v: boolean) => void;
  hasTransport: boolean | null; setHasTransport: (v: boolean) => void;
  bgCheck: boolean; setBgCheck: (v: boolean) => void;
  terms: boolean; setTerms: (v: boolean) => void; onViewTerms: () => void;
  preview: string | null; setPreview: (v: string | null) => void;
  converting: boolean; setConverting: (v: boolean) => void;
  photoError: boolean; setPhotoError: (v: boolean) => void;
  fileRef: React.RefObject<HTMLInputElement>;
}) {
  const YesNo = ({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) => (
    <div className="flex gap-2">
      {[true, false].map(v => (
        <button key={String(v)} type="button" onClick={() => onChange(v)}
          className="px-5 py-2 rounded-full text-xs font-semibold border-none cursor-pointer transition-all duration-150"
          style={value === v
            ? { background: 'linear-gradient(135deg,#EC4899,#F472B6)', color: '#fff', boxShadow: '0 2px 10px rgba(236,72,153,0.3)' }
            : { background: '#F3F4F6', color: '#6B7280' }}>
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Profile photo */}
      <div className="flex flex-col items-center gap-2">
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden cursor-pointer border-none"
          style={{ background: preview ? 'transparent' : '#FFF5F9', border: '2px dashed #F9A8D4' }}>
          {converting
            ? <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            : preview
              ? <img src={preview} className="w-full h-full object-cover" />
              : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>}
        </button>
        <span className="text-xs" style={{ color: photoError ? '#EF4444' : '#9CA3AF' }}>
          {converting ? 'Converting…' : photoError ? 'Could not load image' : preview ? 'Tap to change' : 'Upload profile photo (optional)'}
        </span>
        <input ref={fileRef} type="file" accept={acceptsHeic()} className="hidden"
          onChange={async e => {
            const file = e.target.files?.[0];
            if (!file) return;
            setPhotoError(false);
            setConverting(true);
            try {
              const url = await toPreviewUrl(file);
              setPreview(url);
            } catch (err) {
              console.error('[photo] conversion failed:', err);
              setPhotoError(true);
            } finally {
              setConverting(false);
            }
          }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Emergency Contact" placeholder="Full name" value={f.ecName} onChange={set('ecName')} error={errors.ecName} />
        <Field label="Their Phone" type="tel" placeholder="(931) 000-0000" value={f.ecPhone} onChange={set('ecPhone')} error={errors.ecPhone} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#9CA3AF' }}>Valid driver's license?</label>
        <YesNo value={hasLicense} onChange={setHasLicense} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#9CA3AF' }}>Reliable transportation?</label>
        <YesNo value={hasTransport} onChange={setHasTransport} />
      </div>

      <Field label="Why do you want to volunteer?" placeholder="Share what brought you here..." value={f.whyVolunteer} onChange={set('whyVolunteer')} error={errors.whyVolunteer} textarea />

      <div className="flex flex-col gap-2.5 pt-1">
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <button type="button" onClick={() => setBgCheck(!bgCheck)}
              className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border-none cursor-pointer transition-all duration-150"
              style={{ background: bgCheck ? '#EC4899' : (errors.bgCheck ? '#FEE2E2' : '#F3F4F6'), minWidth: 16, border: errors.bgCheck ? '1.5px solid #EF4444' : 'none' }}>
              {bgCheck && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
            <span className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>I consent to a background check as part of the volunteer process.</span>
          </label>
          {errors.bgCheck && <p className="error-in text-[10px] font-medium ml-7" style={{ color: '#EF4444' }}>{errors.bgCheck}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <button type="button" onClick={() => setTerms(!terms)}
              className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border-none cursor-pointer transition-all duration-150"
              style={{ background: terms ? '#EC4899' : (errors.terms ? '#FEE2E2' : '#F3F4F6'), minWidth: 16, border: errors.terms ? '1.5px solid #EF4444' : 'none' }}>
              {terms && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
            <span className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
              I have read and agree to the{' '}
              <button type="button" onClick={e => { e.preventDefault(); onViewTerms(); }}
                className="border-none bg-transparent cursor-pointer p-0 underline transition-opacity hover:opacity-70"
                style={{ color: '#EC4899', fontSize: 'inherit' }}>
                Terms of Service
              </button>
              .
            </span>
          </label>
          {errors.terms && <p className="error-in text-[10px] font-medium ml-7" style={{ color: '#EF4444' }}>{errors.terms}</p>}
        </div>
      </div>
    </div>
  );
}

// ── volunteer welcome screen (post-registration) ──────────────────────────────
function VolunteerWelcome({ firstName, onGo }: { firstName: string; onGo: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 2200;
    let raf: number;
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 400, textAlign: 'center', padding: '0 16px' }}>
      {/* Ring + checkmark */}
      <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 28px' }}>
        <svg width="88" height="88" viewBox="0 0 88 88" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
          <circle cx="44" cy="44" r="40" fill="none" stroke="url(#pg)" strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress)}`}
            strokeLinecap="round"/>
          <defs>
            <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EC4899"/>
              <stop offset="100%" stopColor="#F472B6"/>
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#F9A8D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 16l6.5 6.5L26 10"/>
          </svg>
        </div>
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#EC4899', marginBottom: 10 }}>
        You're in
      </p>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 14 }}>
        Welcome to the team{firstName ? `, ${firstName}` : ''}.
      </h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 300, margin: '0 auto 32px' }}>
        Your account is ready. Heading to your dashboard now.
      </p>

      <button onClick={onGo}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 20,
          fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.18)',
          cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
        Go to Dashboard
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8h10M9 4l4 4-4 4"/>
        </svg>
      </button>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function VolunteerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerVolunteer } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [tab, setTab] = useState<'register' | 'login'>(
    (location.state as { tab?: 'register' | 'login' } | null)?.tab ?? 'register'
  );
  const [step, setStep] = useState(1);
  const [animClass, setAnimClass] = useState('step-enter-forward');
  const [stepKey, setStepKey] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [showServices, setShowServices] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [f, setF] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    dob: '', homePhone: '', cellPhone: '', streetAddress: '', city: '', state: '', zip: '',
    bio: '', referredBy: '',
    ecName: '', ecPhone: '', whyVolunteer: '',
  });
  const set = (k: keyof typeof f) => (v: string) => setF(prev => ({ ...prev, [k]: v }));

  const [availability, setAvailability] = useState<Set<string>>(new Set());
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [hasLicense, setHasLicense] = useState<boolean | null>(null);
  const [hasTransport, setHasTransport] = useState<boolean | null>(null);
  const [bgCheck, setBgCheck] = useState(false);
  const [terms, setTerms] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoConverting, setPhotoConverting] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((s: number): Errors => {
    const e: Errors = {};
    if (s === 1) {
      if (!f.firstName.trim()) e.firstName = 'First name is required';
      if (!f.lastName.trim()) e.lastName = 'Last name is required';
      if (!f.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email';
      if (!f.password) e.password = 'Password is required';
      else if (f.password.length < 8) e.password = 'At least 8 characters';
      if (!f.confirmPassword) e.confirmPassword = 'Please confirm your password';
      else if (f.confirmPassword !== f.password) e.confirmPassword = 'Passwords do not match';
    }
    if (s === 2) {
      if (!f.dob) e.dob = 'Date of birth is required';
      if (!f.homePhone.trim() && !f.cellPhone.trim()) e.homePhone = 'At least one phone number is required';
      if (!f.streetAddress.trim()) e.streetAddress = 'Street address is required';
      if (!f.city.trim()) e.city = 'City is required';
      if (!f.state.trim()) e.state = 'Required';
      else if (f.state.length !== 2) e.state = '2-letter code';
      if (!f.zip.trim()) e.zip = 'Required';
      else if (!/^\d{5}$/.test(f.zip)) e.zip = '5 digits';
    }
    if (s === 3) {
      if (availability.size === 0) e.availability = 'Select at least one time slot';
      if (!frequency) e.frequency = 'Select a frequency';
    }
    if (s === 4) {
      if (skills.length === 0) e.skills = 'Select at least one skill';
    }
    if (s === 5) {
      if (!f.ecName.trim()) e.ecName = 'Emergency contact name is required';
      if (!f.ecPhone.trim()) e.ecPhone = 'Emergency contact phone is required';
      if (!f.whyVolunteer.trim()) e.whyVolunteer = 'Please tell us why you want to volunteer';
      if (!bgCheck) e.bgCheck = 'You must consent to a background check';
      if (!terms) e.terms = 'You must agree to the terms';
    }
    return e;
  }, [f, availability, frequency, skills, bgCheck, terms]);

  const goTo = useCallback((next: number) => {
    if (next > step) {
      const e = validate(step);
      if (Object.keys(e).length > 0) { setErrors(e); return; }
    }
    setErrors({});
    setAnimClass(next > step ? 'step-enter-forward' : 'step-enter-back');
    setStep(next);
    setStepKey(k => k + 1);
  }, [step, validate]);

  const handleFinalSubmit = useCallback(async () => {
    const errs = validate(TOTAL_STEPS);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setSubmitting(true);
    let avatarDataUrl: string | undefined;
    if (preview) {
      try { avatarDataUrl = await toDataUrl(preview); } catch { /* skip */ }
    }
    try {
      await registerVolunteer({
        firstName: f.firstName, lastName: f.lastName,
        email: f.email, password: f.password,
        dob: f.dob || undefined,
        homePhone: f.homePhone || undefined, cellPhone: f.cellPhone || undefined,
        streetAddress: f.streetAddress || undefined,
        city: f.city || undefined, state: f.state || undefined, zip: f.zip || undefined,
        bio: f.bio || undefined, whyVolunteer: f.whyVolunteer || undefined,
        ecName: f.ecName || undefined, ecPhone: f.ecPhone || undefined,
        hasLicense: hasLicense ?? false, hasTransport: hasTransport ?? false,
        bgCheck, frequency: frequency || undefined,
        startDate: startDate || undefined,
        availability: [...availability], skills,
        avatarData: avatarDataUrl,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [validate, registerVolunteer, f, hasLicense, hasTransport, bgCheck, frequency, startDate, availability, skills, preview]);

  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(() => navigate('/dashboard/volunteer'), 2200);
    return () => clearTimeout(t);
  }, [submitted, navigate]);

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
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8l4-4" /></svg>
            Back
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        {submitted ? (
          <VolunteerWelcome firstName={f.firstName} onGo={() => navigate('/dashboard/volunteer')} />
        ) : (
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 24px 80px rgba(236,72,153,0.18),0 8px 32px rgba(0,0,0,0.12)' }}>
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right,#F9A8D4,#EC4899,#F9A8D4)' }} />

            <div className="px-6 sm:px-7 pt-6 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(249,168,212,0.2) 0%,transparent 70%)' }} />

              {step === 1 && (
                <>
                  <p className="text-xs font-medium tracking-[0.2em] uppercase mb-1" style={{ color: '#EC4899' }}>Volunteers</p>
                  <h1 className="font-serif text-2xl sm:text-3xl font-normal mb-4" style={{ letterSpacing: '-0.02em', color: '#1F1F1F' }}>
                    {tab === 'login' ? 'Welcome back.' : 'Join our team.'}
                  </h1>
                  <div className="flex rounded-xl p-1 mb-5" style={{ background: '#F9FAFB' }}>
                    {(['register', 'login'] as const).map(t => (
                      <button key={t} onClick={() => { setTab(t); setStep(1); setStepKey(k => k + 1); setErrors({}); }}
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
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: '#EC4899' }}>Step {step} of {TOTAL_STEPS}</p>
                        <p className="font-serif text-xl font-normal" style={{ color: '#1F1F1F', letterSpacing: '-0.01em' }}>{STEP_LABELS[step - 1]}</p>
                      </div>
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
              {tab === 'login' ? (
                <LoginForm />
              ) : (
                <>
                  <div key={stepKey} className={animClass}>
                    {step === 1 && <StepAccount f={f} set={set} errors={errors} />}
                    {step === 2 && <StepAbout f={f} set={set} errors={errors} />}
                    {step === 3 && <StepAvailability availability={availability} setAvailability={setAvailability} frequency={frequency} setFrequency={setFrequency} startDate={startDate} setStartDate={setStartDate} errors={errors} />}
                    {step === 4 && <StepSkills skills={skills} setSkills={setSkills} errors={errors} />}
                    {step === 5 && <StepCommitment f={f} set={set} errors={errors} hasLicense={hasLicense} setHasLicense={setHasLicense} hasTransport={hasTransport} setHasTransport={setHasTransport} bgCheck={bgCheck} setBgCheck={setBgCheck} terms={terms} setTerms={setTerms} onViewTerms={() => setShowTerms(true)} preview={preview} setPreview={setPreview} converting={photoConverting} setConverting={setPhotoConverting} photoError={photoError} setPhotoError={setPhotoError} fileRef={fileRef} />}
                  </div>
                  {apiError && <p className="error-in text-xs font-medium mt-3" style={{ color: '#EF4444' }}>{apiError}</p>}
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
                      {step < TOTAL_STEPS ? 'Next' : submitting ? 'Creating account…' : 'Submit Application'}
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Errors = {};
    if (!email.trim()) err.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = 'Enter a valid email';
    if (!password) err.password = 'Password is required';
    if (Object.keys(err).length > 0) { setErrors(err); return; }

    setLoading(true);
    try {
      await login(email.trim(), password, 'volunteer');
      navigate('/dashboard/volunteer', { replace: true });
    } catch (e: unknown) {
      setErrors({ password: e instanceof Error ? e.message : 'Invalid email or password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
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

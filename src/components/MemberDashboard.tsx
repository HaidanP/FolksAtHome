import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { TaskCategory } from '../api/tasks';
import { usePoll } from '../hooks/usePoll';
import {
  fetchMemberTasks, fetchMemberHistory,
  createTask, cancelTask, confirmRequest, declineRequest,
} from '../api/tasks';
import type { ApiMemberTask, ApiVolRequest, ApiHistoryEntry, TaskFormData } from '../api/tasks';
import logo from '../assets/FolksAtHomeLogo.png';
import BackgroundVideo from './BackgroundVideo';

// ── asset globs ───────────────────────────────────────────────────────────────
const memberImgs    = import.meta.glob('../assets/Members/*.png',    { eager: true, query: '?url', import: 'default' });
const volunteerImgs = import.meta.glob('../assets/Volunteers/*.png', { eager: true, query: '?url', import: 'default' });
const memberImg = (f: string | null) => {
  if (!f) return null;
  if (f.startsWith('/api/') || f.startsWith('http')) return f;
  return (memberImgs[`../assets/Members/${f}`] as string) ?? null;
};
const volImg = (f: string | null) => {
  if (!f) return null;
  if (f.startsWith('/api/') || f.startsWith('http')) return f;
  return (volunteerImgs[`../assets/Volunteers/${f}`] as string) ?? null;
};

// ── constants ─────────────────────────────────────────────────────────────────
const CAT_COLORS: Record<TaskCategory, { bg: string; text: string }> = {
  'Transportation':  { bg: '#EFF6FF', text: '#3B82F6' },
  'Errands':         { bg: '#FEF3C7', text: '#D97706' },
  'Friendly Visit':  { bg: '#F0FDF4', text: '#16A34A' },
  'Tech Support':    { bg: '#F5F3FF', text: '#7C3AED' },
  'Home Task':       { bg: '#FFF1F2', text: '#E11D48' },
  'Glass Recycling': { bg: '#ECFEFF', text: '#0891B2' },
  'Phone Check-In':  { bg: '#FFF7ED', text: '#C2410C' },
};

const ALL_CATEGORIES: TaskCategory[] = [
  'Transportation', 'Errands', 'Friendly Visit', 'Tech Support',
  'Home Task', 'Glass Recycling', 'Phone Check-In',
];

const DURATIONS = [
  { label: '30 min', value: 0.5 }, { label: '1 hour', value: 1 },
  { label: '1.5 hrs', value: 1.5 }, { label: '2 hours', value: 2 },
  { label: '3 hours', value: 3 }, { label: 'Half day', value: 4 },
];

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtShort = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
function fmtScheduled(date: string, time: string) {
  const d = new Date(`${date}T${time}`);
  const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${day} · ${h12}${m ? `:${String(m).padStart(2,'0')}` : ''}${ampm}`;
}
function fmtDur(h: number) {
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h === Math.floor(h)) return `${h}h`;
  return `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`;
}
function greet() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

// ── category icon ─────────────────────────────────────────────────────────────
function CategoryIcon({ cat, size = 18 }: { cat: TaskCategory; size?: number }) {
  const s = { width: size, height: size, flexShrink: 0 as const };
  const stroke = CAT_COLORS[cat].text;
  const sw = '1.6';
  if (cat === 'Transportation') return (
    <svg {...s} viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="16" height="9" rx="2"/>
      <path d="M5 7V5a5 5 0 0 1 10 0v2"/>
      <circle cx="6" cy="16" r="1.5" fill={stroke} stroke="none"/>
      <circle cx="14" cy="16" r="1.5" fill={stroke} stroke="none"/>
    </svg>
  );
  if (cat === 'Errands') return (
    <svg {...s} viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h2l2.5 8h7l2-5H7"/>
      <circle cx="8.5" cy="16" r="1.2" fill={stroke} stroke="none"/>
      <circle cx="15" cy="16" r="1.2" fill={stroke} stroke="none"/>
    </svg>
  );
  if (cat === 'Friendly Visit') return (
    <svg {...s} viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 17s-7-4.5-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 17 8c0 4.5-7 9-7 9z"/>
    </svg>
  );
  if (cat === 'Tech Support') return (
    <svg {...s} viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="11" rx="2"/>
      <path d="M7 18h6M10 15v3"/>
    </svg>
  );
  if (cat === 'Home Task') return (
    <svg {...s} viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>
      <rect x="7.5" y="11" width="5" height="7" rx="1"/>
    </svg>
  );
  if (cat === 'Glass Recycling') return (
    <svg {...s} viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3l3 5H7l3-5z"/>
      <path d="M7 8l-4 7h14l-4-7"/>
      <path d="M8 15v2M12 15v2"/>
    </svg>
  );
  return (
    <svg {...s} viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3h4l1.5 4-2 1.5a11 11 0 0 0 4 4l1.5-2L17 12v4a1 1 0 0 1-1 1A14 14 0 0 1 3 4a1 1 0 0 1 1-1z"/>
    </svg>
  );
}

// ── create task modal ─────────────────────────────────────────────────────────
function CreateModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
}) {
  const [cat, setCat]     = useState<TaskCategory | ''>('');
  const [desc, setDesc]   = useState('');
  const [date, setDate]   = useState('');
  const [time, setTime]   = useState('');
  const [dur, setDur]     = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!cat)         e.cat  = 'Please choose a category';
    if (!desc.trim()) e.desc = 'Please describe what you need';
    if (!date)        e.date = 'Please pick a date';
    if (!time)        e.time = 'Please pick a time';
    if (!dur)         e.dur  = 'Please estimate how long';
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({
      category: cat as TaskCategory,
      description: desc.trim(),
      scheduledDate: date,
      scheduledTime: time,
      durationHours: dur!,
      notes: notes.trim(),
    });
    onClose();
  };

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: 13,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    background: err ? '#FFF5F5' : '#F9FAFB',
    border: `1.5px solid ${err ? '#FCA5A5' : '#F3F4F6'}`,
    color: '#1A1A1A',
  });

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(10,8,5,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 540,
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>

        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#EC4899', marginBottom: 3 }}>New Request</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0, letterSpacing: '-0.01em' }}>What do you need help with?</h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: errors.cat ? '#EF4444' : '#9CA3AF', marginBottom: 10 }}>Category</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {ALL_CATEGORIES.map(c => {
                const col = CAT_COLORS[c];
                const on = cat === c;
                return (
                  <button key={c} onClick={() => { setCat(c); setErrors(p => ({ ...p, cat: '' })); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                      borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                      background: on ? col.bg : '#FAFAFA',
                      border: `2px solid ${on ? col.text : 'transparent'}`,
                      outline: on ? `1px solid ${col.text}20` : 'none', outlineOffset: 2,
                    }}>
                    <CategoryIcon cat={c} size={17} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: on ? col.text : '#4B5563', lineHeight: 1.2 }}>{c}</span>
                  </button>
                );
              })}
            </div>
            {errors.cat && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6 }}>{errors.cat}</p>}
          </div>

          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: errors.desc ? '#EF4444' : '#9CA3AF', marginBottom: 8 }}>Tell us what you need</p>
            <textarea
              rows={3} placeholder="e.g. Ride to my cardiologist appointment in Winchester at 9:30am"
              value={desc} onChange={e => { setDesc(e.target.value); setErrors(p => ({ ...p, desc: '' })); }}
              style={{ ...inputStyle(errors.desc), resize: 'none' }} />
            {errors.desc && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.desc}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: errors.date ? '#EF4444' : '#9CA3AF', marginBottom: 8 }}>Date</p>
              <input type="date" value={date} onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })); }} style={inputStyle(errors.date)} />
              {errors.date && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.date}</p>}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: errors.time ? '#EF4444' : '#9CA3AF', marginBottom: 8 }}>Time</p>
              <input type="time" value={time} onChange={e => { setTime(e.target.value); setErrors(p => ({ ...p, time: '' })); }} style={inputStyle(errors.time)} />
              {errors.time && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.time}</p>}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: errors.dur ? '#EF4444' : '#9CA3AF', marginBottom: 8 }}>Estimated duration</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DURATIONS.map(d => (
                <button key={d.value} onClick={() => { setDur(d.value); setErrors(p => ({ ...p, dur: '' })); }}
                  style={{ padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    background: dur === d.value ? 'linear-gradient(135deg,#EC4899,#F472B6)' : '#F3F4F6',
                    color: dur === d.value ? '#fff' : '#6B7280',
                    boxShadow: dur === d.value ? '0 2px 10px rgba(236,72,153,0.3)' : 'none',
                  }}>
                  {d.label}
                </button>
              ))}
            </div>
            {errors.dur && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6 }}>{errors.dur}</p>}
          </div>

          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8 }}>
              Special notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </p>
            <textarea
              rows={2} placeholder="Anything the volunteer should know — entrance code, parking, pet at home…"
              value={notes} onChange={e => setNotes(e.target.value)}
              style={{ ...inputStyle(), resize: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: '11px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: '#F3F4F6', color: '#6B7280', border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={submit}
              style={{ flex: 2, padding: '11px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg,#EC4899,#F472B6)', color: '#fff',
                border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(236,72,153,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Post Request
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── volunteer bio block ───────────────────────────────────────────────────────
interface VolInfo {
  firstName: string;
  fullName: string;
  skills: string | null;
  bio: string | null;
  avatarFile: string | null;
  requestedAt?: string;
}

function VolBioBlock({ vol, size = 'lg' }: { vol: VolInfo; size?: 'sm' | 'lg' }) {
  const img = volImg(vol.avatarFile);
  const avatarSize = size === 'lg' ? 64 : 44;
  return (
    <div style={{ display: 'flex', gap: size === 'lg' ? 14 : 12, alignItems: 'flex-start' }}>
      {img
        ? <img src={img} alt={vol.fullName} style={{
            width: avatarSize, height: avatarSize, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
            border: `${size === 'lg' ? 2.5 : 2}px solid #EC4899`,
            boxShadow: '0 3px 12px rgba(236,72,153,0.2)',
          }} />
        : <div style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', background: '#FFF5F9',
            color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: size === 'lg' ? 22 : 16, flexShrink: 0 }}>
            {vol.firstName[0]}
          </div>
      }
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 2 }}>
          <span style={{ fontSize: size === 'lg' ? 15 : 13, fontWeight: 700, color: '#1A1A1A' }}>{vol.fullName}</span>
        </div>
        {vol.skills && <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 5 }}>{vol.skills}</p>}
        {vol.bio && <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.55, margin: 0 }}>{vol.bio}</p>}
        {vol.requestedAt && (
          <p style={{ fontSize: 11, color: '#B5AFA8', marginTop: 5 }}>Requested {fmtShort(vol.requestedAt)}</p>
        )}
      </div>
    </div>
  );
}

function reqToVol(req: ApiVolRequest): VolInfo {
  return {
    firstName:   req.volunteerFirstName,
    fullName:    req.volunteerFullName,
    skills:      req.volunteerSkills,
    bio:         req.volunteerBio,
    avatarFile:  req.volunteerAvatar,
    requestedAt: req.requestedAt,
  };
}

// ── approval card ─────────────────────────────────────────────────────────────
function ApprovalCard({ request, task, onApprove, onDecline }: {
  request: ApiVolRequest;
  task: ApiMemberTask;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const cat = CAT_COLORS[task.category as TaskCategory];
  return (
    <div style={{ background: '#FFFCF9', border: '1.5px solid #EAE4DC', borderRadius: 18,
      boxShadow: '0 3px 16px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

      <div style={{ padding: '18px 18px 14px' }}>
        <VolBioBlock vol={reqToVol(request)} size="lg" />
      </div>

      <div style={{ margin: '0 18px 16px', padding: '12px 14px', borderRadius: 12,
        background: '#FDF8F2', border: '1px solid #EDE6DA' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#C4BCB4', marginBottom: 6 }}>Wants to help with</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ background: cat.bg, color: cat.text, fontSize: 10, fontWeight: 700,
            padding: '2px 9px', borderRadius: 20 }}>{task.category}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{task.description}</span>
        </div>
        <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>
          {fmtScheduled(task.scheduledDate, task.scheduledTime)} · {fmtDur(task.durationHours)}
        </p>
      </div>

      <div style={{ padding: '0 18px 18px', display: 'flex', gap: 10 }}>
        <button onClick={onDecline}
          style={{ flex: 1, padding: '10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
            background: '#F3F4F6', color: '#6B7280', border: 'none', cursor: 'pointer' }}>
          Not this time
        </button>
        <button onClick={onApprove}
          style={{ flex: 2, padding: '10px', borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg,#EC4899,#F472B6)', color: '#fff',
            border: 'none', cursor: 'pointer', boxShadow: '0 3px 14px rgba(236,72,153,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 8l3.5 3.5L13 4"/>
          </svg>
          Confirm {request.volunteerFirstName}
        </button>
      </div>
    </div>
  );
}

// ── active task card ──────────────────────────────────────────────────────────
function ActiveTaskCard({ task, onApprove, onDecline, onDelete }: {
  task: ApiMemberTask;
  onApprove: (requestId: number) => void;
  onDecline: (requestId: number) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cat     = CAT_COLORS[task.category as TaskCategory];
  const pending   = task.requests.find(r => r.status === 'Pending') ?? null;
  const confirmed = task.requests.find(r => r.status === 'Confirmed') ?? null;
  const isPending   = !!pending;
  const isConfirmed = !!confirmed;

  const statusLabel = isPending ? 'Needs Review' : isConfirmed ? 'Confirmed' : 'Open';
  const statusBg    = isPending ? '#FFFBEB' : isConfirmed ? '#F0FDF4' : '#F5F3FF';
  const statusColor = isPending ? '#B45309' : isConfirmed ? '#16A34A' : '#7C3AED';

  return (
    <div
      onClick={() => setExpanded(v => !v)}
      style={{
        background: isPending ? '#FFFBF0' : '#FFFCF9',
        border: `1.5px solid ${isPending ? '#FCD34D' : '#EAE4DC'}`,
        borderLeft: `4px solid ${isPending ? '#F59E0B' : cat.text}`,
        borderRadius: 16, cursor: 'pointer', overflow: 'hidden',
        boxShadow: expanded ? '0 6px 24px rgba(0,0,0,0.09)' : '0 2px 6px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.bg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CategoryIcon cat={task.category as TaskCategory} size={19} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3, marginBottom: 4 }}>
            {task.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3px 8px' }}>
            <span style={{ background: cat.bg, color: cat.text, fontSize: 10, fontWeight: 700,
              padding: '2px 8px', borderRadius: 20 }}>{task.category}</span>
            <span style={{ fontSize: 11, color: '#6B7280' }}>
              {fmtScheduled(task.scheduledDate, task.scheduledTime)}
            </span>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>· {fmtDur(task.durationHours)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <span style={{ background: statusBg, color: statusColor, fontSize: 10, fontWeight: 700,
            padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>{statusLabel}</span>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#B5AFA8" strokeWidth="2" strokeLinecap="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M4 6l4 4 4-4"/>
          </svg>
        </div>
      </div>

      {expanded && (
        <div onClick={e => e.stopPropagation()} style={{ borderTop: '1.5px dashed #E8E2DA', padding: '14px 16px' }}>
          <p style={{ fontSize: 11, color: '#B5AFA8', marginBottom: 12 }}>Posted {fmt(task.postedDate)}</p>

          {/* Pending volunteer */}
          {isPending && pending && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 14, padding: '14px', marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#92400E', marginBottom: 10 }}>Volunteer wants to help</p>
              <VolBioBlock vol={reqToVol(pending)} size="sm" />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => onDecline(pending.requestId)}
                  style={{ flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                    background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', cursor: 'pointer' }}>
                  Decline
                </button>
                <button onClick={() => onApprove(pending.requestId)}
                  style={{ flex: 2, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                    background: 'linear-gradient(135deg,#EC4899,#F472B6)', color: '#fff',
                    border: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(236,72,153,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M3 8l3.5 3.5L13 4"/>
                  </svg>
                  Confirm {pending.volunteerFirstName}
                </button>
              </div>
            </div>
          )}

          {/* Confirmed volunteer */}
          {!isPending && confirmed && (
            <div style={{ background: '#F8FFF9', border: '1px solid #BBF7D0', borderRadius: 14, padding: '14px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#166534', marginBottom: 10 }}>Your volunteer</p>
              <VolBioBlock vol={reqToVol(confirmed)} size="sm" />
            </div>
          )}

          {/* Open, no one yet */}
          {!isPending && !confirmed && (
            <p style={{ fontSize: 12, color: '#A8A29E', fontStyle: 'italic' }}>
              Waiting for a volunteer to pick this up…
            </p>
          )}

          {/* Delete */}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #F0EBE4' }}>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: 11, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 4h10M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M6 7v5M10 7v5M4 4l.8 9a1 1 0 0 0 1 .9h4.4a1 1 0 0 0 1-.9L12 4"/>
                </svg>
                Remove request
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>Remove this request?</p>
                <button onClick={onDelete}
                  style={{ padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    background: '#FEE2E2', color: '#EF4444', border: '1px solid #FECACA', cursor: 'pointer' }}>
                  Yes, remove
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  style={{ padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    background: '#F3F4F6', color: '#6B7280', border: 'none', cursor: 'pointer' }}>
                  Keep
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── history card ──────────────────────────────────────────────────────────────
function HistoryCard({ entry }: { entry: ApiHistoryEntry }) {
  const cat = CAT_COLORS[entry.category as TaskCategory];
  const img = volImg(entry.volunteerAvatar);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
      background: '#FFFCF9', border: '1.5px solid #EAE4DC', borderRadius: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {img
        ? <img src={img} alt={entry.volunteerName} style={{ width: 46, height: 46, borderRadius: '50%',
            objectFit: 'cover', border: '2px solid #E5E7EB', flexShrink: 0 }} />
        : <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#F3F4F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            color: '#9CA3AF', flexShrink: 0 }}>{entry.volunteerName[0]}</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 3, lineHeight: 1.3 }}>
          {entry.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ background: cat.bg, color: cat.text, fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 20 }}>
            {entry.category}
          </span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>Helped by {entry.volunteerName}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: 11, color: '#B5AFA8' }}>{fmtShort(entry.completedDate)}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 3 }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 8l3.5 3.5L13 4"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A' }}>Completed</span>
        </div>
      </div>
    </div>
  );
}

// ── main dashboard ────────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]               = useState<'requests' | 'approvals' | 'history'>('requests');
  const [showCreate, setShowCreate]  = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const memberId = user!.id;

  const { data: memberTasks, refetch: refetchTasks } = usePoll(
    useCallback(() => fetchMemberTasks(memberId), [memberId])
  );
  const { data: history } = usePoll(
    useCallback(() => fetchMemberHistory(memberId), [memberId]),
    30_000,
  );

  const allTasks   = memberTasks ?? [];
  const myHistory  = history ?? [];
  const avatarSrc  = user?.avatarFile ? memberImg(user.avatarFile) : null;

  const activeCount   = allTasks.length;
  const approvalCount = allTasks.filter(t => t.requests.some(r => r.status === 'Pending')).length;
  const completedCount = myHistory.length;

  const handleApprove = async (requestId: number) => {
    setActionError(null);
    try {
      await confirmRequest(requestId);
      await refetchTasks();
      setTab('requests');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Confirm failed');
    }
  };

  const handleDecline = async (requestId: number) => {
    setActionError(null);
    try {
      await declineRequest(requestId);
      await refetchTasks();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Decline failed');
    }
  };

  const handleDelete = async (taskId: number) => {
    setActionError(null);
    try {
      await cancelTask(taskId);
      await refetchTasks();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const handleCreate = async (formData: TaskFormData) => {
    setActionError(null);
    try {
      await createTask(memberId, formData);
      await refetchTasks();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Create failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <BackgroundVideo
        src="https://replicate.delivery/xezq/Gir0RAHd87r1E18PeI8fmVU18mUAFbJKGyilv5WeTzplgu7sA/tmpdxstvhk3.mp4"
        overlay="linear-gradient(135deg, rgba(15,10,5,0.55) 0%, rgba(10,8,4,0.65) 100%)"
      />

      {/* ── Navbar ── */}
      <header style={{ background: 'rgba(15,12,8,0.82)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8,
            background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <img src={logo} alt="" style={{ height: 28, opacity: 0.9 }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
              Folks at Home
            </span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {avatarSrc
                ? <img src={avatarSrc} alt="" style={{ width: 32, height: 32, borderRadius: '50%',
                    objectFit: 'cover', border: '2px solid #EC4899' }} />
                : <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EC4899',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13 }}>
                    {user?.firstName[0]}
                  </div>
              }
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Member</p>
              </div>
            </div>
            <button onClick={() => { navigate('/', { replace: true }); logout(); }}
              style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)',
                border: 'none', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px 48px', position: 'relative', zIndex: 10 }}>

        {/* ── Welcome ── */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#EC4899', margin: 0, marginBottom: 6 }}>
            Member Dashboard
          </p>
          <h1 style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 400, color: '#fff',
            letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
            {greet()}, {user?.firstName}.
          </h1>
        </div>

        {/* ── Error banner ── */}
        {actionError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10,
            padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#DC2626' }}>{actionError}</span>
            <button onClick={() => setActionError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontWeight: 700, fontSize: 14 }}>×</button>
          </div>
        )}

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          {([
            { label: 'Active Requests',   value: activeCount,    color: '#7C3AED', tab: 'requests'  as const },
            { label: 'Needs Your Review', value: approvalCount,  color: '#B45309', tab: 'approvals' as const, pulse: approvalCount > 0 },
            { label: 'Helped This Month', value: completedCount, color: '#16A34A', tab: 'history'   as const },
          ] as const).map(s => (
            <div key={s.label} onClick={() => setTab(s.tab)}
              style={{ background: '#fff', borderRadius: 16, padding: '16px 14px', textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)', cursor: 'pointer',
                border: (s as { pulse?: boolean }).pulse ? '1.5px solid #FCD34D' : '1.5px solid transparent',
                transition: 'transform 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
              <p style={{ fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#9CA3AF', margin: 0 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {([
              { id: 'requests',  label: 'My Requests' },
              { id: 'approvals', label: `Needs Review${approvalCount > 0 ? ` (${approvalCount})` : ''}` },
              { id: 'history',   label: 'History' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={tab === t.id
                  ? { background: 'linear-gradient(135deg,#EC4899,#F472B6)', color: '#fff',
                      padding: '7px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      border: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(236,72,153,0.3)' }
                  : { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)',
                      border: '1px solid rgba(255,255,255,0.18)', padding: '7px 18px',
                      borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'requests' && (
            <button onClick={() => setShowCreate(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px',
                borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: 'rgba(255,255,255,0.95)', color: '#EC4899',
                border: 'none', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M8 2v12M2 8h12"/>
              </svg>
              Post New Request
            </button>
          )}
        </div>

        {/* ── My Requests ── */}
        {tab === 'requests' && (() => {
          if (memberTasks === null) return (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Loading…</p>
            </div>
          );

          const openTasks      = allTasks.filter(t => !t.requests.some(r => r.status === 'Confirmed') || t.requests.some(r => r.status === 'Pending'));
          const confirmedTasks = allTasks.filter(t => t.requests.some(r => r.status === 'Confirmed') && !t.requests.some(r => r.status === 'Pending'));
          const hasOpen      = openTasks.length > 0;
          const hasConfirmed = confirmedTasks.length > 0;

          const SectionLabel = ({ label, mt = false }: { label: string; mt?: boolean }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: mt ? 20 : 0, marginBottom: 6 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)', margin: 0, whiteSpace: 'nowrap' }}>{label}</p>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            </div>
          );

          if (!hasOpen && !hasConfirmed) return (
            <div style={{ textAlign: 'center', padding: '56px 0' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>No active requests</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Need a hand with something? Post a request and a volunteer will reach out.</p>
            </div>
          );

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hasOpen && (
                <>
                  <SectionLabel label="Open" />
                  {openTasks.map(task => (
                    <ActiveTaskCard
                      key={task.id} task={task}
                      onApprove={handleApprove}
                      onDecline={handleDecline}
                      onDelete={() => handleDelete(task.id)}
                    />
                  ))}
                </>
              )}
              {hasConfirmed && (
                <>
                  <SectionLabel label="Confirmed" mt={hasOpen} />
                  {confirmedTasks.map(task => (
                    <ActiveTaskCard
                      key={task.id} task={task}
                      onApprove={handleApprove}
                      onDecline={handleDecline}
                      onDelete={() => handleDelete(task.id)}
                    />
                  ))}
                </>
              )}
            </div>
          );
        })()}

        {/* ── Needs Review ── */}
        {tab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(() => {
              const tasksWithPending = allTasks.filter(t => t.requests.some(r => r.status === 'Pending'));
              if (tasksWithPending.length === 0) return (
                <div style={{ textAlign: 'center', padding: '56px 0' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>All caught up</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>No volunteer requests waiting for your review right now.</p>
                </div>
              );
              return tasksWithPending.flatMap(task =>
                task.requests
                  .filter(r => r.status === 'Pending')
                  .map(req => (
                    <ApprovalCard
                      key={`${task.id}-${req.requestId}`}
                      request={req}
                      task={task}
                      onApprove={() => handleApprove(req.requestId)}
                      onDecline={() => handleDecline(req.requestId)}
                    />
                  ))
              );
            })()}
          </div>
        )}

        {/* ── History ── */}
        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 0' }}>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>No completed tasks yet.</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Completed</p>
                {myHistory.map(entry => <HistoryCard key={entry.id} entry={entry} />)}
              </>
            )}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onSubmit={data => { handleCreate(data); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

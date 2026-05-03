import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { TaskCategory } from '../api/tasks';
import { usePoll } from '../hooks/usePoll';
import {
  fetchAllTasks, fetchVolunteerRequests,
  requestTask, cancelTaskRequest,
} from '../api/tasks';
import type { ApiTask } from '../api/tasks';
import logo from '../assets/FolksAtHomeLogo.png';
import BackgroundVideo from './BackgroundVideo';

// ── asset globs ───────────────────────────────────────────────────────────────
const volunteerImgs = import.meta.glob('../assets/Volunteers/*.png', { eager: true, query: '?url', import: 'default' });
const memberImgs    = import.meta.glob('../assets/Members/*.png',    { eager: true, query: '?url', import: 'default' });

function volImg(file: string | null): string | null {
  if (!file) return null;
  if (file.startsWith('/api/') || file.startsWith('http')) return file;
  return (volunteerImgs[`../assets/Volunteers/${file}`] as string) ?? null;
}
function memberImg(file: string | null): string | null {
  if (!file) return null;
  if (file.startsWith('/api/') || file.startsWith('http')) return file;
  return (memberImgs[`../assets/Members/${file}`] as string) ?? null;
}

// ── category colors ───────────────────────────────────────────────────────────
const CAT_COLORS: Record<TaskCategory, { bg: string; text: string }> = {
  'Transportation':  { bg: '#EFF6FF', text: '#3B82F6' },
  'Errands':         { bg: '#FEF3C7', text: '#D97706' },
  'Friendly Visit':  { bg: '#F0FDF4', text: '#16A34A' },
  'Tech Support':    { bg: '#F5F3FF', text: '#7C3AED' },
  'Home Task':       { bg: '#FFF1F2', text: '#E11D48' },
  'Glass Recycling': { bg: '#ECFEFF', text: '#0891B2' },
  'Phone Check-In':  { bg: '#FFF7ED', text: '#C2410C' },
};

// ── helpers ───────────────────────────────────────────────────────────────────
function formatPosted(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatScheduled(date: string, time: string) {
  const d = new Date(`${date}T${time}`);
  const day  = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12  = h % 12 || 12;
  const minS = m ? `:${m.toString().padStart(2, '0')}` : '';
  return `${day} · ${h12}${minS}${ampm}`;
}
function formatDuration(h: number) {
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h === Math.floor(h)) return `${h}h`;
  return `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`;
}

// ── task card ─────────────────────────────────────────────────────────────────
function TaskRow({
  task, isMyTask, isRequested, onRequest, onCancelRequest,
}: {
  task: ApiTask;
  isMyTask: boolean;
  isRequested: boolean;
  onRequest: () => void;
  onCancelRequest: () => void;
}) {
  const [expanded, setExpanded]           = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cat    = CAT_COLORS[task.category as TaskCategory];
  const imgSrc = memberImg(task.memberAvatar);
  const claimer = task.claimedByName;

  const cardBg     = isMyTask ? '#FFF5F9' : isRequested ? '#FFFBF0' : '#FFFCF9';
  const cardBorder = isMyTask ? '#F9A8D4' : isRequested ? '#FCD34D' : '#EAE4DC';

  const statusLabel = isRequested ? 'Requested' : task.status;
  const statusBg    = isRequested ? '#FFFBEB' : task.status === 'Open' ? '#F0FDF4' : '#FFF5F9';
  const statusColor = isRequested ? '#B45309' : task.status === 'Open' ? '#16A34A' : '#EC4899';

  return (
    <div
      onClick={() => { setExpanded(v => !v); setConfirmCancel(false); }}
      style={{
        background: cardBg,
        border: `1.5px solid ${cardBorder}`,
        borderLeft: `4px solid ${cat.text}`,
        borderRadius: 18,
        boxShadow: expanded ? '0 8px 32px rgba(0,0,0,0.10)' : '0 2px 6px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* ── Collapsed header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px 14px 14px' }}>

        {/* Member photo */}
        <div style={{ flexShrink: 0 }}>
          {imgSrc
            ? <img src={imgSrc} alt=""
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover',
                  border: `2.5px solid ${cat.text}`, boxShadow: '0 3px 10px rgba(0,0,0,0.13)' }} />
            : <div style={{ width: 56, height: 56, borderRadius: '50%', background: cat.bg,
                color: cat.text, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 20, border: `2px solid ${cat.text}` }}>
                {task.memberName[0]}
              </div>
          }
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3, marginBottom: 6 }}>
            {task.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 8px' }}>
            <span style={{ background: cat.bg, color: cat.text, fontSize: 10, fontWeight: 700,
              padding: '2px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
              {task.category}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6B7280' }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 1v2M11 1v2M2 6h12"/>
              </svg>
              {formatScheduled(task.scheduledDate, task.scheduledTime)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6B7280' }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="6"/><path d="M8 5v3.5l2 1.5"/>
              </svg>
              {formatDuration(task.durationHours)}
            </span>
          </div>
          {(task.memberFullName || task.memberAge || task.memberTown) && (
            <p style={{ fontSize: 11, color: '#A8A29E', marginTop: 5, fontWeight: 500 }}>
              {task.memberFullName}{task.memberAge ? `, ${task.memberAge}` : ''}{task.memberTown ? ` · ${task.memberTown}` : ''}
            </p>
          )}
        </div>

        {/* Status badge + chevron */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <span style={{ background: statusBg, color: statusColor,
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
            {statusLabel}
          </span>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#B5AFA8" strokeWidth="2" strokeLinecap="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M4 6l4 4 4-4"/>
          </svg>
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div style={{ borderTop: '1.5px dashed #E8E2DA', padding: '14px 16px 16px' }}>

          {/* Care note */}
          {task.memberBio && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.13em',
                textTransform: 'uppercase', color: '#C4BCB4', marginBottom: 6 }}>
                Care Note
              </p>
              <p style={{ fontSize: 12, color: '#6B6560', lineHeight: 1.7, margin: 0,
                paddingLeft: 10, borderLeft: `3px solid ${cat.text}` }}>
                {task.memberBio}
              </p>
            </div>
          )}

          {/* Footer row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ fontSize: 11, color: '#B5AFA8', margin: 0 }}>
              Posted {formatPosted(task.postedDate)}
            </p>

            {/* Action area */}
            {task.status === 'Claimed' ? (
              <p style={{ fontSize: 12, fontWeight: 700, color: '#EC4899', margin: 0 }}>
                Claimed{claimer ? ` · ${claimer}` : ''}
              </p>

            ) : confirmCancel ? (
              <div
                onClick={e => e.stopPropagation()}
                style={{ display: 'flex', alignItems: 'center', gap: 8,
                  background: '#FFF9EC', border: '1px solid #FCD34D',
                  borderRadius: 10, padding: '7px 12px' }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M8 6v4M8 11.5v.5"/><path d="M1.5 13L8 2l6.5 11H1.5z"/>
                </svg>
                <span style={{ fontSize: 11, color: '#92400E', fontWeight: 500 }}>
                  Cancel your request?
                </span>
                <button
                  onClick={() => { onCancelRequest(); setConfirmCancel(false); }}
                  style={{ padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                    background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Yes
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  style={{ padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                    background: '#F3F4F6', color: '#6B7280', border: 'none', cursor: 'pointer' }}>
                  Keep
                </button>
              </div>

            ) : isRequested ? (
              <button
                onClick={e => { e.stopPropagation(); setConfirmCancel(true); }}
                style={{ fontSize: 12, fontWeight: 600, color: '#B45309',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Cancel request
              </button>

            ) : (
              <button
                onClick={e => { e.stopPropagation(); onRequest(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg, #EC4899, #F472B6)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '8px 18px', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 3px 14px rgba(236,72,153,0.35)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Request to Claim
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── dashboard ─────────────────────────────────────────────────────────────────
export default function VolunteerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [filter, setFilter]     = useState<'All' | 'Open' | 'Claimed' | 'Requested'>('All');
  const [sortDate, setSortDate] = useState<'asc' | 'desc'>('asc');
  const [actionError, setActionError] = useState<string | null>(null);

  const userId = user!.id;

  const { data: tasks,      refetch: refetchTasks }    = usePoll(fetchAllTasks);
  const { data: myRequests, refetch: refetchRequests } = usePoll(
    useCallback(() => fetchVolunteerRequests(userId), [userId])
  );

  const allTasks = tasks ?? [];
  const requestedTaskIds = new Set(
    (myRequests ?? []).filter(r => r.status === 'Pending').map(r => r.taskId)
  );
  const confirmedTaskIds = new Set(
    (myRequests ?? []).filter(r => r.status === 'Confirmed').map(r => r.taskId)
  );

  const handleRequest = async (taskId: number) => {
    setActionError(null);
    try {
      await requestTask(taskId, userId);
      refetchRequests();
      refetchTasks();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Request failed');
    }
  };

  const handleCancelRequest = async (taskId: number) => {
    setActionError(null);
    try {
      await cancelTaskRequest(taskId, userId);
      refetchRequests();
      refetchTasks();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Cancel failed');
    }
  };

  const filtered = useMemo(() => {
    let list = [...allTasks];
    if (filter === 'Open')      list = list.filter(t => t.status === 'Open' && !requestedTaskIds.has(t.id));
    if (filter === 'Claimed')   list = list.filter(t => t.status === 'Claimed');
    if (filter === 'Requested') list = list.filter(t => requestedTaskIds.has(t.id));
    list.sort((a, b) => {
      const da = new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime();
      const db = new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime();
      return sortDate === 'asc' ? da - db : db - da;
    });
    return list;
  }, [allTasks, filter, sortDate, requestedTaskIds]);

  const openCount      = allTasks.filter(t => t.status === 'Open' && !requestedTaskIds.has(t.id)).length;
  const claimedCount   = allTasks.filter(t => t.status === 'Claimed').length;
  const requestedCount = requestedTaskIds.size;
  const avatarSrc      = user?.avatarFile ? volImg(user.avatarFile) : null;

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <BackgroundVideo
        src="https://replicate.delivery/xezq/Gir0RAHd87r1E18PeI8fmVU18mUAFbJKGyilv5WeTzplgu7sA/tmpdxstvhk3.mp4"
        overlay="linear-gradient(135deg, rgba(15,10,5,0.55) 0%, rgba(10,8,4,0.65) 100%)"
      />

      {/* ── Navbar ── */}
      <header style={{ background: 'rgba(15,12,8,0.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 40 }}>
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
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Volunteer</p>
              </div>
            </div>
            <button
              onClick={() => { navigate('/', { replace: true }); logout(); }}
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
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#EC4899', marginBottom: 4 }}>Volunteer Dashboard</p>
          <h1 style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 400, color: '#fff',
            letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
            Good morning, {user?.firstName}.
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total',     value: allTasks.length, color: '#1A1A1A' },
            { label: 'Open',      value: openCount,       color: '#16A34A' },
            { label: 'Claimed',   value: claimedCount,    color: '#EC4899' },
            { label: 'Requested', value: requestedCount,  color: '#B45309' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '16px 12px',
              textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#9CA3AF', margin: 0 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Filters + sort ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['All', 'Open', 'Claimed', 'Requested'] as const).map(f => (
              <button key={f} onClick={e => { e.stopPropagation(); setFilter(f); }}
                style={filter === f
                  ? { background: f === 'Requested'
                        ? 'linear-gradient(135deg,#F59E0B,#FBBF24)'
                        : 'linear-gradient(135deg,#EC4899,#F472B6)',
                      color: '#fff', padding: '6px 16px', borderRadius: 20, fontSize: 12,
                      fontWeight: 600, border: 'none', cursor: 'pointer',
                      boxShadow: f === 'Requested'
                        ? '0 2px 10px rgba(245,158,11,0.35)'
                        : '0 2px 10px rgba(236,72,153,0.3)' }
                  : { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      padding: '6px 16px', borderRadius: 20, fontSize: 12,
                      fontWeight: 600, cursor: 'pointer' }}>
                {f}{f === 'Requested' && requestedCount > 0 ? ` (${requestedCount})` : ''}
              </button>
            ))}
          </div>
          <button onClick={e => { e.stopPropagation(); setSortDate(s => s === 'asc' ? 'desc' : 'asc'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(255,255,255,0.18)', padding: '6px 14px', borderRadius: 20,
              fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d={sortDate === 'asc' ? 'M4 6l4-4 4 4M8 2v12' : 'M4 10l4 4 4-4M8 14V2'} />
            </svg>
            Date {sortDate === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* ── Task list ── */}
        {tasks === null ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Loading tasks…</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  {filter === 'Requested' ? "You haven't requested any tasks yet." : 'No tasks match this filter.'}
                </p>
              </div>
            ) : (
              filtered.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isMyTask={confirmedTaskIds.has(task.id)}
                  isRequested={requestedTaskIds.has(task.id)}
                  onRequest={() => handleRequest(task.id)}
                  onCancelRequest={() => handleCancelRequest(task.id)}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

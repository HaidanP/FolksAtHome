import { useEffect } from 'react';

const MEMBERSHIP_SERVICES = [
  'Initial interview and consultations as needed to determine needs and required services',
  'Information and referral for most anything you need',
  'Transportation to medical and other appointments — F@H staff and community volunteers collaborate to provide this service',
  'Periodic errands, grocery shopping, pick ups and delivery including pharmacy',
  'Durable Medical Equipment loans — shower/bath chairs, wheelchairs, walkers, portable ramps and other essential home safety items',
  'Phone check-ins and home visits on request',
  'Assistance with a variety of home tasks',
  'Glass Recycling pickup',
  'General Information',
  'Referrals to community recommended vendors available for hire',
  'Referrals to vetted home help agencies in the area',
  'Basic Technology Support for computers and smart devices',
  'Home safety, fall risk and emergency preparedness review',
  'Participation in F@H sponsored events, classes, activities, and excursions',
];

const VENDOR_SERVICES = [
  'Home repairs',
  'Yard Work and Landscaping',
  'Housekeeping',
  'Window Washing',
  'Pressure Washing',
  'Gutter Cleaning',
  'Painting',
  'Advanced Computer and Smart Device Support',
  'Home modification consultation and planning',
  'Access to non-medical home help',
];

const HEALTH_PROGRAMS = [
  'Walking Group — meets 3 times a week',
  'Tai Ji Quan: Moving for Better Balance',
  'SAIL (Stay Active and Independent for Life)',
  'Periodic lectures on health issues like dementia, osteoporosis, and balance',
  'Programs offered vary from year to year',
];

const SOCIAL_PROGRAMS = [
  'Telephone Reassurance Program',
  'Friendly Home Visits',
  'Book Clubs',
  'Memoir Writing',
  'Arts for Elders',
  'Ball Room Dancing',
  'Outings',
  'Pedicab Rides on the Mountain Goat Trail',
  'Programs offered vary from year to year',
];

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-2.5 mt-5 first:mt-0" style={{ color: '#EC4899' }}>{label}</p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: '#374151' }}>
          <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: '#EC4899' }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ServicesModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[88vh] rounded-2xl flex flex-col overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(236,72,153,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-7 pt-5 pb-4 flex items-start justify-between shrink-0" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-0.5" style={{ color: '#EC4899' }}>Folks at Home</p>
            <h2 className="font-serif text-xl sm:text-2xl font-normal leading-tight" style={{ color: '#1F1F1F', letterSpacing: '-0.01em' }}>
              Services &amp; Programs
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer shrink-0 transition-all duration-150 hover:scale-110"
            style={{ background: '#F3F4F6' }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-7 py-5">
          <p className="text-xs leading-relaxed mb-5 italic" style={{ color: '#6B7280' }}>
            The services listed below are included with a Folks at Home membership. Beyond these, we also offer vendor referrals
            to help members make individualized arrangements with local vendors.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            {/* Left — Services */}
            <div>
              <h3 className="font-serif text-base font-normal mb-3" style={{ color: '#1F1F1F', letterSpacing: '-0.01em' }}>Services</h3>

              <SectionHeader label="Included in Membership" />
              <BulletList items={MEMBERSHIP_SERVICES} />

              <SectionHeader label="Vendor Referral Services" />
              <BulletList items={VENDOR_SERVICES} />
            </div>

            {/* Right — Programs */}
            <div className="mt-6 sm:mt-0">
              <h3 className="font-serif text-base font-normal mb-3" style={{ color: '#1F1F1F', letterSpacing: '-0.01em' }}>Programs</h3>

              <SectionHeader label="Family Support" />
              <div className="text-xs leading-relaxed mb-3" style={{ color: '#374151' }}>
                <p className="font-semibold mb-0.5">F@H Care Partners Support Group</p>
                <p style={{ color: '#6B7280' }}>A bi-weekly support group, open to the community, for people taking care of loved ones.</p>
              </div>

              <SectionHeader label="Health Programs" />
              <BulletList items={HEALTH_PROGRAMS} />

              <SectionHeader label="Social Engagement" />
              <BulletList items={SOCIAL_PROGRAMS} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3.5 shrink-0" style={{ borderTop: '1px solid #F3F4F6' }}>
          <p className="text-[10px]" style={{ color: '#9CA3AF' }}>Questions? <a href="mailto:info@folksathome.org" className="underline" style={{ color: '#EC4899' }}>info@folksathome.org</a></p>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';

export default function TermsModal({ onClose }: { onClose: () => void }) {
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
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[88vh] rounded-2xl flex flex-col overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(236,72,153,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Pink accent bar */}
        <div style={{ height: 4, background: 'linear-gradient(to right,#F9A8D4,#EC4899,#F9A8D4)', flexShrink: 0 }} />

        {/* Header */}
        <div className="px-5 sm:px-7 pt-5 pb-4 flex items-start justify-between shrink-0" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-0.5" style={{ color: '#EC4899' }}>Folks at Home</p>
            <h2 className="font-serif text-xl sm:text-2xl font-normal leading-tight" style={{ color: '#1F1F1F', letterSpacing: '-0.01em' }}>Terms of Service</h2>
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
        <div className="overflow-y-auto flex-1 px-5 sm:px-7 py-5 text-sm" style={{ color: '#374151', lineHeight: 1.75 }}>

          <p className="text-xs mb-5" style={{ color: '#9CA3AF' }}>Effective: January 1, 2025 &nbsp;·&nbsp; Sewanee, Tennessee</p>

          <Section title="1. About This Agreement">
            These Terms of Service govern your use of the Folks at Home platform, including this website and any associated portals. By registering as a member or volunteer, you agree to these terms in full. If you do not agree, please do not complete registration.
          </Section>

          <Section title="2. Who We Are">
            Folks at Home is a 501(c)(3) nonprofit membership organization serving the Sewanee, Tennessee community. We connect community members who need assistance with volunteers who offer their time and skills. We do not employ volunteers and do not provide professional medical, legal, financial, or personal care services.
          </Section>

          <Section title="3. Volunteer Responsibilities">
            <p className="mb-2">By registering as a volunteer, you agree to:</p>
            <ul className="list-none space-y-1.5 pl-0">
              {[
                'Provide accurate personal information during registration.',
                'Consent to a background check, which may be conducted before approval.',
                'Interact with all community members with patience, respect, and dignity.',
                'Keep all personal information about members strictly confidential.',
                'Not accept payment, gifts, or compensation of any kind from members.',
                'Notify coordinators promptly if you are unable to fulfill a confirmed commitment.',
                'Not perform tasks that exceed your abilities or that require professional licensure.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs" style={{ color: '#4B5563' }}>
                  <span style={{ color: '#EC4899', flexShrink: 0, marginTop: 2 }}>
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#EC4899" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="4. Member Responsibilities">
            <p className="mb-2">By registering as a member, you agree to:</p>
            <ul className="list-none space-y-1.5 pl-0">
              {[
                'Provide accurate personal and emergency contact information.',
                'Pay any applicable annual or monthly membership fee as agreed during registration.',
                'Treat all volunteers with courtesy and respect.',
                'Give reasonable notice when canceling or rescheduling a requested service.',
                'Use the platform only for legitimate personal assistance needs.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs" style={{ color: '#4B5563' }}>
                  <span style={{ color: '#EC4899', flexShrink: 0, marginTop: 2 }}>
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#EC4899" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="5. Privacy and Data">
            We collect only the information necessary to coordinate services and maintain membership records. Your personal information is never sold to third parties. Contact details shared between members and volunteers are used solely for coordinating confirmed service requests. By registering, you consent to receiving communications from Folks at Home staff regarding your membership or volunteer status.
          </Section>

          <Section title="6. Limitation of Liability">
            Folks at Home facilitates connections between community members and volunteers but is not responsible for the actions, omissions, or conduct of any individual volunteer or member. Volunteers provide services as independent community members, not as agents or employees of the organization. To the fullest extent permitted by law, Folks at Home shall not be liable for any injury, loss, or damage arising from services arranged through this platform.
          </Section>

          <Section title="7. Code of Conduct">
            All users of this platform are expected to communicate honestly and respectfully, honor their commitments, and promptly report any concerns to organization staff. Accounts may be suspended or terminated at the discretion of Folks at Home staff if a user violates these terms or behaves in a manner inconsistent with the organization's values.
          </Section>

          <Section title="8. Changes to These Terms">
            We may update these terms from time to time. Continued use of the platform after any changes constitutes acceptance of the revised terms. We will notify registered users of material changes by email.
          </Section>

          <Section title="9. Contact">
            Questions about these terms can be directed to:
            <div className="mt-2 text-xs" style={{ color: '#6B7280' }}>
              <p>Folks at Home</p>
              <p>P.O. Box 291, Sewanee, TN 37375</p>
              <p><a href="mailto:info@folksathome.org" style={{ color: '#EC4899', textDecoration: 'none' }}>info@folksathome.org</a></p>
              <p>(931) 598-0303</p>
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3.5 shrink-0 flex items-center justify-between" style={{ borderTop: '1px solid #F3F4F6' }}>
          <p className="text-[10px]" style={{ color: '#9CA3AF' }}>
            Questions? <a href="mailto:info@folksathome.org" className="underline" style={{ color: '#EC4899' }}>info@folksathome.org</a>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border-none cursor-pointer transition-all duration-150 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#EC4899,#F472B6)', color: '#fff', boxShadow: '0 2px 10px rgba(236,72,153,0.3)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-2" style={{ color: '#9CA3AF' }}>{title}</p>
      <div className="text-xs leading-relaxed" style={{ color: '#4B5563' }}>{children}</div>
    </div>
  );
}

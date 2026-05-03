import { useState } from 'react';
import logo from '../assets/FolksAtHomeLogo.png';
import BoardModal from './BoardModal';
import TermsModal from './TermsModal';

const quickLinks = ['About', 'Services', 'Volunteer', 'Members', 'Donate'];
const funders = ['South Cumberland Community Fund', 'Sewanee Community Chest'];

export default function Footer() {
  const [showBoard, setShowBoard] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <footer style={{ background: '#1F1F1F', color: '#EAE0C4' }}>
      {showBoard && <BoardModal onClose={() => setShowBoard(false)} />}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      <div className="max-w-6xl mx-auto px-5 sm:px-6 md:px-12 pt-10 sm:pt-16 pb-8 sm:pb-10">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 pb-8 sm:pb-12" style={{ borderBottom: '1px solid rgba(234,224,196,0.12)' }}>

          {/* Column 1 — identity + contact */}
          <div>
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <img src={logo} alt="Folks at Home" className="h-7 sm:h-8 w-auto opacity-90" />
              <span className="text-lg sm:text-xl font-semibold tracking-tight" style={{ color: '#EAE0C4' }}>
                Folks at Home
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4" style={{ color: 'rgba(234,224,196,0.6)' }}>
              A nonprofit membership organization serving the Sewanee community.
            </p>
            <ul className="space-y-1.5 text-xs sm:text-sm" style={{ color: 'rgba(234,224,196,0.7)' }}>
              <li>P.O. Box 291, Sewanee, TN 37375</li>
              <li>
                <a href="tel:9315980303" className="hover:opacity-100 transition-opacity" style={{ color: 'rgba(234,224,196,0.7)' }}>
                  (931) 598-0303
                </a>
              </li>
              <li>
                <a href="mailto:info@folksathome.org" className="hover:opacity-100 transition-opacity" style={{ color: 'rgba(234,224,196,0.7)' }}>
                  info@folksathome.org
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 — quick links */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.18em] uppercase mb-4 sm:mb-5" style={{ color: 'rgba(234,224,196,0.45)' }}>
              Quick Links
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-xs sm:text-sm transition-opacity hover:opacity-100"
                    style={{ color: 'rgba(234,224,196,0.7)' }}
                  >
                    {link}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setShowBoard(true)}
                  className="text-xs sm:text-sm transition-opacity hover:opacity-100 bg-transparent border-none cursor-pointer p-0 text-left"
                  style={{ color: 'rgba(234,224,196,0.7)' }}
                >
                  Who We Are
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowTerms(true)}
                  className="text-xs sm:text-sm transition-opacity hover:opacity-100 bg-transparent border-none cursor-pointer p-0 text-left"
                  style={{ color: 'rgba(234,224,196,0.7)' }}
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3 — funders */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.18em] uppercase mb-4 sm:mb-5" style={{ color: 'rgba(234,224,196,0.45)' }}>
              Supported By
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4" style={{ color: 'rgba(234,224,196,0.6)' }}>
              We are grateful for the support of our funding partners:
            </p>
            <ul className="space-y-2">
              {funders.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span style={{ color: '#EC4899', marginTop: '2px' }}>—</span>
                  <span className="text-xs sm:text-sm" style={{ color: 'rgba(234,224,196,0.7)' }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 sm:pt-8 text-center">
          <p className="text-xs" style={{ color: 'rgba(234,224,196,0.3)' }}>
            © {new Date().getFullYear()} Folks at Home. All rights reserved. Sewanee, Tennessee.
          </p>
        </div>

      </div>
    </footer>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import MissionSection from './components/MissionSection';
import ServicesSection from './components/ServicesSection';
import HowItWorksSection from './components/HowItWorksSection';
import TestimonialSection from './components/TestimonialSection';
import ServiceAreaSection from './components/ServiceAreaSection';
import CTASection from './components/CTASection';
import DonateSection from './components/DonateSection';
import Footer from './components/Footer';
import MembershipPage from './components/MembershipPage';
import VolunteerPage from './components/VolunteerPage';
import MembershipAuthPage from './components/MembershipAuthPage';
import DashboardLogin from './components/DashboardLogin';
import VolunteerDashboard from './components/VolunteerDashboard';
import MemberDashboard from './components/MemberDashboard';
import { useAuth } from './context/AuthContext';

function Landing() {
  return (
    <div className="scroll-container">
      <div className="snap-section" id="hero"><HeroSection /></div>
      <div className="snap-section" id="mission"><MissionSection /></div>
      <div className="snap-section" id="services"><ServicesSection /></div>
      <div className="snap-section" id="howitworks"><HowItWorksSection /></div>
      <div className="snap-section" id="testimonial"><TestimonialSection /></div>
      <div className="snap-section" id="coverage"><ServiceAreaSection /></div>
      <div className="snap-section" id="join"><CTASection /></div>
      <div className="snap-section" id="donate"><DonateSection /></div>
      <div style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always', overflow: 'hidden' }}>
        <Footer />
      </div>
    </div>
  );
}

function ProtectedVolunteer() {
  const { user } = useAuth();
  if (!user || user.role !== 'volunteer') return <Navigate to="/" replace />;
  return <VolunteerDashboard />;
}

function ProtectedMember() {
  const { user } = useAuth();
  if (!user || user.role !== 'member') return <Navigate to="/" replace />;
  return <MemberDashboard />;
}

// Skips the portal if already logged in
function SmartDashboard() {
  const { user } = useAuth();
  if (user?.role === 'volunteer') return <Navigate to="/dashboard/volunteer" replace />;
  if (user?.role === 'member')    return <Navigate to="/dashboard/member"    replace />;
  return <DashboardLogin />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/membership" element={<MembershipPage />} />
      <Route path="/volunteer" element={<VolunteerPage />} />
      <Route path="/membership/auth" element={<MembershipAuthPage />} />
      <Route path="/dashboard" element={<SmartDashboard />} />
      <Route path="/dashboard/volunteer" element={<ProtectedVolunteer />} />
      <Route path="/dashboard/member" element={<ProtectedMember />} />
    </Routes>
  );
}

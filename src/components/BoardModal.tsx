import { useEffect, useState } from 'react';
import steveImg from '../assets/SteveBlount_pfp.avif';
import karenImg from '../assets/KarenKuers_pfp.avif';
import woodyImg from '../assets/WoodyDeutsch_pfp.avif';
import michaelImg from '../assets/MichealThompson_pfp.avif';
import craigImg from '../assets/CraigStubblebine_pfp.avif';
import amyImg from '../assets/DrAmyLamborn_pfp.avif';
import frankImg from '../assets/FrankHart_pfp.avif';
import melissaImg from '../assets/MelissaWebb_pfp.avif';
import phebeImg from '../assets/PhebeHethcock_pfp.avif';
import wallImg from '../assets/WallWofford_Staff_pfp.avif';

const BOARD = [
  {
    name: 'Steve Blount', title: 'Board President', img: steveImg,
    bio: 'Steve arrived in Sewanee in 1977 to attend the University of the South. After graduating in 1981, he attended Florida State University College of Law and received his Juris Doctorate in 1983. He returned to Sewanee, married his college sweetheart Mary Warner Blount, and began the private practice of Law. Steve later accepted an appointment as an Assistant District Attorney in the 12th Judicial District of Tennessee. In 2011, he was honored as a distinguished Fellow of the Tennessee Bar Foundation — a fellowship limited to about 3% of Tennessee lawyers. He served as Chairperson of the 12th Judicial District Drug Court Team for approximately 15 years, and was active in the Sewanee community as Treasurer of the Vestry at St. Mark & St. Paul Parish and as a coach for Little League and Youth Soccer teams. After 39 years in the legal profession, Steve retired in 2022.',
  },
  {
    name: 'Karen Kuers', title: 'Vice President', img: karenImg,
    bio: 'Karen served as the Annie B. Snowden Professor of Forestry in the Department of Earth and Environmental Systems at the University of the South until her retirement in July 2022. She moved to Sewanee in 1994 from Athens, GA where she earned her PhD in Forest Resources from the University of Georgia. Before her PhD, Karen taught middle and high school sciences and served as Head of the Middle School at Bayside Academy in Daphne, AL. She has an MS in Developmental Biology from Texas A&M and a BS in Biology and Philosophy from Spring Hill College. She has served on the Board of Folks at Home since September 2021.',
  },
  {
    name: 'Woody Deutsch', title: 'Treasurer', img: woodyImg,
    bio: 'Woody came to Sewanee in 1968 as a member of the Class of 1972 at the University of the South. After graduating he farmed the Alto area — raising corn, wheat, soybeans, and hogs — for over 20 years before opening Woody\'s Bicycles in Winchester, TN in 1995. He moved the shop to Sewanee in 2008, reuniting him with the community he loves. He has served on the board of the Mountain Goat Trail Alliance and is a proud member of the Monteagle Sewanee Rotary Club.',
  },
  {
    name: 'Michael Thompson', title: 'Board Secretary', img: michaelImg,
    bio: 'Michael has been a registered nurse since 1994, with extensive experience in cardiothoracic surgical nursing. For 14 years he served as the primary nurse to cardiac surgeon Dr. Stephen Martin, followed by four years with Hospice of Chattanooga. An active member of St. Mark and St. Paul, Michael serves on the vestry and is an Associate of the Community of St. Mary. He believes deeply in the mission of Folks at Home, recognizing its crucial role in helping people remain in familiar, loving surroundings as they age. "Folks at Home strives to help in restoring that essential human connection and working to ensure that people can continue to live full and meaningful lives in their own homes."',
  },
  {
    name: 'Craig Stubblebine', title: 'Board Member', img: craigImg,
    bio: 'Craig served on the economics faculties of the University of Virginia, the University of Delaware, and Claremont McKenna College, where he held the Von Tobel Chair. He is Emeritus Professor of Political Economy at CMC. After retiring from the Claremont Colleges, he served as Chairman of the Board of Pilgrim Place — a continuing care retirement community for over 300 residents. Carol and Craig were drawn from California to Sewanee to be with their daughter Julia, and have been members of the Sewanee community since 2014. He has served on the Board of Folks at Home since October 2016.',
  },
  {
    name: 'Amy Lamborn', title: 'Board Member', img: amyImg,
    bio: 'Amy Bentley Lamborn holds a B.A. in English Literature and an M.Div. from the School of Theology, University of the South, and a Ph.D. in Psychiatry and Religion from Union Theological Seminary in New York City. She is a certified Jungian analyst and a member of the Jungian Psychoanalytic Association. An Episcopal priest since 1998, she has served institutions and parishes in Indiana, New York, and Tennessee, was a faculty member at General Theological Seminary from 2011–2015, and has served as Vicar of the Southeastern Tennessee Episcopal Ministry since 2016.',
  },
  {
    name: 'Frank Hart', title: 'Board Member', img: frankImg,
    bio: 'Frank received his Ph.D. in Physics from Syracuse University in 1967 and joined the University of the South\'s Department of Physics, where he served two terms as Department Chair, as Director of the Radioisotopes Laboratory, and as Director of the University Observatory. Since his formal retirement in 2013 he has remained active in research and taught Lifelong Learning courses on Modern Astronomy. Frank has served on the Board of Folks at Home since April 2021.',
  },
  {
    name: 'Melissa Webb', title: 'Board Member', img: melissaImg,
    bio: 'Melissa served in the University Career Center as Associate Director for Internships from 2000 until her retirement in 2021. Prior to Sewanee she served First Union National Bank as Director of Community Relations for Tennessee and as a branch manager with Dominion Bank in Nashville. She is a graduate of the University of Mississippi with a BBA in Marketing. Since retirement, Melissa has focused on her art gallery in the Monteagle Assembly, featuring McCarty Pottery and local artists. She has lived in Sewanee since 1995.',
  },
  {
    name: 'Phebe Hethcock', title: 'Board Advisor', img: phebeImg,
    bio: 'A member of the Sewanee community since 1979. Past member of the Board of Folks at Home. Past trainer and mentor of Education for Ministry, and past revision manager for the same program. Past member and president of the Board of St. Andrew\'s-Sewanee School. Past member of the nominating and Financial Oversight committees of the Society of the Companions of the Holy Cross. Past Senior Warden of (then Otey Parish) now St. Mark and St. Paul Parish.',
  },
];

const STAFF = [
  {
    name: 'Wall Wofford', title: 'Executive Director', img: wallImg,
    bio: '',
  },
  {
    name: 'Sarah Doyi', title: 'Administrative & Service Coordinator', img: null,
    bio: '',
  },
];

function PersonCard({ name, title, img, bio }: { name: string; title: string; img: string | null; bio: string }) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 180;
  const needsTruncation = bio.length > LIMIT;
  const displayBio = expanded || !needsTruncation ? bio : bio.slice(0, LIMIT).trimEnd() + '…';

  return (
    <div className="flex flex-col items-center text-center gap-2.5 p-4 rounded-2xl" style={{ background: '#F9FAFB' }}>
      <div className="w-16 h-16 rounded-full overflow-hidden shrink-0" style={{ border: '2px solid #F9A8D4' }}>
        {img
          ? <img src={img} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-lg font-semibold" style={{ background: '#FFF5F9', color: '#EC4899' }}>{name[0]}</div>}
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight" style={{ color: '#1F1F1F' }}>{name}</p>
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase mt-0.5" style={{ color: '#EC4899' }}>{title}</p>
      </div>
      {bio && (
        <div className="text-left w-full">
          <p className="text-[11px] leading-relaxed" style={{ color: '#6B7280' }}>{displayBio}</p>
          {needsTruncation && (
            <button onClick={() => setExpanded(v => !v)} className="text-[10px] font-semibold mt-1 bg-transparent border-none cursor-pointer p-0 transition-opacity hover:opacity-70" style={{ color: '#EC4899' }}>
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function BoardModal({ onClose }: { onClose: () => void }) {
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
            <h2 className="font-serif text-xl sm:text-2xl font-normal leading-tight" style={{ color: '#1F1F1F', letterSpacing: '-0.01em' }}>Who We Are</h2>
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
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-3" style={{ color: '#9CA3AF' }}>Board of Directors</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {BOARD.map(p => <PersonCard key={p.name} {...p} />)}
          </div>

          <div style={{ borderTop: '1px solid #F3F4F6' }} className="pt-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-3" style={{ color: '#9CA3AF' }}>Staff</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STAFF.map(p => <PersonCard key={p.name} {...p} />)}
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

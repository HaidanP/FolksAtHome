import { memo } from 'react';

interface Props {
  src: string;
  overlay?: string;
}

const BackgroundVideo = memo(({ src, overlay = 'linear-gradient(135deg,rgba(236,72,153,0.18) 0%,rgba(15,10,5,0.55) 60%,rgba(15,10,5,0.65) 100%)' }: Props) => (
  <>
    <video
      autoPlay
      loop
      muted
      playsInline
      src={src}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        zIndex: 0,
        // Promote to its own GPU compositing layer so parent repaints never touch it
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    />
    <div style={{
      position: 'fixed',
      inset: 0,
      background: overlay,
      zIndex: 1,
    }} />
  </>
));

export default BackgroundVideo;

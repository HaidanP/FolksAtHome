import { useEffect, useState } from 'react';

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  initialDelay?: number;
  charDelay?: number;
  textShadow?: string;
}

export default function AnimatedHeading({
  text,
  className = '',
  initialDelay = 200,
  charDelay = 30,
  textShadow,
}: AnimatedHeadingProps) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), initialDelay);
    return () => clearTimeout(timer);
  }, [initialDelay]);

  const lines = text.split('\n');

  return (
    <h1 className={className} style={{ letterSpacing: '-0.04em', textShadow }}>
      {lines.map((line, lineIndex) => {
        const chars = line.split('');
        // offset for chars in previous lines
        const lineOffset = lines
          .slice(0, lineIndex)
          .reduce((acc, l) => acc + l.length, 0);

        return (
          <span key={lineIndex} style={{ display: 'block' }}>
            {chars.map((char, charIndex) => {
              const globalIndex = lineOffset + charIndex;
              const delay = globalIndex * charDelay;
              const isSpace = char === ' ';

              return (
                <span
                  key={charIndex}
                  style={{
                    display: 'inline-block',
                    opacity: started ? 1 : 0,
                    transform: started ? 'translateX(0)' : 'translateX(-18px)',
                    transition: `opacity 500ms ${delay}ms, transform 500ms ${delay}ms`,
                  }}
                >
                  {isSpace ? '\u00A0' : char}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}

// src/components/ui/parallax.tsx
import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
}

export const Parallax: React.FC<ParallaxProps> = ({ children, speed = 0.5 }) => {
  const [offset, setOffset] = useState(0);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrollTop = window.pageYOffset;
        const elementTop = parallaxRef.current.offsetTop;
        const elementHeight = parallaxRef.current.offsetHeight;
        const viewportHeight = window.innerHeight;

        if (scrollTop + viewportHeight > elementTop && scrollTop < elementTop + elementHeight) {
          setOffset((scrollTop - elementTop) * speed);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={parallaxRef} style={{ transform: `translateY(${offset}px)` }}>
      {children}
    </div>
  );
};
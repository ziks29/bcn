"use client";

import React, { useEffect, useState } from 'react';

const SnowParticles = () => {
    const [flakes, setFlakes] = useState<Array<{ id: number; left: string; animationDuration: string; animationDelay: string; opacity: number; size: string }>>([]);

    useEffect(() => {
        // Generate snowflakes only on client side to avoid hydration mismatch
        const flakeCount = 50;
        const newFlakes = Array.from({ length: flakeCount }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}vw`,
            animationDuration: `${Math.random() * 10 + 10}s`, // 10-20s fall duration
            animationDelay: `-${Math.random() * 10}s`, // Negative delay to start mid-fall
            opacity: Math.random() * 0.5 + 0.3, // 0.3 to 0.8 opacity -> more visible
            size: `${Math.random() * 6 + 4}px`, // 4px to 10px -> larger dots
        }));
        setFlakes(newFlakes);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
            <style jsx global>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) translateX(0);
          }
          25% {
            transform: translateY(25vh) translateX(15px);
          }
          50% {
            transform: translateY(50vh) translateX(-15px);
          }
          75% {
            transform: translateY(75vh) translateX(15px);
          }
          100% {
            transform: translateY(105vh) translateX(0);
          }
        }
      `}</style>
            {flakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute top-[-20px] bg-white rounded-full blur-[0.5px] shadow-sm"
                    style={{
                        left: flake.left,
                        width: flake.size,
                        height: flake.size,
                        opacity: flake.opacity,
                        animation: `snowfall ${flake.animationDuration} linear infinite`,
                        animationDelay: flake.animationDelay,
                    }}
                />
            ))}
        </div>
    );
};

export default SnowParticles;

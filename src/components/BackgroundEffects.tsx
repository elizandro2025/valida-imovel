import React from 'react';
import { ParallaxElement } from '@/components/AnimatedElements';
import heroBgModern from '@/assets/hero-bg-modern.png';

export const BackgroundEffects: React.FC = () => (
  <div className="fixed inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-mesh opacity-80" />
    <ParallaxElement speed={0.2} className="absolute inset-0">
      <img 
        src={heroBgModern} 
        alt="Modern Tech Background" 
        className="w-full h-full object-cover opacity-20"
      />
    </ParallaxElement>
    
    {/* Enhanced floating particles */}
    <div className="absolute inset-0">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full animate-float ${
            i % 3 === 0 ? 'bg-primary/20' : i % 3 === 1 ? 'bg-accent/20' : 'bg-primary-glow/20'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${6 + Math.random() * 8}s`
          }}
        />
      ))}
    </div>

    {/* Gradient orbs */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
    </div>
  </div>
);
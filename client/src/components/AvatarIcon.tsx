import React from 'react';

interface AvatarIconProps {
  type?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarIcon: React.FC<AvatarIconProps> = ({
  type = 'user',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16',
  };

  const dim = sizeMap[size];

  // If type is a custom uploaded image (data URL or external URL)
  if (type && (type.startsWith('data:image') || type.startsWith('http') || type.startsWith('blob:'))) {
    return (
      <div className={`rounded-2xl overflow-hidden border border-amber-500/40 shadow-md ${dim} ${className}`}>
        <img src={type} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  switch (type?.toLowerCase()) {
    case 'spade':
      return (
        <div className={`rounded-2xl bg-slate-900 border border-slate-700 p-2 flex items-center justify-center text-amber-400 ${dim} ${className}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2C9.5 7 5 10 5 13.5C5 16 7 18 9.5 18C10.5 18 11.5 17.5 12 16.8C12.5 17.5 13.5 18 14.5 18C17 18 19 16 19 13.5C19 10 14.5 7 12 2ZM13 18.5C13 18.5 14 21 16 22H8C10 21 11 18.5 11 18.5H13Z" />
          </svg>
        </div>
      );

    case 'crown':
      return (
        <div className={`rounded-2xl bg-amber-950/80 border border-amber-500/50 p-2 flex items-center justify-center text-amber-400 ${dim} ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
          </svg>
        </div>
      );

    case 'shield':
      return (
        <div className={`rounded-2xl bg-indigo-950/80 border border-indigo-500/40 p-2 flex items-center justify-center text-indigo-400 ${dim} ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      );

    case 'flame':
      return (
        <div className={`rounded-2xl bg-red-950/80 border border-red-500/40 p-2 flex items-center justify-center text-red-400 ${dim} ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        </div>
      );

    case 'star':
      return (
        <div className={`rounded-2xl bg-yellow-950/80 border border-yellow-500/40 p-2 flex items-center justify-center text-yellow-400 ${dim} ${className}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      );

    case 'diamond':
      return (
        <div className={`rounded-2xl bg-cyan-950/80 border border-cyan-500/40 p-2 flex items-center justify-center text-cyan-400 ${dim} ${className}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
          </svg>
        </div>
      );

    case 'bot':
      return (
        <div className={`rounded-2xl bg-blue-950/80 border border-blue-500/40 p-2 flex items-center justify-center text-blue-400 ${dim} ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" />
            <line x1="16" y1="16" x2="16" y2="16" />
          </svg>
        </div>
      );

    case 'user':
    default:
      return (
        <div className={`rounded-2xl bg-slate-800 border border-slate-700 p-2 flex items-center justify-center text-slate-300 ${dim} ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      );
  }
};

import React from 'react';

interface AntLogoProps {
  className?: string;
  size?: number;
}

export const AntLogo: React.FC<AntLogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Antenas de la Hormiga */}
      <path
        d="M27,15 C24,10 18,9 14,11 M37,15 C40,10 46,9 50,11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Terminales de antenas */}
      <circle cx="14" cy="11" r="2.5" fill="#38BDF8" />
      <circle cx="50" cy="11" r="2.5" fill="#38BDF8" />

      {/* Cabeza */}
      <ellipse cx="32" cy="23" rx="10" ry="10" fill="currentColor" />

      {/* Ojos */}
      <circle cx="27" cy="21" r="1.8" fill="#4F46E5" />
      <circle cx="37" cy="21" r="1.8" fill="#4F46E5" />

      {/* Tórax */}
      <ellipse cx="32" cy="41" rx="7" ry="8" fill="#C7D2FE" />

      {/* Abdomen grande */}
      <ellipse cx="32" cy="56" rx="12" ry="8" fill="currentColor" />

      {/* Patas delanteras */}
      <path
        d="M25,35 L16,29 L10,34 M39,35 L48,29 L54,34"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Patas intermedias */}
      <path
        d="M25,41 L14,41 L8,48 M39,41 L50,41 L56,48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Patas traseras */}
      <path
        d="M26,46 L17,52 L12,61 M38,46 L47,52 L52,61"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

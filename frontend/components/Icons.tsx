/**
 * Custom SVG Icons for CarConvo
 */

import React from 'react';

export interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Car Icon - Used for placeholders and empty states
 */
export function CarIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5 13L3 13.5V17.5L5 18M19 13L21 13.5V17.5L19 18M5 18V21M19 18V21M7 21H17M19 13V11C19 9.89543 18.1046 9 17 9H7C5.89543 9 5 9.89543 5 11V13M19 13H5M19 13L21 13.5M5 13L3 13.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 6L8 9M17 6L16 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="8"
        cy="15"
        r="1.5"
        fill="currentColor"
      />
      <circle
        cx="16"
        cy="15"
        r="1.5"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Default export for convenience
 */
export default {
  CarIcon,
};


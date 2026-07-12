import { useState } from 'react';

export function useHover(): {
  isHovered: boolean;
  hoverProps: { onMouseEnter: () => void; onMouseLeave: () => void };
} {
  const [isHovered, setHovered] = useState(false);
  return {
    isHovered,
    hoverProps: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
    },
  };
}

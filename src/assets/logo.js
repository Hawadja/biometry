import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export default function Logo({ size = 120 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="45" fill="#e94560" />
      <Circle cx="50" cy="40" r="15" fill="#fff" />
      <Path d="M35 70 Q50 85 65 70" stroke="#fff" strokeWidth="5" fill="none" />
      <Rect x="42" y="35" width="16" height="12" rx="2" fill="#e94560" />
    </Svg>
  );
}
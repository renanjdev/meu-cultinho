/**
 * components/Icons.tsx — stroke icon set, ported 1:1 from icons.jsx.
 *
 * The web prototype used inline <svg> with stroke="currentColor". React Native
 * has no currentColor inheritance, so every glyph resolves its stroke from the
 * active theme's ink by default, overridable per call site with `color`.
 */
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Circle, G, Path, Rect, Svg } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

export interface IconProps {
  size?: number;
  color?: string;
  /** stroke width */
  sw?: number;
  style?: StyleProp<ViewStyle>;
  opacity?: number;
}

function useStroke(color: string | undefined, sw: number) {
  const theme = useTheme();
  return {
    stroke: color ?? theme.ink,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
}

function Glyph({
  size = 22,
  vb = 24,
  style,
  opacity,
  children,
}: {
  size?: number;
  vb?: number;
  style?: StyleProp<ViewStyle>;
  opacity?: number;
  children: React.ReactNode;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      fill="none"
      style={style}
      opacity={opacity}>
      {children}
    </Svg>
  );
}

export const IconHome = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" {...s} />
    </Glyph>
  );
};

export const IconUsers = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...s} />
      <Circle cx={9} cy={7} r={4} {...s} />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" {...s} />
    </Glyph>
  );
};

export const IconUser = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Circle cx={12} cy={8} r={4} {...s} />
      <Path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" {...s} />
    </Glyph>
  );
};

export const IconCheck = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M20 6 9 17l-5-5" {...s} />
    </Glyph>
  );
};

export const IconCheckCircle = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Circle cx={12} cy={12} r={9} {...s} />
      <Path d="m8.5 12 2.5 2.5 4.5-5" {...s} />
    </Glyph>
  );
};

export const IconX = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M18 6 6 18M6 6l12 12" {...s} />
    </Glyph>
  );
};

export const IconXCircle = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Circle cx={12} cy={12} r={9} {...s} />
      <Path d="M15 9l-6 6M9 9l6 6" {...s} />
    </Glyph>
  );
};

export const IconCalendar = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Rect x={3} y={4.5} width={18} height={16} rx={3} {...s} />
      <Path d="M3 9h18M8 2.5v4M16 2.5v4" {...s} />
    </Glyph>
  );
};

export const IconClipboard = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Rect x={5} y={4} width={14} height={17} rx={2.5} {...s} />
      <Path d="M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 11h6M9 15h4" {...s} />
    </Glyph>
  );
};

export const IconChart = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M3 21h18" {...s} />
      <Rect x={5} y={11} width={3.4} height={7} rx={1} {...s} />
      <Rect x={10.3} y={7} width={3.4} height={11} rx={1} {...s} />
      <Rect x={15.6} y={13} width={3.4} height={5} rx={1} {...s} />
    </Glyph>
  );
};

export const IconSettings = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Circle cx={12} cy={12} r={3} {...s} />
      <Path
        d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"
        {...s}
      />
    </Glyph>
  );
};

export const IconHeart = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path
        d="M12 20s-7-4.6-9.3-9.2C1.2 7.7 2.8 4.5 6 4.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.2 0 4.8 3.2 3.3 6.3C19 15.4 12 20 12 20z"
        {...s}
      />
    </Glyph>
  );
};

export const IconBook = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" {...s} />
      <Path d="M4 19a2 2 0 0 1 2-2h13" {...s} />
    </Glyph>
  );
};

export const IconSearch = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Circle cx={11} cy={11} r={7} {...s} />
      <Path d="m20 20-3.2-3.2" {...s} />
    </Glyph>
  );
};

export const IconPlus = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M12 5v14M5 12h14" {...s} />
    </Glyph>
  );
};

export const IconChevR = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="m9 6 6 6-6 6" {...s} />
    </Glyph>
  );
};

export const IconChevL = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="m15 6-6 6 6 6" {...s} />
    </Glyph>
  );
};

export const IconChevD = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="m6 9 6 6 6-6" {...s} />
    </Glyph>
  );
};

export const IconBack = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M19 12H5M12 19l-7-7 7-7" {...s} />
    </Glyph>
  );
};

export const IconFilter = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" {...s} />
    </Glyph>
  );
};

export const IconPhone = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path
        d="M15.5 3h-7A1.5 1.5 0 0 0 7 4.5v15A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 15.5 3zM11 18h2"
        {...s}
      />
    </Glyph>
  );
};

export const IconWhats = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M3 21l1.6-4.5A8 8 0 1 1 8 19.4L3 21z" {...s} />
      <Path
        d="M9 9.5c0 3 2.5 5.5 5.5 5.5.5 0 1-.7 1-1.2l-1.8-.9-1 1c-1-.5-2-1.5-2.5-2.5l1-1-.9-1.8c-.5 0-1.3.4-1.3.9z"
        fill={s.stroke}
        stroke="none"
      />
    </Glyph>
  );
};

export const IconMapPin = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0z" {...s} />
      <Circle cx={12} cy={10} r={3} {...s} />
    </Glyph>
  );
};

export const IconEdit = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" {...s} />
    </Glyph>
  );
};

export const IconBell = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" {...s} />
      <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" {...s} />
    </Glyph>
  );
};

export const IconAlert = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M12 3 2 20h20L12 3z" {...s} />
      <Path d="M12 9.5v5M12 17.6v.1" {...s} />
    </Glyph>
  );
};

export const IconClock = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Circle cx={12} cy={12} r={9} {...s} />
      <Path d="M12 7.5V12l3 2" {...s} />
    </Glyph>
  );
};

export const IconLock = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Rect x={4.5} y={10.5} width={15} height={10} rx={2.5} {...s} />
      <Path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" {...s} />
    </Glyph>
  );
};

export const IconLogout = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" {...s} />
    </Glyph>
  );
};

export const IconLayers = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M12 3 3 8l9 5 9-5-9-5z" {...s} />
      <Path d="m3 13 9 5 9-5M3 18l9 5 9-5" {...s} />
    </Glyph>
  );
};

export const IconDownload = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" {...s} />
    </Glyph>
  );
};

export const IconShield = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M12 3 5 6v6c0 4 3 6.5 7 9 4-2.5 7-5 7-9V6l-7-3z" {...s} />
      <Path d="m9.5 12 2 2 3.5-4" {...s} />
    </Glyph>
  );
};

export const IconNote = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Rect x={4} y={3.5} width={16} height={17} rx={3} {...s} />
      <Path d="M8 8.5h8M8 12.5h8M8 16.5h5" {...s} />
    </Glyph>
  );
};

export const IconStar = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path
        d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7L6.8 19.6l1-5.8-4.3-4.1 5.9-.9L12 3.5z"
        {...s}
      />
    </Glyph>
  );
};

export const IconBabyFace = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Circle cx={12} cy={12} r={9} {...s} />
      <Path d="M9 11v.1M15 11v.1M9 15c1 1 5 1 6 0" {...s} />
    </Glyph>
  );
};

export const IconGroup3 = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Circle cx={12} cy={8} r={3.2} {...s} />
      <Circle cx={5.5} cy={11} r={2.4} {...s} />
      <Circle cx={18.5} cy={11} r={2.4} {...s} />
      <Path d="M7 20v-1.5A3.5 3.5 0 0 1 10.5 15h3A3.5 3.5 0 0 1 17 18.5V20" {...s} />
    </Glyph>
  );
};

export const IconList = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M8 6h13M8 12h13M8 18h13M3.5 6v.01M3.5 12v.01M3.5 18v.01" {...s} />
    </Glyph>
  );
};

export const IconTrend = ({ size, color, sw = 2, style, opacity }: IconProps) => {
  const s = useStroke(color, sw);
  return (
    <Glyph size={size} style={style} opacity={opacity}>
      <Path d="M3 16l5-5 4 4 8-8M16 7h5v5" {...s} />
    </Glyph>
  );
};

export type IconComponent = (props: IconProps) => React.JSX.Element;

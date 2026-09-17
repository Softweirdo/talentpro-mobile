import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme/index';

export type IconName =
  | 'home'
  | 'clipboard'
  | 'share'
  | 'user'
  | 'bell'
  | 'search'
  | 'pin'
  | 'clock'
  | 'bolt'
  | 'chevronRight'
  | 'lock'
  | 'check';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  /** Solid fill for the active tab; outline everywhere else. */
  filled?: boolean;
}

/**
 * A single stroked icon set, drawn on a 24px grid with a 2px stroke to match
 * the rest of the UI's line weight.
 *
 * These replace the emoji the prototype used as placeholders. Emoji render
 * with the OS's own colours and metrics — they cannot take the theme colour,
 * they look different on every Android skin, and the tab bar ends up a row of
 * mismatched pictures rather than one icon family.
 */
export function Icon({ name, size = 24, color = colors.textMute, filled = false }: Props) {
  const stroke = color;
  const common = {
    stroke,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  // The active tab gets a soft wash of the same hue rather than a second colour.
  const wash = { fill: filled ? color : 'none', fillOpacity: filled ? 0.16 : 0 };
  const hollow = { fill: 'none' as const };

  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" {...common} {...wash} />
        </Svg>
      );

    case 'clipboard':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" {...common} {...wash} />
          <Rect x="9" y="2.5" width="6" height="4" rx="1.2" {...common} {...wash} />
          <Path d="M9 12h6M9 16h4" {...common} {...hollow} />
        </Svg>
      );

    case 'share':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M7 17 17 7M9 7h8v8" {...common} {...hollow} />
        </Svg>
      );

    case 'user':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="8" r="4" {...common} {...wash} />
          <Path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" {...common} {...wash} />
        </Svg>
      );

    case 'bell':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M18 8a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" {...common} {...wash} />
          <Path d="M13.7 18a2 2 0 0 1-3.4 0" {...common} {...hollow} />
        </Svg>
      );

    case 'search':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="11" cy="11" r="7" {...common} {...hollow} />
          <Path d="m20 20-3.5-3.5" {...common} {...hollow} />
        </Svg>
      );

    case 'pin':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11" {...common} {...hollow} />
          <Circle cx="12" cy="10" r="2.5" {...common} {...hollow} />
        </Svg>
      );

    case 'clock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="9" {...common} {...hollow} />
          <Path d="M12 7v5l3.5 2" {...common} {...hollow} />
        </Svg>
      );

    case 'bolt':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M13 2 4 14h7l-1 8 9-12h-7z" {...common} {...hollow} />
        </Svg>
      );

    case 'chevronRight':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="m9 5 7 7-7 7" {...common} {...hollow} />
        </Svg>
      );

    case 'lock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="4.5" y="10" width="15" height="11" rx="2" {...common} {...hollow} />
          <Path d="M8 10V7a4 4 0 0 1 8 0v3" {...common} {...hollow} />
        </Svg>
      );

    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="m5 13 4.5 4.5L19 7" {...common} {...hollow} />
        </Svg>
      );
  }
}

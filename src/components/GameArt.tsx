import React, { useId } from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Rect,
  Circle,
  G,
  Line,
  Polygon,
  Text as SvgText,
} from 'react-native-svg';

/**
 * GameArt draws a distinct vector illustration for each game category, tinted
 * with that category's brand gradient. It scales cleanly at any size and runs
 * in Expo Go (react-native-svg ships with Expo Go), so there are no image files
 * to manage. Drop it on a game card, the quiz header, or anywhere a category
 * needs a picture.
 */

export type GameArtCategory =
  | 'memory'
  | 'math'
  | 'puzzles'
  | 'riddles'
  | 'sequences'
  | 'wordplay'
  | 'random';

type ArtPalette = { from: string; to: string };

const ART_COLORS: Record<GameArtCategory, ArtPalette> = {
  memory: { from: '#B07CFF', to: '#6B21D4' },
  math: { from: '#3DF7FF', to: '#0077AA' },
  puzzles: { from: '#FF8A5B', to: '#CC3300' },
  riddles: { from: '#FFE05C', to: '#FF8C00' },
  sequences: { from: '#6FE3DB', to: '#006B5C' },
  wordplay: { from: '#FF77A9', to: '#A00040' },
  random: { from: '#FF4D6D', to: '#9B59F5' },
};

const WHITE = '#FFFFFF';

interface GameArtProps {
  category: GameArtCategory;
  size?: number;
}

export function GameArt({ category, size = 96 }: GameArtProps) {
  const palette = ART_COLORS[category] ?? ART_COLORS.random;

  // Gradient ids must be unique per instance, otherwise two illustrations of the
  // same category on one screen would share (and clobber) a gradient definition.
  const rawId = useId();
  const gid = 'gameArt' + rawId.replace(/[^a-zA-Z0-9]/g, '');
  const fill = `url(#${gid})`;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={palette.from} />
          <Stop offset="100%" stopColor={palette.to} />
        </LinearGradient>
      </Defs>
      {renderArt(category, fill, palette)}
    </Svg>
  );
}

function renderArt(category: GameArtCategory, fill: string, palette: ArtPalette) {
  switch (category) {
    case 'memory':
      return memoryArt(fill, palette);
    case 'math':
      return mathArt(fill, palette);
    case 'puzzles':
      return puzzlesArt(fill);
    case 'riddles':
      return riddlesArt(fill, palette);
    case 'sequences':
      return sequencesArt(fill);
    case 'wordplay':
      return wordplayArt(fill, palette);
    case 'random':
    default:
      return randomArt(fill, palette);
  }
}

// Memory: a pair of matching cards, one face up with a star.
function memoryArt(fill: string, palette: ArtPalette) {
  const star = '52,41 55.1,49.8 64.4,50 57,55.6 59.6,64.5 52,59.2 44.4,64.5 47,55.6 39.6,50 48.9,49.8';
  return (
    <G>
      <Rect x={16} y={24} width={40} height={52} rx={9} fill={palette.to} opacity={0.45} />
      <Rect x={30} y={28} width={44} height={52} rx={9} fill={fill} />
      <Polygon points={star} fill={WHITE} />
    </G>
  );
}

// Math: a calculator with a screen and a grid of buttons.
function mathArt(fill: string, palette: ArtPalette) {
  const cols = [35, 47, 59];
  const rows = [46, 58, 70];
  const buttons: React.ReactNode[] = [];
  rows.forEach((y, r) =>
    cols.forEach((x, c) => {
      const isEquals = r === 2 && c === 2;
      buttons.push(
        <Rect
          key={`${r}-${c}`}
          x={x}
          y={y}
          width={9}
          height={9}
          rx={3}
          fill={isEquals ? palette.from : WHITE}
          opacity={isEquals ? 1 : 0.92}
        />,
      );
    }),
  );
  return (
    <G>
      <Rect x={28} y={16} width={44} height={68} rx={9} fill={fill} />
      <Rect x={34} y={23} width={32} height={14} rx={3} fill="#0D0F1A" opacity={0.85} />
      {buttons}
    </G>
  );
}

// Puzzles: a single jigsaw piece with a knob on the top and right edges.
function puzzlesArt(fill: string) {
  const piece =
    'M30,30 L42,30 C40,16 60,16 58,30 L70,30 L70,42 C84,40 84,60 70,58 L70,70 L30,70 Z';
  return (
    <G>
      <Path d={piece} fill={fill} />
      <Circle cx={42} cy={58} r={5} fill={WHITE} opacity={0.85} />
    </G>
  );
}

// Riddles: a glowing lightbulb, the classic "aha" moment.
function riddlesArt(fill: string, palette: ArtPalette) {
  const ray = (x1: number, y1: number, x2: number, y2: number, key: string) => (
    <Line
      key={key}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={palette.from}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  );
  return (
    <G>
      {ray(50, 16, 50, 7, 'top')}
      {ray(36, 28, 30, 22, 'upLeft')}
      {ray(64, 28, 70, 22, 'upRight')}
      {ray(27, 42, 19, 42, 'left')}
      {ray(73, 42, 81, 42, 'right')}
      <Circle cx={50} cy={42} r={20} fill={fill} />
      <Path d="M43,43 q7,-12 14,0" stroke={WHITE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Rect x={43} y={61} width={14} height={5} rx={2} fill={WHITE} />
      <Rect x={44} y={67} width={12} height={4} rx={2} fill={WHITE} opacity={0.8} />
      <Rect x={46} y={72} width={8} height={4} rx={2} fill={WHITE} opacity={0.6} />
    </G>
  );
}

// Sequences: rising bars, with the next bar highlighted as "what comes next".
function sequencesArt(fill: string) {
  const baseline = 80;
  const bars = [
    { x: 22, h: 18 },
    { x: 39, h: 30 },
    { x: 56, h: 42 },
  ];
  return (
    <G>
      {bars.map((b) => (
        <Rect key={b.x} x={b.x} y={baseline - b.h} width={13} height={b.h} rx={4} fill={fill} />
      ))}
      <Rect x={73} y={baseline - 54} width={13} height={54} rx={4} fill={WHITE} />
    </G>
  );
}

// Wordplay: three lettered tiles, spelling F-U-N.
function wordplayArt(fill: string, palette: ArtPalette) {
  const tile = (x: number, y: number, rotate: number, letter: string, tint: string, key: string) => {
    const cx = x + 14;
    const cy = y + 14;
    return (
      <G key={key} rotation={rotate} originX={cx} originY={cy}>
        <Rect x={x} y={y} width={28} height={28} rx={6} fill={tint} />
        <SvgText
          x={cx}
          y={cy + 6}
          fontSize={17}
          fontWeight="bold"
          fill={WHITE}
          textAnchor="middle"
        >
          {letter}
        </SvgText>
      </G>
    );
  };
  return (
    <G>
      {tile(20, 40, -10, 'F', palette.to, 't1')}
      {tile(38, 32, 6, 'U', fill, 't2')}
      {tile(56, 42, -4, 'N', palette.from, 't3')}
    </G>
  );
}

// Random: a die mid-shuffle with a sparkle, for the "any category" mix.
function randomArt(fill: string, palette: ArtPalette) {
  const pips = [
    [40, 40],
    [64, 40],
    [52, 52],
    [40, 64],
    [64, 64],
  ];
  const sparkle = '78,22 80,29 87,31 80,33 78,40 76,33 69,31 76,29';
  return (
    <G>
      <G rotation={-8} originX={52} originY={52}>
        <Rect x={30} y={30} width={44} height={44} rx={12} fill={fill} />
        {pips.map(([cx, cy]) => (
          <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={WHITE} />
        ))}
      </G>
      <Polygon points={sparkle} fill={palette.from} />
    </G>
  );
}

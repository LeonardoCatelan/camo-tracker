import { type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import {
  createRandom,
  getCamoArt,
  hashString,
  OLIVE_PALETTE,
  type CamoPattern,
  type Palette,
} from "../lib/camo-art";

/** Visual family of the icon. Weapon camos with a real name use "named". */
export type CamoIconVariant =
  "named" | "military" | "gold" | "platinum" | "harmonic_break" | "divergence";

interface CamoIconProps {
  /** Camo name; drives the generated swatch for the "named" variant. */
  name: string;
  variant?: CamoIconVariant;
  /** Military camo number (1-8), printed on the swatch. */
  index?: number;
  className?: string;
}

const SIZE = 32;
const n = (value: number) => Number(value.toFixed(2));

type Random = () => number;

function between(random: Random, min: number, max: number): number {
  return min + random() * (max - min);
}

function choose<T>(random: Random, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)] as T;
}

const PATTERN_RENDERERS: Record<CamoPattern, (palette: Palette, random: Random) => ReactNode> = {
  woodland: (palette, random) => (
    <>
      <rect width={SIZE} height={SIZE} fill={palette[1]} />
      {[palette[0], palette[2], palette[3]].flatMap((color, layer) =>
        Array.from({ length: layer === 2 ? 4 : 7 }, (_, index) => (
          <ellipse
            key={`${layer}-${index}`}
            cx={n(between(random, -2, 34))}
            cy={n(between(random, -2, 34))}
            rx={n(between(random, 3, 8))}
            ry={n(between(random, 2, 4.5))}
            transform={`rotate(${n(between(random, -60, 60))} 16 16)`}
            fill={color}
          />
        )),
      )}
    </>
  ),
  digital: (palette, random) => (
    <>
      <rect width={SIZE} height={SIZE} fill={palette[0]} />
      {Array.from({ length: 64 }, (_, index) => {
        const roll = random();
        if (roll < 0.35) return null;
        const color = roll < 0.65 ? palette[1] : roll < 0.88 ? palette[2] : palette[3];
        return (
          <rect
            key={index}
            x={(index % 8) * 4}
            y={Math.floor(index / 8) * 4}
            width={4}
            height={4}
            fill={color}
          />
        );
      })}
    </>
  ),
  tiger: (palette, random) => (
    <>
      <rect width={SIZE} height={SIZE} fill={palette[2]} />
      {Array.from({ length: 6 }, (_, index) => {
        const x = index * 6 + between(random, -2, 2);
        const width = between(random, 1.5, 3.5);
        const sway = between(random, -6, 6);
        return (
          <path
            key={index}
            d={`M${n(x)} -1 L${n(x + width)} -1 L${n(x + sway + width / 3)} 33 L${n(x + sway)} 33 Z`}
            fill={index % 2 ? palette[0] : palette[1]}
          />
        );
      })}
    </>
  ),
  topo: (palette, random) => {
    const centers = [0, 1].map(() => [between(random, 4, 28), between(random, 4, 28)] as const);
    return (
      <>
        <rect width={SIZE} height={SIZE} fill={palette[1]} />
        {centers.flatMap(([cx, cy], center) =>
          [4, 8, 12, 16, 20].map((radius) => (
            <ellipse
              key={`${center}-${radius}`}
              cx={n(cx)}
              cy={n(cy)}
              rx={n(radius * 1.2)}
              ry={radius}
              fill="none"
              stroke={radius % 8 ? palette[3] : palette[0]}
              strokeWidth={1.1}
            />
          )),
        )}
      </>
    );
  },
  scales: (palette, random) => (
    <>
      <rect width={SIZE} height={SIZE} fill={palette[0]} />
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 5 }, (_, column) => (
          <circle
            key={`${row}-${column}`}
            cx={column * 7 + (row % 2) * 3.5}
            cy={row * 6}
            r={3.6}
            fill={random() < 0.5 ? palette[1] : palette[2]}
            stroke={palette[0]}
            strokeWidth={0.8}
          />
        )),
      )}
    </>
  ),
  splinter: (palette, random) => (
    <>
      <rect width={SIZE} height={SIZE} fill={palette[1]} />
      {Array.from({ length: 9 }, (_, index) => {
        const x = between(random, -4, 32);
        const y = between(random, -4, 32);
        return (
          <path
            key={index}
            d={`M${n(x)} ${n(y)} L${n(x + between(random, 6, 16))} ${n(y + between(random, -4, 4))} L${n(x + between(random, 0, 8))} ${n(y + between(random, 6, 14))} Z`}
            fill={choose(random, [palette[0], palette[2], palette[3]])}
          />
        );
      })}
    </>
  ),
  waves: (palette, random) => (
    <>
      <rect width={SIZE} height={SIZE} fill={palette[0]} />
      {Array.from({ length: 7 }, (_, index) => {
        const y = index * 5 + between(random, -1, 1);
        const amplitude = between(random, 2, 4);
        return (
          <path
            key={index}
            d={`M-2 ${n(y)} Q6 ${n(y - amplitude)} 14 ${n(y)} T30 ${n(y)} T46 ${n(y)}`}
            fill="none"
            stroke={index % 2 ? palette[2] : palette[3]}
            strokeWidth={1.6}
          />
        );
      })}
    </>
  ),
  smoke: (palette, random) => (
    <>
      <rect width={SIZE} height={SIZE} fill={palette[0]} />
      {Array.from({ length: 10 }, (_, index) => (
        <circle
          key={index}
          cx={n(between(random, 0, 32))}
          cy={n(between(random, 0, 32))}
          r={n(between(random, 4, 10))}
          fill={index % 2 ? palette[2] : palette[1]}
          opacity={0.45}
        />
      ))}
      {Array.from({ length: 6 }, (_, index) => (
        <circle
          key={`dot-${index}`}
          cx={n(between(random, 2, 30))}
          cy={n(between(random, 2, 30))}
          r={0.7}
          fill={palette[3]}
        />
      ))}
    </>
  ),
  brush: (palette, random) => (
    <>
      <rect width={SIZE} height={SIZE} fill={palette[1]} />
      {Array.from({ length: 6 }, (_, index) => {
        const x = between(random, -2, 30);
        const y = between(random, -2, 30);
        return (
          <line
            key={index}
            x1={n(x)}
            y1={n(y)}
            x2={n(x + between(random, -10, 10))}
            y2={n(y + between(random, -10, 10))}
            stroke={choose(random, [palette[0], palette[2], palette[3]])}
            strokeWidth={n(between(random, 2.5, 5))}
            strokeLinecap="round"
          />
        );
      })}
      {Array.from({ length: 8 }, (_, index) => (
        <circle
          key={`splat-${index}`}
          cx={n(between(random, 0, 32))}
          cy={n(between(random, 0, 32))}
          r={n(between(random, 0.6, 1.6))}
          fill={palette[3]}
        />
      ))}
    </>
  ),
  solid: (palette) => (
    <>
      <rect width={SIZE} height={SIZE} fill={palette[1]} />
      {Array.from({ length: 9 }, (_, index) => (
        <line
          key={index}
          x1={index * 5 - 8}
          y1={33}
          x2={index * 5 + 8}
          y2={-1}
          stroke={palette[2]}
          strokeWidth={0.8}
          opacity={0.5}
        />
      ))}
      <rect x={0} y={0} width={SIZE} height={6} fill={palette[3]} opacity={0.25} />
    </>
  ),
};

const METALS = {
  gold: { base: "#a87a22", light: "#e8c25a", shine: "#f8e6a8", dark: "#6e4e12" },
  platinum: { base: "#7f888d", light: "#c9d0d4", shine: "#f3f5f6", dark: "#4b5357" },
} as const;

function MetalSwatch({ metal }: { metal: keyof typeof METALS }) {
  const colors = METALS[metal];
  return (
    <>
      <rect width={SIZE} height={SIZE} fill={colors.base} />
      <path d="M-4 22 L22 -4 L30 -4 L-4 30 Z" fill={colors.light} />
      <path d="M6 36 L36 6 L36 12 L12 36 Z" fill={colors.light} opacity={0.7} />
      <path d="M-4 14 L14 -4 L17 -4 L-4 17 Z" fill={colors.shine} />
      <path d="M20 36 L36 20 L36 26 L26 36 Z" fill={colors.dark} opacity={0.6} />
      <rect
        x={1}
        y={1}
        width={30}
        height={30}
        fill="none"
        stroke={colors.dark}
        strokeWidth={1}
        opacity={0.6}
      />
    </>
  );
}

function HarmonicBreakSwatch() {
  const wave = "M-2 16 L4 9 L8 22 L13 6 L18 25 L23 10 L27 20 L34 14";
  return (
    <>
      <rect width={SIZE} height={SIZE} fill="#16131d" />
      <path d={wave} fill="none" stroke="#2fb3a8" strokeWidth={1.6} transform="translate(1.5 2)" />
      <path d={wave} fill="none" stroke="#e0a63a" strokeWidth={1.8} />
      <rect x={0} y={12} width={SIZE} height={1.2} fill="#16131d" />
      <rect x={0} y={19} width={SIZE} height={0.8} fill="#16131d" />
    </>
  );
}

function DivergenceSwatch() {
  return (
    <>
      <rect width={SIZE} height={SIZE} fill="#0d2833" />
      <path d="M32 0 L32 32 L0 32 Z" fill="#2a0f2d" />
      {[6, 11, 16].map((radius) => (
        <circle
          key={radius}
          cx={16}
          cy={16}
          r={radius}
          fill="none"
          stroke={radius === 11 ? "#e7d27a" : "#58c4c9"}
          strokeWidth={radius === 11 ? 1.4 : 0.8}
          opacity={radius === 11 ? 1 : 0.7}
        />
      ))}
      <path d="M0 32 L32 0" stroke="#e7d27a" strokeWidth={1.2} />
    </>
  );
}

function MilitarySwatch({ index }: { index: number }) {
  const random = createRandom(hashString(`military-${index}`));
  return (
    <>
      {PATTERN_RENDERERS.woodland(OLIVE_PALETTE, random)}
      <rect x={17} y={19} width={14} height={12} rx={1.5} fill="#15170f" opacity={0.85} />
      <text
        x={24}
        y={28.5}
        textAnchor="middle"
        fontSize={10}
        fontFamily="var(--font-hud), monospace"
        fill="#e8dcae"
      >
        {index}
      </text>
    </>
  );
}

/** Small, original camo swatch (decorative: the owning control carries the label). */
export function CamoIcon({ name, variant = "named", index = 1, className }: CamoIconProps) {
  let content: ReactNode;
  if (variant === "gold" || variant === "platinum") content = <MetalSwatch metal={variant} />;
  else if (variant === "harmonic_break") content = <HarmonicBreakSwatch />;
  else if (variant === "divergence") content = <DivergenceSwatch />;
  else if (variant === "military") content = <MilitarySwatch index={index} />;
  else {
    const art = getCamoArt(name);
    content = PATTERN_RENDERERS[art.pattern](art.palette, createRandom(art.seed));
  }

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden
      focusable="false"
      className={cn("shrink-0 overflow-hidden rounded-[3px]", className)}
    >
      {content}
    </svg>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { FormatChamber } from "../types";
import { FileTypeDefinition } from "../formatRegistry";

interface RevolverMenuProps {
  fileName: string;
  filePath?: string;
  fileInfo: FileTypeDefinition;
  onSelectFormat: (format: string) => void;
  onCancel: () => void;
  isSimulated?: boolean;
  externalActiveIndex?: number | null;
}

// Generates mathematically exact Tangerine petals with CONSTANT STRAIGHT GAP (non-tapering) and proportional corners
function createTangerinePetalPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  alpha1Deg: number,
  alpha2Deg: number,
  gapPx: number,
  R_co: number,
  R_ci: number
): string {
  const toRad = Math.PI / 180;
  const d = gapPx / 2;

  const a1 = alpha1Deg * toRad;
  const a2 = alpha2Deg * toRad;

  // Unit vectors and normals for the divider rays
  const u1x = Math.cos(a1), u1y = Math.sin(a1);
  const n1x = -Math.sin(a1), n1y = Math.cos(a1); // Points into petal on side 1

  const u2x = Math.cos(a2), u2y = Math.sin(a2);
  const n2x = Math.sin(a2), n2y = -Math.cos(a2); // Points into petal on side 2

  // Angular offsets corresponding to the constant perpendicular shift d
  const dThetaOut = Math.asin(Math.min(0.85, d / rOuter));
  const dThetaIn = Math.asin(Math.min(0.85, d / rInner));

  // Corner fillet angular allocations
  const dPhiOut = Math.min((a2 - a1) / 3.8, R_co / rOuter);
  const dPhiIn = Math.min((a2 - a1) / 4.5, R_ci / rInner);

  // 1. Straight side 1 start (just after inner corner)
  const t1_start = rInner + R_ci;
  const p1x = cx + t1_start * u1x + d * n1x;
  const p1y = cy + t1_start * u1y + d * n1y;

  // 2. Straight side 1 end (just before outer corner)
  const t1_end = rOuter - R_co;
  const p2x = cx + t1_end * u1x + d * n1x;
  const p2y = cy + t1_end * u1y + d * n1y;

  // 3. Meeting point on outer circular arc for outer corner 1
  const angOut1 = a1 + dThetaOut + dPhiOut;
  const p3x = cx + rOuter * Math.cos(angOut1);
  const p3y = cy + rOuter * Math.sin(angOut1);

  // 4. Meeting point on outer circular arc for outer corner 2
  const angOut2 = a2 - dThetaOut - dPhiOut;
  const p4x = cx + rOuter * Math.cos(angOut2);
  const p4y = cy + rOuter * Math.sin(angOut2);

  // 5. Straight side 2 start (just after outer corner 2)
  const t2_start = rOuter - R_co;
  const p5x = cx + t2_start * u2x + d * n2x;
  const p5y = cy + t2_start * u2y + d * n2y;

  // 6. Straight side 2 end (just before inner corner 2)
  const t2_end = rInner + R_ci;
  const p6x = cx + t2_end * u2x + d * n2x;
  const p6y = cy + t2_end * u2y + d * n2y;

  // 7. Meeting point on inner circular arc for inner corner 2
  const angIn2 = a2 - dThetaIn - dPhiIn;
  const p7x = cx + rInner * Math.cos(angIn2);
  const p7y = cy + rInner * Math.sin(angIn2);

  // 8. Meeting point on inner circular arc for inner corner 1
  const angIn1 = a1 + dThetaIn + dPhiIn;
  const p8x = cx + rInner * Math.cos(angIn1);
  const p8y = cy + rInner * Math.sin(angIn1);

  const fmt = (n: number) => n.toFixed(2);

  return (
    `M ${fmt(p1x)} ${fmt(p1y)} ` +
    `L ${fmt(p2x)} ${fmt(p2y)} ` +
    `A ${R_co} ${R_co} 0 0 1 ${fmt(p3x)} ${fmt(p3y)} ` +
    `A ${rOuter} ${rOuter} 0 0 1 ${fmt(p4x)} ${fmt(p4y)} ` +
    `A ${R_co} ${R_co} 0 0 1 ${fmt(p5x)} ${fmt(p5y)} ` +
    `L ${fmt(p6x)} ${fmt(p6y)} ` +
    `A ${R_ci} ${R_ci} 0 0 1 ${fmt(p7x)} ${fmt(p7y)} ` +
    `A ${rInner} ${rInner} 0 0 0 ${fmt(p8x)} ${fmt(p8y)} ` +
    `A ${R_ci} ${R_ci} 0 0 1 ${fmt(p1x)} ${fmt(p1y)} Z`
  );
}

export const RevolverMenu: React.FC<RevolverMenuProps> = ({
  fileName,
  fileInfo,
  onSelectFormat,
  onCancel,
  externalActiveIndex,
}) => {
  const chambers = fileInfo.targetChambers;
  const count = chambers.length;
  const ext = fileName.split(".").pop()?.toUpperCase() || "FILE";

  // Find recommended default format (webp if present, otherwise index 0)
  const defaultIdx = chambers.findIndex((c) => c.format.toLowerCase() === "webp");
  const initialIndex = defaultIdx !== -1 ? defaultIdx : 0;
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<number | null>(initialIndex);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeIndex =
    externalActiveIndex !== undefined && externalActiveIndex !== null
      ? externalActiveIndex
      : (internalHoveredIndex !== null ? internalHoveredIndex : initialIndex);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }

      // Check number keys 1..9 for direct shortcut
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= chambers.length) {
        onSelectFormat(chambers[keyNum - 1].format);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, chambers, onSelectFormat]);

  // Smooth circular tracking over the wheel container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Active detection zone: from center hub edge (32px) out to wheel perimeter (172px)
    if (dist >= 32 && dist <= 172) {
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180 to 180
      const normalized = ((angle + 90) % 360 + 360) % 360; // 0 at 12 o'clock
      const slice = 360 / count;
      const idx = Math.floor((normalized + slice / 2) / slice) % count;
      setInternalHoveredIndex(idx);
    }
  };

  const handleMouseLeave = () => {
    // Keep last hovered selection active for seamless tactile feel
  };

  // Dimensions in SVG coordinate space (360 x 360)
  const svgSize = 360;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const rOuter = 144;    // Petals outer boundary
  const rBaseDisc = 154; // Balanced circular platter disc with ~10px clean margin
  const rInner = 52;     // Petals inner boundary
  const textRadius = (rInner + rOuter) / 2;
  const sliceDeg = 360 / count;
  const gapPx = 3.5;            // Exact constant 3.5px gap width from outer to inner (parallel, no tapering)
  const cornerRadiusOuter = 13; // Pillowy rounded outer corners
  const cornerRadiusInner = 5;  // Subtle, proportional inner corners (not overly curved)

  const currentChamber = activeIndex !== null && chambers[activeIndex] ? chambers[activeIndex] : chambers[initialIndex];

  return (
    <div className={`tangerine-overlay ${mounted ? "is-open" : ""}`}>
      {/* Invisible backdrop to dismiss on click outside */}
      <div className="tangerine-backdrop" onClick={onCancel} />

      <div className="tangerine-radial-stage">
        {/* Wheel with Circular Platter Base */}
        <div
          ref={containerRef}
          className="tangerine-wheel-container"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <svg
            className="tangerine-wheel-svg"
            viewBox={`0 0 ${svgSize} ${svgSize}`}
          >
            <defs>
              {/* Circular Base Disc Gradient (Soft Clay Platter) */}
              <linearGradient id="baseDiscGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f5f8fa" />
                <stop offset="45%" stopColor="#ebf0f5" />
                <stop offset="100%" stopColor="#dce4ed" />
              </linearGradient>

              {/* Vibrant Tangerine Orange Gradient */}
              <linearGradient id="tangerineOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff5900" />
                <stop offset="100%" stopColor="#eb3e00" />
              </linearGradient>

              {/* Inactive Tactile Clay Gradient */}
              <linearGradient id="tangerineClay" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#edf2f7" />
              </linearGradient>
            </defs>

            {/* 1. Snug Circular Base Disc behind all petals */}
            <circle
              cx={cx}
              cy={cy}
              r={rBaseDisc}
              fill="url(#baseDiscGrad)"
              stroke="#cfd8e3"
              strokeWidth="1.5"
              className="base-disc-shape"
            />
            {/* Subtle inner rim highlight for tactile depth */}
            <circle
              cx={cx}
              cy={cy}
              r={rBaseDisc - 1.5}
              fill="none"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="1"
            />

            {/* 2. Segmented Petals sitting on top of base disc */}
            {chambers.map((chamber: FormatChamber, index: number) => {
              const midAngle = -90 + index * sliceDeg;
              const alpha1 = midAngle - sliceDeg / 2;
              const alpha2 = midAngle + sliceDeg / 2;

              const pathData = createTangerinePetalPath(
                cx,
                cy,
                rInner,
                rOuter,
                alpha1,
                alpha2,
                gapPx,
                cornerRadiusOuter,
                cornerRadiusInner
              );

              const isActive = activeIndex === index;
              const textX = cx + textRadius * Math.cos((midAngle * Math.PI) / 180);
              const textY = cy + textRadius * Math.sin((midAngle * Math.PI) / 180);

              return (
                <g
                  key={chamber.format}
                  className={`tangerine-petal ${isActive ? "is-active" : ""}`}
                  onClick={() => onSelectFormat(chamber.format)}
                  onMouseEnter={() => setInternalHoveredIndex(index)}
                >
                  <path
                    d={pathData}
                    className="petal-path"
                    fill={isActive ? "url(#tangerineOrange)" : "url(#tangerineClay)"}
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="petal-label"
                  >
                    {chamber.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* 3. Center Stadium Capsule Pill (e.g. WEBP) */}
          <div className="tangerine-center-hub">
            <span className="hub-format-active">
              {currentChamber ? currentChamber.label : ext}
            </span>
          </div>
        </div>

        {/* Dynamic Action Status below the wheel */}
        <div className="tangerine-status-row">
          <span className={`tangerine-status-text ${currentChamber ? "has-target" : ""}`}>
            {currentChamber ? `Convert to ${currentChamber.label}` : "Pilih format"}
          </span>
        </div>
      </div>
    </div>
  );
};

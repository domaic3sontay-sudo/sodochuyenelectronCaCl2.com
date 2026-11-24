import React from 'react';
import {
  AtomGeometry,
  CL_RADII,
  DiagramStage,
  polarPoint,
  SpeciesId,
} from '../chemistry/cacl2Model';

interface AtomSvgGroupProps {
  atom: AtomGeometry;
  stage: DiagramStage;
  transferProgress: number;
  showShellLabels: boolean;
  highlightTransfer: boolean;
  showBrackets: boolean;
  isSelected: boolean;
  onSelect?: (id: SpeciesId) => void;
  hideMovingValenceOnCa?: boolean;
}

export const AtomSvgGroup: React.FC<AtomSvgGroupProps> = ({
  atom,
  stage,
  transferProgress,
  showShellLabels,
  highlightTransfer,
  showBrackets,
  isSelected,
  onSelect,
  hideMovingValenceOnCa = false,
}) => {
  const isCa = atom.id === 'ca';
  const isIon = stage === 'ions';
  const accentColor = isCa ? '#0284C7' : '#0D9488';
  const nucleusFill = isCa ? '#E0F2FE' : '#CCFBF1';
  const nucleusStroke = isCa ? '#0284C7' : '#0D9488';
  const nucleusTextColor = isCa ? '#075985' : '#115E59';
  const transferColor = highlightTransfer ? '#EA580C' : '#0F172A';

  // Vacant slot for neutral Cl atoms facing Ca
  const vacantSlotDeg = atom.id === 'cl-left' ? 0 : 180;
  const vacantSlotPt = !isCa && !isIon ? polarPoint(atom.cx, atom.cy, CL_RADII.shells[2], vacantSlotDeg) : null;

  // Bracket coordinates when in ion stage
  const bxLeft = atom.cx - atom.bracketHalfWidth;
  const bxRight = atom.cx + atom.bracketHalfWidth;
  const byTop = atom.cy - atom.bracketHalfHeight;
  const byBottom = atom.cy + atom.bracketHalfHeight;
  const bracketArm = 13;

  const shellConfigText = atom.shells.map((s) => s.electronCount).join(', ');
  const mainCaption = isIon
    ? isCa
      ? 'Ion Ca²⁺ (điện tích 2+)'
      : 'Ion Cl⁻ (điện tích 1−)'
    : isCa
      ? 'Nguyên tử Ca (Z = 20)'
      : 'Nguyên tử Cl (Z = 17)';
  const subCaption = isIon
    ? `Z = ${atom.atomicNumber} · Lớp e: ${shellConfigText}`
    : `Lớp e: ${shellConfigText}`;

  return (
    <g
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={atom.nameVi}
      onClick={onSelect ? () => onSelect(atom.id) : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(atom.id);
              }
            }
          : undefined
      }
      className={onSelect ? 'cursor-pointer focus:outline-none' : undefined}
    >
      {/* Subtle selection highlight hugging the outermost shell (never crosses brackets/arrows) */}
      {isSelected && (
        <circle
          cx={atom.cx}
          cy={atom.cy}
          r={atom.shells[atom.shells.length - 1].radius}
          fill={accentColor}
          fillOpacity={0.04}
          stroke={accentColor}
          strokeWidth={2}
          strokeOpacity={0.35}
        />
      )}

      {/* Concentric electron shells */}
      {atom.shells.map((shell) => {
        const isCaOuterLosing = isCa && shell.shellNumber === 4 && stage === 'transfer';
        const shellOpacity = isCaOuterLosing ? Math.max(0.18, 1 - transferProgress * 0.82) : 1;
        const isOutermost = shell.shellNumber === atom.shells.length;

        // Place shell label in guaranteed electron-free gap for each shell
        const labelAngleByShell: Record<number, number> = {
          1: 125, // K (electrons at -90, 90)
          2: 90, // L (electrons at 67.5, 112.5)
          3: 112.5, // M (electrons at 90, 135)
          4: 90, // N (electrons at 0, 180)
        };
        const labelPt = polarPoint(
          atom.cx,
          atom.cy,
          shell.radius,
          labelAngleByShell[shell.shellNumber] ?? 90
        );

        return (
          <g key={`${atom.id}-shell-${shell.shellNumber}`} opacity={shellOpacity}>
            <circle
              cx={atom.cx}
              cy={atom.cy}
              r={shell.radius}
              fill="none"
              stroke={isOutermost ? '#64748B' : '#94A3B8'}
              strokeWidth={isOutermost ? 1.5 : 1.2}
              strokeDasharray={isCaOuterLosing ? '4 4' : undefined}
            />

            {/* Optional shell ring label (K, L, M, N) positioned away from all dots */}
            {showShellLabels && (
              <g>
                <rect
                  x={labelPt.x - 7.5}
                  y={labelPt.y - 6.5}
                  width={15}
                  height={13}
                  rx={3}
                  fill="#FFFFFF"
                />
                <text
                  x={labelPt.x}
                  y={labelPt.y + 3.5}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="IBM Plex Mono, monospace"
                  fill="#475569"
                >
                  {shell.label}
                </text>
              </g>
            )}

            {/* Electron dots on this shell */}
            {shell.electrons.map((el) => {
              if (hideMovingValenceOnCa && el.role === 'valence-transfer') {
                return null;
              }
              const isTransferred = el.role === 'valence-transfer' || el.role === 'valence-received';
              const dotFill = isTransferred ? transferColor : isCa ? '#0F172A' : '#134E4A';

              return (
                <g key={el.id}>
                  {isTransferred && highlightTransfer && (
                    <circle
                      cx={el.x}
                      cy={el.y}
                      r={8.5}
                      fill="#FFEDD5"
                      stroke="#EA580C"
                      strokeWidth={1.2}
                    />
                  )}
                  <circle
                    cx={el.x}
                    cy={el.y}
                    r={4.6}
                    fill={dotFill}
                    stroke="#FFFFFF"
                    strokeWidth={1.6}
                  />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Vacant slot marker on neutral Cl outer shell */}
      {vacantSlotPt && (
        <g>
          <circle
            cx={vacantSlotPt.x}
            cy={vacantSlotPt.y}
            r={5.5}
            fill="#FFF7ED"
            stroke="#EA580C"
            strokeWidth={1.4}
            strokeDasharray="2.5 2.5"
          />
        </g>
      )}

      {/* Innermost circle: Nucleus (+20 or +17) */}
      <circle
        cx={atom.cx}
        cy={atom.cy}
        r={atom.nucleusRadius}
        fill={nucleusFill}
        stroke={nucleusStroke}
        strokeWidth={2}
      />
      <text
        x={atom.cx}
        y={atom.cy + 5}
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fontFamily="IBM Plex Mono, monospace"
        fill={nucleusTextColor}
      >
        {atom.nucleusLabel}
      </text>

      {/* Ion square brackets and charge superscript (2+ or 1-) */}
      {isIon && showBrackets && (
        <g>
          {/* Left bracket [ */}
          <path
            d={`M ${bxLeft + bracketArm} ${byTop} L ${bxLeft} ${byTop} L ${bxLeft} ${byBottom} L ${
              bxLeft + bracketArm
            } ${byBottom}`}
            fill="none"
            stroke="#334155"
            strokeWidth={2}
            strokeLinecap="square"
          />
          {/* Right bracket ] */}
          <path
            d={`M ${bxRight - bracketArm} ${byTop} L ${bxRight} ${byTop} L ${bxRight} ${byBottom} L ${
              bxRight - bracketArm
            } ${byBottom}`}
            fill="none"
            stroke="#334155"
            strokeWidth={2}
            strokeLinecap="square"
          />
          {/* Charge label */}
          <text
            x={bxRight + 8}
            y={byTop + 10}
            textAnchor="start"
            fontSize="18"
            fontWeight="700"
            fontFamily="IBM Plex Mono, monospace"
            fill={isCa ? '#0284C7' : '#0D9488'}
          >
            {atom.chargeLabel}
          </text>
        </g>
      )}

      {/* Charge label even if brackets hidden in ion stage */}
      {isIon && !showBrackets && (
        <text
          x={atom.cx + (isCa ? 96 : 92)}
          y={atom.cy - 82}
          textAnchor="start"
          fontSize="18"
          fontWeight="700"
          fontFamily="IBM Plex Mono, monospace"
          fill={isCa ? '#0284C7' : '#0D9488'}
        >
          {atom.chargeLabel}
        </text>
      )}

      {/* Bottom Caption */}
      <text
        x={atom.cx}
        y={atom.cy + 136}
        textAnchor="middle"
        fontSize="13.5"
        fontWeight="700"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fill="#0F172A"
      >
        {mainCaption}
      </text>
      <text
        x={atom.cx}
        y={atom.cy + 155}
        textAnchor="middle"
        fontSize="11.5"
        fontWeight="500"
        fontFamily="IBM Plex Mono, monospace"
        fill="#475569"
      >
        {subCaption}
      </text>
    </g>
  );
};

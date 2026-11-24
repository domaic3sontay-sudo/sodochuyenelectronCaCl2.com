import React from 'react';
import {
  buildSpeciesGeometry,
  computeTransferArcs,
  SpeciesId,
} from '../chemistry/cacl2Model';
import { AtomSvgGroup } from './AtomSvgGroup';

interface FullPosterDiagramProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  showShellLabels: boolean;
  highlightTransfer: boolean;
  showBrackets: boolean;
  selectedSpecies: SpeciesId;
  onSelectSpecies: (id: SpeciesId) => void;
}

export const FullPosterDiagram: React.FC<FullPosterDiagramProps> = ({
  svgRef,
  showShellLabels,
  highlightTransfer,
  showBrackets,
  selectedSpecies,
  onSelectSpecies,
}) => {
  const topCenters = {
    'cl-left': { x: 175, y: 195 },
    ca: { x: 480, y: 195 },
    'cl-right': { x: 785, y: 195 },
  };

  const bottomCenters = {
    'cl-left': { x: 175, y: 585 },
    ca: { x: 480, y: 585 },
    'cl-right': { x: 785, y: 585 },
  };

  const clLeftAtom = buildSpeciesGeometry('cl-left', 'atoms', 0, topCenters['cl-left']);
  const caAtom = buildSpeciesGeometry('ca', 'atoms', 0, topCenters.ca);
  const clRightAtom = buildSpeciesGeometry('cl-right', 'atoms', 0, topCenters['cl-right']);

  const clLeftIon = buildSpeciesGeometry('cl-left', 'ions', 1, bottomCenters['cl-left']);
  const caIon = buildSpeciesGeometry('ca', 'ions', 1, bottomCenters.ca);
  const clRightIon = buildSpeciesGeometry('cl-right', 'ions', 1, bottomCenters['cl-right']);

  const topArcs = computeTransferArcs(0, topCenters);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      <svg
        ref={svgRef}
        data-testid="full-poster-svg"
        viewBox="0 0 960 790"
        className="h-auto w-full select-none"
        role="img"
        aria-label="Sơ đồ tổng quan quá trình chuyển electron giữa nguyên tử Ca (Z=20) và hai nguyên tử Cl (Z=17)"
      >
        <defs>
          <pattern id="poster-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#F8FAFC" strokeWidth="1" />
          </pattern>
          <marker
            id="poster-arrow-transfer"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#EA580C" />
          </marker>
          <marker
            id="poster-arrow-down"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#0F172A" />
          </marker>
        </defs>

        <rect width={960} height={790} fill="#FFFFFF" />
        <rect width={960} height={790} fill="url(#poster-grid)" />

        {/* Poster Title */}
        <text
          x={480}
          y={34}
          textAnchor="middle"
          fontSize="16"
          fontWeight="700"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fill="#0F172A"
        >
          SƠ ĐỒ CHUYỂN ELECTRON HÌNH THÀNH LIÊN KẾT ION CaCl₂
        </text>
        <text
          x={480}
          y={55}
          textAnchor="middle"
          fontSize="12"
          fontWeight="500"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fill="#475569"
        >
          1. Nguyên tử Ca (Z = 20) nhường 2 electron cho 2 nguyên tử Cl (Z = 17)
        </text>

        {/* Top row: Neutral atoms + curved transfer arrows */}
        <AtomSvgGroup
          atom={clLeftAtom}
          stage="atoms"
          transferProgress={0}
          showShellLabels={showShellLabels}
          highlightTransfer={highlightTransfer}
          showBrackets={showBrackets}
          isSelected={selectedSpecies === 'cl-left'}
          onSelect={onSelectSpecies}
        />
        <AtomSvgGroup
          atom={caAtom}
          stage="atoms"
          transferProgress={0}
          showShellLabels={showShellLabels}
          highlightTransfer={highlightTransfer}
          showBrackets={showBrackets}
          isSelected={selectedSpecies === 'ca'}
          onSelect={onSelectSpecies}
        />
        <AtomSvgGroup
          atom={clRightAtom}
          stage="atoms"
          transferProgress={0}
          showShellLabels={showShellLabels}
          highlightTransfer={highlightTransfer}
          showBrackets={showBrackets}
          isSelected={selectedSpecies === 'cl-right'}
          onSelect={onSelectSpecies}
        />

        {/* Transfer arrows on top row */}
        {topArcs.map((arc) => {
          const pathD = `M ${arc.from.x} ${arc.from.y} Q ${arc.control.x} ${arc.control.y} ${arc.to.x} ${arc.to.y}`;
          return (
            <g key={`poster-arc-${arc.id}`}>
              <path
                d={pathD}
                fill="none"
                stroke="#EA580C"
                strokeWidth={2.2}
                markerEnd="url(#poster-arrow-transfer)"
              />
              <rect
                x={arc.control.x - 34}
                y={114}
                width={68}
                height={19}
                rx={4}
                fill="#FFF7ED"
                stroke="#FDBA74"
                strokeWidth={1}
              />
              <text
                x={arc.control.x}
                y={127}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fill="#C2410C"
              >
                Nhường 1e
              </text>
            </g>
          );
        })}

        {/* Transition divider & reaction arrow with clean vertical clearance */}
        <line x1={56} y1={374} x2={904} y2={374} stroke="#E2E8F0" strokeWidth={1} />
        <line
          x1={480}
          y1={382}
          x2={480}
          y2={414}
          stroke="#0F172A"
          strokeWidth={2}
          markerEnd="url(#poster-arrow-down)"
        />
        <text
          x={480}
          y={440}
          textAnchor="middle"
          fontSize="12.5"
          fontWeight="600"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fill="#0F172A"
        >
          2. Tạo thành ion Ca²⁺ (đặt giữa) và 2 ion Cl⁻ (hai bên)
        </text>

        {/* Bottom row: Resulting Ions (Cl- left, Ca2+ center, Cl- right) */}
        <AtomSvgGroup
          atom={clLeftIon}
          stage="ions"
          transferProgress={1}
          showShellLabels={showShellLabels}
          highlightTransfer={highlightTransfer}
          showBrackets={showBrackets}
          isSelected={selectedSpecies === 'cl-left'}
          onSelect={onSelectSpecies}
        />
        <AtomSvgGroup
          atom={caIon}
          stage="ions"
          transferProgress={1}
          showShellLabels={showShellLabels}
          highlightTransfer={highlightTransfer}
          showBrackets={showBrackets}
          isSelected={selectedSpecies === 'ca'}
          onSelect={onSelectSpecies}
        />
        <AtomSvgGroup
          atom={clRightIon}
          stage="ions"
          transferProgress={1}
          showShellLabels={showShellLabels}
          highlightTransfer={highlightTransfer}
          showBrackets={showBrackets}
          isSelected={selectedSpecies === 'cl-right'}
          onSelect={onSelectSpecies}
        />

        {/* Electrostatic attraction lines in bottom row */}
        <line x1={296} y1={585} x2={364} y2={585} stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" />
        <line x1={596} y1={585} x2={664} y2={585} stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" />

        {/* Summary footer equation inside poster */}
        <text
          x={480}
          y={770}
          textAnchor="middle"
          fontSize="12.5"
          fontWeight="600"
          fontFamily="IBM Plex Mono, monospace"
          fill="#334155"
        >
          Ca (2, 8, 8, 2) + 2 Cl (2, 8, 7) → Ca²⁺ (2, 8, 8) + 2 Cl⁻ (2, 8, 8) → CaCl₂
        </text>
      </svg>
    </div>
  );
};

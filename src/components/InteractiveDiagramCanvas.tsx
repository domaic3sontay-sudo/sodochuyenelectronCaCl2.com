import React from 'react';
import {
  buildSpeciesGeometry,
  computeTransferArcs,
  DiagramStage,
  SpeciesId,
  STAGE_CANVAS,
} from '../chemistry/cacl2Model';
import { AtomSvgGroup } from './AtomSvgGroup';

interface InteractiveDiagramCanvasProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  stage: DiagramStage;
  transferProgress: number;
  showShellLabels: boolean;
  highlightTransfer: boolean;
  showBrackets: boolean;
  selectedSpecies: SpeciesId;
  onSelectSpecies: (id: SpeciesId) => void;
}

export const InteractiveDiagramCanvas: React.FC<InteractiveDiagramCanvasProps> = ({
  svgRef,
  stage,
  transferProgress,
  showShellLabels,
  highlightTransfer,
  showBrackets,
  selectedSpecies,
  onSelectSpecies,
}) => {
  const clLeft = buildSpeciesGeometry('cl-left', stage, transferProgress);
  const ca = buildSpeciesGeometry('ca', stage, transferProgress);
  const clRight = buildSpeciesGeometry('cl-right', stage, transferProgress);
  const arcs = computeTransferArcs(transferProgress);

  const showArrows = stage === 'transfer';

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      <svg
        ref={svgRef}
        data-testid="interactive-diagram-svg"
        viewBox={`0 0 ${STAGE_CANVAS.width} ${STAGE_CANVAS.height}`}
        className="h-auto w-full select-none"
        role="img"
        aria-label="Sơ đồ chuyển electron giữa nguyên tử Ca (Z=20) và hai nguyên tử Cl (Z=17)"
      >
        <defs>
          <pattern id="lab-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#F1F5F9" strokeWidth="1" />
          </pattern>
          <marker
            id="arrow-transfer"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#EA580C" />
          </marker>
        </defs>

        {/* Clean subtle blueprint grid */}
        <rect width={STAGE_CANVAS.width} height={STAGE_CANVAS.height} fill="#FFFFFF" />
        <rect width={STAGE_CANVAS.width} height={STAGE_CANVAS.height} fill="url(#lab-grid)" />

        {/* Stage top banner inside SVG so exported PNG/SVG is self-contained */}
        <text
          x={STAGE_CANVAS.width / 2}
          y={28}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fill="#334155"
        >
          {stage === 'atoms'
            ? 'Giai đoạn 1: Các nguyên tử Cl (Z = 17) và Ca (Z = 20) trước khi chuyển electron'
            : stage === 'transfer'
              ? 'Giai đoạn 2: Nguyên tử Ca nhường 2 electron lớp ngoài cùng cho 2 nguyên tử Cl'
              : 'Giai đoạn 3: Ion Ca²⁺ (giữa) và 2 ion Cl⁻ (hai bên) tạo thành liên kết ion CaCl₂'}
        </text>

        {/* Three species: Cl (left), Ca (center), Cl (right) */}
        <AtomSvgGroup
          atom={clLeft}
          stage={stage}
          transferProgress={transferProgress}
          showShellLabels={showShellLabels}
          highlightTransfer={highlightTransfer}
          showBrackets={showBrackets}
          isSelected={selectedSpecies === 'cl-left'}
          onSelect={onSelectSpecies}
        />

        <AtomSvgGroup
          atom={ca}
          stage={stage}
          transferProgress={transferProgress}
          showShellLabels={showShellLabels}
          highlightTransfer={highlightTransfer}
          showBrackets={showBrackets}
          isSelected={selectedSpecies === 'ca'}
          onSelect={onSelectSpecies}
          hideMovingValenceOnCa={showArrows}
        />

        <AtomSvgGroup
          atom={clRight}
          stage={stage}
          transferProgress={transferProgress}
          showShellLabels={showShellLabels}
          highlightTransfer={highlightTransfer}
          showBrackets={showBrackets}
          isSelected={selectedSpecies === 'cl-right'}
          onSelect={onSelectSpecies}
        />

        {/* Electrostatic attraction indicators in ion stage */}
        {stage === 'ions' && (
          <g opacity={0.7}>
            <line
              x1={296}
              y1={185}
              x2={364}
              y2={185}
              stroke="#64748B"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <text
              x={330}
              y={174}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="600"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fill="#475569"
            >
              Hút tĩnh điện
            </text>

            <line
              x1={596}
              y1={185}
              x2={664}
              y2={185}
              stroke="#64748B"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <text
              x={630}
              y={174}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="600"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fill="#475569"
            >
              Hút tĩnh điện
            </text>
          </g>
        )}

        {/* Curved transfer arrows and moving electron dots during transfer stage */}
        {showArrows && (
          <g>
            {arcs.map((arc) => {
              const labelX = arc.control.x;
              const labelY = 122;
              const pathD = `M ${arc.from.x} ${arc.from.y} Q ${arc.control.x} ${arc.control.y} ${arc.to.x} ${arc.to.y}`;
              return (
                <g key={arc.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#EA580C"
                    strokeWidth={2.2}
                    strokeDasharray="6 4"
                    markerEnd="url(#arrow-transfer)"
                  />
                  <rect
                    x={labelX - 34}
                    y={labelY - 13}
                    width={68}
                    height={19}
                    rx={4}
                    fill="#FFF7ED"
                    stroke="#FDBA74"
                    strokeWidth={1}
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    fill="#C2410C"
                  >
                    Nhường 1e
                  </text>

                  {/* Animated electron dot along the Bezier path */}
                  <circle
                    cx={arc.currentPos.x}
                    cy={arc.currentPos.y}
                    r={9.5}
                    fill="#FFEDD5"
                    stroke="#EA580C"
                    strokeWidth={1.5}
                    opacity={0.9}
                  />
                  <circle
                    cx={arc.currentPos.x}
                    cy={arc.currentPos.y}
                    r={5}
                    fill="#EA580C"
                    stroke="#FFFFFF"
                    strokeWidth={1.6}
                  />
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
};

export type DiagramStage = 'atoms' | 'transfer' | 'ions';

export type SpeciesId = 'cl-left' | 'ca' | 'cl-right';

export interface ShellSpec {
  shellNumber: number; // 1-based counting from nucleus outward (Vòng tròn thứ 2 = electron shell 1, etc.)
  ringIndex: number; // Ring index as described: 1 = nucleus, 2 = K, 3 = L, 4 = M, 5 = N
  label: string; // K, L, M, N
  radius: number;
  electronCount: number;
  electrons: ElectronPoint[];
}

export interface ElectronPoint {
  id: string;
  angleDeg: number;
  x: number;
  y: number;
  role: 'core' | 'valence-stay' | 'valence-transfer' | 'valence-received';
}

export interface AtomGeometry {
  id: SpeciesId;
  symbol: string;
  ionSymbol: string;
  nameVi: string;
  atomicNumber: number;
  nucleusLabel: string;
  nucleusRadius: number;
  cx: number;
  cy: number;
  shells: ShellSpec[];
  totalElectrons: number;
  chargeLabel: string;
  chargeValue: number;
  bracketHalfWidth: number;
  bracketHalfHeight: number;
}

export interface TransferArcSpec {
  id: 'left' | 'right';
  from: { x: number; y: number };
  to: { x: number; y: number };
  control: { x: number; y: number };
  currentPos: { x: number; y: number };
}

export const STAGE_CANVAS = {
  width: 960,
  height: 380,
  centers: {
    'cl-left': { x: 175, y: 185 },
    ca: { x: 480, y: 185 },
    'cl-right': { x: 785, y: 185 },
  },
} as const;

export const CA_RADII = {
  nucleus: 23,
  shells: [44, 66, 88, 110] as const,
};

export const CL_RADII = {
  nucleus: 21,
  shells: [42, 64, 86] as const,
};

const SHELL_LETTERS = ['K', 'L', 'M', 'N'] as const;

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function polarPoint(cx: number, cy: number, radius: number, angleDeg: number): { x: number; y: number } {
  const rad = degToRad(angleDeg);
  return {
    x: Number((cx + radius * Math.cos(rad)).toFixed(2)),
    y: Number((cy + radius * Math.sin(rad)).toFixed(2)),
  };
}

export function quadraticBezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const clamped = Math.max(0, Math.min(1, t));
  const u = 1 - clamped;
  return {
    x: Number((u * u * p0.x + 2 * u * clamped * p1.x + clamped * clamped * p2.x).toFixed(2)),
    y: Number((u * u * p0.y + 2 * u * clamped * p1.y + clamped * clamped * p2.y).toFixed(2)),
  };
}

function buildEvenAngles(count: number, offsetDeg: number): number[] {
  const step = 360 / count;
  return Array.from({ length: count }, (_, idx) => (offsetDeg + idx * step) % 360);
}

/**
 * Computes exact atomic or ionic geometry for Ca (Z=20) or Cl (Z=17) at a given stage
 * and transfer progress t in [0, 1].
 */
export function buildSpeciesGeometry(
  id: SpeciesId,
  stage: DiagramStage,
  transferProgress = stage === 'ions' ? 1 : 0,
  centerOverride?: { x: number; y: number }
): AtomGeometry {
  const center = centerOverride ?? STAGE_CANVAS.centers[id];
  const progress = stage === 'atoms' ? 0 : stage === 'ions' ? 1 : Math.max(0, Math.min(1, transferProgress));

  if (id === 'ca') {
    const isIon = stage === 'ions';
    const counts = isIon ? [2, 8, 8] : [2, 8, 8, 2];

    const shells: ShellSpec[] = counts.map((count, idx) => {
      const radius = CA_RADII.shells[idx];
      let angles: number[];
      if (idx === 0) {
        // K shell: 2 electrons (top & bottom)
        angles = [-90, 90];
      } else if (idx === 1) {
        // L shell: 8 electrons interleaved
        angles = buildEvenAngles(8, 22.5);
      } else if (idx === 2) {
        // M shell: 8 electrons
        angles = buildEvenAngles(8, 0);
      } else {
        // N shell (outermost of neutral Ca): 2 electrons facing left & right Cl atoms
        angles = [180, 0];
      }

      const electrons: ElectronPoint[] = angles.map((angleDeg, eIdx) => {
        const pt = polarPoint(center.x, center.y, radius, angleDeg);
        const role = idx === 3 ? 'valence-transfer' : 'core';
        return {
          id: `ca-s${idx + 1}-e${eIdx}`,
          angleDeg,
          x: pt.x,
          y: pt.y,
          role,
        };
      });

      return {
        shellNumber: idx + 1,
        ringIndex: idx + 2, // Ring 1 is nucleus (+20)
        label: SHELL_LETTERS[idx],
        radius,
        electronCount: count,
        electrons,
      };
    });

    const totalElectrons = isIon ? 18 : Math.round(20 - 2 * progress);

    return {
      id,
      symbol: 'Ca',
      ionSymbol: 'Ca²⁺',
      nameVi: isIon ? 'Ion Calcium (Ca²⁺)' : 'Nguyên tử Calcium (Ca)',
      atomicNumber: 20,
      nucleusLabel: '+20',
      nucleusRadius: CA_RADII.nucleus,
      cx: center.x,
      cy: center.y,
      shells,
      totalElectrons,
      chargeLabel: isIon ? '2+' : '0',
      chargeValue: isIon ? 2 : 0,
      bracketHalfWidth: 104,
      bracketHalfHeight: 102,
    };
  }

  // Chlorine atom (left or right)
  const isLeft = id === 'cl-left';
  const vacantSlotDeg = isLeft ? 0 : 180;
  const isIon = stage === 'ions';
  const outerAnglesBase = buildEvenAngles(8, 0).filter((deg) => deg !== vacantSlotDeg);

  const counts = isIon ? [2, 8, 8] : [2, 8, 7];

  const shells: ShellSpec[] = counts.map((count, idx) => {
    const radius = CL_RADII.shells[idx];
    let electrons: ElectronPoint[];

    if (idx === 0) {
      electrons = [-90, 90].map((angleDeg, eIdx) => {
        const pt = polarPoint(center.x, center.y, radius, angleDeg);
        return {
          id: `${id}-s1-e${eIdx}`,
          angleDeg,
          x: pt.x,
          y: pt.y,
          role: 'core',
        };
      });
    } else if (idx === 1) {
      electrons = buildEvenAngles(8, 22.5).map((angleDeg, eIdx) => {
        const pt = polarPoint(center.x, center.y, radius, angleDeg);
        return {
          id: `${id}-s2-e${eIdx}`,
          angleDeg,
          x: pt.x,
          y: pt.y,
          role: 'core',
        };
      });
    } else {
      electrons = outerAnglesBase.map((angleDeg, eIdx) => {
        const pt = polarPoint(center.x, center.y, radius, angleDeg);
        return {
          id: `${id}-s3-e${eIdx}`,
          angleDeg,
          x: pt.x,
          y: pt.y,
          role: 'valence-stay',
        };
      });

      if (isIon) {
        const receivedPt = polarPoint(center.x, center.y, radius, vacantSlotDeg);
        electrons.push({
          id: `${id}-s3-received`,
          angleDeg: vacantSlotDeg,
          x: receivedPt.x,
          y: receivedPt.y,
          role: 'valence-received',
        });
      }
    }

    return {
      shellNumber: idx + 1,
      ringIndex: idx + 2, // Ring 1 is nucleus (+17)
      label: SHELL_LETTERS[idx],
      radius,
      electronCount: count,
      electrons,
    };
  });

  const totalElectrons = isIon ? 18 : Math.round(17 + progress);

  return {
    id,
    symbol: 'Cl',
    ionSymbol: 'Cl⁻',
    nameVi: isIon ? 'Ion Chlorine (Cl⁻)' : 'Nguyên tử Chlorine (Cl)',
    atomicNumber: 17,
    nucleusLabel: '+17',
    nucleusRadius: CL_RADII.nucleus,
    cx: center.x,
    cy: center.y,
    shells,
    totalElectrons,
    chargeLabel: isIon ? '1−' : '0',
    chargeValue: isIon ? -1 : 0,
    bracketHalfWidth: 100,
    bracketHalfHeight: 100,
  };
}

/**
 * Computes the curved electron transfer paths and moving electron coordinates
 * from Ca's 4th shell (N) to left Cl's 3rd shell (0 deg) and right Cl's 3rd shell (180 deg).
 */
export function computeTransferArcs(
  transferProgress: number,
  centers: {
    'cl-left': { x: number; y: number };
    ca: { x: number; y: number };
    'cl-right': { x: number; y: number };
  } = STAGE_CANVAS.centers
): TransferArcSpec[] {
  const caLeftElectron = polarPoint(centers.ca.x, centers.ca.y, CA_RADII.shells[3], 180);
  const clLeftTarget = polarPoint(centers['cl-left'].x, centers['cl-left'].y, CL_RADII.shells[2], 0);
  const leftControl = {
    x: Number(((caLeftElectron.x + clLeftTarget.x) / 2).toFixed(2)),
    y: Number((centers.ca.y - 98).toFixed(2)),
  };

  const caRightElectron = polarPoint(centers.ca.x, centers.ca.y, CA_RADII.shells[3], 0);
  const clRightTarget = polarPoint(centers['cl-right'].x, centers['cl-right'].y, CL_RADII.shells[2], 180);
  const rightControl = {
    x: Number(((caRightElectron.x + clRightTarget.x) / 2).toFixed(2)),
    y: Number((centers.ca.y - 98).toFixed(2)),
  };

  return [
    {
      id: 'left',
      from: caLeftElectron,
      to: clLeftTarget,
      control: leftControl,
      currentPos: quadraticBezierPoint(caLeftElectron, leftControl, clLeftTarget, transferProgress),
    },
    {
      id: 'right',
      from: caRightElectron,
      to: clRightTarget,
      control: rightControl,
      currentPos: quadraticBezierPoint(caRightElectron, rightControl, clRightTarget, transferProgress),
    },
  ];
}

export interface StageSummary {
  id: DiagramStage;
  stepNumber: number;
  title: string;
  shortLabel: string;
  equation: string;
  description: string;
  keyTakeaway: string;
}

export const STAGE_SUMMARIES: Record<DiagramStage, StageSummary> = {
  atoms: {
    id: 'atoms',
    stepNumber: 1,
    title: 'Trạng thái các nguyên tử ban đầu',
    shortLabel: '1. Nguyên tử',
    equation: 'Cl (2, 8, 7)  +  Ca (2, 8, 8, 2)  +  Cl (2, 8, 7)',
    description:
      'Nguyên tử Ca (Z = 20) đặt ở giữa có 4 lớp electron (2, 8, 8, 2), lớp ngoài cùng có 2 electron. Hai nguyên tử Cl (Z = 17) hai bên có 3 lớp electron (2, 8, 7), lớp ngoài cùng đều thiếu 1 electron để đạt cấu hình bền vững.',
    keyTakeaway: 'Ca có xu hướng nhường 2e; mỗi nguyên tử Cl có xu hướng nhận 1e.',
  },
  transfer: {
    id: 'transfer',
    stepNumber: 2,
    title: 'Quá trình chuyển electron từ Ca sang hai nguyên tử Cl',
    shortLabel: '2. Chuyển e',
    equation: 'Ca → Ca²⁺ + 2e   |   2Cl + 2e → 2Cl⁻',
    description:
      'Nguyên tử Ca ở giữa nhường đồng thời 1 electron lớp ngoài cùng cho nguyên tử Cl bên trái và 1 electron lớp ngoài cùng cho nguyên tử Cl bên phải.',
    keyTakeaway: '2 electron chuyển từ lớp thứ 4 (vòng tròn ngoài cùng) của Ca sang lớp ngoài cùng của 2 nguyên tử Cl.',
  },
  ions: {
    id: 'ions',
    stepNumber: 3,
    title: 'Hình thành ion Ca²⁺ và 2 ion Cl⁻',
    shortLabel: '3. Tạo ion',
    equation: 'Ca  +  2Cl  →  Ca²⁺  +  2Cl⁻  →  CaCl₂',
    description:
      'Sau khi nhường 2e, ion Ca²⁺ (điện tích 2+) đặt ở giữa còn 3 lớp electron (2, 8, 8). Hai bên là 2 ion Cl⁻ (điện tích 1−), mỗi ion có 3 lớp electron (2, 8, 8) đạt quy tắc octet bền vững. Lực hút tĩnh điện giữa các ion trái dấu tạo thành hợp chất ion CaCl₂.',
    keyTakeaway: 'Tổng điện tích được bảo toàn: (+2) + 2×(−1) = 0.',
  },
};

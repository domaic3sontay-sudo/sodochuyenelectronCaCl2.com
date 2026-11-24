import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSpeciesGeometry,
  computeTransferArcs,
  STAGE_CANVAS,
} from './cacl2Model';

test('Neutral Ca atom (Z=20) matches exact ring specifications: +20, 2, 8, 8, 2', () => {
  const ca = buildSpeciesGeometry('ca', 'atoms');
  assert.equal(ca.nucleusLabel, '+20');
  assert.equal(ca.atomicNumber, 20);
  assert.equal(ca.chargeValue, 0);
  assert.equal(ca.shells.length, 4);
  assert.deepEqual(
    ca.shells.map((s) => s.electronCount),
    [2, 8, 8, 2]
  );
  assert.equal(
    ca.shells.reduce((sum, s) => sum + s.electrons.length, 0),
    20
  );
});

test('Neutral Cl atoms (Z=17) match exact ring specifications: +17, 2, 8, 7', () => {
  const clLeft = buildSpeciesGeometry('cl-left', 'atoms');
  const clRight = buildSpeciesGeometry('cl-right', 'atoms');

  for (const cl of [clLeft, clRight]) {
    assert.equal(cl.nucleusLabel, '+17');
    assert.equal(cl.atomicNumber, 17);
    assert.equal(cl.chargeValue, 0);
    assert.equal(cl.shells.length, 3);
    assert.deepEqual(
      cl.shells.map((s) => s.electronCount),
      [2, 8, 7]
    );
    assert.equal(
      cl.shells.reduce((sum, s) => sum + s.electrons.length, 0),
      17
    );
  }
});

test('Ca2+ ion after transfer has +20 nucleus and shells [2, 8, 8] with charge 2+', () => {
  const caIon = buildSpeciesGeometry('ca', 'ions');
  assert.equal(caIon.nucleusLabel, '+20');
  assert.equal(caIon.chargeLabel, '2+');
  assert.equal(caIon.chargeValue, 2);
  assert.equal(caIon.shells.length, 3);
  assert.deepEqual(
    caIon.shells.map((s) => s.electronCount),
    [2, 8, 8]
  );
  assert.equal(caIon.totalElectrons, 18);
});

test('Two Cl- ions after transfer each have +17 nucleus, shells [2, 8, 8], charge 1-, and 1 received electron', () => {
  const clLeftIon = buildSpeciesGeometry('cl-left', 'ions');
  const clRightIon = buildSpeciesGeometry('cl-right', 'ions');

  for (const clIon of [clLeftIon, clRightIon]) {
    assert.equal(clIon.nucleusLabel, '+17');
    assert.equal(clIon.chargeLabel, '1−');
    assert.equal(clIon.chargeValue, -1);
    assert.equal(clIon.shells.length, 3);
    assert.deepEqual(
      clIon.shells.map((s) => s.electronCount),
      [2, 8, 8]
    );
    assert.equal(clIon.totalElectrons, 18);
    const received = clIon.shells[2].electrons.filter((e) => e.role === 'valence-received');
    assert.equal(received.length, 1);
  }
});

test('Conservation of charge and electrons across reaction', () => {
  const atoms = [
    buildSpeciesGeometry('cl-left', 'atoms'),
    buildSpeciesGeometry('ca', 'atoms'),
    buildSpeciesGeometry('cl-right', 'atoms'),
  ];
  const ions = [
    buildSpeciesGeometry('cl-left', 'ions'),
    buildSpeciesGeometry('ca', 'ions'),
    buildSpeciesGeometry('cl-right', 'ions'),
  ];

  const atomChargeSum = atoms.reduce((sum, a) => sum + a.chargeValue, 0);
  const ionChargeSum = ions.reduce((sum, a) => sum + a.chargeValue, 0);
  assert.equal(atomChargeSum, 0);
  assert.equal(ionChargeSum, 0);

  const atomElectronSum = atoms.reduce((sum, a) => sum + a.totalElectrons, 0);
  const ionElectronSum = ions.reduce((sum, a) => sum + a.totalElectrons, 0);
  assert.equal(atomElectronSum, 54);
  assert.equal(ionElectronSum, 54);
});

test('Transfer arcs connect Ca outer valence electrons to exact vacant Cl slots', () => {
  const ca = buildSpeciesGeometry('ca', 'atoms');
  const clLeftIon = buildSpeciesGeometry('cl-left', 'ions');
  const clRightIon = buildSpeciesGeometry('cl-right', 'ions');

  const arcsStart = computeTransferArcs(0, STAGE_CANVAS.centers);
  const arcsEnd = computeTransferArcs(1, STAGE_CANVAS.centers);

  const caOuterLeft = ca.shells[3].electrons.find((e) => e.angleDeg === 180)!;
  const caOuterRight = ca.shells[3].electrons.find((e) => e.angleDeg === 0)!;

  assert.deepEqual(arcsStart[0].currentPos, { x: caOuterLeft.x, y: caOuterLeft.y });
  assert.deepEqual(arcsStart[1].currentPos, { x: caOuterRight.x, y: caOuterRight.y });

  const leftReceived = clLeftIon.shells[2].electrons.find((e) => e.role === 'valence-received')!;
  const rightReceived = clRightIon.shells[2].electrons.find((e) => e.role === 'valence-received')!;

  assert.deepEqual(arcsEnd[0].currentPos, { x: leftReceived.x, y: leftReceived.y });
  assert.deepEqual(arcsEnd[1].currentPos, { x: rightReceived.x, y: rightReceived.y });
});

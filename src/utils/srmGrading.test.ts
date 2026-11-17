import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFinalResult,
  calculateGradeTargets,
  calculateNextGradeTarget,
  convertExternalMarks,
  getAchievableGradeBounds,
  getGradeForMarks,
  validateMarksInput,
} from './srmGrading';

test('prompt example: internal 45, external 68 yields 36.27 converted, 81.27 final, A+, 9 pts', () => {
  const result = calculateFinalResult(45, 68);
  assert.equal(result.internalMarks, 45);
  assert.equal(result.externalRawMarks, 68);
  assert.equal(result.externalConvertedMarks.toFixed(2), '36.27');
  assert.equal(result.finalMarks.toFixed(2), '81.27');
  assert.equal(result.gradeDefinition.grade, 'A+');
  assert.equal(result.gradeDefinition.gradePoints, 9);
  assert.equal(result.subjectPercentage.toFixed(2), '81.27');
});

test('grade boundaries use unrounded values accurately', () => {
  assert.equal(getGradeForMarks(100).grade, 'O');
  assert.equal(getGradeForMarks(91).grade, 'O');
  assert.equal(getGradeForMarks(90.99).grade, 'A+');
  assert.equal(getGradeForMarks(81).grade, 'A+');
  assert.equal(getGradeForMarks(80.99).grade, 'A');
  assert.equal(getGradeForMarks(71).grade, 'A');
  assert.equal(getGradeForMarks(70.5).grade, 'B+');
  assert.equal(getGradeForMarks(61).grade, 'B+');
  assert.equal(getGradeForMarks(60.9).grade, 'B');
  assert.equal(getGradeForMarks(56).grade, 'B');
  assert.equal(getGradeForMarks(55.8).grade, 'C');
  assert.equal(getGradeForMarks(50).grade, 'C');
  assert.equal(getGradeForMarks(49.99).grade, 'F');
  assert.equal(getGradeForMarks(0).grade, 'F');
});

test('final marks never exceed 100', () => {
  const result = calculateFinalResult(60, 75);
  assert.equal(result.externalConvertedMarks, 40);
  assert.equal(result.finalMarks, 100);
  assert.equal(result.gradeDefinition.grade, 'O');

  const over = calculateFinalResult(70, 90);
  assert.equal(over.finalMarks, 100);
});

test('calculateGradeTargets for internal 45 matches exact rounding & statuses', () => {
  const targets = calculateGradeTargets(45);
  const byGrade = Object.fromEntries(targets.map((t) => [t.grade, t]));

  assert.equal(byGrade['O'].externalRawRequired, 87);
  assert.equal(byGrade['O'].externalConvertedRequired, 46);
  assert.equal(byGrade['O'].status, 'not_possible');

  assert.equal(byGrade['A+'].externalRawRequired, 68);
  assert.equal(byGrade['A+'].externalConvertedRequired, 36);
  assert.equal(byGrade['A+'].status, 'achievable');

  assert.equal(byGrade['A'].externalRawRequired, 49);
  assert.equal(byGrade['A'].externalConvertedRequired, 26);
  assert.equal(byGrade['A'].status, 'achievable');

  assert.equal(byGrade['B+'].externalRawRequired, 30);
  assert.equal(byGrade['B+'].externalConvertedRequired, 16);
  assert.equal(byGrade['B+'].status, 'achievable');

  assert.equal(byGrade['B'].externalRawRequired, 21);
  assert.equal(byGrade['B'].externalConvertedRequired, 11);
  assert.equal(byGrade['B'].status, 'achievable');

  assert.equal(byGrade['C'].externalRawRequired, 10);
  assert.equal(byGrade['C'].externalConvertedRequired, 5);
  assert.equal(byGrade['C'].status, 'achievable');
});

test('already achieved targets and minimum/highest achievable grades work for internal 52', () => {
  const targets = calculateGradeTargets(52);
  const byGrade = Object.fromEntries(targets.map((t) => [t.grade, t]));

  assert.equal(byGrade['C'].status, 'already_achieved');
  assert.equal(byGrade['C'].externalRawRequired, 0);
  assert.equal(byGrade['B'].status, 'achievable');
  assert.equal(byGrade['B'].externalRawRequired, 8); // (56-52)*75/40 = 7.5 -> 8
  assert.equal(byGrade['O'].status, 'achievable');
  assert.equal(byGrade['O'].externalRawRequired, 74); // (91-52)*75/40 = 73.125 -> 74

  const bounds = getAchievableGradeBounds(52);
  assert.equal(bounds.minimumAchievableGrade.grade, 'C');
  assert.equal(bounds.highestAchievableGrade.grade, 'O');
});

test('floating-point precision does not inflate exact integer requirements', () => {
  // (61 - 49.8) * 75 / 40 = 11.2 * 1.875 = 21.0 exactly
  const targets = calculateGradeTargets(49.8);
  const bPlus = targets.find((t) => t.grade === 'B+');
  assert.equal(bPlus?.externalRawRequired, 21);
});

test('next grade target handles O grade, achievable next grade, and impossible next grade', () => {
  // Internal 45, external 68 -> A+, next grade O (needs 19 more -> total 87 > 75, not possible)
  const aPlusCase = calculateNextGradeTarget(45, 68);
  assert.equal(aPlusCase.currentGrade.grade, 'A+');
  assert.equal(aPlusCase.nextGrade?.grade, 'O');
  assert.equal(aPlusCase.additionalExternalRawNeeded, 19);
  assert.equal(aPlusCase.totalExternalRawForNextGrade, 87);
  assert.equal(aPlusCase.isNextGradeAchievable, false);
  assert.equal(aPlusCase.highestAchievableGrade.grade, 'A+');

  // Internal 52, external 60 -> 52 + 32 = 84 (A+), next grade O (needs 14 more -> total 74 <= 75, achievable)
  const achievableCase = calculateNextGradeTarget(52, 60);
  assert.equal(achievableCase.currentGrade.grade, 'A+');
  assert.equal(achievableCase.nextGrade?.grade, 'O');
  assert.equal(achievableCase.additionalExternalRawNeeded, 14);
  assert.equal(achievableCase.totalExternalRawForNextGrade, 74);
  assert.equal(achievableCase.isNextGradeAchievable, true);
  assert.equal(achievableCase.highestAchievableGrade.grade, 'O');

  // Internal 55, external 70 -> 55 + 37.333 = 92.33 (O)
  const oCase = calculateNextGradeTarget(55, 70);
  assert.equal(oCase.currentGrade.grade, 'O');
  assert.equal(oCase.hasHighestGrade, true);
  assert.equal(oCase.nextGrade, null);
});

test('validation rejects negative, out-of-bounds, and malformed inputs while accepting decimals', () => {
  assert.equal(validateMarksInput('', 60, 'Internal Marks', false).isValid, true);
  assert.equal(validateMarksInput('', 60, 'Internal Marks', true).isValid, false);
  assert.equal(validateMarksInput('45.5', 60, 'Internal Marks').value, 45.5);
  assert.equal(validateMarksInput('-1', 60, 'Internal Marks').isValid, false);
  assert.equal(validateMarksInput('60.1', 60, 'Internal Marks').isValid, false);
  assert.equal(validateMarksInput('75.01', 75, 'External Marks').isValid, false);
  assert.equal(validateMarksInput('abc', 75, 'External Marks').isValid, false);
  assert.equal(convertExternalMarks(75), 40);
});

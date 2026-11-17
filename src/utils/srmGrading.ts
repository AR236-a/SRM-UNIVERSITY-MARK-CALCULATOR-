export const MAX_INTERNAL_MARKS = 60;
export const MAX_EXTERNAL_RAW_MARKS = 75;
export const MAX_EXTERNAL_CONVERTED_MARKS = 40;
export const MAX_TOTAL_MARKS = 100;

export type TargetGradeLetter = 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C';
export type MarksGradeLetter = TargetGradeLetter | 'F';
export type AcademicStatus = 'REGULAR' | 'Ab' | 'I';
export type OverallGradeCode = MarksGradeLetter | 'Ab' | 'I';

export interface GradeDefinition {
  grade: MarksGradeLetter;
  minMarks: number;
  maxMarks: number;
  gradePoints: number;
  rangeLabel: string;
  description: string;
}

export const SRM_GRADING_SCALE: readonly GradeDefinition[] = [
  {
    grade: 'O',
    minMarks: 91,
    maxMarks: 100,
    gradePoints: 10,
    rangeLabel: '91–100',
    description: 'Outstanding',
  },
  {
    grade: 'A+',
    minMarks: 81,
    maxMarks: 90,
    gradePoints: 9,
    rangeLabel: '81–90',
    description: 'Excellent',
  },
  {
    grade: 'A',
    minMarks: 71,
    maxMarks: 80,
    gradePoints: 8,
    rangeLabel: '71–80',
    description: 'Very Good',
  },
  {
    grade: 'B+',
    minMarks: 61,
    maxMarks: 70,
    gradePoints: 7,
    rangeLabel: '61–70',
    description: 'Good',
  },
  {
    grade: 'B',
    minMarks: 56,
    maxMarks: 60,
    gradePoints: 6,
    rangeLabel: '56–60',
    description: 'Above Average',
  },
  {
    grade: 'C',
    minMarks: 50,
    maxMarks: 55,
    gradePoints: 5,
    rangeLabel: '50–55',
    description: 'Average',
  },
  {
    grade: 'F',
    minMarks: 0,
    maxMarks: 49,
    gradePoints: 0,
    rangeLabel: '0–49',
    description: 'Fail',
  },
] as const;

export const TARGET_GRADES: readonly GradeDefinition[] = SRM_GRADING_SCALE.filter(
  (g): g is GradeDefinition & { grade: TargetGradeLetter } => g.grade !== 'F'
);

export const SPECIAL_ACADEMIC_STATUSES = [
  {
    code: 'Ab' as const,
    title: 'Absent in Examination',
    description:
      'Awarded when a student is absent for the end-semester external examination regardless of internal marks.',
    gradePoints: 0,
  },
  {
    code: 'I' as const,
    title: 'Insufficient Attendance',
    description:
      'Awarded when a student does not meet the mandatory minimum attendance requirement and is detained from appearing in the external examination.',
    gradePoints: 0,
  },
] as const;

export type AchievabilityStatus = 'already_achieved' | 'achievable' | 'not_possible';

export interface GradeTargetResult {
  grade: TargetGradeLetter;
  description: string;
  rangeLabel: string;
  requiredFinalMarks: number;
  gradePoints: number;
  /** Whole external raw marks out of 75 needed (rounded up). 0 if already achieved. */
  externalRawRequired: number;
  /** Unrounded exact raw external marks needed out of 75 (clamped at >= 0). */
  exactExternalRawRequired: number;
  /** External converted marks out of 40 needed to reach requiredFinalMarks. */
  externalConvertedRequired: number;
  /** Actual final marks achieved if scoring exact externalRawRequired (whole number). */
  projectedFinalWithWholeExternal: number;
  status: AchievabilityStatus;
}

export interface ValidationResult {
  isValid: boolean;
  value: number | null;
  error: string | null;
}

export interface FinalResultSummary {
  internalMarks: number;
  externalRawMarks: number;
  externalConvertedMarks: number;
  finalMarks: number;
  subjectPercentage: number;
  gradeDefinition: GradeDefinition;
}

export interface NextGradeTargetInfo {
  currentGrade: GradeDefinition;
  hasHighestGrade: boolean;
  nextGrade: GradeDefinition | null;
  /** Additional whole external raw marks needed beyond expected external marks to reach nextGrade. */
  additionalExternalRawNeeded: number | null;
  /** Total external raw marks out of 75 required for nextGrade. */
  totalExternalRawForNextGrade: number | null;
  /** Whether nextGrade is possible within the 75-mark external exam limit. */
  isNextGradeAchievable: boolean;
  highestAchievableGrade: GradeDefinition;
}

const EPSILON = 1e-9;

/**
 * Validates numeric marks input for Internal (0–60) or External (0–75).
 * Empty string returns isValid: true with value: null (unless required).
 */
export function validateMarksInput(
  rawInput: string,
  maxMarks: number,
  label: string,
  required = false
): ValidationResult {
  const trimmed = rawInput.trim();
  if (trimmed === '') {
    if (required) {
      return {
        isValid: false,
        value: null,
        error: `Please enter ${label.toLowerCase()}.`,
      };
    }
    return { isValid: true, value: null, error: null };
  }

  // Reject non-numeric strings (e.g., "12abc", "--5", "NaN")
  if (!/^-?\d*(\.\d+)?$/.test(trimmed)) {
    return {
      isValid: false,
      value: null,
      error: `${label} must be a valid number.`,
    };
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return {
      isValid: false,
      value: null,
      error: `${label} must be a finite number.`,
    };
  }

  if (parsed < 0) {
    return {
      isValid: false,
      value: null,
      error: `${label} cannot be negative.`,
    };
  }

  if (parsed > maxMarks) {
    return {
      isValid: false,
      value: null,
      error: `${label} cannot exceed ${maxMarks}.`,
    };
  }

  return { isValid: true, value: parsed, error: null };
}

/**
 * Converts external raw marks (out of 75) to converted marks (out of 40).
 */
export function convertExternalMarks(externalRaw: number): number {
  const clamped = Math.max(0, Math.min(MAX_EXTERNAL_RAW_MARKS, externalRaw));
  return (clamped / MAX_EXTERNAL_RAW_MARKS) * MAX_EXTERNAL_CONVERTED_MARKS;
}

/**
 * Determines the SRM grade definition using unrounded final marks.
 * Final marks are clamped to [0, 100].
 */
export function getGradeForMarks(unroundedFinalMarks: number): GradeDefinition {
  const clamped = Math.max(0, Math.min(MAX_TOTAL_MARKS, unroundedFinalMarks));
  for (const entry of SRM_GRADING_SCALE) {
    if (clamped + EPSILON >= entry.minMarks) {
      return entry;
    }
  }
  return SRM_GRADING_SCALE[SRM_GRADING_SCALE.length - 1];
}

/**
 * Calculates minimum and highest achievable grades given internal marks only.
 * - Minimum achievable grade assumes 0 external marks.
 * - Highest achievable grade assumes full 75/75 external marks (40/40 converted).
 */
export function getAchievableGradeBounds(internalMarks: number): {
  minimumAchievableGrade: GradeDefinition;
  highestAchievableGrade: GradeDefinition;
  minimumFinalMarks: number;
  maximumFinalMarks: number;
} {
  const clampedInternal = Math.max(0, Math.min(MAX_INTERNAL_MARKS, internalMarks));
  const minimumFinalMarks = clampedInternal;
  const maximumFinalMarks = Math.min(MAX_TOTAL_MARKS, clampedInternal + MAX_EXTERNAL_CONVERTED_MARKS);

  return {
    minimumAchievableGrade: getGradeForMarks(minimumFinalMarks),
    highestAchievableGrade: getGradeForMarks(maximumFinalMarks),
    minimumFinalMarks,
    maximumFinalMarks,
  };
}

/**
 * Feature One & Feature Four:
 * Calculates external raw & converted marks required for O, A+, A, B+, B, and C.
 */
export function calculateGradeTargets(internalMarks: number): GradeTargetResult[] {
  const clampedInternal = Math.max(0, Math.min(MAX_INTERNAL_MARKS, internalMarks));

  return TARGET_GRADES.map((def) => {
    const convertedNeeded = Math.max(0, def.minMarks - clampedInternal);
    const exactRawNeeded = (convertedNeeded * MAX_EXTERNAL_RAW_MARKS) / MAX_EXTERNAL_CONVERTED_MARKS;

    // Guard against IEEE-754 artifacts like 21.000000000000004 rounding up to 22
    const roundedRawNeeded =
      exactRawNeeded <= EPSILON ? 0 : Math.ceil(exactRawNeeded - EPSILON);

    let status: AchievabilityStatus;
    if (clampedInternal + EPSILON >= def.minMarks) {
      status = 'already_achieved';
    } else if (roundedRawNeeded > MAX_EXTERNAL_RAW_MARKS) {
      status = 'not_possible';
    } else {
      status = 'achievable';
    }

    const projectedFinal =
      status === 'already_achieved'
        ? clampedInternal
        : Math.min(
            MAX_TOTAL_MARKS,
            clampedInternal + convertExternalMarks(Math.min(MAX_EXTERNAL_RAW_MARKS, roundedRawNeeded))
          );

    return {
      grade: def.grade as TargetGradeLetter,
      description: def.description,
      rangeLabel: def.rangeLabel,
      requiredFinalMarks: def.minMarks,
      gradePoints: def.gradePoints,
      externalRawRequired: status === 'already_achieved' ? 0 : roundedRawNeeded,
      exactExternalRawRequired: Math.max(0, exactRawNeeded),
      externalConvertedRequired: convertedNeeded,
      projectedFinalWithWholeExternal: projectedFinal,
      status,
    };
  });
}

/**
 * Feature Two:
 * Calculates the complete final subject result when both internal and expected external marks exist.
 */
export function calculateFinalResult(
  internalMarks: number,
  externalRawMarks: number
): FinalResultSummary {
  const clampedInternal = Math.max(0, Math.min(MAX_INTERNAL_MARKS, internalMarks));
  const clampedExternal = Math.max(0, Math.min(MAX_EXTERNAL_RAW_MARKS, externalRawMarks));
  const externalConvertedMarks = convertExternalMarks(clampedExternal);
  const rawFinal = clampedInternal + externalConvertedMarks;
  const finalMarks = Math.min(MAX_TOTAL_MARKS, rawFinal);
  const gradeDefinition = getGradeForMarks(finalMarks);

  return {
    internalMarks: clampedInternal,
    externalRawMarks: clampedExternal,
    externalConvertedMarks,
    finalMarks,
    subjectPercentage: finalMarks,
    gradeDefinition,
  };
}

/**
 * Feature Three:
 * Computes the next higher grade target, additional external marks needed,
 * and highest achievable grade for the student's internal marks.
 */
export function calculateNextGradeTarget(
  internalMarks: number,
  expectedExternalRaw: number
): NextGradeTargetInfo {
  const summary = calculateFinalResult(internalMarks, expectedExternalRaw);
  const currentGrade = summary.gradeDefinition;
  const { highestAchievableGrade } = getAchievableGradeBounds(internalMarks);

  if (currentGrade.grade === 'O') {
    return {
      currentGrade,
      hasHighestGrade: true,
      nextGrade: null,
      additionalExternalRawNeeded: 0,
      totalExternalRawForNextGrade: null,
      isNextGradeAchievable: true,
      highestAchievableGrade,
    };
  }

  const currentIdx = SRM_GRADING_SCALE.findIndex((g) => g.grade === currentGrade.grade);
  const nextGrade = currentIdx > 0 ? SRM_GRADING_SCALE[currentIdx - 1] : null;

  if (!nextGrade) {
    return {
      currentGrade,
      hasHighestGrade: false,
      nextGrade: null,
      additionalExternalRawNeeded: null,
      totalExternalRawForNextGrade: null,
      isNextGradeAchievable: false,
      highestAchievableGrade,
    };
  }

  const exactTotalRawForNext =
    (Math.max(0, nextGrade.minMarks - summary.internalMarks) * MAX_EXTERNAL_RAW_MARKS) /
    MAX_EXTERNAL_CONVERTED_MARKS;
  const totalExternalRawForNextGrade =
    exactTotalRawForNext <= EPSILON ? 0 : Math.ceil(exactTotalRawForNext - EPSILON);

  const exactAdditionalRaw =
    (Math.max(0, nextGrade.minMarks - summary.finalMarks) * MAX_EXTERNAL_RAW_MARKS) /
    MAX_EXTERNAL_CONVERTED_MARKS;
  const additionalExternalRawNeeded =
    exactAdditionalRaw <= EPSILON ? 0 : Math.ceil(exactAdditionalRaw - EPSILON);

  const isNextGradeAchievable = totalExternalRawForNextGrade <= MAX_EXTERNAL_RAW_MARKS;

  return {
    currentGrade,
    hasHighestGrade: false,
    nextGrade,
    additionalExternalRawNeeded,
    totalExternalRawForNextGrade,
    isNextGradeAchievable,
    highestAchievableGrade,
  };
}

export function formatMarks(value: number): string {
  return value.toFixed(2);
}

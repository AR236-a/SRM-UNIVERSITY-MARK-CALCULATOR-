import { Ban, CheckCircle2, Target } from 'lucide-react';
import {
  AcademicStatus,
  GradeDefinition,
  GradeTargetResult,
  MarksGradeLetter,
  TargetGradeLetter,
  formatMarks,
} from '../utils/srmGrading';

interface GradeComparisonGridProps {
  internalMarks: number | null;
  targets: GradeTargetResult[] | null;
  selectedTargetGrade: TargetGradeLetter;
  expectedGrade: MarksGradeLetter | null;
  academicStatus: AcademicStatus;
  achievableBounds: {
    minimumAchievableGrade: GradeDefinition;
    highestAchievableGrade: GradeDefinition;
    minimumFinalMarks: number;
    maximumFinalMarks: number;
  } | null;
  onSelectTargetGrade: (grade: TargetGradeLetter) => void;
}

const DEFAULT_GRADE_ROWS: Array<{
  grade: TargetGradeLetter;
  description: string;
  rangeLabel: string;
  requiredFinalMarks: number;
  gradePoints: number;
}> = [
  { grade: 'O', description: 'Outstanding', rangeLabel: '91–100', requiredFinalMarks: 91, gradePoints: 10 },
  { grade: 'A+', description: 'Excellent', rangeLabel: '81–90', requiredFinalMarks: 81, gradePoints: 9 },
  { grade: 'A', description: 'Very Good', rangeLabel: '71–80', requiredFinalMarks: 71, gradePoints: 8 },
  { grade: 'B+', description: 'Good', rangeLabel: '61–70', requiredFinalMarks: 61, gradePoints: 7 },
  { grade: 'B', description: 'Above Average', rangeLabel: '56–60', requiredFinalMarks: 56, gradePoints: 6 },
  { grade: 'C', description: 'Average', rangeLabel: '50–55', requiredFinalMarks: 50, gradePoints: 5 },
];

export function GradeComparisonGrid({
  internalMarks,
  targets,
  selectedTargetGrade,
  expectedGrade,
  academicStatus,
  achievableBounds,
  onSelectTargetGrade,
}: GradeComparisonGridProps) {
  const isRegular = academicStatus === 'REGULAR';

  return (
    <section id="grade-comparison" aria-labelledby="grade-comparison-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="grade-comparison-heading" className="text-xl font-bold text-stone-900">
            External Marks Required &amp; Grade Comparison
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Click any grade card to set it as your target grade. Target and expected grades are highlighted separately.
          </p>
        </div>

        {/* Clean unboxed legend & achievable bounds summary */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-600">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#7A1426]">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#7A1426]" aria-hidden="true" />
            <span>Target Grade ({selectedTargetGrade})</span>
          </span>

          {isRegular && expectedGrade && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-800">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-600" aria-hidden="true" />
              <span>Expected Grade ({expectedGrade})</span>
            </span>
          )}

          {achievableBounds && (
            <span className="font-mono tabular-nums text-stone-700">
              Min: <strong>{achievableBounds.minimumAchievableGrade.grade}</strong> · Max:{' '}
              <strong className="text-[#7A1426]">{achievableBounds.highestAchievableGrade.grade}</strong>
            </span>
          )}
        </div>
      </div>

      {/* 6 Grade Cards: O, A+, A, B+, B, C */}
      <div
        data-testid="grade-comparison-grid"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {(targets ?? DEFAULT_GRADE_ROWS).map((item) => {
          const hasComputed = targets !== null && 'status' in item;
          const computed = hasComputed ? (item as GradeTargetResult) : null;
          const isTarget = selectedTargetGrade === item.grade;
          const isExpected = isRegular && expectedGrade === item.grade;

          // Distinct visual framing for Target vs Expected vs Both
          let borderClasses = 'border-stone-200 bg-white hover:border-stone-300';
          if (isTarget && isExpected) {
            borderClasses =
              'border-[#7A1426] bg-white ring-2 ring-amber-500/40 shadow-sm';
          } else if (isTarget) {
            borderClasses = 'border-[#7A1426] bg-white ring-2 ring-[#7A1426]/20';
          } else if (isExpected) {
            borderClasses = 'border-amber-600 bg-amber-50/30 ring-2 ring-amber-500/20';
          } else if (computed?.status === 'not_possible') {
            borderClasses = 'border-stone-200 bg-stone-50/80';
          }

          const rawProgressRatio =
            computed && computed.status !== 'already_achieved'
              ? Math.min(1, computed.externalRawRequired / 75)
              : computed?.status === 'already_achieved'
                ? 0
                : 0;

          return (
            <button
              key={item.grade}
              type="button"
              onClick={() => onSelectTargetGrade(item.grade)}
              aria-pressed={isTarget}
              data-testid={`grade-card-${item.grade}`}
              className={`group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1426] focus-visible:ring-offset-2 ${borderClasses}`}
            >
              <div>
                {/* Header row with Grade Name, Grade Points, and Target/Expected Indicators */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-baseline gap-2.5">
                    <span
                      className={`font-display text-3xl font-extrabold ${
                        isTarget ? 'text-[#7A1426]' : isExpected ? 'text-amber-800' : 'text-stone-900'
                      }`}
                    >
                      {item.grade}
                    </span>
                    <span className="text-xs font-medium text-stone-500">
                      {item.description} · {item.rangeLabel}
                    </span>
                  </div>

                  <span className="font-mono text-sm font-bold text-stone-700 tabular-nums shrink-0">
                    {item.gradePoints} pts
                  </span>
                </div>

                {/* Highlight Markers (Unboxed typographic markers — zero-pill discipline) */}
                {(isTarget || isExpected) && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
                    {isTarget && (
                      <span className="text-[#7A1426]">Target Grade</span>
                    )}
                    {isTarget && isExpected && (
                      <span className="text-stone-300" aria-hidden="true">/</span>
                    )}
                    {isExpected && (
                      <span className="text-amber-800">Expected Grade</span>
                    )}
                  </div>
                )}

                {/* Metrics rows */}
                <dl className="mt-4 space-y-2.5 border-t border-stone-100 pt-4 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-stone-500">Required Final Marks</dt>
                    <dd className="font-mono font-semibold text-stone-900 tabular-nums">
                      {item.requiredFinalMarks} / 100
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-stone-500">External Raw Needed</dt>
                    <dd className="font-mono font-bold text-stone-900 tabular-nums">
                      {!computed || internalMarks === null ? (
                        <span className="font-normal text-stone-400">Enter internal</span>
                      ) : computed.status === 'already_achieved' ? (
                        <span className="text-emerald-700">0 / 75</span>
                      ) : computed.status === 'not_possible' ? (
                        <span className="text-stone-500">
                          {computed.externalRawRequired} / 75
                        </span>
                      ) : (
                        <span className="text-[#7A1426]">{computed.externalRawRequired} / 75</span>
                      )}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-stone-500">External Contribution</dt>
                    <dd className="font-mono font-semibold text-stone-900 tabular-nums">
                      {!computed || internalMarks === null ? (
                        <span className="font-normal text-stone-400">— / 40</span>
                      ) : (
                        `${formatMarks(computed.externalConvertedRequired)} / 40`
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Achievability Status Footer */}
              <div className="mt-4 border-t border-stone-100 pt-3.5">
                {!computed || internalMarks === null ? (
                  <p className="text-xs text-stone-500">
                    Waiting for internal marks to compute target
                  </p>
                ) : computed.status === 'already_achieved' ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Already Achieved</span>
                  </div>
                ) : computed.status === 'not_possible' ? (
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-red-700">
                    <span className="inline-flex items-center gap-1.5">
                      <Ban className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Not Possible</span>
                    </span>
                    <span className="font-mono font-normal text-stone-500 tabular-nums">
                      Exceeds 75 max
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-stone-800">
                      <span className="inline-flex items-center gap-1.5 text-emerald-800">
                        <Target className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>Achievable</span>
                      </span>
                      <span className="font-mono text-stone-500 tabular-nums">
                        {Math.round((computed.externalRawRequired / 75) * 100)}% of external
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
                      <div
                        className="h-full w-full origin-left rounded-full bg-[#7A1426] transition-transform duration-200"
                        style={{ transform: `scaleX(${rawProgressRatio})` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

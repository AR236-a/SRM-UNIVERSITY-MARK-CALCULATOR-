import { ArrowUpRight, Award, Ban, Calculator, CheckCircle2, Info } from 'lucide-react';
import {
  AcademicStatus,
  FinalResultSummary,
  GradeDefinition,
  NextGradeTargetInfo,
  SPECIAL_ACADEMIC_STATUSES,
  formatMarks,
} from '../utils/srmGrading';

interface FinalResultCardProps {
  academicStatus: AcademicStatus;
  internalMarks: number | null;
  finalResult: FinalResultSummary | null;
  nextGradeInfo: NextGradeTargetInfo | null;
  achievableBounds: {
    minimumAchievableGrade: GradeDefinition;
    highestAchievableGrade: GradeDefinition;
    minimumFinalMarks: number;
    maximumFinalMarks: number;
  } | null;
  hasValidationError: boolean;
  onLoadExample: () => void;
}

export function FinalResultCard({
  academicStatus,
  internalMarks,
  finalResult,
  nextGradeInfo,
  achievableBounds,
  hasValidationError,
  onLoadExample,
}: FinalResultCardProps) {
  // Distinguish Ab and I from ordinary marks-based grades
  if (academicStatus !== 'REGULAR') {
    const special = SPECIAL_ACADEMIC_STATUSES.find((s) => s.code === academicStatus)!;
    return (
      <section
        aria-labelledby="final-result-heading"
        className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"
      >
        <div>
          <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <p className="text-xs font-semibold text-[#7A1426]">Academic Status Result</p>
              <h2 id="final-result-heading" className="mt-1 text-xl font-bold text-stone-900">
                Non-Marks Administrative Grade
              </h2>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-stone-900 font-display text-2xl font-extrabold text-white">
              {special.code}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <Ban className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  {special.code} — {special.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-amber-900">{special.description}</p>
              </div>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-stone-100 pt-5">
            <div>
              <dt className="text-xs text-stone-500">Recorded Internal Marks</dt>
              <dd className="mt-1 font-mono text-lg font-bold text-stone-900 tabular-nums">
                {internalMarks !== null ? `${formatMarks(internalMarks)} / 60` : 'Not entered'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">Grade Points Awarded</dt>
              <dd className="mt-1 font-mono text-lg font-bold text-stone-900 tabular-nums">
                0 (Administrative Status)
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-6 border-t border-stone-100 pt-4 text-xs text-stone-500">
          Note: {special.code} is distinct from an ordinary marks-based F grade (0–49). Switch status back to Regular to calculate marks-based targets.
        </p>
      </section>
    );
  }

  // Empty state or validation error state when internal marks are absent/invalid
  if (internalMarks === null || hasValidationError) {
    return (
      <section
        aria-labelledby="final-result-heading"
        className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"
      >
        <div>
          <div className="flex items-center gap-3 border-b border-stone-100 pb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7A1426]/10 text-[#7A1426]">
              <Calculator className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="final-result-heading" className="text-xl font-bold text-stone-900">
                Final Result Summary
              </h2>
              <p className="text-sm text-stone-600">
                {hasValidationError
                  ? 'Fix the highlighted input error to view live calculations.'
                  : 'Awaiting your internal marks out of 60.'}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-stone-600">
            <p className="font-medium text-stone-800">How the calculator works:</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Enter your <strong className="text-stone-900">Internal Marks (0–60)</strong> to immediately see the external marks needed for O, A+, A, B+, B, and C.
              </li>
              <li>
                Optionally enter your <strong className="text-stone-900">Expected External Marks (0–75)</strong> to compute converted marks out of 40, final marks out of 100, grade, and next-grade target.
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-6 border-t border-stone-100 pt-5">
          <button
            type="button"
            onClick={onLoadExample}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#7A1426] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5E0E1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1426] focus-visible:ring-offset-2"
          >
            <span>Try Example: 45 Internal &amp; 68 External</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    );
  }

  // State C: Internal marks entered, Expected External marks still optional/blank
  if (!finalResult || !nextGradeInfo) {
    return (
      <section
        aria-labelledby="final-result-heading"
        className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"
      >
        <div>
          <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <p className="text-xs font-semibold text-[#7A1426]">Step 1 &amp; 2 Active</p>
              <h2 id="final-result-heading" className="mt-1 text-xl font-bold text-stone-900">
                Achievable Grade Outlook
              </h2>
            </div>
            <div className="text-right font-mono tabular-nums">
              <span className="text-xs text-stone-500">Internal</span>
              <p className="text-lg font-bold text-stone-900">{formatMarks(internalMarks)} / 60</p>
            </div>
          </div>

          {achievableBounds && (
            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-stone-50 p-4">
                <dt className="text-xs font-medium text-stone-500">
                  Minimum Achievable Grade (0/75 ext)
                </dt>
                <dd className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-extrabold text-stone-900">
                    {achievableBounds.minimumAchievableGrade.grade}
                  </span>
                  <span className="font-mono text-xs text-stone-600 tabular-nums">
                    {formatMarks(achievableBounds.minimumFinalMarks)}/100 · {achievableBounds.minimumAchievableGrade.gradePoints} pts
                  </span>
                </dd>
              </div>

              <div className="rounded-xl bg-[#7A1426]/5 p-4">
                <dt className="text-xs font-medium text-[#7A1426]">
                  Highest Achievable Grade (75/75 ext)
                </dt>
                <dd className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-extrabold text-[#7A1426]">
                    {achievableBounds.highestAchievableGrade.grade}
                  </span>
                  <span className="font-mono text-xs text-stone-700 tabular-nums">
                    {formatMarks(achievableBounds.maximumFinalMarks)}/100 · {achievableBounds.highestAchievableGrade.gradePoints} pts
                  </span>
                </dd>
              </div>
            </dl>
          )}
        </div>

        <div className="mt-6 flex items-start gap-2.5 border-t border-stone-100 pt-4 text-sm text-stone-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7A1426]" aria-hidden="true" />
          <p>
            Enter your <strong className="text-stone-900">Expected External Marks (out of 75)</strong> above to calculate your converted external score, final marks, achieved grade, and next-grade target.
          </p>
        </div>
      </section>
    );
  }

  // State D: Full Final Result + Next Grade Target (Features Two & Three)
  const finalProgressRatio = Math.min(1, Math.max(0, finalResult.finalMarks / 100));
  const isPassing = finalResult.gradeDefinition.grade !== 'F';

  return (
    <section
      aria-labelledby="final-result-heading"
      data-testid="final-result-card"
      className="rounded-2xl border border-stone-200 bg-white overflow-hidden"
    >
      {/* Prominent Header Strip in SRM Maroon */}
      <div className="bg-[#7A1426] px-5 py-5 text-white sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-white/80">Final Subject Assessment</p>
            <h2 id="final-result-heading" className="mt-0.5 text-xl font-bold text-white">
              Expected Final Result
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-white/80">Subject Percentage</p>
              <p className="font-mono text-2xl font-bold text-white tabular-nums">
                {formatMarks(finalResult.subjectPercentage)}%
              </p>
            </div>
            <div className="flex h-14 min-w-[3.5rem] items-center justify-center rounded-xl bg-white px-3 font-display text-2xl font-extrabold text-[#7A1426]">
              {finalResult.gradeDefinition.grade}
            </div>
          </div>
        </div>

        {/* Visual Progress out of 100 */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-white/85 font-mono tabular-nums">
            <span>Final Marks: {formatMarks(finalResult.finalMarks)} / 100</span>
            <span>Grade Points: {finalResult.gradeDefinition.gradePoints} / 10</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20" aria-hidden="true">
            <div
              className="h-full w-full origin-left rounded-full bg-white transition-transform duration-200"
              style={{ transform: `scaleX(${finalProgressRatio})` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown Metrics (Feature Two: all 7 fields) */}
      <div className="p-5 sm:p-7">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-xs text-stone-500">Internal Marks</dt>
            <dd className="mt-1 font-mono text-base font-bold text-stone-900 tabular-nums whitespace-nowrap">
              {formatMarks(finalResult.internalMarks)} / 60
            </dd>
          </div>
          <div>
            <dt className="text-xs text-stone-500">External Raw Marks</dt>
            <dd className="mt-1 font-mono text-base font-bold text-stone-900 tabular-nums whitespace-nowrap">
              {formatMarks(finalResult.externalRawMarks)} / 75
            </dd>
          </div>
          <div>
            <dt className="text-xs text-stone-500">Converted External</dt>
            <dd className="mt-1 font-mono text-base font-bold text-stone-900 tabular-nums whitespace-nowrap">
              {formatMarks(finalResult.externalConvertedMarks)} / 40
            </dd>
          </div>
          <div>
            <dt className="text-xs text-stone-500">Final Marks</dt>
            <dd className="mt-1 font-mono text-base font-bold text-[#7A1426] tabular-nums whitespace-nowrap">
              {formatMarks(finalResult.finalMarks)} / 100
            </dd>
          </div>
          <div>
            <dt className="text-xs text-stone-500">Achieved Grade</dt>
            <dd className="mt-1 flex items-baseline gap-1.5 font-display text-base font-bold text-stone-900">
              <span>{finalResult.gradeDefinition.grade}</span>
              <span className="text-xs font-sans font-normal text-stone-500">
                ({finalResult.gradeDefinition.description})
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-stone-500">Grade Points</dt>
            <dd className="mt-1 font-mono text-base font-bold text-stone-900 tabular-nums whitespace-nowrap">
              {finalResult.gradeDefinition.gradePoints} / 10
              <span className="ml-2 text-xs font-sans font-medium text-stone-500">
                · {isPassing ? 'Pass' : 'Fail'}
              </span>
            </dd>
          </div>
        </dl>

        {/* Feature Three: Next Grade Target */}
        <div
          data-testid="next-grade-target"
          className="mt-6 border-t border-stone-200 pt-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-stone-900">Next Grade Target</h3>
            <span className="text-xs font-medium text-stone-600">
              Highest Achievable:{' '}
              <strong className="font-display text-[#7A1426]">
                {nextGradeInfo.highestAchievableGrade.grade}
              </strong>{' '}
              <span className="font-mono tabular-nums">
                ({nextGradeInfo.highestAchievableGrade.gradePoints} pts)
              </span>
            </span>
          </div>

          {nextGradeInfo.hasHighestGrade ? (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-900">
              <Award className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
              <p className="text-sm font-semibold">You have achieved the highest grade</p>
            </div>
          ) : (
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-stone-500">Current Achieved Grade</dt>
                <dd className="font-display font-bold text-stone-900">
                  {nextGradeInfo.currentGrade.grade}{' '}
                  <span className="font-mono text-xs font-medium text-stone-500 tabular-nums">
                    ({nextGradeInfo.currentGrade.gradePoints} pts)
                  </span>
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4">
                <dt className="text-stone-500">Next Higher Grade</dt>
                <dd className="font-display font-bold text-[#7A1426]">
                  {nextGradeInfo.nextGrade?.grade}{' '}
                  <span className="font-mono text-xs font-medium text-stone-500 tabular-nums">
                    (Needs {nextGradeInfo.nextGrade?.minMarks}/100)
                  </span>
                </dd>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-2 pt-1">
                <dt className="text-stone-500">Additional External Needed</dt>
                <dd className="font-mono text-sm font-bold text-stone-900 tabular-nums text-right">
                  {nextGradeInfo.isNextGradeAchievable ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>
                        +{nextGradeInfo.additionalExternalRawNeeded} marks (total{' '}
                        {nextGradeInfo.totalExternalRawForNextGrade}/75)
                      </span>
                    </span>
                  ) : (
                    <span className="text-stone-800">
                      +{nextGradeInfo.additionalExternalRawNeeded} marks{' '}
                      <span className="font-sans text-xs font-semibold text-red-700">
                        ({nextGradeInfo.totalExternalRawForNextGrade}/75 — Not Possible)
                      </span>
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}

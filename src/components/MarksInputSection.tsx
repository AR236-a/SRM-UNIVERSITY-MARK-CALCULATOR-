import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import {
  AcademicStatus,
  MAX_EXTERNAL_RAW_MARKS,
  MAX_INTERNAL_MARKS,
  TARGET_GRADES,
  TargetGradeLetter,
  ValidationResult,
  convertExternalMarks,
  formatMarks,
} from '../utils/srmGrading';

interface MarksInputSectionProps {
  internalInput: string;
  externalInput: string;
  academicStatus: AcademicStatus;
  selectedTargetGrade: TargetGradeLetter;
  internalValidation: ValidationResult;
  externalValidation: ValidationResult;
  onInternalChange: (value: string) => void;
  onExternalChange: (value: string) => void;
  onAcademicStatusChange: (status: AcademicStatus) => void;
  onTargetGradeChange: (grade: TargetGradeLetter) => void;
  onLoadExample: () => void;
  onReset: () => void;
}

const STATUS_OPTIONS: { value: AcademicStatus; label: string; shortHint: string }[] = [
  { value: 'REGULAR', label: 'Regular (Marks-Based)', shortHint: 'Standard grading' },
  { value: 'Ab', label: 'Ab (Absent)', shortHint: 'Absent in external exam' },
  { value: 'I', label: 'I (Insufficient Attendance)', shortHint: 'Attendance shortage' },
];

export function MarksInputSection({
  internalInput,
  externalInput,
  academicStatus,
  selectedTargetGrade,
  internalValidation,
  externalValidation,
  onInternalChange,
  onExternalChange,
  onAcademicStatusChange,
  onTargetGradeChange,
  onLoadExample,
  onReset,
}: MarksInputSectionProps) {
  const isRegular = academicStatus === 'REGULAR';
  const internalRatio =
    internalValidation.isValid && internalValidation.value !== null
      ? Math.min(1, Math.max(0, internalValidation.value / MAX_INTERNAL_MARKS))
      : 0;
  const externalRatio =
    isRegular && externalValidation.isValid && externalValidation.value !== null
      ? Math.min(1, Math.max(0, externalValidation.value / MAX_EXTERNAL_RAW_MARKS))
      : 0;

  const liveConvertedExternal =
    isRegular && externalValidation.isValid && externalValidation.value !== null
      ? convertExternalMarks(externalValidation.value)
      : null;

  return (
    <section
      aria-labelledby="marks-input-heading"
      className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <h2 id="marks-input-heading" className="text-xl font-bold text-stone-900">
            Student Marks Entry
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Enter internal marks to see external targets immediately. Add expected external marks to calculate your final grade.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onLoadExample}
            className="inline-flex min-h-[40px] items-center rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 transition-colors hover:border-[#7A1426] hover:text-[#7A1426] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1426] focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
          >
            Load Example (45 &amp; 68)
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset all marks"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1426] focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Input 1: Internal Marks */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label
              htmlFor="internal-marks-input"
              className="text-sm font-semibold text-stone-900 whitespace-nowrap"
            >
              Internal Marks
            </label>
            <span className="font-mono text-xs font-medium text-stone-500 tabular-nums whitespace-nowrap">
              Out of {MAX_INTERNAL_MARKS}
            </span>
          </div>

          <div className="relative mt-2">
            <input
              id="internal-marks-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g., 45"
              value={internalInput}
              onChange={(e) => onInternalChange(e.target.value)}
              aria-invalid={!internalValidation.isValid}
              aria-describedby={internalValidation.error ? 'internal-marks-error' : 'internal-marks-hint'}
              className={`w-full min-h-[48px] rounded-xl border bg-white px-4 pr-16 font-mono text-lg font-semibold text-stone-900 tabular-nums transition-colors placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-stone-400 focus:outline-none focus:ring-2 ${
                !internalValidation.isValid
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
                  : 'border-stone-300 focus:border-[#7A1426] focus:ring-[#7A1426]/20'
              }`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm font-medium text-stone-400 tabular-nums">
              / {MAX_INTERNAL_MARKS}
            </span>
          </div>

          {/* Progress indicator */}
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
            <div
              className={`h-full w-full origin-left rounded-full transition-transform duration-200 ${
                !internalValidation.isValid ? 'bg-red-500' : 'bg-[#7A1426]'
              }`}
              style={{ transform: `scaleX(${internalRatio})` }}
            />
          </div>

          {internalValidation.error ? (
            <p
              id="internal-marks-error"
              role="alert"
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-700"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{internalValidation.error}</span>
            </p>
          ) : (
            <p id="internal-marks-hint" className="mt-2 text-xs text-stone-500">
              {internalValidation.value !== null ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{formatMarks(internalValidation.value)} internal marks recorded</span>
                </span>
              ) : (
                'Accepts decimals from 0 to 60'
              )}
            </p>
          )}
        </div>

        {/* Input 2: Expected External Marks (Optional initially) */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label
              htmlFor="external-marks-input"
              className="text-sm font-semibold text-stone-900 whitespace-nowrap"
            >
              Expected External
            </label>
            <span className="font-mono text-xs font-medium text-stone-500 tabular-nums whitespace-nowrap">
              Optional · /{MAX_EXTERNAL_RAW_MARKS}
            </span>
          </div>

          <div className="relative mt-2">
            <input
              id="external-marks-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              disabled={!isRegular}
              placeholder={isRegular ? 'e.g., 68 (optional)' : `Disabled (${academicStatus} selected)`}
              value={isRegular ? externalInput : ''}
              onChange={(e) => onExternalChange(e.target.value)}
              aria-invalid={isRegular && !externalValidation.isValid}
              aria-describedby={
                isRegular && externalValidation.error ? 'external-marks-error' : 'external-marks-hint'
              }
              className={`w-full min-h-[48px] rounded-xl border px-4 pr-16 font-mono text-lg font-semibold tabular-nums transition-colors placeholder:font-sans placeholder:text-sm placeholder:font-normal focus:outline-none focus:ring-2 ${
                !isRegular
                  ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 placeholder:text-stone-400'
                  : !externalValidation.isValid
                    ? 'border-red-500 bg-white text-stone-900 focus:border-red-600 focus:ring-red-200'
                    : 'border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-[#7A1426] focus:ring-[#7A1426]/20'
              }`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm font-medium text-stone-400 tabular-nums">
              / {MAX_EXTERNAL_RAW_MARKS}
            </span>
          </div>

          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
            <div
              className={`h-full w-full origin-left rounded-full transition-transform duration-200 ${
                !externalValidation.isValid ? 'bg-red-500' : 'bg-amber-600'
              }`}
              style={{ transform: `scaleX(${externalRatio})` }}
            />
          </div>

          {isRegular && externalValidation.error ? (
            <p
              id="external-marks-error"
              role="alert"
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-700"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{externalValidation.error}</span>
            </p>
          ) : (
            <p id="external-marks-hint" className="mt-2 text-xs text-stone-500">
              {!isRegular ? (
                `External score N/A for status "${academicStatus}".`
              ) : liveConvertedExternal !== null ? (
                <span className="font-medium text-stone-700 font-mono tabular-nums">
                  Converts to {formatMarks(liveConvertedExternal)} / 40 marks
                </span>
              ) : (
                'Leave blank for targets only, or enter 0–75'
              )}
            </p>
          )}
        </div>
      </div>

      {/* Examination Status & Target Grade Controls */}
      <div className="mt-6 space-y-5 border-t border-stone-100 pt-5">
        <div>
          <span id="academic-status-label" className="block text-xs font-semibold text-stone-700">
            Examination Status
          </span>
          <div
            role="group"
            aria-labelledby="academic-status-label"
            className="mt-2 grid grid-cols-1 gap-1.5 rounded-xl bg-stone-100 p-1 sm:grid-cols-3"
          >
            {STATUS_OPTIONS.map((option) => {
              const active = academicStatus === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onAcademicStatusChange(option.value)}
                  className={`min-h-[40px] rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1426] whitespace-nowrap ${
                    active
                      ? 'bg-[#7A1426] text-white'
                      : 'text-stone-700 hover:bg-white/70 hover:text-stone-900'
                  }`}
                  title={option.shortHint}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span id="target-grade-label" className="block text-xs font-semibold text-stone-700">
            Desired Target Grade (Highlight on Dashboard)
          </span>
          <div
            role="group"
            aria-labelledby="target-grade-label"
            className="mt-2 grid grid-cols-6 gap-1.5 rounded-xl bg-stone-100 p-1"
          >
            {TARGET_GRADES.map((g) => {
              const active = selectedTargetGrade === g.grade;
              return (
                <button
                  key={g.grade}
                  type="button"
                  aria-pressed={active}
                  aria-label={`Set target grade ${g.grade}`}
                  onClick={() => onTargetGradeChange(g.grade as TargetGradeLetter)}
                  className={`min-h-[40px] rounded-lg px-2 py-2 font-display text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1426] whitespace-nowrap ${
                    active
                      ? 'bg-[#7A1426] text-white'
                      : 'text-stone-700 hover:bg-white/70 hover:text-stone-900'
                  }`}
                >
                  {g.grade}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

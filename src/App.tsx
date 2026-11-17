import { useMemo, useState } from 'react';
import { FinalResultCard } from './components/FinalResultCard';
import { GradeComparisonGrid } from './components/GradeComparisonGrid';
import { GradingReferenceSection } from './components/GradingReferenceSection';
import { MarksInputSection } from './components/MarksInputSection';
import { TopBar } from './components/TopBar';
import {
  AcademicStatus,
  MAX_EXTERNAL_RAW_MARKS,
  MAX_INTERNAL_MARKS,
  TargetGradeLetter,
  calculateFinalResult,
  calculateGradeTargets,
  calculateNextGradeTarget,
  getAchievableGradeBounds,
  validateMarksInput,
} from './utils/srmGrading';

export default function App() {
  const [internalInput, setInternalInput] = useState<string>('');
  const [externalInput, setExternalInput] = useState<string>('');
  const [academicStatus, setAcademicStatus] = useState<AcademicStatus>('REGULAR');
  const [selectedTargetGrade, setSelectedTargetGrade] = useState<TargetGradeLetter>('O');

  const internalValidation = useMemo(
    () => validateMarksInput(internalInput, MAX_INTERNAL_MARKS, 'Internal Marks', false),
    [internalInput]
  );

  const externalValidation = useMemo(
    () =>
      academicStatus === 'REGULAR'
        ? validateMarksInput(externalInput, MAX_EXTERNAL_RAW_MARKS, 'External Marks', false)
        : { isValid: true, value: null, error: null },
    [externalInput, academicStatus]
  );

  const validInternalMarks =
    internalValidation.isValid && internalValidation.value !== null
      ? internalValidation.value
      : null;

  const validExternalMarks =
    academicStatus === 'REGULAR' &&
    externalValidation.isValid &&
    externalValidation.value !== null
      ? externalValidation.value
      : null;

  const hasValidationError =
    !internalValidation.isValid || (academicStatus === 'REGULAR' && !externalValidation.isValid);

  const achievableBounds = useMemo(
    () => (validInternalMarks !== null ? getAchievableGradeBounds(validInternalMarks) : null),
    [validInternalMarks]
  );

  const gradeTargets = useMemo(
    () =>
      validInternalMarks !== null && !hasValidationError
        ? calculateGradeTargets(validInternalMarks)
        : null,
    [validInternalMarks, hasValidationError]
  );

  const finalResult = useMemo(
    () =>
      validInternalMarks !== null &&
      validExternalMarks !== null &&
      academicStatus === 'REGULAR' &&
      !hasValidationError
        ? calculateFinalResult(validInternalMarks, validExternalMarks)
        : null,
    [validInternalMarks, validExternalMarks, academicStatus, hasValidationError]
  );

  const nextGradeInfo = useMemo(
    () =>
      validInternalMarks !== null &&
      validExternalMarks !== null &&
      academicStatus === 'REGULAR' &&
      !hasValidationError
        ? calculateNextGradeTarget(validInternalMarks, validExternalMarks)
        : null,
    [validInternalMarks, validExternalMarks, academicStatus, hasValidationError]
  );

  const handleLoadExample = () => {
    setAcademicStatus('REGULAR');
    setInternalInput('45');
    setExternalInput('68');
    setSelectedTargetGrade('O');
  };

  const handleReset = () => {
    setInternalInput('');
    setExternalInput('');
    setAcademicStatus('REGULAR');
    setSelectedTargetGrade('O');
  };

  const hasAnyInput =
    internalInput.trim() !== '' ||
    externalInput.trim() !== '' ||
    academicStatus !== 'REGULAR' ||
    selectedTargetGrade !== 'O';

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-stone-900">
      <TopBar onReset={handleReset} hasAnyInput={hasAnyInput} />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:py-10">
        {/* Page Title & Context */}
        <section id="calculator" aria-labelledby="page-title" className="space-y-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-[#7A1426]">
              SRM University Academic Assessment Tool
            </p>
            <h1
              id="page-title"
              className="mt-1.5 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl text-balance"
            >
              SRM University Smart Marks Calculator
            </h1>
            <p className="mt-2 text-base leading-relaxed text-stone-600">
              Calculate your final subject marks (60 internal + 40 converted external), verify your SRM grade and grade points, and see the exact external marks needed for every grade target.
            </p>
          </div>

          {/* Integrated Primary Workspace: Inputs + Result Dashboard */}
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <MarksInputSection
                internalInput={internalInput}
                externalInput={externalInput}
                academicStatus={academicStatus}
                selectedTargetGrade={selectedTargetGrade}
                internalValidation={internalValidation}
                externalValidation={externalValidation}
                onInternalChange={setInternalInput}
                onExternalChange={setExternalInput}
                onAcademicStatusChange={setAcademicStatus}
                onTargetGradeChange={setSelectedTargetGrade}
                onLoadExample={handleLoadExample}
                onReset={handleReset}
              />
            </div>

            <div className="lg:col-span-5 flex flex-col [&>section]:flex-1">
              <FinalResultCard
                academicStatus={academicStatus}
                internalMarks={validInternalMarks}
                finalResult={finalResult}
                nextGradeInfo={nextGradeInfo}
                achievableBounds={achievableBounds}
                hasValidationError={hasValidationError}
                onLoadExample={handleLoadExample}
              />
            </div>
          </div>
        </section>

        {/* Feature One & Four: 6-Card Grade Comparison Dashboard */}
        <GradeComparisonGrid
          internalMarks={validInternalMarks}
          targets={gradeTargets}
          selectedTargetGrade={selectedTargetGrade}
          expectedGrade={finalResult ? finalResult.gradeDefinition.grade : null}
          academicStatus={academicStatus}
          achievableBounds={achievableBounds}
          onSelectTargetGrade={setSelectedTargetGrade}
        />

        {/* Official SRM Grading System & Formulas */}
        <GradingReferenceSection />
      </main>

      <footer className="mt-8 border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-stone-500 sm:px-6">
          <p>SRM University Smart Marks Calculator · 60 Internal + 75 External (Converted to 40)</p>
          <p>Unrounded marks used for grade determination · Displayed to 2 decimal places</p>
        </div>
      </footer>
    </div>
  );
}

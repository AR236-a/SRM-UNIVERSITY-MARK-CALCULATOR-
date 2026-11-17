import { SPECIAL_ACADEMIC_STATUSES, SRM_GRADING_SCALE } from '../utils/srmGrading';

export function GradingReferenceSection() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Official SRM Grading System Table */}
      <section
        id="grading-system"
        aria-labelledby="grading-system-heading"
        className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7 lg:col-span-7"
      >
        <h2 id="grading-system-heading" className="text-lg font-bold text-stone-900">
          Official SRM Grading System
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Grade boundaries evaluated on unrounded final marks out of 100.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500">
                <th scope="col" className="py-2.5 pr-4">Final Marks</th>
                <th scope="col" className="py-2.5 px-4">Grade</th>
                <th scope="col" className="py-2.5 px-4">Performance</th>
                <th scope="col" className="py-2.5 pl-4 text-right">Grade Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {SRM_GRADING_SCALE.map((row) => (
                <tr key={row.grade} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-2.5 pr-4 font-mono font-medium text-stone-800 tabular-nums">
                    {row.rangeLabel}
                  </td>
                  <td className="py-2.5 px-4 font-display font-bold text-[#7A1426]">
                    {row.grade}
                  </td>
                  <td className="py-2.5 px-4 text-stone-600">{row.description}</td>
                  <td className="py-2.5 pl-4 text-right font-mono font-semibold text-stone-900 tabular-nums">
                    {row.gradePoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Distinct Academic Statuses Ab and I */}
        <div className="mt-5 border-t border-stone-200 pt-4">
          <h3 className="text-xs font-semibold text-stone-700">
            Non-Marks Academic Statuses
          </h3>
          <dl className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SPECIAL_ACADEMIC_STATUSES.map((item) => (
              <div key={item.code} className="rounded-xl bg-stone-50 p-3.5">
                <dt className="font-display text-sm font-bold text-stone-900">
                  {item.code} — {item.title}
                </dt>
                <dd className="mt-1 text-xs leading-relaxed text-stone-600">
                  {item.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Official Mark Distribution & Formulas */}
      <section
        id="formulas"
        aria-labelledby="formulas-heading"
        className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7 lg:col-span-5"
      >
        <h2 id="formulas-heading" className="text-lg font-bold text-stone-900">
          Mark Distribution &amp; Formulas
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Standard SRM internal and external weightage split (60:40).
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-stone-50 p-3.5">
            <dt className="text-xs text-stone-500">Internal Examination</dt>
            <dd className="mt-1 font-mono text-lg font-bold text-stone-900 tabular-nums">60 marks</dd>
          </div>
          <div className="rounded-xl bg-stone-50 p-3.5">
            <dt className="text-xs text-stone-500">External Raw Exam</dt>
            <dd className="mt-1 font-mono text-lg font-bold text-stone-900 tabular-nums">75 marks</dd>
          </div>
          <div className="rounded-xl bg-stone-50 p-3.5">
            <dt className="text-xs text-stone-500">External Converted</dt>
            <dd className="mt-1 font-mono text-lg font-bold text-[#7A1426] tabular-nums">40 marks</dd>
          </div>
          <div className="rounded-xl bg-stone-50 p-3.5">
            <dt className="text-xs text-stone-500">Total Subject Marks</dt>
            <dd className="mt-1 font-mono text-lg font-bold text-stone-900 tabular-nums">100 marks</dd>
          </div>
        </dl>

        <div className="mt-5 space-y-3 border-t border-stone-200 pt-4 text-xs">
          <div>
            <p className="font-semibold text-stone-800">1. External Converted Marks</p>
            <p className="mt-1 rounded-lg bg-stone-50 px-3 py-2 font-mono text-stone-700">
              (External Marks Obtained / 75) × 40
            </p>
          </div>

          <div>
            <p className="font-semibold text-stone-800">2. Final Subject Marks</p>
            <p className="mt-1 rounded-lg bg-stone-50 px-3 py-2 font-mono text-stone-700">
              Internal Marks + External Converted Marks
            </p>
          </div>

          <div>
            <p className="font-semibold text-stone-800">3. Required External Raw Marks</p>
            <p className="mt-1 rounded-lg bg-stone-50 px-3 py-2 font-mono text-stone-700">
              ceil((Required Final − Internal Marks) × 75 / 40)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

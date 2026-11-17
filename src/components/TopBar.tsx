import { RotateCcw } from 'lucide-react';

interface TopBarProps {
  onReset: () => void;
  hasAnyInput: boolean;
}

export function TopBar({ onReset, hasAnyInput }: TopBarProps) {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        <a
          href="#calculator"
          className="font-display text-lg font-bold tracking-tight text-[#7A1426] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1426] focus-visible:ring-offset-2 rounded"
        >
          SRM Smart Marks Calculator
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600"
        >
          <a
            href="#calculator"
            className="hover:text-[#7A1426] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Calculator
          </a>
          <a
            href="#grade-comparison"
            className="hover:text-[#7A1426] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Grade Targets
          </a>
          <a
            href="#grading-system"
            className="hover:text-[#7A1426] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Grading Scale
          </a>
          <a
            href="#formulas"
            className="hover:text-[#7A1426] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Formulas
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasAnyInput}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#7A1426] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5E0E1C] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1426] focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}

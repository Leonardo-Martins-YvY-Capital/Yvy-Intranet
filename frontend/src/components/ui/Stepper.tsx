import { cn } from "../../lib/utils";

interface StepperStep {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number; // 0-based
  className?: string;
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8l3.5 3.5L13 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progresso do cadastro" className={className}>
      <ol className="flex items-start">
        {steps.map((step, i) => {
          const isComplete = i < currentStep;
          const isCurrent = i === currentStep;

          return (
            <li
              key={i}
              className="flex-1 flex flex-col items-center"
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Header row: left line — circle — right line */}
              <div className="flex items-center w-full">
                <div
                  className={cn(
                    "flex-1 h-px",
                    i === 0
                      ? "invisible"
                      : i <= currentStep
                      ? "bg-yvy-navy"
                      : "bg-black/15"
                  )}
                />
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold font-barlowcn yvy-transition",
                    isComplete && "bg-yvy-navy text-white",
                    isCurrent && "bg-yvy-royal text-white",
                    !isComplete && !isCurrent && "bg-white border border-black/15 text-yvy-navy/30"
                  )}
                >
                  {isComplete ? <CheckIcon /> : i + 1}
                </div>
                <div
                  className={cn(
                    "flex-1 h-px",
                    i === steps.length - 1
                      ? "invisible"
                      : i < currentStep
                      ? "bg-yvy-navy"
                      : "bg-black/15"
                  )}
                />
              </div>

              {/* Label + description */}
              <div className="text-center mt-2 px-1 flex flex-col gap-y-0.5">
                <span
                  className={cn(
                    "text-xs font-barlowcn uppercase tracking-wider yvy-transition",
                    isCurrent
                      ? "text-yvy-navy font-semibold"
                      : "text-yvy-navy/40 font-medium"
                  )}
                >
                  {step.label}
                </span>
                {step.description && isCurrent && (
                  <span className="text-xs font-barlow font-light text-yvy-navy/40">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

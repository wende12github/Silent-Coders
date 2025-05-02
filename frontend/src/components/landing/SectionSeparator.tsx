
export const SectionSeparator = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg
        className="w-full h-12"
        viewBox="0 0 1200 40"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0 C100,20 200,40 300,30 C400,20 500,0 600,10 C700,20 800,40 900,30 C1000,20 1100,10 1200,20 L1200,40 L0,40 Z"
          fill="currentColor"
          className="text-[var(--color-primary)]/5"
        />
      </svg>
    </div>
  );
};
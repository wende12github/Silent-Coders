export const LoadingOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="h-20 w-20 animate-spin rounded-full border-6 border-[var(--color-primary)] border-t-transparent"></div>
        <p className="mt-4 text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );
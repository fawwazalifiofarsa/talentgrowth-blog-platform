type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        <span>{message}</span>
      </div>
    </div>
  );
}

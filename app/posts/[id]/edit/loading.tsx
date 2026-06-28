import { LoadingState } from "@/components/loading-state";

export default function EditPostLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <LoadingState message="Loading post editor..." />
    </div>
  );
}

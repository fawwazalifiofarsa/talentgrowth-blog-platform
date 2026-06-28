import { LoadingState } from "@/components/loading-state";

export default function PostDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <LoadingState message="Loading post..." />
    </div>
  );
}

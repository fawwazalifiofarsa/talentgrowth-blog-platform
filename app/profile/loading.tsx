import { LoadingState } from "@/components/loading-state";

export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <LoadingState message="Loading profile..." />
    </div>
  );
}

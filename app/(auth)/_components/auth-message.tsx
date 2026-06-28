import type { AuthActionState } from "@/app/(auth)/actions";

export function AuthMessage({ state }: { state: AuthActionState }) {
  if (state.message) {
    return (
      <p
        className={`rounded-md px-3 py-2 text-sm ${
          state.success
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-700"
        }`}
      >
        {state.message}
      </p>
    );
  }

  return null;
}

import { SignUpForm } from "@/app/(auth)/_components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Sign up
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Create an account to write posts and join discussions.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <SignUpForm />
      </div>
    </div>
  );
}

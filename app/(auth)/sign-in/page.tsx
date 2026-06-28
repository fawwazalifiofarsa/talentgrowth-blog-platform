import { SignInForm } from "@/app/(auth)/_components/sign-in-form";

type SignInPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Sign in
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Access your account to create posts and manage your profile.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <SignInForm next={params?.next} />
      </div>
    </div>
  );
}

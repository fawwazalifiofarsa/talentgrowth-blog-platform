export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Blog Platform
        </p>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Read and write focused developer posts.
          </h1>
          <p className="text-lg leading-8 text-slate-600">
            A clean foundation for posts, comments, profiles, search,
            pagination, and Markdown writing.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="post-search">
            Search posts
          </label>
          <input
            id="post-search"
            type="search"
            name="search"
            placeholder="Search posts"
            disabled
            className="min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-500 shadow-sm"
          />
          <button
            type="button"
            disabled
            className="min-h-11 rounded-md bg-slate-900 px-4 text-sm font-medium text-white opacity-60"
          >
            Search
          </button>
        </div>

        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">No posts yet.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Post listing, search, and pagination will be connected in the next
            feature workstream.
          </p>
        </div>
      </section>
    </div>
  );
}

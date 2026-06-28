import Link from "next/link";

type SearchInputProps = {
  search?: string;
  limit: number;
};

export function SearchInput({ search, limit }: SearchInputProps) {
  return (
    <form action="/" className="flex flex-col gap-3 sm:flex-row">
      <input type="hidden" name="limit" value={limit} />
      <label className="sr-only" htmlFor="post-search">
        Search posts
      </label>
      <input
        id="post-search"
        type="search"
        name="search"
        defaultValue={search}
        placeholder="Search posts"
        className="min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-900"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="min-h-11 flex-1 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700 sm:flex-none"
        >
          Search
        </button>
        {search ? (
          <Link
            href={`/?limit=${limit}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-100 sm:flex-none"
          >
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}

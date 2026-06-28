import Link from "next/link";

import type { PaginationMeta } from "@/lib/api/client";

type PaginationProps = {
  pagination: PaginationMeta;
  search?: string;
  basePath?: string;
};

function getPageHref(
  page: number,
  limit: number,
  search?: string,
  basePath = "/",
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search) {
    params.set("search", search);
  }

  return `${basePath}?${params.toString()}`;
}

export function Pagination({
  pagination,
  search,
  basePath = "/",
}: PaginationProps) {
  const hasPrevious = pagination.page > 1;
  const hasNext =
    pagination.totalPages > 0 && pagination.page < pagination.totalPages;
  const previousPage = Math.max(1, pagination.page - 1);
  const nextPage = Math.min(pagination.totalPages, pagination.page + 1);

  return (
    <nav
      aria-label="Post pagination"
      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-slate-600">
        Page{" "}
        <span className="font-medium text-slate-950">{pagination.page}</span> of{" "}
        <span className="font-medium text-slate-950">
          {Math.max(1, pagination.totalPages)}
        </span>
      </p>
      <div className="flex gap-2">
        {hasPrevious ? (
          <Link
            href={getPageHref(previousPage, pagination.limit, search, basePath)}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-100 sm:flex-none"
          >
            Previous
          </Link>
        ) : (
          <span className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-400 sm:flex-none">
            Previous
          </span>
        )}
        {hasNext ? (
          <Link
            href={getPageHref(nextPage, pagination.limit, search, basePath)}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-100 sm:flex-none"
          >
            Next
          </Link>
        ) : (
          <span className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-400 sm:flex-none">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}

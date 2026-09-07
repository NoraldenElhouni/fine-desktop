import React, { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { SearchableSelect } from "./SearchableSelect";
import type { SearchableSelectProps } from "./SearchableSelect";
import { cn } from "../../lib/utils/utils";

export interface AsyncSearchableSelectPage<T> {
  data: T[];
  hasMore: boolean;
}

export interface AsyncSearchableSelectProps<T>
  extends Omit<
    SearchableSelectProps<T>,
    | "options"
    | "loading"
    | "value"
    | "onChange"
    | "searchValue"
    | "onSearchChange"
  > {
  fetcher: (params: {
    search: string;
    page: number;
  }) => Promise<AsyncSearchableSelectPage<T>>;
  value: T | null;
  onChange: (next: T | null) => void;
  queryKey: readonly unknown[];

  debounceMs?: number;
  minSearchLength?: number;
  initialSearch?: string;

  emptyMessage?: string;
  loadingMessage?: string;
  loadingMoreMessage?: string;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function AsyncSearchableSelect<T>({
  fetcher,
  queryKey,
  value,
  onChange,
  debounceMs = 250,
  minSearchLength = 0,
  initialSearch = "",
  emptyMessage = "لا توجد نتائج.",
  loadingMessage = "جارٍ التحميل…",
  loadingMoreMessage = "جارٍ تحميل المزيد…",
  ...selectProps
}: AsyncSearchableSelectProps<T>) {
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(searchInput, debounceMs);

  const lastFetcherRef = useRef(fetcher);
  useEffect(() => {
    lastFetcherRef.current = fetcher;
  }, [fetcher]);

  const effectiveSearch =
    debouncedSearch.trim().length >= minSearchLength ? debouncedSearch : "";

  const query = useInfiniteQuery({
    queryKey: [...queryKey, effectiveSearch],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const f = lastFetcherRef.current;
      const res = await f({ search: effectiveSearch, page: pageParam });
      return {
        data: res.data,
        nextPageParam: res.hasMore ? (pageParam as number) + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage: { nextPageParam?: number }) =>
      lastPage.nextPageParam,
    staleTime: 30_000,
  });

  const options = useMemo(() => {
    const pages = query.data?.pages ?? [];
    return pages.flatMap((p) => (p as { data: T[] }).data);
  }, [query.data]);

  useEffect(() => {
    if (
      value &&
      !options.some(
        (o) => selectProps.getOptionId(o) === selectProps.getOptionId(value)
      ) &&
      !query.isFetching
    ) {
      onChange(null);
    }
  }, [options, value, onChange, query.isFetching, selectProps]);

  return (
    <div className="relative w-full" dir="rtl">
      <SearchableSelect<T>
        {...selectProps}
        options={options}
        value={value}
        onChange={onChange}
        loading={query.isFetching}
        placeholder={selectProps.placeholder ?? "اختر…"}
        emptyMessage={
          query.isFetching
            ? loadingMessage
            : options.length === 0 && effectiveSearch
              ? `${emptyMessage} (${effectiveSearch})`
              : emptyMessage
        }
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        className={cn(selectProps.className)}
        onBlur={() => {
          selectProps.onBlur?.();
        }}
      />

      <div className="sr-only" aria-live="polite">
        {query.isFetching ? loadingMessage : ""}
      </div>

      {query.hasNextPage && !searchInput.trim() && (
        <button
          type="button"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className={cn(
            "absolute -bottom-7 start-0 text-[10px] text-app-accent hover:underline font-semibold disabled:opacity-50"
          )}
        >
          {query.isFetchingNextPage ? loadingMoreMessage : "تحميل المزيد…"}
        </button>
      )}
    </div>
  );
}

export function useInvalidateSearchableSelect(queryKey: readonly unknown[]) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey });
}

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";

export interface SearchableSelectOption {
  id: string;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}

export interface SearchableSelectRenderOptionContext {
  active: boolean;
  selected: boolean;
}

export interface SearchableSelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (next: T | null) => void;

  getOptionId: (opt: T) => string;
  getOptionLabel: (opt: T) => string;
  getOptionSubLabel?: (opt: T) => string | undefined;
  getOptionSearchText?: (opt: T) => string;
  getOptionDisabled?: (opt: T) => boolean;
  renderOption?: (
    opt: T,
    ctx: SearchableSelectRenderOptionContext
  ) => React.ReactNode;
  isOptionEqual?: (a: T, b: T) => boolean;

  placeholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  required?: boolean;
  size?: "sm" | "md";
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  maxVisibleOptions?: number;
  ariaLabel?: string;
  name?: string;
  id?: string;
  onBlur?: () => void;

  searchValue?: string;
  onSearchChange?: (next: string) => void;
}

const sizeClasses: Record<"sm" | "md", string> = {
  sm: "px-2.5 py-1.5 text-[11px]",
  md: "px-3 py-2 text-xs",
};

const popoverOptionSizeClasses: Record<"sm" | "md", string> = {
  sm: "px-2.5 py-1.5 text-[11px]",
  md: "px-3 py-2 text-xs",
};

function defaultEqual<T>(a: T, b: T, getId: (o: T) => string): boolean {
  return getId(a) === getId(b);
}

function normalize(input: string): string {
  return input.trim().toLocaleLowerCase("ar-LY");
}

export const SearchableSelect = forwardRef(function SearchableSelect<T>(
  {
    options,
    value,
    onChange,
    getOptionId,
    getOptionLabel,
    getOptionSubLabel,
    getOptionSearchText,
    getOptionDisabled,
    renderOption,
    isOptionEqual,
    placeholder = "اختر…",
    emptyMessage = "لا توجد نتائج.",
    loading = false,
    disabled = false,
    clearable = true,
    size = "md",
    className,
    triggerClassName,
    popoverClassName,
    maxVisibleOptions = 200,
    ariaLabel,
    name,
    id,
    onBlur,
    searchValue,
    onSearchChange,
    required,
  }: SearchableSelectProps<T>,
  ref: React.Ref<HTMLButtonElement>
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const listboxId = `${fieldId}-listbox`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

  const [open, setOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const search =
    searchValue !== undefined ? searchValue : internalSearch;
  const setSearch = (next: string) => {
    if (onSearchChange) {
      onSearchChange(next);
    } else {
      setInternalSearch(next);
    }
  };
  const [activeIndex, setActiveIndex] = useState(0);

  const eq = useCallback(
    (a: T, b: T) =>
      isOptionEqual ? isOptionEqual(a, b) : defaultEqual(a, b, getOptionId),
    [isOptionEqual, getOptionId]
  );

  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return options;
    return options.filter((o) => {
      const haystack = normalize(
        getOptionSearchText ? getOptionSearchText(o) : getOptionLabel(o)
      );
      return haystack.includes(q);
    });
  }, [options, search, getOptionLabel, getOptionSearchText]);

  const visibleOptions = useMemo(
    () => filtered.slice(0, maxVisibleOptions),
    [filtered, maxVisibleOptions]
  );

  useEffect(() => {
    if (!open) return;
    const handleDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        target &&
        !triggerRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
        setSearch("");
        onBlur?.();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
        triggerRef.current?.focus();
        onBlur?.();
      }
    };
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onBlur]);

  useEffect(() => {
    if (open) {
      const idx = visibleOptions.findIndex((o) => value && eq(o, value));
      setActiveIndex(idx >= 0 ? idx : 0);
    }
  }, [open, visibleOptions, value, eq]);

  const handleSelect = (opt: T) => {
    if (getOptionDisabled?.(opt)) return;
    onChange(opt);
    setOpen(false);
    setSearch("");
    triggerRef.current?.focus();
  };

  const handleKeyDownTrigger: React.KeyboardEventHandler<HTMLButtonElement> = (
    e
  ) => {
    if (disabled) return;
    if (
      e.key === "ArrowDown" ||
      e.key === "ArrowUp" ||
      e.key === "Enter" ||
      e.key === " "
    ) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleKeyDownListbox: React.KeyboardEventHandler<HTMLDivElement> = (
    e
  ) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) =>
        Math.min(visibleOptions.length - 1, i + 1 < 0 ? 0 : i + 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(Math.max(0, visibleOptions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = visibleOptions[activeIndex];
      if (opt) handleSelect(opt);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setSearch("");
      triggerRef.current?.focus();
    }
  };

  const handleClear: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onChange(null);
    setSearch("");
    triggerRef.current?.focus();
  };

  const selectedLabel = value ? getOptionLabel(value) : null;
  const selectedSubLabel = value ? getOptionSubLabel?.(value) : null;

  return (
    <div className={cn("relative w-full", className)} dir="rtl">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && visibleOptions[activeIndex]
            ? `${fieldId}-opt-${getOptionId(visibleOptions[activeIndex])}`
            : undefined
        }
        aria-label={ariaLabel}
        aria-required={required ? true : undefined}
        id={fieldId}
        name={name}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDownTrigger}
        className={cn(
          tokens.typography.webUI.b2Regular,
          sizeClasses[size],
          "w-full border rounded-app-lg bg-app-bg-primary text-app-label-primary text-start",
          "flex items-center gap-2 outline-none transition-colors",
          disabled
            ? "border-app-separator opacity-50 cursor-not-allowed"
            : open
              ? "border-app-accent ring-1 ring-app-accent"
              : "border-app-separator hover:border-app-fill-f3 focus:border-app-accent focus:ring-1 focus:ring-app-accent",
          triggerClassName
        )}
      >
        <span
          className={cn(
            "flex-1 truncate text-start",
            !selectedLabel && "text-app-label-tertiary"
          )}
        >
          {selectedLabel ?? placeholder}
        </span>

        {loading ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-app-label-tertiary" />
        ) : clearable && value && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded p-0.5 text-app-label-tertiary hover:bg-app-fill-f1 hover:text-app-label-secondary transition-colors"
            tabIndex={-1}
            aria-label="مسح الاختيار"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}

        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-app-label-tertiary transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {selectedSubLabel && !open && (
        <p
          className={cn(
            tokens.typography.webUI.c1Regular,
            "text-app-label-tertiary mt-1 truncate text-start"
          )}
        >
          {selectedSubLabel}
        </p>
      )}

      {open && (
        <div
          ref={popoverRef}
          className={cn(
            "absolute z-40 mt-1 w-full rounded-app-lg border border-app-separator bg-app-bg-primary shadow-lg overflow-hidden",
            "animate-in fade-in slide-in-from-top-1 duration-150",
            popoverClassName
          )}
          onKeyDown={handleKeyDownListbox}
        >
          <div className="relative border-b border-app-separator bg-app-bg-secondary">
            <Search className="absolute inset-y-0 start-2 my-auto h-3.5 w-3.5 text-app-label-tertiary pointer-events-none" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="بحث…"
              dir="rtl"
              className={cn(
                tokens.typography.webUI.b2Regular,
                "w-full bg-transparent ps-7 pe-2 py-2 text-start text-app-label-primary placeholder-app-label-tertiary outline-none"
              )}
            />
            {loading && (
              <Loader2 className="absolute inset-y-0 end-2 my-auto h-3.5 w-3.5 animate-spin text-app-label-tertiary" />
            )}
          </div>

          <ul
            id={listboxId}
            role="listbox"
            dir="rtl"
            className="max-h-60 overflow-y-auto py-1"
          >
            {visibleOptions.length === 0 ? (
              <li
                className={cn(
                  tokens.typography.webUI.c1Regular,
                  "px-3 py-4 text-center text-app-label-tertiary"
                )}
              >
                {emptyMessage}
              </li>
            ) : (
              visibleOptions.map((opt, idx) => {
                const optId = getOptionId(opt);
                const label = getOptionLabel(opt);
                const subLabel = getOptionSubLabel?.(opt);
                const isActive = idx === activeIndex;
                const isSelected = value ? eq(opt, value) : false;
                const isDisabled = !!getOptionDisabled?.(opt);

                return (
                  <li
                    key={optId}
                    id={`${fieldId}-opt-${optId}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      tokens.typography.webUI.b2Regular,
                      popoverOptionSizeClasses[size],
                      "flex items-center gap-2 cursor-pointer text-start",
                      "transition-colors",
                      isActive && "bg-app-fill-f1",
                      isDisabled && "opacity-50 cursor-not-allowed",
                      isSelected && "font-semibold"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-3.5 w-3.5 shrink-0 items-center justify-center",
                        isSelected ? "text-app-accent" : "text-transparent"
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {renderOption ? (
                      renderOption(opt, {
                        active: isActive,
                        selected: isSelected,
                      })
                    ) : (
                      <span className="flex-1 truncate">
                        <span className="block truncate text-app-label-primary">
                          {label}
                        </span>
                        {subLabel && (
                          <span
                            className={cn(
                              tokens.typography.webUI.c1Regular,
                              "block truncate text-app-label-tertiary"
                            )}
                          >
                            {subLabel}
                          </span>
                        )}
                      </span>
                    )}
                  </li>
                );
              })
            )}

            {filtered.length > maxVisibleOptions && (
              <li
                className={cn(
                  tokens.typography.webUI.c1Regular,
                  "px-3 py-2 text-center text-app-label-tertiary border-t border-app-separator bg-app-bg-secondary"
                )}
              >
                اعرض أول {maxVisibleOptions} نتيجة — اكمل البحث لتضييق القائمة.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}) as <T>(
  props: SearchableSelectProps<T> & {
    ref?: React.Ref<HTMLButtonElement>;
  }
) => React.ReactElement;

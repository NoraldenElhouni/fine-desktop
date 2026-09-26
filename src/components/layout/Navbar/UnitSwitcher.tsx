import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Check, ChevronDown, Search, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "../../../lib/utils/utils";
import { tokens } from "../../../lib/tokens";
import { useServerConfigStore } from "../../../stores/serverConfigStore";
import { useOperatingUnits } from "../../../hooks/usePartners";
import type { OperatingUnit } from "../../../types/entities";

/**
 * The navbar unit switcher. Company-wide roles pick "كل الوحدات" (unpinned) by
 * default and can drill down to a single unit; unit-scoped users have a fixed
 * binding and don't see this control.
 */
const UnitSwitcher = () => {
  const { operatingUnitId, setOperatingUnitId } = useServerConfigStore();
  const { data: operatingUnits = [] } = useOperatingUnits();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const pinned = useMemo(
    () => operatingUnits.find((u: OperatingUnit) => u.id === operatingUnitId) ?? null,
    [operatingUnits, operatingUnitId],
  );

  const label = pinned ? pinned.name : "كل الوحدات";

  const filteredUnits = useMemo(() => {
    if (!query.trim()) return operatingUnits;
    const q = query.trim().toLowerCase();
    return operatingUnits.filter((u: OperatingUnit) => u.name.toLowerCase().includes(q));
  }, [operatingUnits, query]);

  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const width = Math.max(r.width, 280);
      const left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12));
      setPopoverPos({ top: r.bottom + 6, left, width });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => searchRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
    setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const pick = (id: string | null) => {
    if (id === operatingUnitId) {
      setOpen(false);
      return;
    }
    setOperatingUnitId(id);
    setOpen(false);
    // Every unit-scoped query is stale the moment X-Operating-Unit-ID changes —
    // refetch everything currently on screen instead of showing the old unit's data.
    queryClient.invalidateQueries();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-app-xl border px-3 py-2 transition-all",
          tokens.typography.webUI.c1Emphasized,
          pinned
            ? "border-app-accent/40 bg-app-accent/10 text-app-accent hover:bg-app-accent/15"
            : "border-app-separator bg-app-bg-secondary text-app-label-secondary hover:bg-app-fill-f1",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="اختر الوحدة التشغيلية"
      >
        <Building2 className="h-4 w-4" />
        <span className={tokens.typography.webUI.c1Regular}>{label}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </button>

      {open && popoverPos && createPortal(
        <div
          ref={popoverRef}
          role="listbox"
          style={{ top: popoverPos.top, left: popoverPos.left, width: popoverPos.width }}
          className="fixed z-50 max-h-80 overflow-auto rounded-app-xl border border-app-separator bg-app-bg-primary shadow-app-modal"
          dir="rtl"
        >
          <div className="sticky top-0 z-10 border-b border-app-separator bg-app-bg-primary p-2">
            <div className="flex items-center gap-2 rounded-app-md border border-app-separator bg-app-bg-secondary px-2 py-1.5">
              <Search className="h-3.5 w-3.5 text-app-label-secondary" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث عن وحدة..."
                className="flex-1 bg-transparent text-xs text-app-label-primary placeholder:text-app-label-tertiary focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-app-label-tertiary hover:text-app-label-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            role="option"
            aria-selected={operatingUnitId === null}
            onClick={() => pick(null)}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-start text-xs transition-colors hover:bg-app-fill-f1",
              operatingUnitId === null
                ? "bg-app-accent/10 text-app-accent"
                : "text-app-label-primary",
            )}
          >
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 font-semibold">كل الوحدات</span>
            {operatingUnitId === null && <Check className="h-3.5 w-3.5" />}
          </button>

          <div className="border-t border-app-separator" />

          {filteredUnits.length === 0 ? (
            <div className="p-3 text-center text-xs text-app-label-secondary">
              لا توجد وحدات مطابقة
            </div>
          ) : (
            filteredUnits.map((unit: OperatingUnit) => {
              const selected = operatingUnitId === unit.id;
              return (
                <button
                  key={unit.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => pick(unit.id)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-start text-xs transition-colors hover:bg-app-fill-f1",
                    selected
                      ? "bg-app-accent/10 text-app-accent"
                      : "text-app-label-primary",
                  )}
                >
                  <span className="flex-1">{unit.name}</span>
                  {selected && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })
          )}
        </div>,
        document.body,
      )}
    </>
  );
};

export default UnitSwitcher;

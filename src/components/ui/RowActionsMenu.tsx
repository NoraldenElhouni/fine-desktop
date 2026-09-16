import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import { cn } from "../../lib/utils/utils";

export interface RowActionItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface RowActionsMenuProps {
  items: RowActionItem[];
  className?: string;
  ariaLabel?: string;
}

interface MenuPosition {
  left: number;
  placement: "bottom" | "top";
  offset: number;
}

const GAP = 4;
const ITEM_HEIGHT = 34;
const MENU_WIDTH = 176;

/**
 * Same fixed-position-portal approach as SearchableSelect's popover, so the menu
 * never gets clipped by a scrollable dialog body and flips upward when it's near
 * the bottom of the viewport.
 */
export const RowActionsMenu: React.FC<RowActionsMenuProps> = ({ items, className, ariaLabel = "إجراءات" }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedHeight = Math.min(items.length * ITEM_HEIGHT + 8, 280);
    const spaceBelow = viewportHeight - rect.bottom - GAP;
    const spaceAbove = rect.top - GAP;
    const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    setPosition({
      left: Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)),
      placement: openUpward ? "top" : "bottom",
      offset: openUpward ? viewportHeight - rect.top + GAP : rect.bottom + GAP,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    updatePosition();
    const handle = () => updatePosition();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [open, items.length]);

  useLayoutEffect(() => {
    if (!open) return;
    const handleDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (target && !triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className={cn("inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="rounded-lg p-1.5 text-app-label-secondary hover:bg-app-fill-f1 hover:text-app-label-primary transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            dir="rtl"
            style={{
              left: position.left,
              width: MENU_WIDTH,
              ...(position.placement === "bottom" ? { top: position.offset } : { bottom: position.offset }),
            }}
            className="fixed z-[9999] overflow-hidden rounded-app-lg border border-app-separator bg-app-bg-primary py-1 shadow-lg animate-in fade-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-start text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                    item.danger
                      ? "text-app-status-danger hover:bg-app-status-danger/10"
                      : "text-app-label-primary hover:bg-app-fill-f1"
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                  {item.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};

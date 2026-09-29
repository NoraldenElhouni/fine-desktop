import React, { useMemo } from "react";
import { BookOpen, Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { SearchableSelect } from "../ui/SearchableSelect";
import { useAccounts } from "../../hooks/useAccounting";
import {
  inventoryItemAccountsApi,
  INVENTORY_EVENT_TYPES,
  INVENTORY_EVENT_LABELS,
  REQUIRED_INVENTORY_EVENTS,
  type InventoryEventType,
  type InventoryItemAccount,
} from "../../api/endpoints/inventoryItemAccounts";
import { toast } from "../../stores/toastStore";

interface InventoryItemAccountsEditorProps {
  itemId: string | null;
}

const EVENT_ORDER: InventoryEventType[] = [...INVENTORY_EVENT_TYPES];

export const InventoryItemAccountsEditor: React.FC<InventoryItemAccountsEditorProps> = ({
  itemId,
}) => {
  const queryClient = useQueryClient();
  const accountsQuery = useAccounts();
  const accounts = accountsQuery.data ?? [];

  const list = useQuery({
    queryKey: ["inventory-item-accounts", itemId],
    queryFn: () => inventoryItemAccountsApi.list(itemId as string).then((r) => r.data),
    enabled: Boolean(itemId),
  });

  const upsertMutation = useMutation({
    mutationFn: (vars: { event: InventoryEventType; accountId: string | null }) =>
      vars.accountId === null
        ? inventoryItemAccountsApi.remove(itemId as string, lookupRowId(list.data, vars.event))
        : inventoryItemAccountsApi.upsert(itemId as string, {
            event_type: vars.event,
            account_id: vars.accountId,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-item-accounts", itemId] });
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, "فشل حفظ ربط الحساب"));
    },
  });

  const byType = useMemo(() => {
    const map = new Map<InventoryEventType, InventoryItemAccount>();
    for (const row of list.data?.data ?? []) {
      map.set(row.event_type, row);
    }
    return map;
  }, [list.data]);

  const linkedCount = byType.size;
  const missingRequired = REQUIRED_INVENTORY_EVENTS.filter((e) => !byType.get(e)?.account);

  if (!itemId) {
    return (
      <div className="rounded-xl border border-dashed border-app-separator bg-app-bg-secondary p-3 text-xs text-app-label-secondary">
        احفظ الصنف أولاً لتتمكن من ربط الحسابات.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-app-accent" />
          <span className="text-xs font-bold text-app-label-primary">
            ربط الحسابات (دليل الحسابات)
          </span>
          <span className="rounded-full bg-app-fill-f1 px-2 py-0.5 text-[10px] font-bold text-app-label-secondary">
            {linkedCount} / {EVENT_ORDER.length}
          </span>
        </div>
        {missingRequired.length > 0 && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-app-status-danger">
            <AlertTriangle className="h-3.5 w-3.5" />
            مطلوب لبدء الحركة: {missingRequired.length} حساب
          </span>
        )}
      </div>

      {list.isLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-secondary p-3 text-xs text-app-label-secondary">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          جارٍ تحميل الحسابات المرتبطة…
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-app-separator">
          {EVENT_ORDER.map((event) => {
            const row = byType.get(event);
            const isRequired = REQUIRED_INVENTORY_EVENTS.includes(event);
            const selected = row?.account
              ? accounts.find((a) => a.id === row.account!.id) ?? null
              : null;
            return (
              <div
                key={event}
                className="flex items-center gap-3 border-b border-app-separator bg-app-bg-primary px-3 py-2 last:border-b-0"
              >
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-app-label-primary">
                      {INVENTORY_EVENT_LABELS[event]}
                    </span>
                    {isRequired && (
                      <span
                        className="rounded-full bg-app-status-danger/15 px-1.5 py-0.5 text-[9px] font-bold text-app-status-danger"
                        title="بدون هذا الحساب يرفض النظام أي حركة على الصنف"
                      >
                        مطلوب
                      </span>
                    )}
                    <span className="text-[10px] text-app-label-tertiary" dir="ltr">
                      {event}
                    </span>
                  </div>
                </div>
                <div className="w-72">
                  <SearchableSelect<{ id: string; account_code: string; name: string; type: string }>
                    options={accounts}
                    value={selected}
                    onChange={(acc) =>
                      upsertMutation.mutate({
                        event,
                        accountId: acc ? acc.id : null,
                      })
                    }
                    getOptionId={(acc) => acc.id}
                    getOptionLabel={(acc) => `${acc.account_code} - ${acc.name} (${acc.type})`}
                    placeholder="اختر الحساب…"
                    size="sm"
                    triggerClassName="text-[11px]"
                    disabled={upsertMutation.isPending}
                  />
                </div>
                {selected ? (
                  <button
                    type="button"
                    onClick={() =>
                      upsertMutation.mutate({ event, accountId: null })
                    }
                    className="rounded-lg border border-app-separator p-1 text-app-label-tertiary hover:bg-app-fill-f1 hover:text-app-status-danger"
                    title="إزالة الربط"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center text-app-label-tertiary">
                    <Check className="h-3.5 w-3.5 opacity-0" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function lookupRowId(
  data: { data: InventoryItemAccount[] } | undefined,
  event: InventoryEventType,
): string {
  const row = data?.data.find((r) => r.event_type === event);
  if (!row) {
    throw new Error(`No existing row for event ${event} to delete`);
  }
  return row.id;
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return fallback;
}

import React, { useMemo, useState } from "react";
import { BookOpenText, Plus, AlertTriangle, Trash2, ChevronDown, ChevronUp, PencilLine } from "lucide-react";
import { useClients } from "../../hooks/useClients";
import type { Client } from "../../types/entities";
import { useJournalEntries, useCreateManualEntry, useAccounts } from "../../hooks/useAccounting";
import { apiErrorPayload } from "../../api/endpoints/production";
import type { JournalEntry, JournalLine } from "../../api/endpoints/accounting";
import { formatDate, formatNumber } from "../../lib/utils/format";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";
import { DataTable, useDataTable } from "../../components/ui/DataTable";
import { useJournalLinesColumns } from "../../components/table-columns/journalLinesColumns";
import { leafAccounts } from "../../lib/utils/coa";

const num = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const RECEIVABLE_ROOT_CODE = "122";

const PARTY_ERROR_MESSAGES: Record<string, string> = {
  PARTY_ON_NON_RECEIVABLE: "لا يمكن ربط عميل إلا بحساب ذمم مدينة",
  PARTY_ACCOUNT_MISMATCH: "حساب العميل لا يطابق الحساب المختار",
};

interface FormLine {
  key: string;
  account_code: string;
  client_id: string;
  side: "debit" | "credit";
  amount: string;
  memo: string;
}

const emptyLine = (side: "debit" | "credit"): FormLine => ({
  key: Math.random().toString(36).slice(2),
  account_code: "",
  client_id: "",
  side,
  amount: "",
  memo: "",
});

/** The debit/credit breakdown shown inside an expanded journal entry row. */
const JournalLinesTable: React.FC<{ lines: JournalLine[] }> = ({ lines }) => {
  const columns = useJournalLinesColumns();

  const table = useDataTable({
    columns,
    data: lines,
    enableSorting: false,
    enableGlobalFilter: false,
    enablePagination: false,
    getRowId: (l) => l.id,
  });

  return (
    <DataTable table={table} className="rounded-none border-0 shadow-none">
      <DataTable.Content emptyMessage="لا توجد سطور." />
    </DataTable>
  );
};

export const JournalEntriesPage: React.FC = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [manualOnly, setManualOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [lines, setLines] = useState<FormLine[]>([emptyLine("debit"), emptyLine("credit")]);

  const { data: entries, isLoading } = useJournalEntries({
    from: from || undefined,
    to: to || undefined,
    manual_only: manualOnly || undefined,
    page,
  });
  const { data: accounts } = useAccounts();
  const { data: clients = [] } = useClients();
  const createMutation = useCreateManualEntry();

  const totalDebit = lines.reduce((s, l) => s + (l.side === "debit" ? num(l.amount) : 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.side === "credit" ? num(l.amount) : 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.0001 && totalDebit > 0;

  // Receivable subtree: account 122 plus every descendant, walked via parent_account_id.
  const receivableCodes = useMemo(() => {
    const byId = new Map((accounts ?? []).map((a) => [a.id, a]));
    const inSubtree = (id: string): boolean => {
      const seen = new Set<string>();
      let cur = byId.get(id);
      while (cur && !seen.has(cur.id)) {
        if (cur.account_code === RECEIVABLE_ROOT_CODE) return true;
        seen.add(cur.id);
        cur = cur.parent_account_id ? byId.get(cur.parent_account_id) : undefined;
      }
      return false;
    };
    return new Set((accounts ?? []).filter((a) => inSubtree(a.id)).map((a) => a.account_code));
  }, [accounts]);

  // A client bound to a sub-account may only sit on that account (backend PARTY_ACCOUNT_MISMATCH).
  const clientFitsAccount = (client: Client, accountId: string | undefined): boolean =>
    !client.account_id || client.account_id === accountId;

  const patchLine = (key: string, patch: Partial<FormLine>) =>
    setLines(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(
      {
        description,
        entry_date: entryDate || undefined,
        lines: lines.map((l) => ({
          account_code: l.account_code,
          [l.side]: num(l.amount),
          memo: l.memo || undefined,
          ...(l.client_id && receivableCodes.has(l.account_code) ? { client_id: l.client_id } : {}),
        })),
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setDescription("");
          setEntryDate("");
          setLines([emptyLine("debit"), emptyLine("credit")]);
        },
        onError: (err) => {
          const payload = apiErrorPayload(err);
          setError(
            (payload?.code && PARTY_ERROR_MESSAGES[payload.code]) ||
              payload?.message ||
              "تعذر ترحيل القيد.",
          );
        },
      },
    );
  };

  const sourceLabel = (entry: JournalEntry) =>
    entry.is_manual ? "قيد يدوي" : entry.source_document_type ?? "—";

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <BookOpenText className="w-7 h-7 text-app-accent" />
            دفتر اليومية (Journal)
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            كل قيد هنا مُرحّل تلقائيًا من عملية تشغيلية أو مُدخل يدويًا كتسوية. القيود المؤتمتة للقراءة فقط.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(null); }}
          className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
        >
          <PencilLine className="w-4 h-4" /> قيد تسوية يدوي
        </button>
      </div>

      {error && !showForm && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-app-label-secondary">
          من
          <input
            type="date" value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-app-label-secondary">
          إلى
          <input
            type="date" value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-app-label-secondary">
          <input
            type="checkbox" checked={manualOnly}
            onChange={(e) => { setManualOnly(e.target.checked); setPage(1); }}
            className="accent-app-accent"
          />
          القيود اليدوية فقط
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
        ) : (
          <div className="divide-y divide-app-separator">
            {entries?.data.map((entry) => (
              <div key={entry.id}>
                <button
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                  className="w-full flex flex-wrap items-center gap-3 p-4 text-start hover:bg-app-fill-f1"
                >
                  <span className="font-mono font-bold text-app-accent text-sm">{entry.reference}</span>
                  <span className="text-xs font-mono text-app-label-secondary">{entry.entry_date ? formatDate(entry.entry_date) : ""}</span>
                  <span className="text-xs text-app-label-primary">{entry.description}</span>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${entry.is_manual ? "bg-app-status-yellow/15 text-app-status-yellow" : "bg-app-accent-subtle text-app-accent"}`}>
                    {sourceLabel(entry)}
                  </span>
                  <span className="ms-auto text-app-label-tertiary">
                    {expanded === entry.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {expanded === entry.id && (
                  <div className="px-4 pb-4">
                    <JournalLinesTable lines={entry.lines ?? []} />
                  </div>
                )}
              </div>
            ))}
            {entries?.data.length === 0 && (
              <div className="p-10 text-center text-xs text-app-label-tertiary">لا توجد قيود في هذه الفترة.</div>
            )}
          </div>
        )}
      </div>

      {entries && entries.last_page > 1 && (
        <div className="flex items-center justify-center gap-3 text-xs">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-xl border border-app-separator px-3 py-1.5 font-semibold text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-40"
          >
            السابق
          </button>
          <span className="font-mono text-app-label-secondary">{page} / {entries.last_page}</span>
          <button
            disabled={page >= entries.last_page}
            onClick={() => setPage(page + 1)}
            className="rounded-xl border border-app-separator px-3 py-1.5 font-semibold text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent size="2xl">
          <DialogHeader>
            <div>
              <DialogTitle>قيد تسوية يدوي</DialogTitle>
              <DialogDescription>
                للتصحيحات فقط (ACC-04). لن يُقبل القيد ما لم يتساوَ طرفاه.
              </DialogDescription>
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-3">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form id="journal-entry-form" onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">وصف القيد / سبب التسوية</label>
                <input
                  type="text" required placeholder="وصف القيد — سبب التسوية"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs border-app-separator focus:border-app-accent focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-app-label-secondary">
                تاريخ القيد (اختياري — اليوم افتراضيًا)
                <input
                  type="date" value={entryDate} max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
                />
              </label>

              {lines.map((l) => (
                <div key={l.key} className="flex gap-2 items-end">
                  <div className="flex flex-col flex-1">
                    <label className="block text-[10px] font-semibold text-app-label-secondary mb-0.5">الحساب</label>
                    <SearchableSelect<{ id: string; account_code: string; name: string; type?: string }>
                      options={leafAccounts(accounts ?? [], ["122"])}
                      value={
                        accounts?.find((a) => a.account_code === l.account_code) ??
                        null
                      }
                      onChange={(a) =>
                        patchLine(l.key, {
                          account_code: a ? a.account_code : "",
                          client_id:
                            a &&
                            receivableCodes.has(a.account_code) &&
                            clients.some((c) => c.id === l.client_id && clientFitsAccount(c, a.id))
                              ? l.client_id
                              : "",
                        })
                      }
                      getOptionId={(a) => a.id}
                      getOptionLabel={(a) => a.name}
                      getOptionSubLabel={(a) => `${a.account_code} · ${a.type ?? ""}`}
                      getOptionSearchText={(a) =>
                        `${a.account_code} ${a.name}`
                      }
                      placeholder="الحساب…"
                      size="sm"
                      required
                    />
                  </div>
                  {receivableCodes.has(l.account_code) && (
                    <div className="flex flex-col w-44">
                      <label className="block text-[10px] font-semibold text-app-label-secondary mb-0.5">العميل (اختياري)</label>
                      <SearchableSelect<Client>
                        options={clients.filter((c) =>
                          clientFitsAccount(c, accounts?.find((a) => a.account_code === l.account_code)?.id),
                        )}
                        value={clients.find((c) => c.id === l.client_id) ?? null}
                        onChange={(c) => patchLine(l.key, { client_id: c ? c.id : "" })}
                        getOptionId={(c) => c.id}
                        getOptionLabel={(c) => c.entity?.name ?? c.id}
                        getOptionSearchText={(c) => c.entity?.name ?? c.id}
                        placeholder="العميل…"
                        size="sm"
                      />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <label className="block text-[10px] font-semibold text-app-label-secondary mb-0.5">الطرف</label>
                    <select
                      value={l.side}
                      onChange={(e) => patchLine(l.key, { side: e.target.value as FormLine["side"] })}
                      className="w-24 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
                    >
                      <option value="debit">مدين</option>
                      <option value="credit">دائن</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[10px] font-semibold text-app-label-secondary mb-0.5">المبلغ (LYD)</label>
                    <input
                      type="number" step="0.0001" min="0.0001" required placeholder="المبلغ"
                      value={l.amount}
                      onChange={(e) => patchLine(l.key, { amount: e.target.value })}
                      className="w-28 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs font-mono focus:border-app-accent focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[10px] font-semibold text-app-label-secondary mb-0.5">البيان</label>
                    <input
                      type="text" placeholder="بيان"
                      value={l.memo}
                      onChange={(e) => patchLine(l.key, { memo: e.target.value })}
                      className="w-32 px-2 py-1.5 border border-app-separator rounded-lg bg-app-bg-secondary text-xs focus:border-app-accent focus:outline-none"
                    />
                  </div>
                  {lines.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setLines(lines.filter((x) => x.key !== l.key))}
                      className="p-1 text-app-label-tertiary hover:text-app-status-danger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setLines([...lines, emptyLine("credit")])}
                className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:opacity-80"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة سطر
              </button>

              <div className={`flex justify-between rounded-xl px-4 py-2 text-xs font-bold font-mono ${isBalanced ? "bg-app-status-positive/10 text-app-status-positive" : "bg-app-status-yellow/15 text-app-status-yellow"}`}>
                <span>مدين: {formatNumber(totalDebit)}</span>
                <span>دائن: {formatNumber(totalCredit)}</span>
                <span>{isBalanced ? "متوازن" : "غير متوازن"}</span>
              </div>

            </form>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="journal-entry-form"
              disabled={createMutation.isPending || !isBalanced || lines.some((l) => !l.account_code)}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              {createMutation.isPending ? "جارٍ الترحيل…" : "ترحيل القيد"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

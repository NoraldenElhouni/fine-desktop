import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Factory, Plus, RefreshCw, AlertTriangle, Boxes, Trash2 } from "lucide-react";
import {
  useProductionBatches,
  useCreateProductionBatch,
  useDeleteProductionBatch,
  expectedOperationNumber,
} from "../../hooks/useProduction";
import {
  CreateBatchInput,
  ProductionBatch,
  isNonSequentialError,
  apiErrorPayload,
  NonSequentialOperationError,
} from "../../api/endpoints/production";

const STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  configured: "Configured",
  running: "Running",
  consumed: "Consumed",
  curing: "Curing",
  ready_for_grading: "Ready for Grading",
  graded: "Graded",
  closed: "Closed",
};

const emptyForm = {
  operation_number: "",
  bun_width_m: "2.4",
  density_band: "",
  cure_time_minutes: "",
  conveyor_speed: "",
  status: "planned",
};

export const ProductionBatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [warning, setWarning] = useState<NonSequentialOperationError | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, refetch } = useProductionBatches();
  const createMutation = useCreateProductionBatch();
  const deleteMutation = useDeleteProductionBatch();

  const batches = data?.data ?? [];
  const expected = expectedOperationNumber(batches);

  const buildPayload = (confirm = false): CreateBatchInput => ({
    operation_number: Number(form.operation_number),
    bun_width_m: Number(form.bun_width_m),
    status: form.status as CreateBatchInput["status"],
    formula_params: {
      density_band: form.density_band || undefined,
      cure_time_minutes: form.cure_time_minutes ? Number(form.cure_time_minutes) : undefined,
      conveyor_speed: form.conveyor_speed ? Number(form.conveyor_speed) : undefined,
    },
    ...(confirm ? { confirm_non_sequential: true } : {}),
  });

  const submit = (confirm = false) => {
    setError(null);
    createMutation.mutate(buildPayload(confirm), {
      onSuccess: () => {
        setShowForm(false);
        setWarning(null);
        setForm(emptyForm);
        refetch();
      },
      onError: (err: unknown) => {
        const payload = apiErrorPayload(err);

        // A non-sequential number is a warning, not a rejection — surface the
        // expected value and let the operator confirm. Rendering this as a plain
        // validation error would wall them off from every legitimate gap.
        if (isNonSequentialError(payload)) {
          setWarning(payload);
          return;
        }

        setError(
          payload?.errors?.operation_number?.[0] ??
            payload?.message ??
            "Could not create the production batch.",
        );
      },
    });
  };

  const handleDelete = (batch: ProductionBatch) => {
    setError(null);
    deleteMutation.mutate(batch.id, {
      onError: (err: unknown) =>
        setError(apiErrorPayload(err)?.message ?? "Could not delete the batch."),
      onSuccess: () => refetch(),
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <Factory className="w-7 h-7 text-app-accent" />
            Foam Production Batches
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            One batch per pour. Blocks are registered after grading, from the completed production report.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => {
              setForm({ ...emptyForm, operation_number: String(expected) });
              setWarning(null);
              setError(null);
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> New Batch
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-xs text-app-status-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">
            Loading production batches...
          </div>
        ) : (
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
              <tr>
                <th className="px-4 py-3 text-start">Operation No.</th>
                <th className="px-4 py-3 text-start">Bun Width</th>
                <th className="px-4 py-3 text-start">Density / Time / Speed</th>
                <th className="px-4 py-3 text-start">Blocks</th>
                <th className="px-4 py-3 text-start">Scrap</th>
                <th className="px-4 py-3 text-start">Status</th>
                <th className="px-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-app-accent">
                    {batch.operation_number}
                  </td>
                  <td className="px-4 py-3 font-mono">{batch.bun_width_m} m</td>
                  <td className="px-4 py-3 text-app-label-secondary font-mono">
                    {batch.formula_params?.density_band ?? "—"}
                    {" · "}
                    {batch.formula_params?.cure_time_minutes ?? "—"} min
                    {" · "}
                    {batch.formula_params?.conveyor_speed ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-bold">{batch.stock_lots_count ?? 0}</td>
                  <td className="px-4 py-3 font-mono text-app-label-secondary">
                    {Number(batch.scrap_volume_m3).toFixed(3)} m³
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-app-accent-subtle text-app-accent">
                      {STATUS_LABELS[batch.status] ?? batch.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/manufacturing/batches/${batch.id}`)}
                        className="inline-flex items-center gap-1 rounded-xl bg-app-accent px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all"
                      >
                        <Boxes className="w-3.5 h-3.5" /> Blocks
                      </button>
                      {(batch.stock_lots_count ?? 0) === 0 && (
                        <button
                          onClick={() => handleDelete(batch)}
                          className="inline-flex items-center gap-1 rounded-xl border border-app-separator px-2.5 py-1 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-app-label-tertiary">
                    No production batches recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-app-bg-primary rounded-2xl max-w-lg w-full p-6 border border-app-separator shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-app-accent-subtle text-app-accent rounded-xl">
                <Factory className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-app-label-primary">New Production Batch</h3>
                <p className="text-xs text-app-label-secondary">
                  Last operation was {expected - 1} — next expected is{" "}
                  <span className="font-mono font-bold">{expected}</span>.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    Operation Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.operation_number}
                    onChange={(e) => {
                      setForm({ ...form, operation_number: e.target.value });
                      setWarning(null);
                    }}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary uppercase mb-1">
                    Bun Width (m)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    required
                    value={form.bun_width_m}
                    onChange={(e) => setForm({ ...form, bun_width_m: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-secondary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-app-bg-secondary rounded-xl border border-app-separator">
                <div>
                  <label className="block text-xs text-app-label-secondary mb-1">Density Band</label>
                  <input
                    type="text"
                    placeholder="12-14"
                    value={form.density_band}
                    onChange={(e) => setForm({ ...form, density_band: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-app-label-secondary mb-1">Time (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.cure_time_minutes}
                    onChange={(e) => setForm({ ...form, cure_time_minutes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-app-label-secondary mb-1">Conveyor Speed</label>
                  <input
                    type="number"
                    min="0"
                    value={form.conveyor_speed}
                    onChange={(e) => setForm({ ...form, conveyor_speed: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-app-bg-primary text-xs text-app-label-primary border-app-separator focus:border-app-accent focus:outline-none font-mono"
                  />
                </div>
              </div>

              {warning && (
                <div className="rounded-xl border border-app-status-yellow/40 bg-app-status-yellow/10 p-4 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-app-label-primary">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-app-status-yellow" />
                    <span>
                      Last operation was{" "}
                      <span className="font-mono font-bold">
                        {warning.expected_operation_number - 1}
                      </span>
                      , so <span className="font-mono font-bold">{warning.expected_operation_number}</span>{" "}
                      was expected — you entered{" "}
                      <span className="font-mono font-bold">{warning.entered_operation_number}</span>.
                      Gaps are allowed, but check this is not a typo.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => submit(true)}
                    disabled={createMutation.isPending}
                    className="w-full px-4 py-2 text-xs font-bold text-white bg-app-status-yellow rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50"
                  >
                    Use {warning.entered_operation_number} anyway
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setWarning(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {createMutation.isPending ? "Saving..." : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

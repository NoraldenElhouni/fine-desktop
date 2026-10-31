import React, { useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import {
  useClientAddresses,
  useCreateClientAddress,
  useDeleteClientAddress,
  useUpdateClientAddress,
} from "../../hooks/useClients";
import { clientErrorMessage, type ClientAddress } from "../../api/endpoints/clients";
import { apiErrorPayload } from "../../api/endpoints/production";
import { toast } from "../../stores/toastStore";

const th = "px-3 py-2 text-start text-[11px] font-semibold text-app-label-secondary";
const td = "px-3 py-2 text-xs text-app-label-primary";
const input =
  "w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none focus:border-app-accent";
const label = "block text-xs font-semibold text-app-label-secondary mb-1";

/** W5-05: the client's delivery address book. One address is always the default once any exist. */
export const ClientAddressesTab: React.FC<{ clientId: string }> = ({ clientId }) => {
  const { data: addresses = [], isLoading, isError } = useClientAddresses(clientId);
  const update = useUpdateClientAddress();
  const remove = useDeleteClientAddress();
  // null = closed; "new" = add; an address = edit.
  const [editing, setEditing] = useState<ClientAddress | "new" | null>(null);
  const [toRemove, setToRemove] = useState<ClientAddress | null>(null);

  const makeDefault = (address: ClientAddress) => {
    update.mutate(
      { clientId, addressId: address.id, payload: { is_default: true, record_version: address.record_version } },
      {
        onSuccess: () => toast.success("تم تعيين العنوان الافتراضي"),
        onError: (err) => toast.error(clientErrorMessage(err, "تعذر تعيين العنوان الافتراضي.")),
      },
    );
  };

  const confirmRemove = () => {
    if (!toRemove) return;
    remove.mutate(
      { clientId, addressId: toRemove.id },
      {
        onSuccess: () => {
          toast.success("تم حذف العنوان");
          setToRemove(null);
        },
        onError: (err) => {
          setToRemove(null);
          toast.error(clientErrorMessage(err, "تعذر حذف العنوان."));
        },
      },
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-separator p-3">
        <p className="text-[11px] text-app-label-secondary">
          يُختار عنوان التوصيل عند البيع من نقطة البيع، ويحفظ البيع نسخة منه تُطبع على إذن الاستلام، فتعديل العنوان لاحقاً لا يغيّر المبيعات السابقة.
        </p>
        <button
          onClick={() => setEditing("new")}
          disabled={isLoading || isError}
          className="inline-flex items-center gap-1.5 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          إضافة عنوان
        </button>
      </div>

      <table className="w-full">
        <thead className="bg-app-bg-secondary border-b border-app-separator">
          <tr>
            <th className={th}>الاسم</th>
            <th className={th}>المدينة</th>
            <th className={th}>العنوان</th>
            <th className={th}>الهاتف</th>
            <th className={th} />
          </tr>
        </thead>
        <tbody>
          {addresses.map((a) => (
            <tr key={a.id} className="border-b border-app-separator last:border-0">
              <td className={td}>
                <div className="flex items-center gap-2">
                  {a.label}
                  {a.is_default && (
                    <span className="rounded-full bg-app-status-positive/10 px-2 py-0.5 text-[10px] font-bold text-app-status-positive">
                      الافتراضي
                    </span>
                  )}
                </div>
              </td>
              <td className={td}>{a.city || "—"}</td>
              <td className={td}>{a.address}</td>
              <td className={td}>
                <span dir="ltr" className="font-mono">{a.phone || "—"}</span>
              </td>
              <td className={`${td} text-end whitespace-nowrap`}>
                {!a.is_default && (
                  <button
                    onClick={() => makeDefault(a)}
                    disabled={update.isPending}
                    className="rounded-lg p-1.5 text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-40"
                    aria-label="تعيين كافتراضي"
                    title="تعيين كافتراضي"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setEditing(a)}
                  className="rounded-lg p-1.5 text-app-label-secondary hover:bg-app-fill-f1"
                  aria-label="تعديل العنوان"
                  title="تعديل العنوان"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setToRemove(a)}
                  className="rounded-lg p-1.5 text-app-status-danger hover:bg-app-status-danger/10"
                  aria-label="حذف العنوان"
                  title="حذف العنوان"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isLoading && <p className="p-4 text-xs text-app-label-secondary">جارٍ التحميل…</p>}
      {isError && <p className="p-4 text-xs text-app-status-danger">تعذر تحميل عناوين العميل.</p>}
      {!isLoading && !isError && addresses.length === 0 && (
        <p className="flex items-center gap-2 p-4 text-xs text-app-label-secondary">
          <MapPin className="h-4 w-4" />
          لا توجد عناوين توصيل لهذا العميل بعد.
        </p>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "إضافة عنوان توصيل" : "تعديل عنوان التوصيل"}</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {editing !== null && (
            <AddressForm
              clientId={clientId}
              address={editing === "new" ? null : editing}
              isFirst={!isLoading && !isError && addresses.length === 0}
              onDone={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={toRemove !== null}
        onClose={() => setToRemove(null)}
        onConfirm={confirmRemove}
        isLoading={remove.isPending}
        title="حذف العنوان"
        message={
          toRemove
            ? `سيُحذف العنوان «${toRemove.label}». المبيعات السابقة تحتفظ بنسختها منه.${
                toRemove.is_default ? " سيصبح أقدم عنوان متبقٍ هو الافتراضي." : ""
              }`
            : ""
        }
        confirmText="حذف"
        variant="danger"
      />
    </>
  );
};

const AddressForm: React.FC<{
  clientId: string;
  address: ClientAddress | null;
  isFirst: boolean;
  onDone: () => void;
}> = ({ clientId, address, isFirst, onDone }) => {
  const create = useCreateClientAddress();
  const update = useUpdateClientAddress();
  const [error, setError] = useState<string | null>(null);
  const [labelText, setLabelText] = useState(address?.label ?? "");
  const [city, setCity] = useState(address?.city ?? "");
  const [addressText, setAddressText] = useState(address?.address ?? "");
  const [phone, setPhone] = useState(address?.phone ?? "");
  const [isDefault, setIsDefault] = useState(address?.is_default ?? isFirst);
  const isPending = create.isPending || update.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!labelText.trim()) {
      setError("أدخل اسماً للعنوان (مثل: المنزل، المخزن).");
      return;
    }
    if (!addressText.trim()) {
      setError("أدخل العنوان.");
      return;
    }
    const payload = {
      label: labelText.trim(),
      city: city.trim() || null,
      address: addressText.trim(),
      phone: phone.trim() || null,
    };
    const onError = (err: unknown) => {
      const message = clientErrorMessage(err, "تعذر حفظ العنوان.");
      if (apiErrorPayload(err)?.code === "OPTIMISTIC_LOCK_CONFLICT") {
        // This dialog holds the old record_version, so saving again would fail the same way. Close it
        // (the list refetches) so the user reopens the address with its current data and version.
        toast.error(message);
        onDone();
        return;
      }
      setError(message);
    };
    if (address) {
      update.mutate(
        {
          clientId,
          addressId: address.id,
          // The default is never switched off here: another address is made the default instead.
          payload: { ...payload, ...(isDefault && !address.is_default ? { is_default: true } : {}), record_version: address.record_version },
        },
        {
          onSuccess: () => {
            toast.success("تم تحديث العنوان");
            onDone();
          },
          onError,
        },
      );
    } else {
      create.mutate(
        // A first address becomes the default on the server anyway; only send the flag when the cashier chose it,
        // so a stale empty list can never replace the client's real default.
        { clientId, payload: { ...payload, ...(isDefault && !isFirst ? { is_default: true } : {}) } },
        {
          onSuccess: () => {
            toast.success("تمت إضافة العنوان");
            onDone();
          },
          onError,
        },
      );
    }
  };

  // The first address is always the default, and the current default cannot be switched off.
  const defaultLocked = isFirst || Boolean(address?.is_default);

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <DialogBody className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>اسم العنوان *</label>
            <input
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              maxLength={100}
              placeholder="مثال: المنزل"
              className={input}
            />
          </div>
          <div>
            <label className={label}>المدينة</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} className={input} />
          </div>
        </div>
        <div>
          <label className={label}>العنوان *</label>
          <textarea
            value={addressText}
            onChange={(e) => setAddressText(e.target.value)}
            maxLength={500}
            rows={2}
            className={input}
          />
        </div>
        <div>
          <label className={label}>هاتف الاستلام</label>
          <input
            type="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={50}
            className={`${input} font-mono text-start`}
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-app-label-primary">
          <input
            type="checkbox"
            checked={isDefault}
            disabled={defaultLocked}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 accent-app-accent"
          />
          العنوان الافتراضي
          {defaultLocked && (
            <span className="text-[11px] text-app-label-tertiary">
              {isFirst && !address ? "(أول عنوان يكون الافتراضي)" : "(لتغييره اجعل عنواناً آخر هو الافتراضي)"}
            </span>
          )}
        </label>
        {error && <p className="text-xs text-app-status-danger">{error}</p>}
      </DialogBody>
      <DialogFooter>
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl border border-app-separator px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "جارٍ الحفظ…" : "حفظ"}
        </button>
      </DialogFooter>
    </form>
  );
};

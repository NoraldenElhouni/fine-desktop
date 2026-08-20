import { create } from "zustand";

interface ConflictState {
  isOpen: boolean;
  message: string | null;
  endpoint: string | null;
  triggerConflict: (data: { message?: string; endpoint?: string }) => void;
  dismissConflict: () => void;
}

export const useConflictStore = create<ConflictState>((set) => ({
  isOpen: false,
  message: null,
  endpoint: null,
  triggerConflict: ({ message, endpoint }) =>
    set({
      isOpen: true,
      message:
        message ||
        "تم تعديل هذا السجل بواسطة مستخدم آخر بالتزامن. يرجى إعادة تحميل الصفحة للحصول على أحدث البيانات.",
      endpoint: endpoint || null,
    }),
  dismissConflict: () =>
    set({
      isOpen: false,
      message: null,
      endpoint: null,
    }),
}));

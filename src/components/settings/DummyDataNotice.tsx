import React from "react";
import { FlaskConical } from "lucide-react";

/**
 * Banner for settings screens that still run on local dummy data because the
 * matching backend resource does not exist yet. Remove with the mock store.
 */
export const DummyDataNotice: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
    <FlaskConical className="mt-px h-3.5 w-3.5 shrink-0" />
    <span>
      {message ??
        "بيانات تجريبية مؤقتة غير مرتبطة بالخادم — أي تعديل هنا لا يُحفظ ويُفقد عند إعادة تشغيل التطبيق."}
    </span>
  </div>
);

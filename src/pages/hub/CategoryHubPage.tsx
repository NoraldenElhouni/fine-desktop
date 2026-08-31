import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categoryGroups } from "../../routes/categories.config";
import { ArrowLeft, ChevronLeft } from "lucide-react";

export const CategoryHubPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const category = categoryGroups.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4 text-center p-6" dir="rtl">
        <p className="text-sm font-bold text-app-label-primary">فئة غير موجودة</p>
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
        >
          العودة للوحة التحكم
        </button>
      </div>
    );
  }

  const GroupIcon = category.icon;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Category Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-app-accent-subtle text-app-accent">
            <GroupIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-app-label-primary">{category.label}</h1>
            <p className="text-xs text-app-label-secondary mt-1 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              className="group relative flex flex-col justify-between rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-sm transition-all duration-200 hover:border-app-accent hover:shadow-md cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-app-accent-subtle text-app-accent group-hover:bg-app-accent group-hover:text-white transition-colors duration-200">
                    <ItemIcon className="h-6 w-6" />
                  </div>
                  <ChevronLeft className="h-5 w-5 text-app-label-tertiary group-hover:text-app-accent group-hover:-translate-x-1 transition-all duration-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-app-label-primary group-hover:text-app-accent transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-xs text-app-label-secondary mt-1.5 line-clamp-2 leading-relaxed">
                    الانتقال مباشرة إلى شاشة {item.label} وإدارة كافة العمليات والسجلات المتعلقة بها.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-app-accent opacity-90 group-hover:opacity-100">
                <span>فتح الشاشة</span>
                <ArrowLeft className="h-3.5 w-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="flex min-h-screen w-full flex-col items-center justify-center bg-app-bg-secondary p-6 text-app-label-primary select-none"
        >
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-app-label-primary">
                حدث خطأ غير متوقع في واجهة التطبيق
              </h2>
              <p className="text-xs text-app-label-secondary font-sans">
                {this.state.error?.message || "تعذر إكمال معالجة الشاشة الحالية"}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 rounded-xl bg-app-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>إعادة تحميل التطبيق</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { useState, useEffect } from "react";
import { ProductionRepository } from "../renderer-repositories/productionRepository";
import { Plus, Minus, CheckCircle, Database, Package, ListChecks, Server, Activity } from "lucide-react";
import { useServerConfigStore } from "../stores/serverConfigStore";

type OpenOrder = {
  id: string;
  productSku: string;
  quantity: number;
  status: string;
  createdAt: string;
};

const Dashboard = () => {
  const [stock, setStock] = useState<number | null>(null);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [createQty, setCreateQty] = useState(50);
  const [isLoading, setIsLoading] = useState(false);

  const { serverUrl, operatingUnitId, isServerConnected } = useServerConfigStore();

  const fetchStock = async () => {
    try {
      const currentStock = await ProductionRepository.getStock("WIDGET-X");
      setStock(currentStock);
    } catch {
      setStock(null);
    }
  };

  const fetchOpenOrders = async () => {
    try {
      const orders = await ProductionRepository.getOpenOrders();
      setOpenOrders(orders || []);
    } catch {
      setOpenOrders([]);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchStock(), fetchOpenOrders()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [serverUrl]);

  const handleCreate = async () => {
    if (createQty <= 0) return;
    try {
      await ProductionRepository.createOrder("WIDGET-X", createQty);
      await fetchOpenOrders();
      setCreateQty(50);
    } catch (e) {
      console.error("Failed to create order", e);
    }
  };

  const handleComplete = async (orderId: string) => {
    const order = openOrders.find((o) => o.id === orderId);
    if (!order) return;
    try {
      await ProductionRepository.completeOrder(orderId, "RAW-Y", order.quantity * 2);
      await fetchOpenOrders();
      await fetchStock();
    } catch (e) {
      console.error("Failed to complete order", e);
    }
  };

  const handleCompleteAll = async () => {
    for (const order of openOrders) {
      try {
        await ProductionRepository.completeOrder(order.id, "RAW-Y", order.quantity * 2);
      } catch (e) {
        console.error("Failed to complete order", e);
      }
    }
    await fetchOpenOrders();
    await fetchStock();
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8 text-neutral-900 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">لوحة التحكم (Online-Only Dashboard)</h1>
            <p className="text-sm text-neutral-500 mt-1">إدارة أوامر الإنتاج والمخزون عبر اتصال مباشر بالسيرفر المركزية.</p>
          </div>
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-neutral-100">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-neutral-700">مخزون WIDGET-X:</span>
            </div>
            <span className="text-xl font-semibold text-neutral-900">
              {stock !== null ? stock : "..."}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Production Card */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-neutral-100 rounded-lg">
                <Database className="w-5 h-5 text-neutral-700" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">إنشاء أمر إنتاج جديد</h2>
            </div>
            
            <div className="flex-1 space-y-6">
              <p className="text-sm text-neutral-500 leading-relaxed">
                إرسال طلب مباشر لإنشاء أمر إنتاج لـ WIDGET-X عبر API.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <span className="text-sm font-medium text-neutral-700 pr-2">الكمية</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setCreateQty(Math.max(1, createQty - 10))}
                      className="p-1.5 hover:bg-neutral-200 rounded-md transition-colors text-neutral-500 hover:text-neutral-900 active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium tabular-nums text-neutral-900">{createQty}</span>
                    <button 
                      onClick={() => setCreateQty(createQty + 10)}
                      className="p-1.5 hover:bg-neutral-200 rounded-md transition-colors text-neutral-500 hover:text-neutral-900 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={createQty <= 0 || !isServerConnected}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-medium rounded-xl transition-all shadow-sm disabled:shadow-none active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء الأمر 
                </button>
              </div>
            </div>
          </section>

          {/* Connection Status Card */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Server className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">حالة الاتصال بالسيرفر</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-500">حالة الشبكة الحالية</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isServerConnected ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {isServerConnected ? "متصل بالشبكة (Online)" : "منقطع (Offline)"}
                  </span>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
                  <span className="text-xs font-semibold text-neutral-400 block">عنوان السيرفر (Base URL):</span>
                  <code className="text-xs text-neutral-800 font-mono break-all">{serverUrl}</code>
                </div>

                {operatingUnitId && (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
                    <span className="text-xs font-semibold text-neutral-400 block">وحدة التشغيل النشطة (X-Operating-Unit-ID):</span>
                    <code className="text-xs text-neutral-800 font-mono">{operatingUnitId}</code>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={loadData}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-all"
              >
                <Activity className={`w-4 h-4 ${isLoading ? "animate-spin text-teal-600" : ""}`} />
                تحديث البيانات المباشرة
              </button>
            </div>
          </section>
        </div>

        {/* Open Orders Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <ListChecks className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">أوامر الإنتاج المفتوحة</h2>
              <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full text-xs font-bold tabular-nums">
                {openOrders.length}
              </span>
            </div>
            
            {openOrders.length > 1 && (
              <button
                onClick={handleCompleteAll}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                إكمال كافة الأوامر
              </button>
            )}
          </div>

          {openOrders.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-neutral-100 rounded-xl">
              <CheckCircle className="w-8 h-8 text-neutral-300 mb-3" />
              <p className="text-neutral-500 font-medium">لا توجد أوامر إنتاج معلقة</p>
              <p className="text-sm text-neutral-400 mt-1">جميع العمليات مكتملة مباشرة على السيرفر.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-xl hover:border-neutral-200 transition-colors group">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">{order.productSku}</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">مفتوح</span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1 tabular-nums">
                      الكمية: {order.quantity} • تاريخ الإنشاء: {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleComplete(order.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 hover:border-teal-600 hover:text-teal-600 font-medium rounded-lg shadow-sm transition-all active:scale-95 opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                  >
                    <CheckCircle className="w-4 h-4" />
                    إكمال الأمر
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Dashboard;

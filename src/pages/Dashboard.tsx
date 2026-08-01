import React, { useState, useEffect } from "react";
import { ProductionRepository } from "../renderer-repositories/productionRepository";
import { RefreshCw, Plus, Minus, CheckCircle, Database, Package, ListChecks } from "lucide-react";

type OpenOrder = {
  id: string;
  productSku: string;
  quantity: number;
  status: string;
  createdAt: string;
};

const Dashboard = () => {
  const [stock, setStock] = useState<number | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [createQty, setCreateQty] = useState(50);

  const fetchStock = async () => {
    setStock(await ProductionRepository.getStock("WIDGET-X"));
  };

  const fetchLastSync = async () => {
    const time = await window.electronAPI.sync.getLastSyncTime();
    setLastSync(time ? new Date(time).toLocaleString() : "Never synced");
  };

  const fetchOpenOrders = async () => {
    const orders = await ProductionRepository.getOpenOrders();
    setOpenOrders(orders);
  };

  useEffect(() => {
    fetchStock();
    fetchLastSync();
    fetchOpenOrders();
  }, []);

  const handleCreate = async () => {
    if (createQty <= 0) return;
    await ProductionRepository.createOrder("WIDGET-X", createQty);
    await fetchOpenOrders();
    setCreateQty(50); // reset
  };

  const handleComplete = async (orderId: string) => {
    // Assuming RAW-Y consumes 2x WIDGET-X quantity
    const order = openOrders.find((o) => o.id === orderId);
    if (!order) return;
    await ProductionRepository.completeOrder(orderId, "RAW-Y", order.quantity * 2);
    await fetchOpenOrders();
    await fetchStock();
  };

  const handleCompleteAll = async () => {
    for (const order of openOrders) {
      await ProductionRepository.completeOrder(order.id, "RAW-Y", order.quantity * 2);
    }
    await fetchOpenOrders();
    await fetchStock();
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await window.electronAPI.sync.syncNow();
    } finally {
      await fetchLastSync();
      await fetchStock();
      await fetchOpenOrders();
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8 text-neutral-900 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
            <p className="text-sm text-neutral-500 mt-1">Manage production orders and synchronize local state.</p>
          </div>
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-neutral-100">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-neutral-700">WIDGET-X Stock:</span>
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
              <h2 className="text-lg font-semibold tracking-tight">Create Order</h2>
            </div>
            
            <div className="flex-1 space-y-6">
              <p className="text-sm text-neutral-500 leading-relaxed">
                Configure and submit a new production order for WIDGET-X.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <span className="text-sm font-medium text-neutral-700 pl-2">Quantity</span>
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
                  disabled={createQty <= 0}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-medium rounded-xl transition-all shadow-sm disabled:shadow-none active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  Create Order
                </button>
              </div>
            </div>
          </section>

          {/* Sync Card */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-50 rounded-lg">
                <RefreshCw className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">Synchronization</h2>
            </div>
            
            <div className="flex-1 space-y-4">
              <p className="text-sm text-neutral-500 leading-relaxed">
                Push your local outbox changes to the backend and pull the latest production records from the server.
              </p>

              <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 flex flex-col gap-1 items-center justify-center py-6 mt-4">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Last Sync</span>
                <span className="text-sm font-medium text-neutral-700 tabular-nums">
                  {lastSync || "Loading..."}
                </span>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="group relative flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50 text-neutral-700 font-medium rounded-xl transition-all active:scale-[0.98]"
              >
                <RefreshCw className={`w-4 h-4 transition-transform duration-700 ${isSyncing ? "animate-spin text-teal-600" : "group-hover:rotate-180"}`} />
                {isSyncing ? "Syncing..." : "Sync with Server"}
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
              <h2 className="text-lg font-semibold tracking-tight">Open Orders</h2>
              <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full text-xs font-bold tabular-nums">
                {openOrders.length}
              </span>
            </div>
            
            {openOrders.length > 1 && (
              <button
                onClick={handleCompleteAll}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Complete All
              </button>
            )}
          </div>

          {openOrders.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-neutral-100 rounded-xl">
              <CheckCircle className="w-8 h-8 text-neutral-300 mb-3" />
              <p className="text-neutral-500 font-medium">All caught up</p>
              <p className="text-sm text-neutral-400 mt-1">No open production orders pending.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-xl hover:border-neutral-200 transition-colors group">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">{order.productSku}</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Open</span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1 tabular-nums">
                      Qty: {order.quantity} • Created: {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleComplete(order.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 hover:border-teal-600 hover:text-teal-600 font-medium rounded-lg shadow-sm transition-all active:scale-95 opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete
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

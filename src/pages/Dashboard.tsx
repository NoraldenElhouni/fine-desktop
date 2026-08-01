import React, { useState } from "react";
import { ProductionRepository } from "../renderer-repositories/productionRepository";

const Dashboard = () => {
  const [stock, setStock] = useState<number | null>(null);

  const fetchStock = async () => {
    setStock(await ProductionRepository.getStock("WIDGET-X"));
  };

  React.useEffect(() => {
    fetchStock();
  }, []);

  return (
    <div>
      {/* TEST/TEMPORARY: scratch panel to verify the local-first write path
          (repository -> outbox -> sqlite) and the sync loop end-to-end.
          Remove once real production-order UI exists. */}
      <button
        onClick={async () => {
          const order = await ProductionRepository.createOrder("WIDGET-X", 50);
          await ProductionRepository.completeOrder(order.id, "RAW-Y", 100);
          await fetchStock();
        }}
      >
        Create + complete production order
      </button>
      <button onClick={() => window.electronAPI.sync.syncNow()}>
        Sync now
      </button>
      <button onClick={fetchStock}>
        Refresh Stock
      </button>
      {stock !== null && <p>Widget-X stock: {stock}</p>}
    </div>
  );
};

export default Dashboard;

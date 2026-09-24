import { useEffect, useState } from "react";
import { matchPath } from "react-router-dom";

export const useRouteDisplayName = (pathname: string) => {
  const [displayName, setDisplayName] = useState("…");

  useEffect(() => {
    const normalizedPath = pathname === "/" ? "/" : pathname;
    const clientMatch = matchPath(
      { path: "/clients/:id", end: true },
      normalizedPath,
    );
    const orderMatch = matchPath(
      { path: "/orders/:id", end: true },
      normalizedPath,
    );
    const accountMatch = matchPath(
      { path: "/accounting/accounts/:id", end: true },
      normalizedPath,
    );

    if (!clientMatch && !orderMatch && !accountMatch) {
      setDisplayName("…");
      return;
    }

    const id = clientMatch?.params.id ?? orderMatch?.params.id ?? accountMatch?.params.id;
    setDisplayName("…");

    const timer = window.setTimeout(() => {
      if (clientMatch) {
        setDisplayName(id ? `عميل ${id}` : "عميل");
        return;
      }

      if (accountMatch) {
        setDisplayName("تفاصيل الحساب");
        return;
      }

      setDisplayName(id ? `طلب #${id}` : "طلب");
    }, 250);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return displayName;
};

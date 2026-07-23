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

    if (!clientMatch && !orderMatch) {
      setDisplayName("…");
      return;
    }

    const id = clientMatch?.params.id ?? orderMatch?.params.id;
    setDisplayName("…");

    const timer = window.setTimeout(() => {
      if (clientMatch) {
        setDisplayName(id ? `عميل ${id}` : "عميل");
        return;
      }

      setDisplayName(id ? `طلب #${id}` : "طلب");
    }, 250);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return displayName;
};

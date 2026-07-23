import { useEffect, useState } from "react";

export const useSidebarCollapsed = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem("fine-sidebar-collapsed");
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      "fine-sidebar-collapsed",
      isCollapsed ? "true" : "false",
    );
  }, [isCollapsed]);

  return { isCollapsed, setIsCollapsed };
};

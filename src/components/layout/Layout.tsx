import { Outlet } from "react-router-dom";
import AppShell from "./AppShell";

const Layout = () => {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

export default Layout;

import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* Admin sidebar / topbar can go here later */}
      <Outlet />
    </div>
  );
}

export default AdminLayout;

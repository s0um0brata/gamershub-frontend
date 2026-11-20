import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Gamepad2,
  Plus,
  Store,
  LogOut,
  Tags,
} from "lucide-react";
import "../styles/admin.css";

function AdminLayout() {
  const navigate = useNavigate();

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Manage Games",
      path: "/admin/games",
      icon: Gamepad2,
    },
    {
      label: "Add New Game",
      path: "/admin/games/add",
      icon: Plus,
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: Tags,
    },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Gamepad2 size={26} />
          <span>Game Store</span>
        </div>

        <p className="admin-sidebar-label">ADMINISTRATION</p>

        <nav className="admin-navigation">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="admin-nav-link" onClick={() => navigate("/")}>
            <Store size={19} />
            <span>View Storefront</span>
          </button>

          <button
            className="admin-nav-link"
            onClick={() => navigate("/admin/login")}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar-title">Administration Panel</span>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default AdminLayout;

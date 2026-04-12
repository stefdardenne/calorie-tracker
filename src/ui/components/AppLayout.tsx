import { NavLink, Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <>
      <aside className="sidebar">
        <h1 className="sidebar__title">Calorie Tracker</h1>
        <nav>
          <ul className="sidebar__nav">
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                }
                to="/"
                end
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                }
                to="/foods"
              >
                Foods
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__link sidebar__link--active"
                    : "sidebar__link"
                }
                to="/meals"
              >
                Meals
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="page-content">
        <Outlet />
      </main>
    </>
  );
}

import React from "react";
import { NavLink } from "react-router-dom";
import c from "./Sidebar.module.scss";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const unreadMessages = useSelector((state) => state.unreadMessages) || {};

  const totalUnread = Object.values(unreadMessages).reduce(
    (sum, cnt) => sum + cnt,
    0
  );

  return (
    <aside className={c.sidebar}>
      <div className={c.navContainer}>
        <nav className={c.nav}>
          <NavLink
            to="/posts"
            className={({ isActive }) => (isActive ? c.activeLink : c.link)}
          >
            Posts
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) => (isActive ? c.activeLink : c.link)}
          >
            Chat{" "}
            {totalUnread > 0 && (
              <span className={c.unreadBadge}>{totalUnread}</span>
            )}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? c.activeLink : c.link)}
          >
            Settings
          </NavLink>
          <NavLink
            to="/friends"
            className={({ isActive }) => (isActive ? c.activeLink : c.link)}
          >
            Friends
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

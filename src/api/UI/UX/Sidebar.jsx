import React from "react";
import { NavLink } from "react-router-dom";
import c from "./Sidebar.module.scss";

const Sidebar = () => {
  return (
    <aside className={c.sidebar}>
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
          Chat
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
    </aside>
  );
};

export default Sidebar;

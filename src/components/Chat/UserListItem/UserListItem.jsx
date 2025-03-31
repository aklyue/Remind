import React from "react";
import c from "./UserListItem.module.scss";

export default function UserListItem({ user, unreadMessages, onClick }) {
  const unreadCount = unreadMessages[user.id] || 0;

  return (
    <div className={c.userItem} onClick={onClick}>
      <span>{user.nickname || user.username}</span>
      {unreadCount > 0 && <span className={c.unreadBadge}>{unreadCount}</span>}
    </div>
  );
}

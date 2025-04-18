import React, { useState, useEffect } from "react";
import { getUsers } from "../../users";
import { Link } from "react-router-dom";
import * as c from "./UserSearch.module.scss";

function UserSearch() {
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredUsers([]);
      setDropdownVisible(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        const results = users.filter((user) =>
          user.username.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredUsers(results);
        setDropdownVisible(true);
      } catch (error) {
        console.error("Ошибка загрузки пользователей:", error);
      }
    };

    fetchUsers();
  }, [searchText]);

  return (
    <div className={c.searchContainer}>
      <input
        type="text"
        className={c.searchInput}
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onFocus={() => setDropdownVisible(true)}
        onBlur={() => setTimeout(() => setDropdownVisible(false), 200)}
      />
      {isDropdownVisible && filteredUsers.length > 0 && (
        <ul className={c.dropdown}>
          {filteredUsers.map((user) => (
            <Link key={user.id} to={`/profile/${user.id}`}>
              <li className={c.dropdownItem}>
                <img
                  src={user.avatar}
                  alt={user.username}
                />
                {user.username}
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserSearch;

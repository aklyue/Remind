import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserById, getUsers } from "../../users";
import c from "./Header.module.scss";

function Header() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserById(userId);
        setUser(data);
        if (data) {
          setIsUser(true);
        } else {
          return;
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [navigate]);

  function handleLogOut() {
    localStorage.removeItem("userId");
    navigate(`/authorization`);
  }

  return (
    <div className={c.header}>
      <div className={c.container}>
        {isUser && (
          <div className={c.img}>
            <Link className={c.link} to={`/users/${userId}`}>
              <img className={c.avatar} src={user.avatar} alt="" />
            </Link>
          </div>
        )}
        <div className={c.info}>
          <Link to={`/users/${userId}`}>
            <p>{user.username}</p>
          </Link>
          <Link to={`/settings`}>
            <p>Settings</p>
          </Link>
          <Link to={`/create-post`}>
            <p>Create Post</p>
          </Link>
        </div>
      </div>
      <div className={c.sideInfo}>
        {isUser ? (
          <p onClick={handleLogOut} className={c.logout}>
            Log out
          </p>
        ) : (
          <p onClick={handleLogOut} className={c.logout}>
            Sign in
          </p>
        )}
      </div>
    </div>
  );
}

export default Header;

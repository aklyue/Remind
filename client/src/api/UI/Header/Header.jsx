import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserById, getUsers } from "../../users";
import { useSelector } from "react-redux";
import UserSearch from "../UserSearch";
import * as c from "./Header.module.scss";

function Header() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [isUser, setIsUser] = useState(false);
  const unreadMessages = useSelector((state) => state.unreadMessages) || {};

  const totalUnread = Object.values(unreadMessages).reduce(
    (sum, cnt) => sum + cnt,
    0
  );

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
    localStorage.removeItem("token");
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
            <p className={c.link}>
              Settings
              <svg
                fill="#000000"
                width="20px"
                height="20px"
                viewBox="0 0 1920 1920"
              >
                <path
                  d="m1739.34 1293.414-105.827 180.818-240.225-80.188-24.509 22.25c-69.91 63.586-150.211 109.666-238.644 136.771l-32.076 9.94-49.468 244.065H835.584l-49.468-244.179-32.076-9.939c-88.432-27.105-168.734-73.185-238.644-136.771l-24.508-22.25-240.226 80.189-105.826-180.82 189.74-164.442-7.453-32.978c-10.39-45.742-15.586-91.483-15.586-135.869 0-44.386 5.195-90.127 15.586-135.868l7.454-32.979-189.741-164.442 105.826-180.819 240.226 80.075 24.508-22.25c69.91-63.585 150.212-109.665 238.644-136.884l32.076-9.826 49.468-244.066h213.007l49.468 244.18 32.076 9.825c88.433 27.219 168.734 73.186 238.644 136.885l24.509 22.25 240.225-80.189 105.826 180.819-189.74 164.442 7.453 32.98c10.39 45.74 15.586 91.481 15.586 135.867 0 44.386-5.195 90.127-15.586 135.869l-7.454 32.978 189.741 164.556Zm-53.76-333.403c0-41.788-3.84-84.48-11.634-127.284l210.184-182.062-199.454-340.856-265.186 88.433c-66.974-55.567-143.322-99.388-223.85-128.414L1140.977.01H743.198l-54.663 269.704c-81.431 29.139-156.424 72.282-223.963 128.414L199.5 309.809.045 650.665l210.07 182.062c-7.68 42.804-11.52 85.496-11.52 127.284 0 41.789 3.84 84.48 11.52 127.172L.046 1269.357 199.5 1610.214l265.186-88.546c66.974 55.68 143.323 99.388 223.85 128.527l54.663 269.816h397.779l54.663-269.703c81.318-29.252 156.424-72.283 223.85-128.527l265.186 88.546 199.454-340.857-210.184-182.174c7.793-42.805 11.633-85.496 11.633-127.285ZM942.075 564.706C724.1 564.706 546.782 742.024 546.782 960c0 217.976 177.318 395.294 395.294 395.294 217.977 0 395.294-177.318 395.294-395.294 0-217.976-177.317-395.294-395.294-395.294m0 677.647c-155.633 0-282.353-126.72-282.353-282.353s126.72-282.353 282.353-282.353S1224.43 804.367 1224.43 960s-126.72 282.353-282.353 282.353"
                  fill-rule="evenodd"
                />
              </svg>
            </p>
          </Link>
          <Link to={`/create-post`}>
            <p className={c.strokeLink}>
              Create Post
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 25 25"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="none"
                  d="M18.6375 9.04176L13.3875 14.2418C13.3075 14.3218 13.1876 14.3718 13.0676 14.3718H10.1075V11.3118C10.1075 11.1918 10.1575 11.0818 10.2375 11.0018L15.4376 5.84176"
                  stroke="#0F0F0F"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                />
                <path
                  fill="none"
                  d="M18.7076 11.9818V21.6618C18.7076 21.9018 18.5176 22.0918 18.2776 22.0918H2.84756C2.60756 22.0918 2.41754 21.9018 2.41754 21.6618V6.23176C2.41754 5.99176 2.60756 5.80176 2.84756 5.80176H12.4875"
                  stroke="#0F0F0F"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                />
                <path
                  fill="none"
                  d="M18.3863 2.90824L16.859 4.43558L20.0551 7.63167L21.5824 6.10433L18.3863 2.90824Z"
                  stroke="#0F0F0F"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                />
              </svg>
            </p>
          </Link>
        </div>
      </div>
      <UserSearch />
      <div className={c.sideInfo}>
        <div className={c.notificationsContainer}>
          {totalUnread > 0 ? (
            <Link to={`/chat`}>
              <div className={c.link}>
                <p
                  className={c.unreadBadge}
                  style={{ color: "#8e764f", cursor: "default" }}
                >
                  {totalUnread}
                </p>
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 512 512"
                  version="1.1"
                >
                  <title>notifications</title>
                  <g
                    id="Page-1"
                    stroke="none"
                    stroke-width="1"
                    fill="none"
                    fill-rule="evenodd"
                  >
                    <g
                      id="drop"
                      fill="#8e764f"
                      transform="translate(64.000000, 64.000000)"
                    >
                      <path
                        d="M85.3333333,85.3333333 L85.3333333,320 L186.515625,320 L341.333333,405.333333 L341.292969,320 L405.333333,320 L405.333333,85.3333333 L85.3333333,85.3333333 Z M362.666667,128 L362.666667,277.333333 L298.626302,277.333333 L298.626302,333.031249 L197.484375,277.333333 L128,277.333333 L128,128 L362.666667,128 Z M298.666667,-1.42108547e-14 L298.666667,42.6666667 L42.6666667,42.6666667 L42.6666667,213.333333 L-1.42108547e-14,213.333333 L-1.42108547e-14,-1.42108547e-14 L298.666667,-1.42108547e-14 Z"
                        id="Shape"
                      ></path>
                    </g>
                  </g>
                </svg>
              </div>
            </Link>
          ) : (
            <svg width="25px" height="25px" viewBox="0 0 512 512" version="1.1">
              <title>notifications</title>
              <g
                id="Page-1"
                stroke="none"
                stroke-width="1"
                fill="none"
                fill-rule="evenodd"
              >
                <g
                  id="drop"
                  fill="#333333"
                  transform="translate(64.000000, 64.000000)"
                >
                  <path
                    d="M85.3333333,85.3333333 L85.3333333,320 L186.515625,320 L341.333333,405.333333 L341.292969,320 L405.333333,320 L405.333333,85.3333333 L85.3333333,85.3333333 Z M362.666667,128 L362.666667,277.333333 L298.626302,277.333333 L298.626302,333.031249 L197.484375,277.333333 L128,277.333333 L128,128 L362.666667,128 Z M298.666667,-1.42108547e-14 L298.666667,42.6666667 L42.6666667,42.6666667 L42.6666667,213.333333 L-1.42108547e-14,213.333333 L-1.42108547e-14,-1.42108547e-14 L298.666667,-1.42108547e-14 Z"
                    id="Shape"
                  ></path>
                </g>
              </g>
            </svg>
          )}
        </div>
        {isUser ? (
          <p onClick={handleLogOut} className={c.logout}>
            Log out
            <svg
              width="20px"
              height="20px"
              viewBox="-96 0 512 512"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M96 512L320 460.8V51.2L96 0V48H0V464H96V512ZM32 80H96V432H32V80ZM144 288C152.837 288 160 277.255 160 264C160 250.745 152.837 240 144 240C135.163 240 128 250.745 128 264C128 277.255 135.163 288 144 288Z"></path>
            </svg>
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

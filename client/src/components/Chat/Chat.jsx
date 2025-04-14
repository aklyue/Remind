import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import * as c from "./Chat.module.scss";
import { useUsers } from "../../hooks/useUsers/useUsers";
import useMessages from "../../hooks/useMessages/useMessages";
import UserListItem from "./UserListItem";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  const [recipientId, setRecipientId] = useState(
    location?.state?.recipient?.id || userId
  );

  const [groupId, setGroupId] = useState(location?.state?.room?.id || null);
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const unreadMessages = useSelector((state) => state.unreadMessages);
  const { sortedUsers, others, currentUser, groups } = useUsers(userId);

  const {
    messages,
    sendMessage,
    messagesContainerRef,
    scrollToBottom,
    isAtBottom,
    setIsAtBottom,
  } = useMessages(userId, recipientId, groupId);

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const handleNavigation = () => {
      if (!location.pathname.includes("/chat")) {
        setRecipientId(null);
        setIsUserSelected(false);
        setGroupId(null);
      }
    };

    handleNavigation();

    return () => {};
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!currentUser) {
    return <div className={c.spinner}></div>;
  }

  const handleUserClick = (user) => {
    setRecipientId(user.id);
    setIsUserSelected(true);
    navigate("/chat", { state: { recipient: user } });
  };

  const handleRoomClick = (group) => {
    setGroupId(group.id);
    console.log(groupId);
    console.log(recipientId);
    setRecipientId(null);
    setIsUserSelected(true);
    navigate("/chat", { state: { room: group } });
  };

  const handleBackToUserList = () => {
    setIsUserSelected(false);
    navigate("/chat");
  };

  const isMobile = windowWidth < 1024;

  return (
    <div className={c.chat}>
      <div className={c.sidebar}>
        {isMobile && !isUserSelected && (
          <>
            {currentUser && (
              <div>
                <h3>Saved messages</h3>
                <UserListItem
                  user={currentUser}
                  unreadMessages={unreadMessages}
                  onClick={() => handleUserClick(currentUser)}
                />
              </div>
            )}
            {sortedUsers.length > 0 && <h3>Friends</h3>}
            {sortedUsers.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                unreadMessages={unreadMessages}
                onClick={() => handleUserClick(user)}
              />
            ))}

            {/* {groups?.length > 0 && <h3>Groups</h3>}
            {groups?.map((group) => (
              <UserListItem
                key={group.id}
                user={group}
                unreadMessages={unreadMessages}
                onClick={() => handleRoomClick(group)}
              />
            ))} */}

            {others.length > 0 && <h3>Other users</h3>}
            {others.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                unreadMessages={unreadMessages}
                onClick={() => handleUserClick(user)}
              />
            ))}
          </>
        )}

        {isMobile && isUserSelected && (
          <button className={c.backButton} onClick={handleBackToUserList}>
            Назад к списку пользователей
          </button>
        )}
        {!isMobile && (
          <>
            {currentUser && (
              <div>
                <h3>Saved messages</h3>
                <UserListItem
                  user={currentUser}
                  unreadMessages={unreadMessages}
                  onClick={() => handleUserClick(currentUser)}
                />
              </div>
            )}
            {sortedUsers.length > 0 && <h3>Friends</h3>}
            {sortedUsers.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                unreadMessages={unreadMessages}
                onClick={() => handleUserClick(user)}
              />
            ))}
            {/* {groups?.length > 0 && <h3>Groups</h3>}
            {groups?.map((group) => (
              <UserListItem
                key={group.groupId}
                user={group}
                unreadMessages={unreadMessages}
                onClick={() => handleRoomClick(group)}
              />
            ))} */}

            {others.length > 0 && <h3>Other users</h3>}
            {others.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                unreadMessages={unreadMessages}
                onClick={() => handleUserClick(user)}
              />
            ))}
          </>
        )}
      </div>

      <div className={c.chatWindow}>
        {isUserSelected && (
          <>
            <MessageList
              messages={messages}
              userId={userId || groupId}
              messagesContainerRef={messagesContainerRef}
              className={c.messagesContainer}
              isAtBottom={isAtBottom}
              scrollToBottom={scrollToBottom}
              setIsAtBottom={setIsAtBottom}
            />

            <ChatInput
              sendMessage={(msg) =>
                sendMessage(msg, currentUser, selectedFile, groupId)
              }
              setFile={setSelectedFile}
            />
          </>
        )}
      </div>
      {/* <Link to={`/create-group`}>
        <button>Create group</button>
      </Link> */}
    </div>
  );
}

export default Chat;

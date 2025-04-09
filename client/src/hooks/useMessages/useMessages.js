import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetUnread } from "../../store/unreadMessagesSlice";
import useWebSocket from "../useWebSocket/useWebSocket";
import { useNavigate } from "react-router-dom";

export default function useMessages(userId, recipientId, groupId) {
  const dispatch = useDispatch();
  const socket = useWebSocket(userId, groupId);
  const messagesContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const unreadMessages = useSelector((state) => state.unreadMessages);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token);

  async function fetchMessages() {
    if ((!recipientId && !groupId) || !isAuthenticated) {
      navigate("/authorization");
      return;
    }

    try {
      if (recipientId) {
        const res = await fetch(`http://localhost:4000/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await res.json();
        const chatMessages =
          user.messages?.filter(
            (m) =>
              (m.senderId === recipientId && m.recipientId === userId) ||
              (m.senderId === userId && m.recipientId === recipientId)
          ) || [];
        setMessages(
          chatMessages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          )
        );
      } else if (groupId) {
        const res = await fetch(`http://localhost:4000/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await res.json();
        console.log(user.groups);
        const group = user.groups.find((group) => group.id == groupId);
        setMessages(
          group?.messages?.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          ) || []
        );
      }

      setTimeout(() => {
        if (messagesContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } =
            messagesContainerRef.current;
          setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 20);
        }
      }, 50);
    } catch (error) {
      console.error("Ошибка загрузки сообщений:", error);
    }
  }

  useEffect(() => {
    if (!socket.current) return;

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);

      if (
        (message.recipientId && message.senderId === recipientId) ||
        (message.groupId && message.groupId === groupId)
      ) {
        setMessages((prev) => {
          if (!prev.some((m) => m.id === message.id)) {
            return [...prev, message];
          }
          return prev;
        });

        if (isAtBottom) {
          setTimeout(scrollToBottom, 50);
        }

        if (message.recipientId) {
          dispatch(resetUnread({ senderId: recipientId }));
        }
      }
    };

    socket.current.addEventListener("message", handleMessage);

    return () => {
      socket.current?.removeEventListener("message", handleMessage);
    };
  }, [socket, recipientId, groupId, isAtBottom, dispatch]);

  useEffect(() => {
    fetchMessages();
  }, [recipientId, groupId]);

  useEffect(() => {
    if (recipientId) {
      dispatch(resetUnread({ senderId: recipientId }));
    }
  }, [recipientId, dispatch]);

  const sendMessage = async (messageText, currentUser, file, groupId) => {
    if ((!recipientId && !groupId) || (!messageText.trim() && !file)) return;

    let fileUrl = null;

    if (file) {
      const formData = new FormData();
      formData.append("fileType", "messages");
      formData.append("file", file);

      try {
        const res = await fetch("http://localhost:4000/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.urls?.length > 0) {
          fileUrl = data.urls[0];
        }
      } catch (error) {
        console.error("Ошибка загрузки файла:", error);
        return;
      }
    }

    const message = {
      id: crypto.randomUUID(),
      username: currentUser?.username,
      message: messageText,
      senderId: userId,
      event: "message",
      timestamp: new Date().toISOString(),
      fileUrl,
    };

    if (recipientId) {
      message.recipientId = recipientId;
    } else if (groupId) {
      message.groupId = groupId;
      console.log(message.groupId)
      const groupRes = await fetch(`http://localhost:4000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await groupRes.json();

      const group = user.groups.find((group) => group.id == groupId);

      if (group) {
        message.recipients = group.members.map((member) => member.id);
      }
    }

    socket.current.send(JSON.stringify(message));

    await saveMessageToDB(message);
    fetchMessages();
    setTimeout(scrollToBottom, 50);
  };

  async function saveMessageToDB(message) {
    if (!isAuthenticated) return;

    try {
      if (message.recipientId) {
        const senderRes = await fetch(`http://localhost:4000/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sender = await senderRes.json();
        sender.messages = [...(sender.messages || []), message];

        const recipientRes = await fetch(
          `http://localhost:4000/users/${message.recipientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const recipient = await recipientRes.json();
        recipient.messages = [...(recipient.messages || []), message];

        const senderUpdateRes = await fetch(
          `http://localhost:4000/users/${userId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(sender),
          }
        );

        const recipientUpdateRes = await fetch(
          `http://localhost:4000/users/${message.recipientId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(recipient),
          }
        );

        if (!senderUpdateRes.ok) {
          console.error(
            "Ошибка обновления отправителя",
            await senderUpdateRes.json()
          );
        }
        if (!recipientUpdateRes.ok) {
          console.error(
            "Ошибка обновления получателя",
            await recipientUpdateRes.json()
          );
        }
      } else if (message.groupId) {
        const roomRes = await fetch(`http://localhost:4000/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await roomRes.json();
        const group = user.groups.find((group) => group.id === message.groupId);

        if (group) {
          const updatedGroups = user.groups.map((group) =>
            group.id == message.groupId
              ? {
                  ...group,
                  messages: [...(group.messages || []), message],
                }
              : group
          );
          console.log("Обновленные группы отправителя:", updatedGroups);
          const updatedUser = { ...user, groups: updatedGroups };

          const userUpdateRes = await fetch(
            `http://localhost:4000/users/${userId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(updatedUser),
            }
          );

          if (!userUpdateRes.ok) {
            console.error(
              "Ошибка обновления отправителя (группа)",
              await userUpdateRes.json()
            );
          }

          await Promise.all(
            group.members
              .filter((member) => member.id != userId)
              .map(async (member) => {
                const memberRes = await fetch(
                  `http://localhost:4000/users/${member.id}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                const memberData = await memberRes.json();
                console.log(
                  memberData.groups.map((g) => console.log(g.messages))
                );
                const updatedMemberGroups = memberData.groups.map((g) =>
                  g.id == message.groupId
                    ? {
                        ...g,
                        messages: [...(g.messages || []), message],
                      }
                    : g
                );
                const updatedMember = {
                  ...memberData,
                  groups: updatedMemberGroups,
                };

                const memberUpdateRes = await fetch(
                  `http://localhost:4000/users/${member.id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updatedMember),
                  }
                );

                if (!memberUpdateRes.ok) {
                  console.error(
                    "Ошибка обновления участника группы",
                    await memberUpdateRes.json()
                  );
                }
              })
          );
        }
      }
    } catch (error) {
      console.error("Ошибка сохранения сообщения:", error);
    }
  }

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 20);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [recipientId, groupId]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "instant",
      });
    }
  };

  return {
    messages,
    sendMessage,
    messagesContainerRef,
    scrollToBottom,
    isAtBottom,
    setIsAtBottom,
    unreadMessages,
  };
}

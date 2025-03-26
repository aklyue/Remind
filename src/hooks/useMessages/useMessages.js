import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { incrementUnread, resetUnread } from "../../store/unreadMessagesSlice";
import useWebSocket from "../useWebSocket/useWebSocket";

export default function useMessages(userId, recipientId) {
  const dispatch = useDispatch();
  const socket = useWebSocket(userId);
  const messagesContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const unreadMessages = useSelector((state) => state.unreadMessages);

  async function fetchMessages() {
    if (!recipientId) return;
    try {
      const res = await fetch(`http://localhost:3001/users/${userId}`);
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

      setTimeout(() => {
        if (messagesContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } =
            messagesContainerRef.current;
          setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 20);
        }
      }, 0);
    } catch (error) {
      console.error("Ошибка загрузки сообщений:", error);
    }
  }

  useEffect(() => {
    if (!socket.current) return;

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);

      if (
        (message.senderId === recipientId && message.recipientId === userId) ||
        (message.senderId === userId && message.recipientId === recipientId)
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
      } else {
        dispatch(incrementUnread({ senderId: message.senderId }));
      }
    };

    socket.current.addEventListener("message", handleMessage);

    return () => {
      socket.current?.removeEventListener("message", handleMessage);
    };
  }, [socket, recipientId, userId, isAtBottom, dispatch]);

  useEffect(() => {
    fetchMessages()
  }, [recipientId])

  useEffect(() => {
    if (recipientId) {
      dispatch(resetUnread({ senderId: recipientId }));
    }
  }, [recipientId, dispatch]);

  const sendMessage = async (messageText, currentUser) => {
    if (!recipientId || !messageText.trim()) return;

    const message = {
      id: crypto.randomUUID(),
      username: currentUser?.username,
      message: messageText,
      senderId: userId,
      recipientId,
      event: "message",
      timestamp: new Date().toISOString(),
    };

    socket.current.send(JSON.stringify(message));
    await saveMessageToDB(message);
    fetchMessages();
    setTimeout(scrollToBottom, 50);
  };

  async function saveMessageToDB(message) {
    try {
      const senderRes = await fetch(`http://localhost:3001/users/${userId}`);
      const sender = await senderRes.json();
      const recipientRes = await fetch(
        `http://localhost:3001/users/${recipientId}`
      );
      const recipient = await recipientRes.json();

      sender.messages = [...(sender.messages || []), message];
      recipient.messages = [...(recipient.messages || []), message];

      await Promise.all([
        fetch(`http://localhost:3001/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sender),
        }),
        fetch(`http://localhost:3001/users/${recipientId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recipient),
        }),
      ]);
    } catch (error) {
      console.error("Ошибка сохранения сообщения:", error);
    }
  }

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 140);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

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
    unreadMessages,
  };
}

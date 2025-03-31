import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { incrementUnread } from "../../store/unreadMessagesSlice";

export default function useWebSocket(userId) {
  const socket = useRef(null);
  const isConnected = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:5000");

    socket.current.onopen = () => {
      socket.current.send(JSON.stringify({ event: "connection", id: userId }));
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.senderId !== userId) {
        dispatch(incrementUnread({ senderId: message.senderId }));
      }
    };

    socket.current.onclose = () => console.log("WebSocket отключен");
    socket.current.onerror = (error) =>
      console.error("WebSocket ошибка:", error);

    return () => {};
  }, [userId, dispatch]);

  return socket;
}

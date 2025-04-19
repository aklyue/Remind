import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { incrementUnread } from "../../store/unreadMessagesSlice";

export default function useWebSocket(userId, groupId) {
  const socket = useRef(null);
  const isConnected = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.current = new WebSocket("wss://amused-appreciation-production.up.railway.app/ws");

    socket.current.onopen = () => {
      socket.current.send(JSON.stringify({ event: "connection", id: userId }));
      if (groupId) {
        socket.current.send(
          JSON.stringify({ event: "join_room", id: userId, groupId })
        );
      }
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(event.data)
      if (message.senderId !== userId) {
        dispatch(incrementUnread({ senderId: message.senderId }));
      }
    };

    socket.current.onclose = () => console.log("WebSocket отключен");
    socket.current.onerror = (error) =>
      console.error("WebSocket ошибка:", error);

    return () => {};
  }, [userId, groupId, dispatch]);

  return socket;
}

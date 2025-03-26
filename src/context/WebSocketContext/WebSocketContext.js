import React, { createContext, useContext, useEffect, useRef } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:5000");

    socket.current.onopen = () => {
      console.log("WebSocket подключен");
    };

    socket.current.onclose = () => {
      console.log("WebSocket отключен");
    };

    socket.current.onerror = (error) => {
      console.error("WebSocket ошибка:", error);
    };

    return () => {
      socket.current.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  return useContext(WebSocketContext);
};

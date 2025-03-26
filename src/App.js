import React, { useEffect } from "react";
import Router from "./Router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useWebSocket from "./hooks/useWebSocket/useWebSocket";

const queryClient = new QueryClient();

function App() {
  const userId = localStorage.getItem('userId')
  const socket = useWebSocket(userId)
  useEffect(() => {
    if (socket.current) {
      console.log("WebSocket подключен", socket.current);
    }
  }, [socket]);
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;

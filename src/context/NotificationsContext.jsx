import { useState, useEffect, createContext, useContext } from "react";
import socket from "../utils/sockets";

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // added: join this user's personal notification room
  useEffect(() => {
  function joinRoom() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) return;
    socket.emit("joinUser", user._id);
  }

  joinRoom(); // try immediately on mount
  socket.on("connect", joinRoom); // rejoin after reconnect
  window.addEventListener("auth-changed", joinRoom); // rejoin right after login

  return () => {
    socket.off("connect", joinRoom);
    window.removeEventListener("auth-changed", joinRoom);
  };
}, []);
  useEffect(() => {
    async function fetchNotifications() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setNotifications(data);
      } catch {
        // fail silently, bell just starts empty
      }
    }
    fetchNotifications();
  }, []);

  useEffect(() => {
    function handleNotification(data) {
      setNotifications((prev) => [data, ...prev]);
    }
    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const token = localStorage.getItem("token");
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // UI already updated optimistically
    }
  }

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}


export const useNotifications = () => useContext(NotificationsContext);
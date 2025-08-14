import { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Notifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { store } = useGlobalReducer();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchUnreadMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token || !store.user) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error cargando mensajes");

      const data = await res.json();

      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = tokenPayload.user_id;

      const unread = data.results?.filter((msg) =>
        msg.user_receiver === currentUserId &&
        (!msg.review_date || msg.review_date === null)
      ).length || 0;
      console.log('Mensajes no leídos:', unread);

      setUnreadCount(unread);
    } catch (err) {
      console.error("Error al obtener mensajes no leídos:", err.message);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 5000);
    return () => clearInterval(interval);
  }, [store.user]);

  return (
    <span className="position-relative" style={{ fontSize: '1.2rem', color: unreadCount > 0 ? '#dc3545' : '#0d6efd' }}>
      <i className="fa-solid fa-envelope" />
      {unreadCount > 0 && (
        <span
          className="position-absolute badge rounded-pill bg-danger"
          style={{
            fontSize: '0.7rem',
            minWidth: '16px',
            height: '16px',
            padding: '2px 4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            top: '25%',
            right: '25%',
            transform: 'translate(50%, -50%)',
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </span>
  );
};

export default Notifications;
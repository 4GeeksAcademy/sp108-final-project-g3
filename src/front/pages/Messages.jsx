import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL 

export const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [content, setContent] = useState("");
  const [success, setSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

  const userSender = "user1";
  const userReceiver = "user2";


  const formatDate = (date) => {
    return date.toISOString().slice(0, 19).replace("T", " ");
  };

  // Cargar mensajes desde backend
  const loadMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No autenticado");

      const response = await fetch(`${API_URL}/api/messages`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al cargar mensajes");
      }

      const data = await response.json();
      setMessages(data.results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // Crear un mensaje nuevo
  const createMessage = async () => {
    console.log("create message")
    setFormError(null);
    setSuccess(null);

    if (!content.trim()) {
      setFormError("El contenido del mensaje no puede estar vacío");
      return;
    }

    const newMessage = {
      user_sender: userSender,
      user_receiver: userReceiver,
      content: content.trim(),
      created_at: formatDate(new Date()),
      review_date: formatDate(new Date()),
    };
    console.log(newMessage, token)
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No autenticado");

      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "Error al crear mensaje");
        return;
      }

      setSuccess("Mensaje creado correctamente");
      setContent("");
      loadMessages(); // recarga lista con nuevo mensaje
    } catch (e) {
      setFormError(e.message);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      <h1>Mensajes</h1>

      {/* Lista de mensajes */}
      {loading && <p>Cargando mensajes...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && messages.length === 0 && <p>No hay mensajes aún.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {messages.map((msg) => (
          <li
            key={msg.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: 12,
              marginBottom: 10,
              backgroundColor: "#f9f9f9",
            }}
          >
            <p>
              <b>De:</b> {msg.user_sender} <b>Para:</b> {msg.user_receiver}
            </p>
            <p>{msg.content}</p>
            <small>Creado: {msg.created_at}</small>
          </li>
        ))}
      </ul>

      {/* Formulario para crear mensaje */}
      <div style={{ marginTop: 30 }}>
        <h2>Nuevo mensaje</h2>
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe tu mensaje..."
          style={{ width: "100%", padding: 10, fontSize: 16 }}
        />
        {formError && <p style={{ color: "red" }}>{formError}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <button
          onClick={createMessage}
          style={{
            marginTop: 10,
            padding: "10px 20px",
            backgroundColor: "#2f855a",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Enviar mensaje
        </button>
      </div>
    </div>
  );
};

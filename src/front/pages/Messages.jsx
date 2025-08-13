import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const Messages = () => {
  const [allMessages, setAllMessages] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [activeTab, setActiveTab] = useState("received");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      if (userData[userId]) return;
      
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Error al cargar datos del usuario");
      
      const data = await response.json();
      setUserData(prev => ({ ...prev, [userId]: data.results }));
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUserData(prev => ({ 
        ...prev, 
        [userId]: { 
          first_name: "Usuario", 
          last_name: userId,
          id: userId
        } 
      }));
    }
  };

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Debes iniciar sesión para ver tus mensajes");
      setLoading(false);
      return;
    }

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = tokenPayload.user_id;
      
      const response = await fetch(`${API_URL}/api/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Error al cargar los mensajes");

      const data = await response.json();
      const userMessages = data.results.filter(msg => 
        msg.user_sender === currentUserId || msg.user_receiver === currentUserId
      );

      const uniqueUserIds = [
        ...new Set([
          ...userMessages.map(msg => msg.user_sender),
          ...userMessages.map(msg => msg.user_receiver)
        ])
      ].filter(id => id !== currentUserId);

      await Promise.all(uniqueUserIds.map(fetchUserData));

      setAllMessages(userMessages || []);
      
      if (userMessages.length > 0 && !selectedConversation) {
        const firstContactId = userMessages[0].user_sender === currentUserId 
          ? userMessages[0].user_receiver 
          : userMessages[0].user_sender;
        selectConversation(firstContactId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = (otherUserId) => {
    setSelectedConversation(otherUserId);
    setReplyContent("");
    
    const currentUserId = getCurrentUserId();
    const unreadMessages = allMessages.filter(msg => 
      msg.user_receiver === currentUserId && 
      msg.user_sender === otherUserId &&
      !msg.review_date
    );

    unreadMessages.forEach(msg => markAsRead(msg.id));
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    return tokenPayload.user_id;
  };

  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/messages/${messageId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setAllMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, review_date: new Date().toISOString() } : msg
      ));
    } catch (err) {
      console.error("Error marcando mensaje como leído:", err);
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedConversation) return;

    setSendingReply(true);
    try {
      const token = localStorage.getItem("token");
      const currentUserId = getCurrentUserId();
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_sender: currentUserId,
          user_receiver: selectedConversation,
          content: replyContent,
          created_at: now,
          review_date: now
        }),
      });

      if (!response.ok) throw new Error("Error al enviar la respuesta");

      const newMessage = await response.json();
      
      if (!userData[selectedConversation]) {
        await fetchUserData(selectedConversation);
      }
      
      setAllMessages(prev => [newMessage.results, ...prev]);
      setReplyContent("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingReply(false);
    }
  };

  // Organizar mensajes por conversación
  const currentUserId = getCurrentUserId();
  const conversations = {};
  
  allMessages.forEach(msg => {
    const otherUserId = msg.user_sender === currentUserId 
      ? msg.user_receiver 
      : msg.user_sender;
      
    if (!conversations[otherUserId]) {
      conversations[otherUserId] = {
        user: userData[otherUserId] || { id: otherUserId },
        messages: [],
        unread: 0
      };
    }
    
    conversations[otherUserId].messages.push(msg);
    
    if (!msg.review_date && msg.user_receiver === currentUserId) {
      conversations[otherUserId].unread++;
    }
  });

  // Ordenar conversaciones
  const sortedConversations = Object.values(conversations).sort((a, b) => {
    const lastMsgA = a.messages[a.messages.length - 1].created_at;
    const lastMsgB = b.messages[b.messages.length - 1].created_at;
    return new Date(lastMsgB) - new Date(lastMsgA);
  });

  const receivedConversations = sortedConversations.filter(conv => 
    conv.messages.some(msg => msg.user_receiver === currentUserId)
  );

  const sentConversations = sortedConversations.filter(conv => 
    conv.messages.some(msg => msg.user_sender === currentUserId)
  );

  if (loading) {
    return (
      <div className="container mt-5">
        <h1>Mensajes</h1>
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p>Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <h1>Mensajes</h1>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Mis Mensajes</h1>
      
      <div className="row">
        {/* Lista de conversaciones */}
        <div className="col-md-4">
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'received' ? 'active' : ''}`}
                onClick={() => setActiveTab('received')}
              >
                Recibidos
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'sent' ? 'active' : ''}`}
                onClick={() => setActiveTab('sent')}
              >
                Enviados
              </button>
            </li>
          </ul>
          
          <div className="list-group" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {(activeTab === 'received' ? receivedConversations : sentConversations).map((conversation) => (
              <button
                key={conversation.user.id}
                className={`list-group-item list-group-item-action text-start ${
                  selectedConversation === conversation.user.id ? 'active' : ''
                }`}
                onClick={() => selectConversation(conversation.user.id)}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>
                      {activeTab === 'received' ? 'De: ' : 'Para: '}
                      {conversation.user.first_name} {conversation.user.last_name}
                    </strong>
                    <p className="mb-0 text-truncate small">
                      {conversation.messages[conversation.messages.length - 1].content}
                    </p>
                  </div>
                  <div className="text-end">
                    <small className="d-block">
                      {new Date(
                        conversation.messages[conversation.messages.length - 1].created_at
                      ).toLocaleDateString()}
                    </small>
                    {conversation.unread > 0 && (
                      <span className="badge bg-primary rounded-pill">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Panel de conversación */}
        <div className="col-md-8">
          {selectedConversation ? (
            <div className="card h-100">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <Link 
                      to={`/profile/${selectedConversation}`}
                      className="text-decoration-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${selectedConversation}`);
                      }}
                    >
                      De: {userData[selectedConversation]?.first_name || 'Usuario'}{' '}
                      {userData[selectedConversation]?.last_name || selectedConversation}
                    </Link>
                  </h5>
                </div>
              </div>
              <div className="card-body d-flex flex-column p-0">
                <div 
                  style={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    padding: '1rem'
                  }}
                >
                  {conversations[selectedConversation]?.messages
                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                    .map((message) => (
                      <div 
                        key={message.id}
                        className={`mb-3 p-3 rounded ${
                          message.user_sender === currentUserId
                            ? 'bg-primary text-white ms-auto'
                            : 'bg-light me-auto'
                        }`}
                        style={{ maxWidth: '80%' }}
                      >
                        <p className="mb-1">{message.content}</p>
                        <small className="d-block text-end opacity-75">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                    ))}
                </div>
                
                <div className="p-3 border-top">
                  <textarea
                    className="form-control mb-3"
                    rows="3"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Escribe tu respuesta a ${userData[selectedConversation]?.first_name || 'este usuario'}...`}
                  />
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyContent.trim()}
                  >
                    {sendingReply ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Enviando...
                      </>
                    ) : (
                      "Enviar mensaje"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <div className="text-center py-5">
                  <i className="bi bi-envelope fs-1 text-muted"></i>
                  <p className="mt-3">Selecciona una conversación</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
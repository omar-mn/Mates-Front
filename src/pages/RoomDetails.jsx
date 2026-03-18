import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteMessage, getRoomDetails, getRoomMessages, getRoomSocketUrl, resolveMediaUrl, updateMessage } from '../api';

const getFallbackAvatar = (name) => {
  const safeName = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${safeName}&background=random&color=fff`;
};

function RoomDetails({ onApiStatusChange, showToast, currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [socketState, setSocketState] = useState('connecting');
  const [editingMessage, setEditingMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);

  const wsRef = useRef(null);
  const messageListRef = useRef(null);

  const currentUsername = currentUser?.username || '';
  const roomOwner = room?.owner?.username || '';
  const canAccessRoom = Boolean(room?.is_member ?? room?.members?.some((member) => member?.user?.username === currentUsername && !member?.leftDate));

  const loadRoom = async () => {
    setLoading(true);
    setError('');

    try {
      const roomData = await getRoomDetails(id);
      setRoom(roomData || null);

      if (roomData?.is_member === false) {
        setMessages([]);
        showToast?.(roomData?.private ? 'You need to send a join request first.' : 'You need to join this room first.', 'danger');
        onApiStatusChange?.('connected');
        return;
      }

      const messageData = await getRoomMessages(id);
      setMessages(messageData || []);
      onApiStatusChange?.('connected');
    } catch (err) {
      setError(err.message || 'Failed to load room');
      setMessages([]);
      onApiStatusChange?.('error');
      showToast?.(err.message || 'Access denied', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [id]);

  useEffect(() => {
    if (loading) return;
    const node = messageListRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [loading, id]);

  useEffect(() => {
    const node = messageListRef.current;
    if (!node) return;
    const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    if (distanceFromBottom < 120) {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!id || !canAccessRoom) return undefined;

    const socket = new window.WebSocket(getRoomSocketUrl(id));
    wsRef.current = socket;

    socket.onopen = () => {
      setSocketState('connected');
    };

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        if (parsed?.type === 'chat_message' && parsed?.message) {
          const incoming = parsed.message;
          setMessages((prev) => (incoming?.id && prev.some((msg) => msg.id === incoming.id) ? prev : [...prev, incoming]));
          return;
        }

        if (parsed?.content) {
          setMessages((prev) => [...prev, parsed]);
        }
      } catch (err) {
        window.console.error('[RoomDetails] failed to parse websocket payload:', err);
      }
    };

    socket.onerror = () => {
      setSocketState('error');
      showToast?.('Chat connection error.', 'danger');
    };

    socket.onclose = () => {
      setSocketState('disconnected');
    };

    return () => {
      if (wsRef.current === socket) wsRef.current = null;
      if (socket.readyState === window.WebSocket.OPEN || socket.readyState === window.WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [id, canAccessRoom]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      showToast?.('Message cannot be empty.', 'danger');
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== window.WebSocket.OPEN) {
      showToast?.('Cannot send message while disconnected.', 'danger');
      return;
    }

    wsRef.current.send(JSON.stringify({ content: trimmed }));
    setContent('');
  };

  const handleEditMessage = async (e) => {
    e.preventDefault();
    if (!editingMessage?.content?.trim()) {
      showToast?.('Message content is required.', 'danger');
      return;
    }

    try {
      const updated = await updateMessage(id, editingMessage.id, editingMessage.content.trim());
      setMessages((prev) => prev.map((msg) => (msg.id === editingMessage.id ? { ...msg, ...updated, content: updated.content || editingMessage.content.trim() } : msg)));
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('editMessageModal')).hide();
      showToast?.('Message updated.', 'success');
    } catch (err) {
      showToast?.(err.message || 'You are not allowed to edit this message.', 'danger');
    }
  };

  const handleDeleteMessage = async () => {
    if (!deletingMessage) return;

    try {
      await deleteMessage(id, deletingMessage.id);
      setMessages((prev) => prev.filter((msg) => msg.id !== deletingMessage.id));
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteMessageModal')).hide();
      showToast?.('Message deleted.', 'success');
    } catch (err) {
      showToast?.(err.message || 'You are not allowed to delete this message.', 'danger');
    }
  };

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.sent_at || 0).getTime() - new Date(b.sent_at || 0).getTime()),
    [messages],
  );

  if (loading) {
    return <div className="container-fluid py-4 px-3 px-lg-4"><div className="text-center py-5"><div className="spinner-border" /></div></div>;
  }

  const lockedMessage = room?.private ? 'You need to send a join request first.' : 'You need to join this room first.';

  return (
    <div className="container-fluid room-chat-page py-3 py-lg-4 px-2 px-sm-3 px-lg-4">
      {error && <div className="alert alert-danger">{error}</div>}

      {!canAccessRoom ? (
        <div className="room-locked-state card border-0 shadow-sm rounded-4 p-4 p-lg-5 text-center mx-auto">
          <div className="display-5 mb-3"><i className={`bi ${room?.private ? 'bi-lock-fill' : 'bi-door-open-fill'}`} /></div>
          <h2 className="mb-3">Access required</h2>
          <p className="text-secondary mb-4">{lockedMessage}</p>
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <button className="btn btn-outline-secondary" onClick={() => navigate('/home')}>Back to rooms</button>
            <button className="btn btn-primary" onClick={() => navigate(`/room/${id}/info`)}>Open Room Info</button>
          </div>
        </div>
      ) : (
        <div className="room-chat-shell mx-auto">
          <button className="room-chat-header card border-0 shadow-sm rounded-4 mb-3 w-100 text-start" onClick={() => navigate(`/room/${id}/info`)}>
            <div className="card-body py-3 d-flex align-items-center justify-content-between gap-3">
              <div>
                <div className="small text-secondary text-uppercase">Room</div>
                <h3 className="mb-0 room-chat-title">{room?.name || 'Room'}</h3>
              </div>
              <i className="bi bi-chevron-right text-secondary" />
            </div>
          </button>

          <div className="card border-0 shadow-sm rounded-4 room-messages-card" ref={messageListRef}>
            <div className="card-body room-messages-body d-grid gap-3">
              {sortedMessages.map((message, index) => {
                const messageUsername = message?.user?.username || '';
                const isCurrentUser = currentUsername && messageUsername === currentUsername;
                const canEdit = isCurrentUser;
                const canDelete = isCurrentUser || (currentUsername && currentUsername === roomOwner);

                return (
                  <div key={`${message.id || index}-${message.sent_at || index}`} className={`d-flex chat-message-row ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div className="d-flex gap-2 chat-message-wrap">
                      {!isCurrentUser && (
                        <img
                          src={resolveMediaUrl(message?.user?.profileImage, getFallbackAvatar(message?.user?.username))}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallbackAvatar(message?.user?.username); }}
                          alt="user"
                          width="34"
                          height="34"
                          className="rounded-circle border align-self-end"
                        />
                      )}

                      <div className={`card border-0 p-2 px-3 chat-message-bubble ${isCurrentUser ? 'chat-own-message' : ''}`}>
                        <div className="d-flex align-items-start justify-content-between gap-2">
                          <div className="small text-secondary fw-semibold">{messageUsername || 'User'}</div>
                          {(canEdit || canDelete) && (
                            <div className="dropdown">
                              <button className="btn btn-sm btn-outline-secondary py-0 px-1" data-bs-toggle="dropdown"><i className="bi bi-three-dots" /></button>
                              <ul className="dropdown-menu dropdown-menu-end">
                                {canEdit && <li><button className="dropdown-item" onClick={() => {
                                  setEditingMessage({ id: message.id, content: message.content || '' });
                                  window.bootstrap.Modal.getOrCreateInstance(document.getElementById('editMessageModal')).show();
                                }}>Edit message</button></li>}
                                {canDelete && <li><button className="dropdown-item text-danger" onClick={() => {
                                  setDeletingMessage(message);
                                  window.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteMessageModal')).show();
                                }}>Delete message</button></li>}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="mt-1" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message?.content || ''}</div>
                        <div className="small text-secondary mt-2">{message?.sent_at ? new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                      </div>

                      {isCurrentUser && (
                        <img
                          src={resolveMediaUrl(message?.user?.profileImage, getFallbackAvatar(message?.user?.username))}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallbackAvatar(message?.user?.username); }}
                          alt="user"
                          width="34"
                          height="34"
                          className="rounded-circle border align-self-end"
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {!sortedMessages.length && <div className="alert alert-info mb-0">No messages yet.</div>}
            </div>
          </div>

          <form className="card border-0 shadow-sm rounded-4 p-3 mt-3 room-input-card" onSubmit={handleSend}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-secondary">Chat status: {socketState}</small>
            </div>
            <div className="d-flex gap-2 align-items-end">
              <input
                type="text"
                className="form-control"
                placeholder="Write a message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                required
              />
              <button className="btn btn-primary" disabled={socketState !== 'connected'}>Send</button>
            </div>
          </form>
        </div>
      )}

      <div className="modal fade" id="editMessageModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header"><h5 className="modal-title">Edit message</h5><button className="btn-close" data-bs-dismiss="modal" /></div>
            <form onSubmit={handleEditMessage}>
              <div className="modal-body">
                <textarea className="form-control" rows="4" value={editingMessage?.content || ''} onChange={(e) => setEditingMessage((prev) => ({ ...prev, content: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="deleteMessageModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header"><h5 className="modal-title">Delete message</h5><button className="btn-close" data-bs-dismiss="modal" /></div>
            <div className="modal-body">Are you sure you want to delete this message?</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteMessage}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetails;

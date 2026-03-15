import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  deleteMessage,
  getRoomDetails,
  getRoomMessages,
  updateMessage,
} from '../api';

const fallbackAvatar = 'https://via.placeholder.com/32x32.png?text=U';

function RoomDetails({ onApiStatusChange, showToast, currentUser }) {
  const { id } = useParams();
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

  const loadRoom = async () => {
    setLoading(true);
    setError('');

    try {
      const [roomResult, messagesResult] = await Promise.allSettled([getRoomDetails(id), getRoomMessages(id)]);

      if (roomResult.status === 'fulfilled') {
        setRoom(roomResult.value || null);
      } else {
        setRoom(null);
      }

      if (messagesResult.status === 'fulfilled') {
        setMessages(messagesResult.value || []);
      } else {
        setMessages([]);
      }

      if (roomResult.status === 'rejected' && messagesResult.status === 'rejected') {
        throw roomResult.reason;
      }

      onApiStatusChange?.('connected');
    } catch (err) {
      setError(err.message || 'Failed to load room');
      onApiStatusChange?.('error');
      showToast?.(err.message || 'Network error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const roomId = encodeURIComponent(id);
    const socketUrl = `${protocol}://127.0.0.1:8000/ws/message/${roomId}/?token=${encodeURIComponent(token)}`;
    window.console.log('[RoomDetails] final socket URL:', socketUrl);

    const socket = new window.WebSocket(socketUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      window.console.log('[RoomDetails] websocket onopen');
      setSocketState('connected');
      showToast?.('Connected to room chat.', 'info');
    };

    socket.onmessage = (event) => {
      window.console.log('[RoomDetails] websocket onmessage:', event.data);
      try {
        const parsed = JSON.parse(event.data);
        if (parsed?.content) {
          setMessages((prev) => [...prev, parsed]);
        }
      } catch {
        // ignore malformed websocket payload
      }
    };

    socket.onerror = (event) => {
      window.console.log('[RoomDetails] websocket onerror:', event);
      setSocketState('error');
      showToast?.('Chat connection error.', 'danger');
    };

    socket.onclose = (event) => {
      window.console.log('[RoomDetails] websocket onclose:', event);
      setSocketState('disconnected');
      showToast?.('Chat disconnected.', 'info');
    };

    return () => {
      if (wsRef.current === socket) {
        wsRef.current = null;
      }

      if (socket.readyState === window.WebSocket.OPEN || socket.readyState === window.WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [id]);

  useEffect(() => {
    const node = messageListRef.current;
    if (!node) return;
    const nearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 120;
    if (nearBottom) node.scrollTop = node.scrollHeight;
  }, [messages]);

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

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
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

  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      {loading ? <div className="text-center py-5"><div className="spinner-border" /></div> : (
        <>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h3 className="mb-2">{room?.name || 'Room'}</h3>
            <div className="d-flex flex-wrap gap-3 align-items-center mb-2">
              <span className="room-category-pill">{room?.category || 'General'}</span>
              <span className="d-flex align-items-center gap-2">
                <img src={room?.owner?.profileImage || fallbackAvatar} onError={(e) => { e.currentTarget.src = fallbackAvatar; }} alt="owner" width="28" height="28" className="rounded-circle border" />
                <strong>{room?.owner?.username || 'Unknown owner'}</strong>
              </span>
            </div>
            <p className="mb-0 text-secondary">{room?.description || 'No description available.'}</p>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-3 mb-3" ref={messageListRef} style={{ maxHeight: '56vh', overflowY: 'auto' }}>
            <div className="d-grid gap-3">
              {sortedMessages.map((message, index) => {
                const messageUsername = message?.user?.username || '';
                const isCurrentUser = currentUsername && messageUsername === currentUsername;
                const canEdit = isCurrentUser;
                const canDelete = isCurrentUser || (currentUsername && currentUsername === roomOwner);

                return (
                  <div key={`${message.id || index}-${message.sent_at || index}`} className={`d-flex ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div className="d-flex gap-2" style={{ maxWidth: '78%' }}>
                      {!isCurrentUser && <img src={message?.user?.profileImage || fallbackAvatar} onError={(e) => { e.currentTarget.src = fallbackAvatar; }} alt="user" width="32" height="32" className="rounded-circle border align-self-end" />}

                      <div className={`card border-0 p-2 px-3 ${isCurrentUser ? 'chat-own-message' : ''}`} style={{ wordBreak: 'break-word' }}>
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
                        <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>{message?.content || ''}</div>
                        <div className="small text-secondary mt-1">{message?.sent_at ? new Date(message.sent_at).toLocaleString() : ''}</div>
                      </div>

                      {isCurrentUser && <img src={message?.user?.profileImage || fallbackAvatar} onError={(e) => { e.currentTarget.src = fallbackAvatar; }} alt="user" width="32" height="32" className="rounded-circle border align-self-end" />}
                    </div>
                  </div>
                );
              })}

              {!sortedMessages.length && <div className="alert alert-info mb-0">No messages yet.</div>}
            </div>
          </div>

          <form className="card border-0 shadow-sm rounded-4 p-3" onSubmit={handleSend}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-secondary">Chat status: {socketState}</small>
            </div>
            <div className="d-flex gap-2 align-items-end">
              <textarea
                className="form-control"
                rows="2"
                placeholder="Write a message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                required
              />
              <button className="btn btn-primary" disabled={socketState !== 'connected'}>Send</button>
            </div>
          </form>

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
        </>
      )}
    </div>
  );
}

export default RoomDetails;

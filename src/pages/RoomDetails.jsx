import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRoomDetails, sendMessage } from '../api';

function RoomDetails({ onApiStatusChange, showToast, profile }) {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const currentUsername = profile?.username || profile?.user?.username || '';

  const loadRoom = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getRoomDetails(id);
      setRoom(data);
      onApiStatusChange?.('connected');
    } catch (err) {
      setError(err.message);
      onApiStatusChange?.('error');
      showToast?.(err.message || 'Network error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [id]);

  const messages = useMemo(() => room?.messages || [], [room]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      await sendMessage(id, trimmed);
      setContent('');
      showToast?.('Message sent', 'success');
      loadRoom();
    } catch (err) {
      showToast?.(err.message || 'Failed to send message', 'danger');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" /></div>
      ) : (
        <>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h3 className="mb-2">{room?.name || 'Room'}</h3>
            <div className="d-flex flex-wrap gap-3 mb-1">
              <span><strong>Owner:</strong> {room?.owner?.username || 'Unknown'}</span>
              <span><strong>Category:</strong> {room?.category || 'General'}</span>
            </div>
            <p className="mb-0 text-secondary">{room?.description || 'No description available.'}</p>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-3 mb-3" style={{ maxHeight: '52vh', overflowY: 'auto' }}>
            <div className="d-grid gap-3">
              {messages.map((message, index) => {
                const isCurrentUser = currentUsername && message?.user?.username === currentUsername;
                return (
                  <div key={`${message.sent_at || index}-${index}`} className={`d-flex ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div className="d-flex gap-2" style={{ maxWidth: '80%' }}>
                      {!isCurrentUser && (
                        <img
                          src={message?.user?.profileImage || 'https://via.placeholder.com/32x32.png?text=U'}
                          alt="user"
                          width="32"
                          height="32"
                          className="rounded-circle border"
                        />
                      )}
                      <div className="card border-0 p-2 px-3">
                        <div className="small text-secondary fw-semibold">{message?.user?.username || 'User'}</div>
                        <div>{message?.content || ''}</div>
                        <div className="small text-secondary mt-1">{message?.sent_at ? new Date(message.sent_at).toLocaleString() : ''}</div>
                      </div>
                      {isCurrentUser && (
                        <img
                          src={message?.user?.profileImage || 'https://via.placeholder.com/32x32.png?text=U'}
                          alt="user"
                          width="32"
                          height="32"
                          className="rounded-circle border"
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {!messages.length && <div className="alert alert-info mb-0">No messages yet.</div>}
            </div>
          </div>

          <form className="card border-0 shadow-sm rounded-4 p-3" onSubmit={handleSend}>
            <div className="d-flex gap-2 align-items-end">
              <textarea
                className="form-control"
                rows="2"
                placeholder="Write a message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <button className="btn btn-primary" disabled={sending}>{sending ? 'Sending...' : 'Send'}</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default RoomDetails;

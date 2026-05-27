// src/components/ChatModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

const ChatModal = ({ isOpen, onClose, recipient, onMessageSent }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState('new');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const getToken = () => localStorage.getItem('portalToken');

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      setActiveTab(recipient ? 'new' : 'inbox');
    }
  }, [isOpen, recipient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    const token = getToken();
    try {
      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (otherUserId) => {
    const token = getToken();
    try {
      const response = await fetch(`http://localhost:5000/api/messages/conversation/${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.participant.id);
  };

  const handleSendNewMessage = async (e) => {
    e.preventDefault();
    if (!subject || !content) {
      Swal.fire({
        title: 'Incomplete Message',
        text: 'Please fill both subject and message fields.',
        icon: 'warning',
        confirmButtonColor: '#1a3a5c'
      });
      return;
    }

    setLoading(true);
    const token = getToken();

    try {
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: recipient.id,
          receiverName: recipient.name,
          receiverRole: recipient.role,
          subject,
          content
        })
      });

      if (response.ok) {
        Swal.fire({
          title: 'Message Sent!',
          text: 'Your message has been delivered successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setSubject('');
        setContent('');
        onMessageSent?.();
        onClose();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to send message. Please try again.',
        icon: 'error',
        confirmButtonColor: '#1a3a5c'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    const token = getToken();
    try {
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedConversation.participant.id,
          receiverName: selectedConversation.participant.name,
          receiverRole: selectedConversation.participant.role,
          subject: `Re: ${messages[0]?.subject || 'Message'}`,
          content: replyText
        })
      });

      if (response.ok) {
        setReplyText('');
        fetchMessages(selectedConversation.participant.id);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="chat-modal-header">
          <div className="header-left">
            <div className="header-icon">
              <i className="fas fa-comment-dots"></i>
            </div>
            <div className="header-info">
              <h3>Messages</h3>
              <p>Chat with school community members</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="chat-tabs">
          <button 
            className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            <i className="fas fa-pen-alt"></i>
            <span>New Message</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            <i className="fas fa-inbox"></i>
            <span>Inbox</span>
            {conversations.length > 0 && (
              <span className="badge">{conversations.length}</span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="chat-tab-content">
          {activeTab === 'new' ? (
            <div className="new-message-form">
              <form onSubmit={handleSendNewMessage}>
                <div className="form-group">
                  <label>
                    <i className="fas fa-user"></i>
                    <span>To</span>
                  </label>
                  <div className="recipient-info">
                    <div className="recipient-avatar">
                      <i className={`fas ${recipient?.role === 'teacher' ? 'fa-chalkboard-user' : recipient?.role === 'student' ? 'fa-user-graduate' : 'fa-user'}`}></i>
                    </div>
                    <div className="recipient-details">
                      <strong>{recipient?.name || 'Select a recipient'}</strong>
                      <span>{recipient?.role || 'User'}</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-heading"></i>
                    <span>Subject</span>
                  </label>
                  <input
                    type="text"
                    placeholder="What is this message about?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-comment"></i>
                    <span>Message</span>
                  </label>
                  <textarea
                    placeholder="Write your message here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="6"
                    required
                  />
                </div>

                <button type="submit" className="send-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="inbox-container">
              {/* Conversations Sidebar */}
              <div className="conversations-sidebar">
                <div className="search-conversations">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="conversations-list">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map(conv => (
                      <div
                        key={conv._id}
                        className={`conversation-item ${selectedConversation?._id === conv._id ? 'active' : ''}`}
                        onClick={() => handleSelectConversation(conv)}
                      >
                        <div className="conversation-avatar">
                          <i className={`fas ${conv.participant.role === 'teacher' ? 'fa-chalkboard-user' : conv.participant.role === 'student' ? 'fa-user-graduate' : 'fa-user'}`}></i>
                          {conv.unreadCount > 0 && <span className="unread-dot"></span>}
                        </div>
                        <div className="conversation-info">
                          <div className="conv-header">
                            <strong>{conv.participant.name}</strong>
                            <span className="conv-time">{formatDate(conv.lastMessage.createdAt)}</span>
                          </div>
                          <div className="conv-preview">{conv.lastMessage.content?.substring(0, 40)}...</div>
                          <div className="conv-meta">
                            <span className="conv-role">{conv.participant.role}</span>
                            {conv.unreadCount > 0 && (
                              <span className="unread-count">{conv.unreadCount}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-conversations">
                      <i className="fas fa-inbox"></i>
                      <p>No conversations yet</p>
                      <span>Start a new conversation</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-area">
                {selectedConversation ? (
                  <>
                    <div className="messages-header">
                      <div className="messages-header-info">
                        <div className="header-avatar">
                          <i className={`fas ${selectedConversation.participant.role === 'teacher' ? 'fa-chalkboard-user' : selectedConversation.participant.role === 'student' ? 'fa-user-graduate' : 'fa-user'}`}></i>
                        </div>
                        <div className="header-details">
                          <h4>{selectedConversation.participant.name}</h4>
                          <span>{selectedConversation.participant.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="messages-list">
                      {messages.map(msg => {
                        const isOwn = msg.senderId === localStorage.getItem('userId');
                        return (
                          <div key={msg._id} className={`message-item ${isOwn ? 'own' : 'other'}`}>
                            <div className="message-bubble">
                              <div className="message-sender">
                                <strong>{msg.senderName}</strong>
                                <span className="message-time">{formatDate(msg.createdAt)}</span>
                              </div>
                              <div className="message-subject">{msg.subject}</div>
                              <div className="message-content">{msg.content}</div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="message-reply">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        rows="2"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                          }
                        }}
                      />
                      <button onClick={handleSendReply} disabled={!replyText.trim()}>
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-messages">
                    <i className="fas fa-comments"></i>
                    <h3>No conversation selected</h3>
                    <p>Select a conversation from the left sidebar to start messaging</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Overlay */
        .chat-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Modal Container */
        .chat-modal-container {
          width: 90%;
          max-width: 1000px;
          height: 85vh;
          max-height: 700px;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Header */
        .chat-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          background: linear-gradient(135deg, #1a3a5c 0%, #2c5f8a 100%);
          color: white;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-icon {
          width: 42px;
          height: 42px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-icon i {
          font-size: 1.3rem;
        }

        .header-info h3 {
          margin: 0;
          font-size: 1.2rem;
        }

        .header-info p {
          margin: 0;
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .close-btn {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        /* Tabs */
        .chat-tabs {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
          background: white;
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          color: #666;
          transition: all 0.3s;
          position: relative;
        }

        .tab-btn i {
          font-size: 1rem;
        }

        .tab-btn.active {
          color: #1a3a5c;
          border-bottom: 2px solid #ffc107;
        }

        .tab-btn .badge {
          margin-left: 5px;
          background: #e74c3c;
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 0.7rem;
        }

        /* Tab Content */
        .chat-tab-content {
          flex: 1;
          overflow: hidden;
        }

        /* New Message Form */
        .new-message-form {
          height: 100%;
          overflow-y: auto;
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 0.85rem;
          color: #333;
        }

        .form-group label i {
          color: #ffc107;
          width: 18px;
        }

        .recipient-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }

        .recipient-avatar {
          width: 45px;
          height: 45px;
          background: #1a3a5c;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .recipient-avatar i {
          font-size: 1.2rem;
          color: white;
        }

        .recipient-details strong {
          display: block;
          font-size: 0.95rem;
        }

        .recipient-details span {
          font-size: 0.7rem;
          color: #ffc107;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.3s;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #1a3a5c;
          box-shadow: 0 0 0 3px rgba(26, 58, 92, 0.1);
        }

        .send-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #27ae60, #219a52);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
        }

        .send-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Inbox Container */
        .inbox-container {
          display: flex;
          height: 100%;
        }

        /* Conversations Sidebar */
        .conversations-sidebar {
          width: 35%;
          border-right: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }

        .search-conversations {
          padding: 15px;
          position: relative;
          border-bottom: 1px solid #e0e0e0;
        }

        .search-conversations i {
          position: absolute;
          left: 25px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }

        .search-conversations input {
          width: 100%;
          padding: 10px 10px 10px 35px;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          background: white;
          font-size: 0.85rem;
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
        }

        .conversation-item {
          display: flex;
          gap: 12px;
          padding: 14px;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #e0e0e0;
        }

        .conversation-item:hover {
          background: #e8f0fe;
        }

        .conversation-item.active {
          background: #e3f2fd;
          border-left: 3px solid #ffc107;
        }

        .conversation-avatar {
          position: relative;
          width: 48px;
          height: 48px;
          background: #1a3a5c;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .conversation-avatar i {
          font-size: 1.2rem;
          color: white;
        }

        .unread-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 10px;
          height: 10px;
          background: #e74c3c;
          border-radius: 50%;
          border: 2px solid white;
        }

        .conversation-info {
          flex: 1;
          min-width: 0;
        }

        .conv-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }

        .conv-header strong {
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .conv-time {
          font-size: 0.65rem;
          color: #999;
        }

        .conv-preview {
          font-size: 0.75rem;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .conv-meta {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .conv-role {
          font-size: 0.65rem;
          background: #e0e0e0;
          padding: 2px 6px;
          border-radius: 4px;
          color: #666;
        }

        .unread-count {
          background: #e74c3c;
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 0.6rem;
          font-weight: bold;
        }

        /* Messages Area */
        .messages-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
        }

        .messages-header {
          padding: 15px;
          border-bottom: 1px solid #e0e0e0;
          background: white;
        }

        .messages-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-avatar {
          width: 45px;
          height: 45px;
          background: #1a3a5c;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-avatar i {
          font-size: 1.2rem;
          color: white;
        }

        .header-details h4 {
          margin: 0;
          font-size: 1rem;
        }

        .header-details span {
          font-size: 0.7rem;
          color: #ffc107;
        }

        .messages-list {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          background: #f8f9fa;
        }

        .message-item {
          display: flex;
        }

        .message-item.own {
          justify-content: flex-end;
        }

        .message-item.other {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
        }

        .message-item.own .message-bubble {
          background: linear-gradient(135deg, #1a3a5c, #2c5f8a);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-item.other .message-bubble {
          background: white;
          color: #333;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .message-sender {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 5px;
        }

        .message-sender strong {
          font-size: 0.8rem;
        }

        .message-time {
          font-size: 0.6rem;
          opacity: 0.7;
        }

        .message-subject {
          font-weight: 600;
          font-size: 0.85rem;
          margin-bottom: 5px;
        }

        .message-content {
          font-size: 0.85rem;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .message-reply {
          padding: 15px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 10px;
          background: white;
        }

        .message-reply textarea {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          resize: none;
          font-family: inherit;
          font-size: 0.85rem;
          transition: all 0.3s;
        }

        .message-reply textarea:focus {
          outline: none;
          border-color: #1a3a5c;
        }

        .message-reply button {
          width: 45px;
          height: 45px;
          background: #1a3a5c;
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
        }

        .message-reply button:hover:not(:disabled) {
          background: #ffc107;
          color: #1a3a5c;
          transform: scale(1.05);
        }

        .message-reply button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Empty States */
        .empty-conversations {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-conversations i {
          font-size: 3rem;
          color: #ccc;
          margin-bottom: 10px;
        }

        .empty-conversations p {
          margin: 0;
          color: #999;
        }

        .empty-conversations span {
          font-size: 0.75rem;
          color: #bbb;
        }

        .empty-messages {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-messages i {
          font-size: 4rem;
          color: #ccc;
          margin-bottom: 15px;
        }

        .empty-messages h3 {
          margin: 0 0 5px;
          color: #666;
        }

        .empty-messages p {
          color: #999;
          font-size: 0.85rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .chat-modal-container {
            width: 95%;
            height: 90vh;
          }

          .inbox-container {
            flex-direction: column;
          }

          .conversations-sidebar {
            width: 100%;
            max-height: 250px;
            border-right: none;
            border-bottom: 1px solid #e0e0e0;
          }

          .message-bubble {
            max-width: 85%;
          }

          .chat-tabs .tab-btn span {
            display: none;
          }

          .chat-tabs .tab-btn i {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatModal;
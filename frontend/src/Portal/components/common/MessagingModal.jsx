import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaTimes, FaPaperPlane, FaUsers } from 'react-icons/fa';

const MessagingModal = ({ isOpen, onClose, categories, onSend }) => {
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subject, setSubject] = useState('');

  const handleSend = () => {
    if (!selectedCategory || !subject || !message) {
      Swal.fire('Error', 'Please fill all fields', 'error');
      return;
    }
    
    Swal.fire({
      title: 'Send Message?',
      text: `Send to ${selectedCategory}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FFD700',
      confirmButtonText: 'Send'
    }).then((result) => {
      if (result.isConfirmed) {
        onSend({ category: selectedCategory, subject, message });
        Swal.fire('Sent!', 'Message sent successfully', 'success');
        setMessage('');
        setSubject('');
        setSelectedCategory('');
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        width: '500px',
        maxWidth: '90%',
        padding: '0',
        animation: 'slideIn 0.3s ease'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaUsers color="#FFD700" /> Send Message
          </h3>
          <FaTimes onClick={onClose} style={{ cursor: 'pointer', fontSize: '20px', color: '#999' }} />
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Send to:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                outline: 'none'
              }}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                outline: 'none'
              }}
              placeholder="Message subject"
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                outline: 'none',
                resize: 'vertical'
              }}
              placeholder="Type your message here..."
            />
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#FFD700',
              color: '#1a1a2e',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold'
            }}
          >
            <FaPaperPlane /> Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagingModal;
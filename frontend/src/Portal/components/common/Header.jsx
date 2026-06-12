import React from 'react';
import { FaBell, FaUserCircle, FaSearch } from 'react-icons/fa';

const Header = ({ title, user }) => {
  return (
    <header style={{
      backgroundColor: 'white',
      padding: '15px 30px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 999
    }}>
      <div>
        <h1 style={{ color: '#1a1a2e', fontSize: '24px', margin: 0 }}>
          {title}
        </h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search..."
            style={{
              padding: '8px 15px 8px 40px',
              borderRadius: '20px',
              border: '1px solid #e0e0e0',
              outline: 'none',
              width: '250px'
            }}
          />
          <FaSearch style={{
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#999'
          }} />
        </div>
        
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <FaBell size={22} color="#666" />
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#FFD700',
            color: '#1a1a2e',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>3</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <FaUserCircle size={32} color="#FFD700" />
          <div>
            <div style={{ fontWeight: 'bold', color: '#1a1a2e' }}>{user?.name || 'Admin User'}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>{user?.role || 'Administrator'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
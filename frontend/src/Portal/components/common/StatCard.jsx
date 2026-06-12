import React from 'react';

const StatCard = ({ icon: Icon, title, value, color, bgColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        borderLeft: `4px solid ${color}`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
      }}
    >
      <div style={{
        backgroundColor: bgColor,
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={28} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>{title}</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>{value}</div>
      </div>
    </div>
  );
};

export default StatCard;
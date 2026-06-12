import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';

const PortalLayout = ({ role, user, children, activeItem, onItemClick, onLogout }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Sidebar
        role={role}
        activeItem={activeItem}
        onItemClick={onItemClick}
        onLogout={onLogout}
      />
      <div style={{ flex: 1, marginLeft: '280px' }}>
        <Header title={`${role.charAt(0).toUpperCase() + role.slice(1)} Portal`} user={user} />
        <main style={{ padding: '30px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
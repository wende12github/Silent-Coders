import React from 'react';
import GroupsPage from './pages/GroupsPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Optional Global Navbar/Header can go here */}
      <GroupsPage />
    </div>
  );
};

export default App;

import { useState } from 'react';
import Layout from '@/components/Layout';
import Login from './Login';
import Dashboard from './Dashboard';
import Machines from './Machines';
import LiveMap from './LiveMap';
import Bookings from './Bookings';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'machines':
        return <Machines />;
      case 'liveMap':
        return <LiveMap />;
      case 'bookings':
        return <Bookings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default Index;

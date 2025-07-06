import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';

// Import semua halaman
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage'; // <-- IMPORT HALAMAN BARU
import SuppliersPage from './pages/SuppliersPage';
import StoresPage from './pages/StoresPage';
import ReportsPage from './pages/ReportsPage';

// Import komponen layout
import Sidebar from './components/Sidebar';
import Header from './components/Header';

function App() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <LoginPage />;
  }

  // Fungsi untuk render konten berdasarkan state currentPage
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'products':
        return <ProductsPage />;
      case 'categories': // <-- TAMBAHKAN CASE INI
        return <CategoriesPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'stores':
        return <StoresPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentPage={currentPage}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
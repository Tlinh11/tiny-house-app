import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ZaloWidget from './components/ZaloWidget';
import AuthModal from './components/AuthModal';
import { DataService } from './services/dataService';

// Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BuildingDetailPage from './pages/BuildingDetailPage';
import RoomDetailPage from './pages/RoomDetailPage';
import LandlordPage from './pages/LandlordPage';
import PartnerPage from './pages/PartnerPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import CMSLayout from './pages/cms/CMSLayout';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, search, building-detail, room-detail, landlord, partner, about, blog, cms
  const [selectedBuildingId, setSelectedBuildingId] = useState('TN007');
  const [selectedRoomId, setSelectedRoomId] = useState('DT007-101');
  const [selectedBlogId, setSelectedBlogId] = useState(null);

  // User Auth State
  const [currentUser, setCurrentUser] = useState(() => DataService.getCurrentUser());

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const handleOpenAuthModal = (mode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    DataService.logoutUser();
    setCurrentUser(null);
    if (activeTab === 'cms') setActiveTab('home');
  };

  const isCmsMode = activeTab === 'cms';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Navigation */}
      {!isCmsMode && (
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenAuthModal={handleOpenAuthModal} 
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* Main Dynamic View Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomePage 
            setActiveTab={setActiveTab} 
            setSelectedBuildingId={setSelectedBuildingId} 
          />
        )}

        {activeTab === 'search' && (
          <SearchPage 
            setActiveTab={setActiveTab} 
            setSelectedBuildingId={setSelectedBuildingId} 
          />
        )}

        {activeTab === 'building-detail' && (
          <BuildingDetailPage 
            buildingId={selectedBuildingId} 
            setActiveTab={setActiveTab} 
            setSelectedRoomId={setSelectedRoomId} 
          />
        )}

        {activeTab === 'room-detail' && (
          <RoomDetailPage 
            roomId={selectedRoomId} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'landlord' && (
          <LandlordPage />
        )}

        {activeTab === 'partner' && (
          <PartnerPage />
        )}

        {activeTab === 'about' && (
          <AboutPage />
        )}

        {activeTab === 'blog' && (
          <BlogPage 
            setActiveTab={setActiveTab} 
            setSelectedBlogId={setSelectedBlogId} 
          />
        )}

        {activeTab === 'cms' && (
          <CMSLayout 
            setActiveTab={setActiveTab} 
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onOpenAuthModal={handleOpenAuthModal}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer Navigation */}
      {!isCmsMode && (
        <Footer setActiveTab={setActiveTab} />
      )}

      {/* Floating Orange Zalo OA Widget */}
      {!isCmsMode && <ZaloWidget />}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        mode={authModalMode} 
        onClose={() => setAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
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
  const [, setTick] = useState(0);

  // User Auth State
  const [currentUser, setCurrentUser] = useState(() => DataService.getCurrentUser());

  // Realtime Backend API Data Synchronization & Event Listener
  useEffect(() => {
    // Fetch live backend data from Express API server
    DataService.fetchAllAsync();

    // Subscribe to data changes
    const unsubscribe = DataService.subscribe(() => {
      setTick(t => t + 1);
      setCurrentUser(DataService.getCurrentUser());
    });

    return () => unsubscribe();
  }, []);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const handleOpenAuthModal = (mode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('cms');
  };

  const handleLogout = () => {
    DataService.logoutUser();
    setCurrentUser(null);
    setActiveTab('home');
  };

  // Global Search Filter State (carried from HomePage to SearchPage)
  const [searchFilters, setSearchFilters] = useState({
    district: 'all',
    minPrice: 0,
    maxPrice: 35000000
  });

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
            onSearch={(filters) => setSearchFilters(filters)}
          />
        )}

        {activeTab === 'search' && (
          <SearchPage 
            setActiveTab={setActiveTab} 
            setSelectedBuildingId={setSelectedBuildingId}
            searchFilters={searchFilters}
            setSearchFilters={setSearchFilters}
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

      {/* Auth Modal */}
      <AuthModal 
        key={`${authModalMode}-${authModalOpen}`}
        isOpen={authModalOpen} 
        mode={authModalMode} 
        onClose={() => setAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

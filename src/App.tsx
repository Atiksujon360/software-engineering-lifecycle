import React, { useState } from 'react';
import {
  DeleteProjectModal,
  ImportProgressModal,
  NewProjectModal,
  RenameProjectModal,
  ResetProgressModal,
} from './components/Modals';
import { Navigation } from './components/Navigation';
import { ToastContainer } from './components/ToastContainer';
import { TopBar } from './components/TopBar';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { useHashRoute } from './hooks/useHashRoute';
import { AgentsPage } from './pages/AgentsPage';
import { GalleryPage } from './pages/GalleryPage';
import { OverviewPage } from './pages/OverviewPage';
import { PhasePage } from './pages/PhasePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResultsPage } from './pages/ResultsPage';
import { SkillsPage } from './pages/SkillsPage';
import { StructurePage } from './pages/StructurePage';
import { TemplatesPage } from './pages/TemplatesPage';
import { MigrationDialog } from './components/migration/MigrationDialog';

function AppContent() {
  const { route, navigate } = useHashRoute();
  const { user } = useProject();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);

  // Disable migration dialog for now - allow guest access
  const showMigrationDialog = false;

  // Render current page based on hash route
  const renderPage = () => {
    switch (route.page) {
      case 'overview':
        return <OverviewPage onNavigate={navigate} />;
      case 'phase':
        return <PhasePage phaseId={route.phaseId} onNavigate={navigate} />;
      case 'agents':
        return <AgentsPage />;
      case 'structure':
        return <StructurePage />;
      case 'templates':
        return <TemplatesPage />;
      case 'gallery':
        return <GalleryPage onNavigate={navigate} />;
      case 'resources':
        return <ResourcesPage />;
      case 'skills':
        return <SkillsPage onNavigate={navigate} />;
      case 'results':
        return <ResultsPage query={route.query} onNavigate={navigate} />;
      case 'portfolio':
        return <PortfolioPage />;
      default:
        return <OverviewPage onNavigate={navigate} />;
    }
  };

  const currentSearchQuery = route.page === 'results' ? route.query : '';

  return (
    <div className="min-h-screen flex flex-col bg-(--paper) text-(--ink)">
      {/* Accessible skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Bar Header */}
      <TopBar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        onOpenNewProjectModal={() => setIsNewModalOpen(true)}
        onOpenRenameModal={() => setIsRenameModalOpen(true)}
        onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenMigrationModal={() => setIsMigrationOpen(true)}
        onNavigate={navigate}
        currentSearchQuery={currentSearchQuery}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Navigation
          currentRoute={route}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          onNavigate={navigate}
        />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>

      {/* Interactive Modals */}
      <NewProjectModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
      <RenameProjectModal isOpen={isRenameModalOpen} onClose={() => setIsRenameModalOpen(false)} />
      <DeleteProjectModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} />
      <ResetProgressModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />
      <ImportProgressModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      {showMigrationDialog && <MigrationDialog user={user} onClose={() => setIsMigrationOpen(false)} />}

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

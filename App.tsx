import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { QuickEntry } from './components/QuickEntry';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { ChildProfile } from './components/ChildProfile';
import { Note, UserProfile } from './types';
import { Plus, Home, FileText, Settings, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    birthDate: '',
    securityPin: '0000', // Default PIN for initial setup
    diagnosis: '',
    medications: ''
  });

  const [view, setView] = useState<'dashboard' | 'reports'>('dashboard');
  const [showEntry, setShowEntry] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);

  // Check auth and load data
  useEffect(() => {
    // Check mock auth token
    const token = localStorage.getItem('postit-smart-auth');
    if (token) {
      setIsAuthenticated(true);
    }

    // Load user profile
    const savedProfile = localStorage.getItem('postit-smart-profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    } else {
      // Legacy support: check for simple name
      const legacyName = localStorage.getItem('postit-smart-child-name');
      if (legacyName) {
        setUserProfile(prev => ({ ...prev, name: legacyName }));
      }
    }

    // Load notes
    const savedNotes = localStorage.getItem('postit-smart-notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    }
  }, []);

  // Save notes to local storage
  useEffect(() => {
    localStorage.setItem('postit-smart-notes', JSON.stringify(notes));
  }, [notes]);

  // Save profile to local storage
  useEffect(() => {
    localStorage.setItem('postit-smart-profile', JSON.stringify(userProfile));
    // Legacy sync
    localStorage.setItem('postit-smart-child-name', userProfile.name);
  }, [userProfile]);

  const handleLogin = (name?: string) => {
    localStorage.setItem('postit-smart-auth', 'mock-token-123');
    if (name) {
      setUserProfile(prev => ({ ...prev, name: name }));
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('postit-smart-auth');
    setIsAuthenticated(false);
    setView('dashboard');
  };

  const handleSaveNote = (note: Note) => {
    setNotes(prev => [note, ...prev]);
    setShowEntry(false);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="bg-slate-50 min-h-screen font-sans text-slate-900 selection:bg-brand-100">
        
        {/* Main Content Area */}
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative pb-20">
          
          {/* Header (Only on Dashboard) */}
          {view === 'dashboard' && (
            <header className="px-6 py-4 bg-white sticky top-0 z-20 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-brand-200 shadow-md">
                  P
                </div>
                <span className="font-bold text-slate-800 tracking-tight">Post-it Smart</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </header>
          )}

          {/* Views */}
          {view === 'dashboard' && (
            <div className="p-4 animate-fade-in">
              <Dashboard 
                notes={notes} 
                userProfile={userProfile} 
                onViewReport={() => setView('reports')} 
                onOpenProfile={() => setShowProfile(true)}
              />
            </div>
          )}

          {view === 'reports' && (
            <div className="animate-fade-in">
              <Reports notes={notes} userProfile={userProfile} onBack={() => setView('dashboard')} />
            </div>
          )}

          {/* Sticky FAB (Floating Action Button) */}
          {view === 'dashboard' && (
             <button
               onClick={() => setShowEntry(true)}
               className="fixed bottom-24 right-6 sm:absolute sm:bottom-6 sm:right-6 w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg shadow-brand-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
               aria-label="Nova Nota"
             >
               <Plus className="w-7 h-7" />
             </button>
          )}

          {/* Bottom Navigation (Mobile) */}
          {view === 'dashboard' && (
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center text-xs font-medium text-slate-400 sm:hidden z-30 pb-safe">
              <button className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-brand-600' : ''}`} onClick={() => setView('dashboard')}>
                <Home className="w-5 h-5" />
                Início
              </button>
              <button className="flex flex-col items-center gap-1" onClick={() => setView('reports')}>
                <FileText className="w-5 h-5" />
                Relatórios
              </button>
              <button className="flex flex-col items-center gap-1" onClick={() => setShowProfile(true)}>
                <Settings className="w-5 h-5" />
                Ajustes
              </button>
            </nav>
          )}

        </main>

        {/* Modals */}
        {showEntry && (
          <QuickEntry onSave={handleSaveNote} onCancel={() => setShowEntry(false)} />
        )}

        {showProfile && (
          <ChildProfile 
            profile={userProfile} 
            onSave={handleUpdateProfile} 
            onClose={() => setShowProfile(false)} 
          />
        )}

      </div>
    </HashRouter>
  );
};

export default App;
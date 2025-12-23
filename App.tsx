
import React, { useState, useEffect } from 'react';
import { User, Role, Invitation, ChatSession } from './types';
import AuthScreen from './components/AuthScreen';
import AdminDashboard from './components/AdminDashboard';
import CustomerChat from './components/CustomerChat';

const STORAGE_KEY_INVITES = 'cp_invites';
const STORAGE_KEY_SESSIONS = 'cp_sessions';
const STORAGE_KEY_USER = 'cp_current_user';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Initialize data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    const savedInvites = localStorage.getItem(STORAGE_KEY_INVITES);
    const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedInvites) setInvitations(JSON.parse(savedInvites));
    if (savedSessions) setSessions(JSON.parse(savedSessions));
  }, []);

  // Persist data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INVITES, JSON.stringify(invitations));
  }, [invitations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const addInvitation = (code: string) => {
    setInvitations(prev => [...prev, { code, createdAt: Date.now(), isUsed: false }]);
  };

  const updateSession = (session: ChatSession) => {
    setSessions(prev => {
      const idx = prev.findIndex(s => s.customerId === session.customerId);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = session;
        return updated;
      }
      return [...prev, session];
    });
  };

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} invitations={invitations} setInvitations={setInvitations} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <h1 className="font-bold text-slate-800 text-lg">ConnectPlus</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-500 hidden sm:inline">
            Logged in as <span className="font-semibold text-slate-700">{currentUser.name}</span>
          </span>
          <button 
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {currentUser.role === 'ADMIN' ? (
          <AdminDashboard 
            adminUser={currentUser} 
            invitations={invitations} 
            onAddInvitation={addInvitation}
            sessions={sessions}
            onUpdateSession={updateSession}
          />
        ) : (
          <CustomerChat 
            customerUser={currentUser} 
            session={sessions.find(s => s.customerId === currentUser.id)}
            onUpdateSession={updateSession}
          />
        )}
      </main>
    </div>
  );
};

export default App;

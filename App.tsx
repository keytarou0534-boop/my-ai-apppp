
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize data from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      const savedInvites = localStorage.getItem(STORAGE_KEY_INVITES);
      const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.id) {
          setCurrentUser(parsedUser);
        }
      }
      if (savedInvites) setInvitations(JSON.parse(savedInvites));
      if (savedSessions) setSessions(JSON.parse(savedSessions));
    } catch (e) {
      console.error("Failed to load initial state", e);
    } finally {
      setTimeout(() => setIsInitializing(false), 500);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist data changes
  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem(STORAGE_KEY_INVITES, JSON.stringify(invitations));
    }
  }, [invitations, isInitializing]);

  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    }
  }, [sessions, isInitializing]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  };

  const handleLogout = () => {
    if (window.confirm("ログアウトしますか？次回ログインには再度パスワードまたはコードが必要です。")) {
      setCurrentUser(null);
      localStorage.removeItem(STORAGE_KEY_USER);
    }
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

  // 外部からのデータ同期用
  const importAllData = (data: { invitations: Invitation[], sessions: ChatSession[] }) => {
    if (data.invitations) setInvitations(data.invitations);
    if (data.sessions) setSessions(data.sessions);
    alert("データを正常にインポートしました。");
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center animate-bounce shadow-2xl">
          <span className="text-indigo-600 font-bold text-4xl">C+</span>
        </div>
        <p className="mt-6 text-white font-medium text-lg opacity-80 animate-pulse">読み込み中...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} invitations={invitations} setInvitations={setInvitations} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-[100dvh]">
      {!isOnline && (
        <div className="bg-red-500 text-white text-center py-1 text-xs font-bold animate-pulse z-[100]">
          オフラインです。一部の機能が制限される場合があります。
        </div>
      )}
      
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="font-bold text-slate-800 text-xl tracking-tight">ConnectPlus</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">User</span>
            <span className="text-sm font-bold text-slate-700">{currentUser.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
            title="ログアウト"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
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
            onImportData={importAllData}
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

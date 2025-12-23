
import React, { useState } from 'react';
import { User, Invitation, ChatSession, Message } from '../types';
import ChatWindow from './ChatWindow';

interface AdminDashboardProps {
  adminUser: User;
  invitations: Invitation[];
  onAddInvitation: (code: string) => void;
  sessions: ChatSession[];
  onUpdateSession: (session: ChatSession) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  adminUser, 
  invitations, 
  onAddInvitation, 
  sessions, 
  onUpdateSession 
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onAddInvitation(code);
    setShowInviteModal(false);
  };

  const selectedSession = sessions.find(s => s.customerId === selectedSessionId);

  return (
    <div className="flex w-full h-full overflow-hidden bg-slate-50">
      {/* Sidebar: Chats and Invites */}
      <aside className={`${selectedSessionId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 border-r border-slate-200 bg-white flex-col h-full overflow-hidden`}>
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-lg">チャット一覧</h2>
          <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-bold">
            {sessions.length}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-400 text-base">進行中のチャットはありません</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {sessions.sort((a,b) => b.lastUpdated - a.lastUpdated).map(session => (
                <button
                  key={session.customerId}
                  onClick={() => setSelectedSessionId(session.customerId)}
                  className={`w-full p-5 flex items-center space-x-4 hover:bg-slate-50 transition-colors text-left ${selectedSessionId === session.customerId ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xl">
                    {session.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="font-bold text-slate-800 text-base truncate">{session.customerName}</p>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(session.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {session.messages[session.messages.length - 1]?.text || (session.messages[session.messages.length - 1]?.imageUrl ? '📷 写真を送りました' : 'チャットを開始しました')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => setShowInviteModal(true)}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center shadow-lg shadow-indigo-100"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            招待コードを発行
          </button>
        </div>
      </aside>

      {/* Main Content: Chat Window */}
      <section className={`${!selectedSessionId ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col h-full relative`}>
        {selectedSession ? (
          <>
            <div className="md:hidden p-2 absolute top-4 left-4 z-20">
              <button 
                onClick={() => setSelectedSessionId(null)}
                className="p-2 bg-white/80 backdrop-blur rounded-full shadow-md text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            <ChatWindow 
              user={adminUser} 
              session={selectedSession} 
              onUpdateSession={onUpdateSession}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700">チャットを選択</h3>
            <p className="mt-3 text-base max-w-xs leading-relaxed">左側のリストから顧客を選択するか、新しく顧客を招待してください。</p>
          </div>
        )}
      </section>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-7 shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">招待の管理</h3>
            
            <div className="mb-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">未使用の招待コード</h4>
              <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-2xl divide-y divide-slate-50">
                {invitations.filter(i => !i.isUsed).length === 0 ? (
                  <p className="p-6 text-base text-slate-400 text-center italic">コードはありません</p>
                ) : (
                  invitations.filter(i => !i.isUsed).map(inv => (
                    <div key={inv.code} className="p-4 flex justify-between items-center">
                      <span className="font-mono font-bold text-indigo-600 text-lg tracking-wider">{inv.code}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(inv.code);
                          alert('コピーしました');
                        }}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
                      >
                        コピー
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button 
                onClick={generateCode}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-100 transition-all"
              >
                新規コードを発行
              </button>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="w-full py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

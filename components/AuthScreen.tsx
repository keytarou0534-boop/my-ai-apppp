
import React, { useState } from 'react';
import { User, Role, Invitation } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  invitations: Invitation[];
  setInvitations: React.Dispatch<React.SetStateAction<Invitation[]>>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, invitations, setInvitations }) => {
  const [mode, setMode] = useState<'CHOICE' | 'ADMIN_LOGIN' | 'CUSTOMER_INVITE'>('CHOICE');
  const [adminPass, setAdminPass] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === 'admin123') { // Simple demo password
      onLogin({ id: 'admin-001', name: '管理者', role: 'ADMIN' });
    } else {
      setError('パスワードが違います');
    }
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invite = invitations.find(inv => inv.code === inviteCode && !inv.isUsed);
    
    if (invite) {
      if (!customerName.trim()) {
        setError('お名前を入力してください');
        return;
      }

      // Mark code as used
      setInvitations(prev => prev.map(inv => 
        inv.code === inviteCode ? { ...inv, isUsed: true, assignedTo: customerName } : inv
      ));

      onLogin({ 
        id: `cust-${Date.now()}`, 
        name: customerName, 
        role: 'CUSTOMER',
        invitationCode: inviteCode
      });
    } else {
      setError('無効な招待コード、または既に使用されています');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-xl shadow-indigo-200">
            <span className="text-white font-bold text-4xl">C+</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">ConnectPlus</h2>
          <p className="text-slate-500 mt-3 text-lg">
            {mode === 'CHOICE' ? 'ログイン方法を選択' : 
             mode === 'ADMIN_LOGIN' ? '管理者ログイン' : '招待コードを入力'}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 text-base rounded-r-xl font-medium">
            {error}
          </div>
        )}

        {mode === 'CHOICE' && (
          <div className="space-y-5">
            <button 
              onClick={() => { setMode('CUSTOMER_INVITE'); setError(''); }}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-indigo-200 active:scale-95"
            >
              顧客として参加
            </button>
            <button 
              onClick={() => { setMode('ADMIN_LOGIN'); setError(''); }}
              className="w-full py-5 bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 rounded-2xl font-bold text-lg transition-all active:scale-95"
            >
              管理者ログイン
            </button>
          </div>
        )}

        {mode === 'ADMIN_LOGIN' && (
          <form onSubmit={handleAdminSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">管理者パスワード</label>
              <input 
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex flex-col space-y-3">
              <button 
                type="submit"
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xl shadow-xl shadow-indigo-200 transition-all active:scale-95"
              >
                ログイン
              </button>
              <button 
                type="button"
                onClick={() => setMode('CHOICE')}
                className="w-full py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
              >
                戻る
              </button>
            </div>
          </form>
        )}

        {mode === 'CUSTOMER_INVITE' && (
          <form onSubmit={handleCustomerSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">お名前</label>
              <input 
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg"
                placeholder="田中 太郎"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">招待コード</label>
              <input 
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-xl tracking-widest"
                placeholder="ABCD-1234"
                required
              />
            </div>
            <div className="flex flex-col space-y-3">
              <button 
                type="submit"
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xl shadow-xl shadow-indigo-200 transition-all active:scale-95"
              >
                チャットを開始
              </button>
              <button 
                type="button"
                onClick={() => setMode('CHOICE')}
                className="w-full py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
              >
                戻る
              </button>
            </div>
          </form>
        )}
      </div>
      <p className="mt-10 text-slate-400 text-sm font-medium">
        © 2024 ConnectPlus Communications
      </p>
    </div>
  );
};

export default AuthScreen;

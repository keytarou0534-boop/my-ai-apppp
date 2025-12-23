
import React, { useState, useRef, useEffect } from 'react';
import { User, Message, ChatSession } from '../types';
import { getSmartReply, summarizeChat } from '../services/geminiService';

interface ChatWindowProps {
  user: User;
  session: ChatSession;
  onUpdateSession: (session: ChatSession) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user, session, onUpdateSession }) => {
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.messages]);

  const handleSendMessage = (text?: string, imageUrl?: string) => {
    if (!text?.trim() && !imageUrl) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      text,
      imageUrl,
      timestamp: Date.now()
    };

    const updatedSession: ChatSession = {
      ...session,
      messages: [...session.messages, newMessage],
      lastUpdated: Date.now()
    };

    onUpdateSession(updatedSession);
    setInputText('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        handleSendMessage(undefined, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiReply = async () => {
    if (session.messages.length === 0) return;
    setIsAiLoading(true);
    const suggestion = await getSmartReply(session.messages);
    setInputText(suggestion);
    setIsAiLoading(false);
  };

  const handleSummarize = async () => {
    if (session.messages.length === 0) return;
    setIsAiLoading(true);
    const summaryText = await summarizeChat(session.messages);
    setSummary(summaryText);
    setIsAiLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Chat Header - Larger on mobile */}
      <div className="px-5 py-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-indigo-600 text-xl">
            {user.role === 'ADMIN' ? session.customerName.charAt(0) : '管'}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg leading-tight">
              {user.role === 'ADMIN' ? session.customerName : '管理者とのチャット'}
            </h3>
            <p className="text-xs text-green-600 flex items-center mt-0.5">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              オンライン
            </p>
          </div>
        </div>

        {user.role === 'ADMIN' && (
          <div className="flex space-x-2">
            <button 
              onClick={handleSummarize}
              disabled={isAiLoading || session.messages.length === 0}
              className="px-4 py-2 text-sm font-semibold bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 disabled:opacity-50 transition-all flex items-center"
            >
              要約
            </button>
            <button 
              onClick={handleAiReply}
              disabled={isAiLoading || session.messages.length === 0}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center shadow-sm"
            >
              {isAiLoading ? '生成中' : 'AI提案'}
            </button>
          </div>
        )}
      </div>

      {/* Summary Box */}
      {summary && (
        <div className="m-4 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl relative shadow-sm">
          <button 
            onClick={() => setSummary(null)}
            className="absolute top-3 right-3 text-indigo-400 hover:text-indigo-600 p-1"
          >
            ✕
          </button>
          <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2 tracking-wider">AI要約</h4>
          <p className="text-base text-indigo-900 leading-relaxed whitespace-pre-wrap">{summary}</p>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-7"
      >
        {session.messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <p className="text-lg">メッセージを送りましょう</p>
          </div>
        )}

        {session.messages.map((msg) => {
          const isOwn = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] sm:max-w-[80%] ${isOwn ? 'order-2' : ''}`}>
                <div className={`text-xs mb-1.5 text-slate-400 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                  {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className={`rounded-[1.25rem] px-5 py-3.5 shadow-sm ${
                  isOwn 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text && <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="Uploaded" 
                      className={`max-w-full rounded-xl ${msg.text ? 'mt-3' : ''} shadow-inner`}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area - Larger inputs for mobile */}
      <div className="p-4 sm:p-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex items-center space-x-3">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-4 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all flex-shrink-0"
            title="写真を添付"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <textarea 
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }
              }}
              placeholder="メッセージ..."
              className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all resize-none text-base leading-snug"
              style={{ maxHeight: '150px' }}
            />
            <button 
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim()}
              className="absolute right-3 bottom-2 p-2 text-indigo-600 disabled:text-slate-300 hover:bg-indigo-50 rounded-xl transition-all"
            >
              <svg className="w-8 h-8 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

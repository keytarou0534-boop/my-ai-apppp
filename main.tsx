import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA機能のためのService Worker登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // import.meta.env が未定義の場合のエラーを回避するための安全なアクセス
    const metaEnv = (import.meta as any).env;
    const baseUrl = metaEnv ? metaEnv.BASE_URL : '/';
    const swPath = baseUrl + 'sw.js';
    
    navigator.serviceWorker.register(swPath).then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
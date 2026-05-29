import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

const rootEl = document.getElementById('root');
if (rootEl && !rootEl._reactRoot) {
  rootEl._reactRoot = ReactDOM.createRoot(rootEl);
}
rootEl._reactRoot.render(<App />);
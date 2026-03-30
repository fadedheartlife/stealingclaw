import React from 'react';
import ReactDOM from 'react-dom/client';
import './config/back4app'; // Initialize Parse before anything else
import { verifyOrigin } from './utils/security';
import App from './App';
import './index.css';

// Block iframe embedding (anti-clickjacking)
verifyOrigin();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

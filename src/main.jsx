import React from 'react';
import ReactDOM from 'react-dom/client';
import './config/back4app'; // Initialize Parse before anything else
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

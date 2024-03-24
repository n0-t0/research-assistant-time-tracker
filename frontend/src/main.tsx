// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; // このインポートが正しく機能するはずです

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);

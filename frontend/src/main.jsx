import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from "react-router";
import { Login } from './Login.jsx';
import { Register } from './register.jsx';
import { ForgotPassword } from './ForgotPassword.jsx';
import { AdminDashboard } from './AdminDashboard.jsx';
import { warmupBackendServer } from './authApi';

// ⚡ Wake up Render backend immediately on app launch so it's awake before user submits forms
warmupBackendServer();

// Periodically keep server warm every 12 minutes while user has the tab open
setInterval(() => {
  warmupBackendServer();
}, 12 * 60 * 1000);

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/forgot-password" element={<ForgotPassword />}></Route>
            <Route path="/admin" element={<AdminDashboard />}></Route>
            <Route path="/admin/dashboard" element={<AdminDashboard />}></Route>
            <Route path="/admin/*" element={<AdminDashboard />}></Route>
        </Routes>
    </BrowserRouter>
)
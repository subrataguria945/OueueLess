import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from "react-router";
import { Login } from './Login.jsx';
import { Register } from './register.jsx';
import { ForgotPassword } from './ForgotPassword.jsx';
import { AdminDashboard } from './AdminDashboard.jsx';

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
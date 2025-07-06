import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';

// 1. Buat Context
const AuthContext = createContext();

// 2. Buat Provider
// Komponen ini akan "membungkus" aplikasi Anda dan menyediakan data auth
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cek sesi pengguna yang aktif saat aplikasi pertama kali dimuat
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        // Listener untuk memantau perubahan status login (login, logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        // Cleanup listener saat komponen tidak lagi digunakan
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Kumpulan fungsi dan state yang akan disediakan untuk komponen lain
    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
        // Anda bisa menambahkan role user di sini nanti
    };

    // Tampilkan children (aplikasi Anda) hanya setelah proses loading selesai
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 3. Buat Custom Hook
// Ini adalah cara mudah untuk mengakses data dari komponen mana pun
export const useAuth = () => {
    return useContext(AuthContext);
};
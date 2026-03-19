import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';

// Defina a tipagem real do que vem do seu endpoint /user/info/
interface User {
    id: number | string;
    name: string;
    email: string;
    image: string | null;
    is_student: boolean;
    is_teacher: boolean;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>; // A função vital que você não tinha
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // Função que busca a verdade no backend
    const refreshUser = async () => {
        try {
            const response = await api.get('/user/info/');
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Token inválido ou expirado. Limpando sessão.");
            logout();
        }
    };

    // Hidrata o estado no primeiro carregamento (F5)
    useEffect(() => {
        const token = localStorage.getItem('token'); // Ou cookie
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            refreshUser().finally(() => setIsInitializing(false));
        } else {
            setIsInitializing(false);
        }
    }, []);

    const login = async (token: string) => {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await refreshUser(); // Imediatamente após o login, busca a foto e os dados
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
    };

    if (isInitializing) {
        return <div className="min-h-screen flex items-center justify-center">Carregando SSA...</div>; // Evita piscar a tela de login
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    return context;
};
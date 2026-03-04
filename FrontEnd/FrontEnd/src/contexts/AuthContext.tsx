import { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

// Defina o formato exato do que vem dentro do token do Django
interface DecodedToken {
    user_id: string;
    name: string;
    email: string;
    is_teacher: boolean;
    is_student: boolean;
    exp: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: DecodedToken | null;
    login: (token: string, refreshToken: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<DecodedToken | null>(null);
    const isAuthenticated = !!user; // Se user existe, está logado

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                // Opcional: Verificar se o token já expirou lendo o decoded.exp
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(decoded);
                } else {
                    logout(); // Token expirado, limpa tudo
                }
            } catch (error) {
                logout(); // Token malformado
            }
        }
    }, []);

    const login = (token: string, refreshToken: string) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        const decoded = jwtDecode<DecodedToken>(token);
        setUser(decoded);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
};
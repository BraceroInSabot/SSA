import { useState } from "react";
import { loginUser } from "../services/AuthService";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const data = await loginUser(email, password);
            login(data.access);
            if (data.access && data.refresh) {
                navigate("/atividades");
            }
        } catch {
            setError("Credenciais inválidas. Verifique seu e-mail e senha.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#1E3A8A] px-6 py-8 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transform rotate-3">
                        <span className="text-[#1E3A8A] text-2xl font-black tracking-tighter -rotate-3">SSA</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Sistema de Suporte ao Aluno</h1>
                    <p className="text-[#F8FAFC] text-sm opacity-90">Plataforma educacional para gestão de atividades</p>
                </div>
                
                <div className="p-8">
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold text-[#0F172A]">Acesso Acadêmico</h2>
                        <p className="text-[#0F172A] opacity-70 text-sm mt-1">Insira suas credenciais para continuar</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2 border border-red-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="form-control">
                            <label className="label py-1" htmlFor="email">
                                <span className="label-text font-semibold text-[#0F172A]">E-mail Institucional</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="input input-bordered w-full bg-[#F8FAFC] focus:bg-white focus:outline focus:outline-2 focus:outline-[#3B82F6] focus:border-transparent"
                                placeholder="aluno@instituicao.edu.br"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                        
                        <div className="form-control">
                            <label className="label py-1" htmlFor="password">
                                <span className="label-text font-semibold text-[#0F172A]">Senha</span>
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="input input-bordered w-full bg-[#F8FAFC] focus:bg-white focus:outline focus:outline-2 focus:outline-[#3B82F6] focus:border-transparent"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="btn bg-[#3B82F6] hover:bg-[#2563EB] text-white w-full mt-2 border-none shadow-md transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Acessando...
                                </>
                            ) : (
                                "Entrar no Ambiente"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs text-[#0F172A] opacity-60 border-t border-gray-100 pt-6">
                        <p>Este é um ambiente acadêmico utilizado como portfólio.</p>
                        <p className="mt-1">Dúvidas sobre o seu acesso? Fale com o seu professor.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

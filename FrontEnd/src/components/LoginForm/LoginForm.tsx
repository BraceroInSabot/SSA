import { useState } from "react";
import Logotipo from '../../assets/img/Logotipo.svg';
import { loginUser } from "../../services/AuthService";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginForm() {
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
                navigate('/atividades');
            }
        } catch (err) {
            setError("Falha na autenticação. Verifique suas credenciais.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[440px]">
            {/* Header Form */}
            <div className="mb-10 text-center lg:text-left">
                <div className="lg:hidden mb-8 flex justify-center">
                    {/* Exibe o logotipo apenas no mobile; no desktop a área institucional assume essa função */}
                    <div className="text-6xl font-bold text-[#3B82F6] tracking-wider mb-2">SSA</div>
                </div>
                <h2 className="text-3xl font-extrabold text-[#0F172A] mb-3 tracking-tight">Bem-vindo de volta</h2>
                <p className="text-[#0F172A] opacity-70 text-base font-medium">Insira suas credenciais para acessar.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                    <div className="alert alert-error bg-[#FEF2F2] text-red-700 border border-red-200 rounded-lg shadow-sm py-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-sm font-semibold">{error}</span>
                    </div>
                )}

                <div className="form-control w-full">
                    <label htmlFor="email" className="label pb-2">
                        <span className="label-text font-bold text-[#0F172A]">E-mail corporativo</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="nome@instituicao.edu.br"
                        className="input input-bordered w-full bg-white border-[#E2E8F0] text-[#0F172A] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-all shadow-sm"
                    />
                </div>

                <div className="form-control w-full">
                    <div className="flex justify-between items-end pb-2">
                        <label htmlFor="password" className="label py-0">
                            <span className="label-text font-bold text-[#0F172A]">Senha</span>
                        </label>
                    </div>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="input input-bordered w-full bg-white border-[#E2E8F0] text-[#0F172A] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-all shadow-sm"
                    />
                </div>

                <div className="mt-6 flex flex-col gap-4">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn bg-[#3B82F6] hover:bg-[#2563EB] text-white border-none w-full shadow-md text-base h-12 font-bold transition-colors"
                    >
                        {isLoading ? <span className="loading loading-spinner"></span> : "Entrar no Sistema"}
                    </button>
                    
                    <div className="divider text-sm text-[#0F172A] opacity-50 before:bg-[#E2E8F0] after:bg-[#E2E8F0] font-semibold my-2">ou</div>
                    
                    <button 
                        type="button" 
                        onClick={() => navigate('/atividades')} 
                        className="btn bg-transparent border-2 border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#3B82F6] hover:text-[#3B82F6] w-full shadow-sm h-12 font-bold transition-colors"
                    >
                        Acessar como Visitante
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;
import { useState } from "react";
import GoToActivity from "../../components/Buttons/GoToActivity";
import Logotipo from '../../assets/img/Logotipo.svg';
import EntrarButton from "../../components/Buttons/Entrar";
import { loginUser } from "../../services/AuthService";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";


function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth(); 
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const data = await loginUser(email, password);
            login(data.access, data.refresh); 

            if (data.access && data.refresh) {
                navigate('/atividades');
            }
        } catch (err) {
            setError("Falha na autenticação. Verifique suas credenciais.");
        }
    };

    return (
        <main className="flex-1 flex items-center justify-center p-4">
            <form 
                onSubmit={handleSubmit} 
                className="bg-[#E9E9E9] w-full max-w-[530px] rounded-lg shadow-sm p-10 flex flex-col"
            >
                <img 
                    src={Logotipo} 
                    alt="Logotipo" 
                    className="self-center mb-10 w-48 object-contain" 
                />

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Senha
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mt-8">
                    <GoToActivity />
                    <EntrarButton is_navigate={false} type="submit" />
                </div>
            </form>
        </main>
    );
}

export default LoginForm;
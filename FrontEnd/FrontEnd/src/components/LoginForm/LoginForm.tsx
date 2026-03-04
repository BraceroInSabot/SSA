import GoToActivity from "../../components/Buttons/GoToActivity";
import Logotipo from '../../assets/img/Logotipo.svg';
import EntrarButton from "../../components/Buttons/Entrar";

function LoginForm() {
    return (
        <main className="flex-1 flex items-center justify-center p-4">
                <div className="bg-[#E9E9E9] w-full max-w-[530px] rounded-lg shadow-sm p-10 flex flex-col">
                    
                    <img 
                        src={Logotipo} 
                        alt="Logotipo" 
                        className="self-center mb-10 w-48 object-contain" 
                    />

                    <div className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
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
                                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <GoToActivity />
                        <EntrarButton is_navigate={false} />
                    </div>
                </div>
            </main>
    );
}

export default LoginForm;
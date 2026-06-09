import { useNavigate } from 'react-router-dom';
import NavBar from "../components/NavBar/NavBar";

function ExamsHub() {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <NavBar />
            <div className="flex-1 flex flex-col h-full overflow-hidden p-8 items-center justify-center">
                <div className="max-w-4xl w-full text-center">
                    <h1 className="text-4xl font-black text-[#1E3A8A] mb-4">Central de Provas</h1>
                    <p className="text-gray-600 mb-12 text-lg">Escolha qual tipo de avaliação você deseja acessar no momento.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div 
                            onClick={() => navigate('/atividades?tipo=avaliacao')} 
                            className="bg-white p-10 rounded-2xl shadow-lg border-2 border-transparent hover:border-[#3B82F6] cursor-pointer transition-all hover:scale-105 group"
                        >
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#3B82F6] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[#3B82F6] group-hover:text-white transition-colors">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Avaliações Padrão</h2>
                            <p className="text-gray-500">Provas regulares, testes e exames aplicados em sala de aula.</p>
                        </div>

                        <div 
                            onClick={() => navigate('/campanhas')} 
                            className="bg-white p-10 rounded-2xl shadow-lg border-2 border-transparent hover:border-[#10B981] cursor-pointer transition-all hover:scale-105 group"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#10B981] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[#10B981] group-hover:text-white transition-colors">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Simulados Gamificados</h2>
                            <p className="text-gray-500">Participe de campanhas de simulados e acompanhe o ranking de pontos.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExamsHub;
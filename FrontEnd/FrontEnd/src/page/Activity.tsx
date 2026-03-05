import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from "../components/NavBar/NavBar";
import { useAuth } from '../contexts/AuthContext';
import { retrieveActivity } from '../services/ActivityCrud';
import { type Activity } from '../types/Activity';

function SingleActivity() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [activity, setActivity] = useState<Activity | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchActivityDetails = async () => {
        if (!id) return;
        
        setIsLoading(true);
        try {
            const response = await retrieveActivity(id);
            setActivity(response);
        } catch (error) {
            console.error(error);
            setActivity(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivityDetails();
    }, [id]);

    const formatDateTime = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
                <NavBar />
                <div className="flex-1 flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-[#621708]"></span>
                </div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
                <NavBar />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-700">Atividade não encontrada</h2>
                    <button onClick={() => navigate(-1)} className="btn btn-outline">Voltar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
            <NavBar />
            
            <main className="flex-1 p-4 lg:p-10 max-w-5xl mx-auto w-full">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-gray-500 hover:text-[#621708] transition-colors mb-6 font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Voltar para Atividades
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#621708] px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`badge border-none ${activity.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                    {activity.is_active ? 'Ativa' : 'Inativa'}
                                </span>
                                {activity.has_submission && (
                                    <span className="badge bg-blue-100 text-blue-800 border-none">
                                        Exige Envio
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{activity.name}</h1>
                        </div>

                        {user?.is_teacher && (
                            <button className="btn bg-[#F6AA1C] hover:bg-yellow-600 text-white border-none shrink-0">
                                Editar Atividade
                            </button>
                        )}
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Lançamento
                                </span>
                                <span className="text-gray-800 font-medium">
                                    {formatDateTime(activity.to_be_launched)}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Prazo de Entrega
                                </span>
                                <span className="text-gray-800 font-medium">
                                    {formatDateTime(activity.due_date)}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Nota Total
                                </span>
                                <span className="text-2xl font-bold text-indigo-600">
                                    {String(activity.total_grade)}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Descrição da Atividade</h3>
                            <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {activity.description}
                            </div>
                        </div>

                        {user?.is_student && activity.has_submission && activity.is_active && (
                            <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
                                <button className="btn bg-[#621708] hover:bg-red-900 text-white border-none px-8">
                                    Enviar Trabalho
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SingleActivity;
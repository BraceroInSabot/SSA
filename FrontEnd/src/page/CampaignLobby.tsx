import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';
import { api } from '../services/api';
import { getCampaignRanking } from '../services/CampaignCrud';

function CampaignLobby() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ranking, setRanking] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch participants
                const rData = await getCampaignRanking(id!);
                setRanking(rData);

                // Fetch published simulados for this campaign
                const { data: actData } = await api.get(`/api/v1/activities/?campaign_id=${id}`);
                // Since API already filters published for students, we just set it
                setActivities(actData.filter((a: any) => a.activity_type === 'SIM' && a.status === 'PUB'));
            } catch (error) {
                console.error("Error fetching lobby data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen">Carregando Lobby...</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-800">
            <NavBar />
            
            <div className="flex-1 overflow-y-auto p-8">
                <button onClick={() => navigate('/campanhas')} className="btn btn-ghost mb-4">← Voltar para Campanhas</button>
                <h1 className="text-3xl font-black text-[#1E3A8A] mb-8">Lobby da Campanha</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Simulados Disponíveis */}
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Simulados Disponíveis</h2>
                        {activities.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Nenhum simulado publicado no momento.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {activities.map((act: any) => (
                                    <div key={act.activity_id} className="border p-4 rounded-lg flex justify-between items-center bg-gray-50">
                                        <div>
                                            <h3 className="font-bold text-[#1E3A8A]">{act.name}</h3>
                                            <p className="text-sm text-gray-500">Valor: {act.total_grade} pts</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/simulado/${act.activity_id}/responder`)}
                                            className="btn bg-[#10B981] text-white hover:bg-green-600"
                                        >
                                            Iniciar Avaliação
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Participantes Inscritos */}
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Participantes Inscritos</h2>
                        <ul className="flex flex-col gap-2">
                            {ranking.map((r, idx) => (
                                <li key={idx} className="flex items-center p-2 hover:bg-gray-50 rounded">
                                    {r.student_image ? (
                                        <img src={r.student_image} alt={r.student} className="w-8 h-8 rounded-full object-cover mr-3" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                            <span className="text-gray-500 font-bold">{r.student.charAt(0)}</span>
                                        </div>
                                    )}
                                    <span className="font-medium">{r.student}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CampaignLobby;
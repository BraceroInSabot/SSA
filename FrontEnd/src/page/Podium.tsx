import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';
import { getCampaignRanking } from '../services/CampaignCrud';

function Podium() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ranking, setRanking] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const rData = await getCampaignRanking(id!);
                setRanking(rData);
            } catch (error) {
                console.error("Error fetching podium ranking", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Carregando Pódio...</div>;

    const top3 = ranking.slice(0, 3);
    const others = ranking.slice(3);

    return (
        <div className="flex h-screen bg-gray-900 overflow-hidden text-white">
            <NavBar />
            
            <div className="flex-1 flex flex-col items-center overflow-y-auto p-8 relative">
                {/* Efeitos visuais */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500 via-purple-900 to-gray-900"></div>
                
                <button onClick={() => navigate('/campanhas')} className="btn btn-outline border-white text-white hover:bg-white hover:text-gray-900 mb-8 z-10 self-start">← Voltar para Campanhas</button>
                
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-12 z-10 text-center uppercase tracking-widest drop-shadow-lg">
                    🏆 Pódio dos Campeões 🏆
                </h1>

                {top3.length > 0 ? (
                    <div className="flex items-end justify-center gap-4 mb-16 h-64 z-10">
                        {/* 2º Lugar */}
                        {top3[1] && (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-gray-300 border-4 border-gray-400 mb-2 overflow-hidden flex items-center justify-center">
                                    {top3[1].student_image ? <img src={top3[1].student_image} className="w-full h-full object-cover"/> : <span className="text-gray-600 font-bold">{top3[1].student.charAt(0)}</span>}
                                </div>
                                <div className="w-24 h-32 bg-gradient-to-t from-gray-400 to-gray-200 rounded-t-lg shadow-lg flex flex-col items-center justify-start pt-4 text-gray-800">
                                    <span className="font-bold text-2xl">2º</span>
                                    <span className="font-bold text-sm text-center px-1 truncate w-full">{top3[1].student}</span>
                                    <span className="text-xs">{top3[1].total_points} pts</span>
                                </div>
                            </div>
                        )}

                        {/* 1º Lugar */}
                        {top3[0] && (
                            <div className="flex flex-col items-center">
                                <div className="text-4xl mb-2 animate-bounce">👑</div>
                                <div className="w-20 h-20 rounded-full bg-yellow-400 border-4 border-yellow-500 mb-2 overflow-hidden flex items-center justify-center shadow-yellow-500/50 shadow-[0_0_15px]">
                                    {top3[0].student_image ? <img src={top3[0].student_image} className="w-full h-full object-cover"/> : <span className="text-yellow-800 font-bold">{top3[0].student.charAt(0)}</span>}
                                </div>
                                <div className="w-28 h-40 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-lg shadow-2xl flex flex-col items-center justify-start pt-4 text-yellow-900 border-t border-yellow-200">
                                    <span className="font-black text-4xl mb-1">1º</span>
                                    <span className="font-bold text-sm text-center px-1 truncate w-full">{top3[0].student}</span>
                                    <span className="font-bold">{top3[0].total_points} pts</span>
                                </div>
                            </div>
                        )}

                        {/* 3º Lugar */}
                        {top3[2] && (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-amber-700 border-4 border-amber-800 mb-2 overflow-hidden flex items-center justify-center">
                                    {top3[2].student_image ? <img src={top3[2].student_image} className="w-full h-full object-cover"/> : <span className="text-amber-100 font-bold">{top3[2].student.charAt(0)}</span>}
                                </div>
                                <div className="w-24 h-24 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-lg shadow-lg flex flex-col items-center justify-start pt-4 text-amber-100">
                                    <span className="font-bold text-xl">3º</span>
                                    <span className="font-bold text-sm text-center px-1 truncate w-full">{top3[2].student}</span>
                                    <span className="text-xs">{top3[2].total_points} pts</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="z-10 text-xl text-gray-400">Nenhum participante avaliado nesta campanha.</div>
                )}

                {/* Demais participantes */}
                {others.length > 0 && (
                    <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-xl p-6 z-10 border border-white/20">
                        <h3 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">Menções Honrosas</h3>
                        <ul className="flex flex-col gap-2">
                            {others.map((r, idx) => (
                                <li key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400 font-mono w-6">#{idx + 4}</span>
                                        {r.student_image ? (
                                            <img src={r.student_image} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><span className="text-white text-xs">{r.student.charAt(0)}</span></div>
                                        )}
                                        <span className="font-medium text-gray-200">{r.student}</span>
                                    </div>
                                    <span className="font-bold text-yellow-400">{r.total_points} pts</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Podium;
import { useState, useEffect } from 'react';
import NavBar from "../components/NavBar/NavBar";
import { useAuth } from '../contexts/AuthContext';
import { listCampaigns, joinCampaign, createCampaign, getCampaignRanking } from '../services/CampaignCrud';
import { useNavigate } from 'react-router-dom';

function Campaigns() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [ranking, setRanking] = useState<any[]>([]);
    
    // Modals state
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [joinError, setJoinError] = useState('');
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newCampaignDesc, setNewCampaignDesc] = useState('');

    const fetchCampaigns = async () => {
        try {
            const data = await listCampaigns();
            setCampaigns(data);
            if (data.length > 0 && !selectedCampaign) {
                handleSelectCampaign(data[0]);
            }
        } catch (error) {
            console.error('Error fetching campaigns', error);
        }
    };

    const handleSelectCampaign = async (campaign: any) => {
        setSelectedCampaign(campaign);
        try {
            const rData = await getCampaignRanking(campaign.campaign_id);
            setRanking(rData);
        } catch (error) {
            console.error('Error fetching ranking', error);
            setRanking([]);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleJoin = async () => {
        setJoinError('');
        try {
            await joinCampaign(accessCode);
            setIsJoinModalOpen(false);
            setAccessCode('');
            fetchCampaigns();
        } catch (error: any) {
            setJoinError(error.response?.data?.error || 'Erro ao entrar na campanha');
        }
    };

    const handleCreate = async () => {
        try {
            await createCampaign({ name: newCampaignName, description: newCampaignDesc, is_active: true });
            setIsCreateModalOpen(false);
            setNewCampaignName('');
            setNewCampaignDesc('');
            fetchCampaigns();
        } catch (error) {
            console.error('Error creating campaign', error);
        }
    };

    console.log("campaigns", ranking);
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-800">
            <NavBar />
            
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-[#1E3A8A]">Simulados Gamificados (Campanhas)</h1>
                    <div className="flex gap-4">
                        {user?.is_teacher ? (
                            <button onClick={() => setIsCreateModalOpen(true)} className="btn bg-[#1E3A8A] text-white hover:bg-[#1e326b]">
                                Nova Campanha
                            </button>
                        ) : (
                            <button onClick={() => setIsJoinModalOpen(true)} className="btn bg-[#10B981] text-white hover:bg-green-600">
                                Participar da Campanha
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-8 h-full">
                    {/* Lista de Campanhas */}
                    <div className="w-1/3 flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-gray-700">Suas Campanhas</h2>
                        {campaigns.length === 0 ? (
                            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
                                {user?.is_teacher ? "Nenhuma campanha criada." : "Você ainda não participa de nenhuma campanha."}
                            </div>
                        ) : (
                            campaigns.map(c => (
                                <div 
                                    key={c.campaign_id} 
                                    onClick={() => handleSelectCampaign(c)}
                                    className={`p-6 rounded-xl shadow cursor-pointer border-l-4 transition-all ${selectedCampaign?.campaign_id === c.campaign_id ? 'bg-blue-50 border-[#3B82F6]' : 'bg-white border-transparent hover:border-gray-300'}`}
                                >
                                    <h3 className="text-lg font-bold text-[#1E3A8A]">{c.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{c.description}</p>
                                    {user?.is_teacher && (
                                        <div className="mt-3 inline-block bg-gray-100 px-3 py-1 rounded-md text-sm font-mono font-bold text-gray-700 border border-gray-200">
                                            Código: {c.access_code}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Detalhes e Ranking */}
                    <div className="w-2/3 bg-white rounded-xl shadow p-8 flex flex-col">
                        {selectedCampaign ? (
                            <>
                                <h2 className="text-2xl font-bold text-[#1E3A8A] mb-2">{selectedCampaign.name}</h2>
                                <p className="text-gray-600 mb-6">{selectedCampaign.description}</p>
                                
                                {user?.is_teacher && (
                                    <div className="mb-6 flex gap-4">
                                        <button 
                                            onClick={() => navigate(`/atividade/novo?campaign_id=${selectedCampaign.campaign_id}&type=SIM`)} 
                                            className="btn btn-outline border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white"
                                        >
                                            Adicionar Simulado
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/atividades?campaign_id=${selectedCampaign.campaign_id}`)}
                                            className="btn btn-outline"
                                        >
                                            Ver Simulados da Campanha
                                        </button>
                                    </div>
                                )}
                                
                                {!user?.is_teacher && (
                                     <div className="mb-6">
                                         <button 
                                            onClick={() => navigate(`/atividades?campaign_id=${selectedCampaign.campaign_id}`)}
                                            className="btn bg-[#3B82F6] text-white hover:bg-blue-600"
                                         >
                                            Ver Provas da Campanha
                                         </button>
                                     </div>
                                )}

                                <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Ranking</h3>
                                <div className="flex-1 overflow-y-auto">
                                    
                                    <table className="table w-full">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-700">
                                                <th className="w-16">Posição</th>
                                                <th>Aluno</th>
                                                <th className="text-right">Pontos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ranking.map((r, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="font-bold text-gray-500">#{idx + 1}</td>
                                                    <td className="font-medium text-gray-800">
                                                        <div className="flex items-center">
                                                        {r.student_image ? (
                                                            <img 
                                                            src={r.student_image}
                                                            alt={r.student}
                                                            className="w-10 h-10 rounded-full object-cover ml-2"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center ml-2">
                                                                <span className="text-gray-500 font-bold">{r.student.charAt(0)}</span>
                                                            </div>
                                                        )}
                                                        <span className="ml-4">{r.student}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-right font-bold text-[#10B981]">{r.total_points || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                Selecione uma campanha para visualizar o ranking.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isJoinModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box bg-white text-gray-800">
                        <h3 className="font-bold text-lg mb-4 text-[#1E3A8A]">Participar da Campanha</h3>
                        <p className="mb-4">Insira o código de acesso fornecido pelo seu professor.</p>
                        <input 
                            type="text" 
                            placeholder="Ex: A1B2C3" 
                            className="input input-bordered w-full bg-white border-gray-300 text-gray-800 font-mono text-center text-2xl uppercase tracking-widest"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                            maxLength={10}
                        />
                        {joinError && <p className="text-red-500 text-sm mt-2">{joinError}</p>}
                        <div className="modal-action">
                            <button onClick={() => setIsJoinModalOpen(false)} className="btn btn-ghost text-gray-600">Cancelar</button>
                            <button onClick={handleJoin} className="btn bg-[#10B981] text-white border-none hover:bg-green-600">Participar</button>
                        </div>
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box bg-white text-gray-800">
                        <h3 className="font-bold text-lg mb-4 text-[#1E3A8A]">Criar Nova Campanha</h3>
                        <div className="form-control w-full mb-4">
                            <label className="label"><span className="label-text text-gray-700 font-bold">Título da Campanha</span></label>
                            <input 
                                type="text" 
                                className="input input-bordered w-full bg-white border-gray-300 text-gray-800"
                                value={newCampaignName}
                                onChange={(e) => setNewCampaignName(e.target.value)}
                            />
                        </div>
                        <div className="form-control w-full mb-4">
                            <label className="label"><span className="label-text text-gray-700 font-bold">Descrição</span></label>
                            <textarea 
                                className="textarea textarea-bordered h-24 bg-white border-gray-300 text-gray-800"
                                value={newCampaignDesc}
                                onChange={(e) => setNewCampaignDesc(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="modal-action">
                            <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-ghost text-gray-600">Cancelar</button>
                            <button onClick={handleCreate} className="btn bg-[#1E3A8A] text-white border-none hover:bg-[#1e326b]">Criar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Campaigns;
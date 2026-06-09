import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar/NavBar';
import QuestionManager from '../components/QuestionManager/QuestionManager'; // Assumindo que você adaptará este componente para aceitar examId
import { listCampaigns } from '../services/CampaignCrud';
import { createPracticeExam, getPracticeExam, updatePracticeExam } from '../services/PracticeExamCrud';

export default function PracticeExamEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const [examId, setExamId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('DRF');
    const [isLoading, setIsLoading] = useState(false);
    
    const [campaigns, setCampaigns] = useState<any[]>([]); // Tipar conforme sua modelagem de Campaign
    
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Estado Unificado espelhando o modelo PracticeExam
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        to_be_launched: today.toISOString().slice(0, 16), // datetime-local format
        due_date: nextWeek.toISOString().slice(0, 16),
        total_grade: 0.0,
        is_active: true,
        course: location.state?.courseId || '',
        campaign_group: '' // ForeignKey opcional
    });

    const fetchDependencies = async () => {
        try {
            const [campaignsRes] = await Promise.all([
                listCampaigns() 
            ]);
            setCampaigns(campaignsRes);
        } catch (error) {
            console.error("Erro ao carregar dependências", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                // Chamando a função correta para buscar os dados
                const data = await getPracticeExam(id);
                setFormData(data); // Atualiza o formulário com os dados carregados
            } else {
                const searchParams = new URLSearchParams(location.search);
                const campaignFromQuery = searchParams.get('campaign_id');
                if (campaignFromQuery) {
                    setFormData(prev => ({ ...prev, campaign_group: campaignFromQuery }));
                }
            }
        };

        if (user?.is_teacher) {
            fetchData(); // Chama a função assíncrona
            fetchDependencies();
        }
    }, [id, user, location.search]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSaveMetadata = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            ...formData,
            to_be_launched: new Date(formData.to_be_launched).toISOString(),
            due_date: new Date(formData.due_date).toISOString(),
            campaign_group: formData.campaign_group ? formData.campaign_group : null
        };

        try {
            if (examId) {
                await updatePracticeExam(examId, payload);
                alert("Simulado atualizado com sucesso!");
            } else {
                const res = await createPracticeExam(payload);
                const newExamId = res.exam_id
                console.log("Simulado criado com ID:", newExamId);
                
                setExamId(newExamId); 
                
                setFormData(prev => ({
                    ...prev,
                    ...res.data 
                }));
                
                setStatus('DRF');
                
                window.history.replaceState(null, '', `/simulados/editar/${newExamId}`);
                
                alert("Simulado criado com sucesso!");
            }
        } catch (err: any) {
            alert("Erro ao salvar os dados do simulado. Verifique os campos.");
            console.error("Erro ao salvar simulado", err); 
        } finally {
            setIsLoading(false);
        }
    };

    const isTeacher = user?.is_teacher;

    return (
        <div className="flex flex-row min-h-screen bg-[#F8FAFC]">
            <NavBar />
            
            <main className="flex-1 w-full max-w-6xl mx-auto p-4 lg:p-8 pb-12">
                <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-blue-500 transition-colors mb-6 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    Voltar
                </button>

                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-300 pb-4 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {status === 'DRF' ? (
                                <span className="badge bg-yellow-100 text-yellow-800 border-none font-bold">RASCUNHO</span>
                            ) : (
                                <span className="badge bg-green-100 text-green-800 border-none font-bold">PUBLICADA</span>
                            )}
                            <span className={`badge border-none ${formData.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                                {formData.is_active ? 'Ativa' : 'Inativa'}
                            </span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                            {formData.name || 'Novo Simulado'}
                        </h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* COLUNA ESQUERDA: Configurações e Metadados */}
                    <aside className="lg:col-span-1 flex flex-col gap-6">
                        <form id="metadata-form" onSubmit={handleSaveMetadata} className="card bg-white shadow-sm border border-gray-200 sticky top-8">
                            <div className="card-body p-6 gap-4">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Detalhes do Simulado</h2>
                                
                                {isTeacher && (
                                    <>
                                        <div className="form-control">
                                            <label className="label-text font-semibold mb-1 text-gray-700">Campanha (Gamificação)</label>
                                            <select 
                                                name="campaign_group" 
                                                value={formData.campaign_group} 
                                                onChange={handleChange} 
                                                className="select select-bordered w-full bg-gray-50 text-gray-800 font-medium"
                                            >
                                                <option value="">Sem campanha vinculada</option>
                                                {campaigns.map(camp => (
                                                    <option key={camp.campaign_id} value={camp.campaign_id}>{camp.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div className="form-control">
                                    <label className="label-text font-semibold mb-1 text-gray-700">Título</label>
                                    <input name="name" value={formData.name} onChange={handleChange} disabled={!isTeacher} className="input input-bordered bg-gray-50 text-gray-800" required />
                                </div>

                                <div className="form-control">
                                    <label className="label-text font-semibold mb-1 text-gray-700">Descrição / Instruções</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} disabled={!isTeacher} className="textarea textarea-bordered h-28 bg-gray-50 text-gray-800 leading-relaxed" required />
                                </div>

                                <div className="grid grid-cols-1 gap-4 mt-2">
                                    <div className="form-control">
                                        <label className="label-text font-semibold mb-1 text-gray-500 text-xs uppercase">Lançamento (Agendamento)</label>
                                        <input type="datetime-local" name="to_be_launched" value={formData.to_be_launched} onChange={handleChange} disabled={!isTeacher} className="input input-bordered bg-gray-50 text-gray-800" required />
                                    </div>
                                    <div className="form-control">
                                        <label className="label-text font-semibold mb-1 text-gray-500 text-xs uppercase">Prazo de Encerramento</label>
                                        <input type="datetime-local" name="due_date" value={formData.due_date} onChange={handleChange} disabled={!isTeacher} className="input input-bordered bg-gray-50 text-gray-800" required />
                                    </div>
                                </div>

                                <div className="form-control mt-2">
                                    <label className="label-text font-semibold mb-1 text-gray-500 text-xs uppercase">Nota Total (Ranking)</label>
                                    <input type="number" step="0.1" name="total_grade" value={formData.total_grade} onChange={handleChange} disabled={!isTeacher} className="input input-bordered bg-gray-50 text-xl font-bold text-indigo-600" required />
                                </div>

                                {isTeacher && (
                                    <>
                                        <div className="flex gap-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <label className="cursor-pointer flex items-center gap-2">
                                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="checkbox checkbox-sm checkbox-success" />
                                                <span className="text-sm font-medium text-gray-800">Simulado Ativo</span>
                                            </label>
                                        </div>
                                        <button type="submit" className="btn btn-outline border-blue-500 text-blue-500 hover:bg-blue-50 hover:border-blue-500 mt-2" disabled={isLoading}>
                                            {examId ? 'Salvar Alterações' : 'Iniciar Rascunho'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </aside>

                    {/* COLUNA DIREITA: Motor de Questões (Anti-Cheat Context) */}
                    <section className="lg:col-span-2 flex flex-col gap-8">
                        {!examId ? (
                            <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white text-center text-gray-400 p-8">
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p className="text-lg">Salve os metadados do simulado ao lado<br/>para desbloquear o banco de questões.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8">
                                
                                {/* ALERTA DA ARQUITETURA DE SIMULADOS */}
                                <div className="alert bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <div>
                                        <h3 className="font-bold">Modo Gamificação / Anti-Cheat</h3>
                                        <div className="text-sm">As questões adicionadas aqui ativam automaticamente os logs de evasão de tela para os alunos.</div>
                                    </div>
                                </div>

                                {/* MOTOR DE QUESTÕES */}
                                <div className="card bg-white shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6">
                                        {/* AQUI VOCÊ DEVE ADAPTAR O SEU COMPONENTE EXISTENTE */}
                                        {/* <QuestionManager examId={examId} isPracticeExam={true} /> */}
                                        <QuestionManager activityId={examId} /> 
                                    </div>
                                </div>

                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
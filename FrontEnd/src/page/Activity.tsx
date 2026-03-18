import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from "../components/NavBar/NavBar";
import { useAuth } from '../contexts/AuthContext';
import { retrieveActivity, uploadActivityFile, detachActivityFile } from '../services/ActivityCrud';
import { type Activity } from '../types/Activity';

export default function SingleActivity() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [activity, setActivity] = useState<Activity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!id || !selectedFile) return;
        setIsUploading(true);
        try {
            await uploadActivityFile(id, selectedFile);
            await fetchActivityDetails();
            setSelectedFile(null);
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileDetach = async (fileId: string) => {
        if (!window.confirm('Tem certeza que deseja remover este arquivo permanentemente?')) return;
        setDeletingFileId(fileId);
        try {
            await detachActivityFile(fileId);
            await fetchActivityDetails();
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingFileId(null);
        }
    };

    const extractFilename = (url: string) => url.split('/').pop() || 'Arquivo';

    const calculateTotalGrade = () => {
        if (!activity?.teacher_submission || !Array.isArray(activity.teacher_submission)) return 0;
        return activity.teacher_submission.reduce((sum, sub: any) => sum + (Number(sub.activity_final_grade) || 0), 0);
    };

    // --- PARSERS DE RESPOSTA E GABARITO ---
    const renderStudentAnswer = (type: string, qResponse: any) => {
        const response = qResponse?.response;
        const optionsList = qResponse?.response_text || [];

        if (!response || Object.keys(response).length === 0) return <span className="italic text-gray-400">Em branco</span>;
        
        const getOptionText = (optId: string) => optionsList.find((o: any) => o.id === optId)?.text || 'Alternativa desconhecida';
        try {
            switch (type) {
                case 'UC':
                    return <p><strong className="text-[#621708] mr-2">{response.option})</strong> {getOptionText(response.option)}</p>;
                case 'MC':
                    return (
                        <ul className="flex flex-col gap-1">
                            {response.options?.map((opt: string) => (
                                <li key={opt}><strong className="text-[#621708] mr-2">{opt})</strong> {getOptionText(opt)}</li>
                            ))}
                        </ul>
                    );
                case 'TF':
                    return (
                        <ul className="flex flex-col gap-2">
                            {Object.entries(response.options || {}).map(([key, val]) => (
                                <li key={key} className="flex items-center gap-2">
                                    <span className={`w-6 text-center font-bold rounded ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {val ? 'V' : 'F'}
                                    </span>
                                    <span className="font-medium text-gray-600"><strong className="text-gray-500 mr-1">{key}.</strong> {getOptionText(key)}</span>
                                </li>
                            ))}
                        </ul>
                    );
                case 'SA':
                case 'ES':
                    return <span className="font-medium text-gray-800 whitespace-pre-wrap">{response.option}</span>;
                default:
                    return <pre className="text-xs text-gray-600">{JSON.stringify(response, null, 2)}</pre>;
            }
        } catch (e) {
            return <span className="text-red-500">Erro ao ler resposta</span>;
        }
    };

    const renderExpectedAnswer = (type: string, expectedResult: any, qResponse: any) => {
        const optionsList = qResponse?.response_text || [];
        
        if (!expectedResult || Object.keys(expectedResult).length === 0) return <span className="text-gray-400 italic">Sem gabarito registrado.</span>;

        const getOptionText = (optId: string) => optionsList.find((o: any) => o.id === optId)?.text || 'Alternativa desconhecida';

        try {
            switch (type) {
                case 'UC': 
                case 'MC': {
                    const correctIds = expectedResult.answers || [];
                    return (
                        <ul className="flex flex-col gap-1">
                            {correctIds.map((id: string) => (
                                <li key={id}><strong className="text-indigo-600 mr-2">{id})</strong> {getOptionText(id)}</li>
                            ))}
                        </ul>
                    );
                }
                case 'TF': {
                    const correctAnswers = expectedResult.answers || {};
                    return (
                        <ul className="flex flex-col gap-2">
                            {Object.entries(correctAnswers).map(([key, val]) => (
                                <li key={key} className="flex items-center gap-2">
                                    <span className={`w-6 text-center font-bold rounded ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {val ? 'V' : 'F'}
                                    </span>
                                    <span className="font-medium text-gray-600"><strong className="text-gray-500 mr-1">{key}.</strong> {getOptionText(key)}</span>
                                </li>
                            ))}
                        </ul>
                    );
                }
                case 'SA':
                case 'ES':
                    return <p className="whitespace-pre-wrap text-gray-700">{expectedResult.expected_text || ''}</p>;
                default:
                    return <pre className="text-xs text-gray-500">{JSON.stringify(expectedResult, null, 2)}</pre>;
            }
        } catch (e) {
             return <span className="text-red-500">Erro ao ler gabarito</span>;
        }
    };

    if (isLoading) return <div className="min-h-screen bg-[#F2F5F7] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-[#621708]"></span></div>;
    if (!activity) return <div className="min-h-screen bg-[#F2F5F7] flex flex-col items-center justify-center gap-4"><h2 className="text-2xl font-bold text-gray-700">Atividade não encontrada</h2><button onClick={() => navigate(-1)} className="btn btn-outline">Voltar</button></div>;

    const totalGrade = calculateTotalGrade();

    return (
        <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
            <NavBar />
            
            <main className="flex-1 p-4 lg:p-10 max-w-5xl mx-auto w-full">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-[#621708] transition-colors mb-6 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    Voltar para Atividades
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#621708] px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`badge border-none ${activity.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{activity.is_active ? 'Ativa' : 'Inativa'}</span>
                                {activity.has_submission && <span className="badge bg-blue-100 text-blue-800 border-none">Exige Envio</span>}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{activity.name}</h1>
                        </div>

                        {user?.is_teacher && (
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => navigate(`/atividade/${activity.activity_id}/avaliar`)}
                                    className="btn bg-white text-[#621708] hover:bg-gray-200 border-none shrink-0 shadow-md font-bold"
                                >
                                    Avaliar Submissões
                                </button>
                                <button 
                                    onClick={() => navigate(`/atividade/editar/${activity.activity_id}`, { state: { courseId: activity.course } })}
                                    className="btn bg-[#F6AA1C] hover:bg-yellow-600 text-white border-none shrink-0 shadow-md"
                                >
                                    Editar Prova
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lançamento</span>
                                <span className="text-gray-800 font-medium">{formatDateTime(activity.to_be_launched)}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Prazo de Entrega</span>
                                <span className="text-gray-800 font-medium">{formatDateTime(activity.due_date)}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nota Total Máxima</span>
                                <span className="text-2xl font-bold text-indigo-600">{String(activity.total_grade)}</span>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Descrição</h3>
                            <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">{activity.description}</div>
                        </div>

                        <div className="mb-10">
                            {user?.is_student && activity.has_submission && activity.is_active && !activity.has_student_submission && (
                                <div className="mt-4 pt-6 border-t border-gray-200 flex justify-start">
                                    <button onClick={() => navigate(`/atividade/${activity.activity_id}/responder`)} className="btn bg-[#621708] hover:bg-black text-white border-none px-10 shadow-lg">
                                        Acessar e Responder Prova
                                    </button>
                                </div>
                            )}
                            
                            {activity.has_student_submission && (
                                <div className="mt-6">
                                    {(!activity.teacher_submission || activity.teacher_submission.length === 0) ? (
                                        <div className='alert bg-blue-50 border-blue-200 text-blue-800 flex items-center shadow-sm'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span>Trabalho entregue com sucesso. O professor ainda não publicou a correção desta atividade.</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center shadow-sm">
                                                <div>
                                                    <h2 className="text-xl font-bold text-green-900">Resultado da Avaliação</h2>
                                                    <p className="text-green-700 text-sm mt-1">Abaixo está o espelho de correção detalhado pelo professor.</p>
                                                </div>
                                                <div className="mt-4 md:mt-0 text-center md:text-right">
                                                    <span className="block text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Sua Nota Final</span>
                                                    <div className="text-4xl font-black text-green-700">
                                                        {totalGrade} <span className="text-xl text-green-500 font-medium">/ {activity.total_grade}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-4 mt-2">
                                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Detalhamento por Questão</h3>
                                                
                                                {activity.teacher_submission.map((feedback: any, idx: number) => (
                                                    <div key={idx} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                                                        <div className="flex-1 p-5 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200">
                                                            <div className="flex items-start gap-3 mb-3">
                                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-gray-700 text-xs font-bold shrink-0">{idx + 1}</span>
                                                                <p className="font-medium text-gray-700 text-sm leading-relaxed">{feedback.question_description}</p>
                                                            </div>
                                                            
                                                            <div className="pl-9 mt-4 flex flex-col gap-4">
                                                                <div>
                                                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sua Resposta</span>
                                                                    <div className="p-3 bg-white border border-gray-200 rounded-md">
                                                                        {renderStudentAnswer(feedback.question_type, feedback.question_response)}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div>
                                                                    <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Gabarito Esperado</span>
                                                                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-md">
                                                                        {renderExpectedAnswer(feedback.question_type, feedback.question_expected_result, feedback.question_response)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="w-full md:w-64 p-5 flex flex-col gap-4 bg-white">
                                                            <div>
                                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nota Obtida</span>
                                                                <div className="text-2xl font-bold text-indigo-600">
                                                                    {feedback.activity_final_grade} pts
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex-1">
                                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Feedback do Professor</span>
                                                                {feedback.teacher_feedback ? (
                                                                    <p className="text-sm text-gray-600 bg-indigo-50 p-3 rounded-md border border-indigo-100 whitespace-pre-wrap">
                                                                        {feedback.teacher_feedback}
                                                                    </p>
                                                                ) : (
                                                                    <span className="text-sm italic text-gray-400">Nenhum comentário.</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Arquivos Anexos</h3>
                            {(!activity.attached_files || activity.attached_files.length === 0) ? (
                                <p className="text-sm text-gray-500 italic mb-6">Nenhum arquivo anexado a esta atividade.</p>
                            ) : (
                                <ul className="flex flex-col gap-3 mb-8">
                                    {activity.attached_files.map((fileRecord) => (
                                        <li key={fileRecord.attached_files_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-sm font-medium text-gray-700 truncate">{extractFilename(fileRecord.file)}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <a href={fileRecord.file} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost text-indigo-600">Baixar</a>
                                                {user?.is_teacher && (
                                                    <button onClick={() => handleFileDetach(fileRecord.attached_files_id)} disabled={deletingFileId === fileRecord.attached_files_id} className="btn btn-sm btn-ghost text-red-600">Remover</button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {user?.is_teacher && (
                                <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">Anexar Novo Arquivo</h4>
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                        <input type="file" onChange={handleFileChange} className="file-input file-input-bordered w-full max-w-xs bg-white" />
                                        <button onClick={handleFileUpload} disabled={!selectedFile || isUploading} className="btn bg-[#621708] hover:bg-black text-white border-none w-full sm:w-auto">
                                            {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from "../components/NavBar/NavBar";
import { useAuth } from '../contexts/AuthContext';
import { retrieveActivity, uploadActivityFile, detachActivityFile, uploadActivitySubmissionFile } from '../services/ActivityCrud';
import { type Activity } from '../types/Activity';

export default function SingleActivity() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [activity, setActivity] = useState<Activity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    
    // Estados do Professor
    const [isUploading, setIsUploading] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Estados do Aluno
    const [studentFile, setStudentFile] = useState<File | null>(null);
    const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

    const DESCRIPTION_LIMIT = 250;

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

    // --- FUNÇÕES DE ARQUIVO (PROFESSOR) ---
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

    // --- FUNÇÕES DE ARQUIVO (ALUNO) ---
    const handleStudentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setStudentFile(e.target.files[0]);
        }
    };

    const handleStudentFileUpload = async () => {
        if (!id || !studentFile) return;
        setIsSubmittingStudent(true);
        try {
            await uploadActivitySubmissionFile(id, studentFile, user?.id); 
            await fetchActivityDetails();
            setStudentFile(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar o trabalho.");
        } finally {
            setIsSubmittingStudent(false);
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
                    return <p><strong className="text-[#3B82F6] mr-2">{response.option})</strong> {getOptionText(response.option)}</p>;
                case 'MC':
                    return (
                        <ul className="flex flex-col gap-1">
                            {response.options?.map((opt: string) => (
                                <li key={opt}><strong className="text-[#3B82F6] mr-2">{opt})</strong> {getOptionText(opt)}</li>
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
                                    <span className="font-medium text-[#0F172A]"><strong className="text-gray-500 mr-1">{key}.</strong> {getOptionText(key)}</span>
                                </li>
                            ))}
                        </ul>
                    );
                case 'SA':
                case 'ES':
                    return <span className="font-medium text-[#0F172A] whitespace-pre-wrap">{response.option}</span>;
                default:
                    return <pre className="text-xs text-[#0F172A]">{JSON.stringify(response, null, 2)}</pre>;
            }
        } catch {
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
                                <li key={id}><strong className="text-[#1E3A8A] mr-2">{id})</strong> {getOptionText(id)}</li>
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
                                    <span className="font-medium text-[#0F172A]"><strong className="text-gray-500 mr-1">{key}.</strong> {getOptionText(key)}</span>
                                </li>
                            ))}
                        </ul>
                    );
                }
                case 'SA':
                case 'ES':
                    return <p className="whitespace-pre-wrap text-[#0F172A]">{expectedResult.expected_text || ''}</p>;
                default:
                    return <pre className="text-xs text-gray-500">{JSON.stringify(expectedResult, null, 2)}</pre>;
            }
        } catch {
             return <span className="text-red-500">Erro ao ler gabarito</span>;
        }
    };

    if (isLoading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-[#1E3A8A]"></span></div>;
    if (!activity) return <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4"><h2 className="text-2xl font-bold text-[#0F172A]">Atividade não encontrada</h2><button onClick={() => navigate(-1)} className="btn btn-outline border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white">Voltar</button></div>;

    const totalGrade = calculateTotalGrade();

    const renderDescription = () => {
        if (!activity?.description) return <p className="text-gray-500 italic">Nenhuma descrição fornecida.</p>;
        
        if (activity.description.length <= DESCRIPTION_LIMIT) {
            return <div className="prose max-w-none text-[#0F172A] leading-relaxed whitespace-pre-wrap">{activity.description}</div>;
        }

        const displayText = isDescriptionExpanded ? activity.description : activity.description.slice(0, DESCRIPTION_LIMIT) + '...';

        return (
            <div>
                <div className="prose max-w-none text-[#0F172A] leading-relaxed whitespace-pre-wrap mb-2">{displayText}</div>
                <button 
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-[#3B82F6] hover:text-[#1E3A8A] font-semibold text-sm transition-colors focus:outline-none flex items-center gap-1 mt-2"
                >
                    {isDescriptionExpanded ? (
                        <>Ler menos <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg></>
                    ) : (
                        <>Ler mais <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></>
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-row min-h-screen bg-[#F8FAFC]">
            <NavBar />
            
            <main className="flex-1 p-4 lg:p-10 max-w-5xl mx-auto w-full">
                <button onClick={() => navigate(-1)} className="flex items-center text-[#3B82F6] hover:text-[#1E3A8A] transition-colors mb-6 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    Voltar para Atividades
                </button>

                <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#1E3A8A] px-6 py-8 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className={`badge border-none ${activity.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{activity.is_active ? 'Ativa' : 'Inativa'}</span>
                                {activity.has_submission && <span className="badge bg-[#F59E0B] text-white border-none font-semibold">Exige Envio</span>}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white break-words">{activity.name}</h1>
                        </div>

                        {user?.is_teacher && (
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => navigate(`/atividade/${activity.activity_id}/avaliar`)}
                                    className="btn bg-white text-[#1E3A8A] hover:bg-gray-100 border-none shrink-0 shadow-sm font-bold flex-1 md:flex-none"
                                >
                                    Avaliar Submissões
                                </button>
                                <button 
                                    onClick={() => navigate(`/atividade/editar/${activity.activity_id}`, { state: { courseId: activity.course } })}
                                    className="btn bg-[#3B82F6] hover:bg-blue-700 text-white border-none shrink-0 shadow-sm flex-1 md:flex-none"
                                >
                                    Editar Prova
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-[#F8FAFC] p-5 rounded-xl border border-gray-100 shadow-sm">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lançamento</span>
                                <span className="text-[#0F172A] font-medium text-lg">{formatDateTime(activity.to_be_launched)}</span>
                            </div>
                            <div className="bg-[#F8FAFC] p-5 rounded-xl border border-gray-100 shadow-sm">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Prazo de Entrega</span>
                                <span className="text-[#0F172A] font-medium text-lg">{formatDateTime(activity.due_date)}</span>
                            </div>
                            <div className="bg-[#F8FAFC] p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nota Total Máxima</span>
                                <span className="text-3xl font-bold text-[#3B82F6]">{String(activity.total_grade)}</span>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-[#0F172A] mb-4 border-b border-gray-100 pb-2">Descrição</h3>
                            {renderDescription()}
                        </div>

                        <div className="mb-10">
                            {user?.is_student && activity.has_submission && activity.is_active && !activity.has_student_submission && (
                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    {activity.activity_type === 'TST' ? (
                                        <div className="flex justify-center md:justify-start">
                                            <button onClick={() => navigate(`/atividade/${activity.activity_id}/responder`)} className="btn bg-[#3B82F6] hover:bg-blue-700 text-white border-none px-10 py-3 h-auto shadow-md rounded-lg font-bold text-lg w-full md:w-auto">
                                                Acessar e Responder Prova
                                            </button>
                                        </div>
                                    ) : activity.activity_type === 'FIL' ? (
                                        <div className="bg-[#F8FAFC] border-2 border-dashed border-[#3B82F6] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                                            <div className="bg-blue-100 p-4 rounded-full mb-4 shadow-sm text-[#3B82F6]">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">Envio de Trabalho</h3>
                                            <p className="text-sm text-[#0F172A] max-w-lg mb-8 leading-relaxed opacity-80">
                                                Anexe o documento de resolução da atividade. O sistema aceita <strong>apenas um arquivo</strong> por envio. Se você possui múltiplos documentos, compacte-os em um único arquivo <strong>.ZIP</strong>.
                                            </p>
                                            
                                            <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-xl bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                                                <input 
                                                    type="file" 
                                                    onChange={handleStudentFileChange} 
                                                    className="file-input file-input-bordered w-full bg-[#F8FAFC] text-[#0F172A]" 
                                                    accept=".pdf,.doc,.docx,.zip,.rar"
                                                />
                                                <button 
                                                    onClick={handleStudentFileUpload} 
                                                    disabled={!studentFile || isSubmittingStudent} 
                                                    className="btn bg-[#3B82F6] hover:bg-blue-700 text-white border-none shadow-sm w-full sm:w-auto px-8 font-bold disabled:bg-gray-300 disabled:text-gray-500"
                                                >
                                                    {isSubmittingStudent ? 'Enviando...' : 'Entregar Trabalho'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="alert bg-[#F8FAFC] text-[#0F172A] border border-gray-200 rounded-xl shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-[#3B82F6] shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span>Esta modalidade de atividade ({activity.activity_type}) não requer envio digital por este painel. Siga as instruções em sala.</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {activity.has_student_submission && (
                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    {(!activity.teacher_submission || activity.teacher_submission.length === 0) ? (
                                        <div className='alert bg-blue-50 border border-blue-200 text-[#1E3A8A] flex items-center shadow-sm rounded-xl'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span className="font-medium">Trabalho entregue com sucesso. O professor ainda não publicou a correção desta atividade.</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            <div className="bg-[#F8FAFC] border border-green-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center shadow-sm">
                                                <div>
                                                    <h2 className="text-xl font-bold text-green-800">Resultado da Avaliação</h2>
                                                    <p className="text-green-700 text-sm mt-1">Abaixo está o espelho de correção detalhado pelo professor.</p>
                                                </div>
                                                <div className="mt-4 md:mt-0 text-center md:text-right bg-white px-6 py-3 rounded-lg border border-green-100 shadow-sm">
                                                    <span className="block text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Sua Nota Final</span>
                                                    <div className="text-4xl font-black text-green-700">
                                                        {totalGrade} <span className="text-xl text-green-500 font-medium">/ {activity.total_grade}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-5 mt-4">
                                                <h3 className="text-xl font-bold text-[#0F172A] border-b border-gray-100 pb-2">Detalhamento por Questão</h3>
                                                
                                                {activity.teacher_submission.map((feedback: any, idx: number) => (
                                                    <div key={idx} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                                                        <div className="flex-1 p-6 md:border-r border-gray-200">
                                                            <div className="flex items-start gap-4 mb-4">
                                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1E3A8A] text-white text-sm font-bold shrink-0 shadow-sm">{idx + 1}</span>
                                                                <p className="font-medium text-[#0F172A] text-base leading-relaxed mt-1">{feedback.question_description}</p>
                                                            </div>
                                                            
                                                            <div className="pl-12 mt-6 flex flex-col gap-5">
                                                                <div>
                                                                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                                                        Sua Resposta
                                                                    </span>
                                                                    <div className="p-4 bg-[#F8FAFC] border border-gray-200 rounded-lg shadow-sm">
                                                                        {renderStudentAnswer(feedback.question_type, feedback.question_response)}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div>
                                                                    <span className="block text-xs font-bold text-[#3B82F6] uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                        Gabarito Esperado
                                                                    </span>
                                                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                                                                        {renderExpectedAnswer(feedback.question_type, feedback.question_expected_result, feedback.question_response)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="w-full md:w-72 p-6 flex flex-col gap-6 bg-[#F8FAFC]">
                                                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
                                                                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nota Obtida</span>
                                                                <div className="text-3xl font-bold text-[#3B82F6]">
                                                                    {feedback.activity_final_grade} <span className="text-sm text-gray-500 font-medium">pts</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex-1 flex flex-col">
                                                                <span className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-2 flex items-center gap-1">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                                                                    Feedback do Professor
                                                                </span>
                                                                {feedback.teacher_feedback ? (
                                                                    <div className="flex-1 text-sm text-[#0F172A] bg-white p-4 rounded-lg border border-gray-200 shadow-sm whitespace-pre-wrap leading-relaxed">
                                                                        {feedback.teacher_feedback}
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex-1 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4">
                                                                        <span className="text-sm italic text-gray-400">Nenhum comentário.</span>
                                                                    </div>
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

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h3 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#3B82F6]"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
                                Arquivos Anexos
                            </h3>
                            
                            {(!activity.attached_files || activity.attached_files.length === 0) ? (
                                <div className="bg-[#F8FAFC] rounded-xl p-6 text-center border border-gray-100">
                                    <p className="text-sm text-gray-500 italic">Nenhum arquivo anexado a esta atividade.</p>
                                </div>
                            ) : (
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {activity.attached_files.map((fileRecord) => (
                                        <li key={fileRecord.attached_files_id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-[#3B82F6] transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="bg-blue-50 p-2 rounded-lg text-[#3B82F6]">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                                </div>
                                                <span className="text-sm font-medium text-[#0F172A] truncate" title={extractFilename(fileRecord.file)}>{extractFilename(fileRecord.file)}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <a href={fileRecord.file} target="_blank" rel="noopener noreferrer" className="btn btn-sm bg-[#3B82F6] hover:bg-blue-700 text-white border-none shadow-sm">Baixar</a>
                                                {user?.is_teacher && (
                                                    <button onClick={() => handleFileDetach(fileRecord.attached_files_id)} disabled={deletingFileId === fileRecord.attached_files_id} className="btn btn-sm btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">Remover</button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {user?.is_teacher && (
                                <div className="bg-[#F8FAFC] p-6 rounded-xl border-2 border-dashed border-gray-300">
                                    <h4 className="text-sm font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#3B82F6]"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                        Anexar Novo Arquivo
                                    </h4>
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                        <input type="file" id="file-upload" onChange={handleFileChange} className="file-input file-input-bordered w-full max-w-md bg-white shadow-sm" />
                                        <button onClick={handleFileUpload} disabled={!selectedFile || isUploading} className="btn bg-[#1E3A8A] hover:bg-blue-900 text-white border-none w-full sm:w-auto shadow-sm px-8 font-bold disabled:bg-gray-300 disabled:text-gray-500">
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
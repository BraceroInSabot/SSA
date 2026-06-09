import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { retrieveActivity } from '../services/ActivityCrud';
import { api } from '../services/api';
import { type Activity, type QuestionDefinition } from '../types/Activity';
import { useAntiCheat } from './useAntiCheat';

// Wrapper component to conditionally call the hook
function AntiCheatWrapper({ activityId, isActive }: { activityId: string, isActive: boolean }) {
    if (isActive) {
        useAntiCheat(activityId);
    }
    return null;
}

export default function ActivityResponder() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [activity, setActivity] = useState<Activity | null>(null);
    const [questions, setQuestions] = useState<QuestionDefinition[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);

    useEffect(() => {
        const loadActivityData = async () => {
            if (!id) return;
            try {
                const actData = await retrieveActivity(id);
                setActivity(actData);
                const qRes = await api.get(`/activities/${id}/questions/`);
                setQuestions(qRes.data);
            } catch (error) {
                setToast({ message: "Erro ao carregar a prova. Verifique sua conexão.", type: 'error' });
                setTimeout(() => navigate('/atividades'), 3000);
            } finally {
                setIsLoading(false);
            }
        };
        loadActivityData();
    }, [id, navigate]);

    const handleAnswerChange = useCallback((questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    }, []);

    const handleTFChange = useCallback((questionId: string, optionId: string, isTrue: boolean) => {
        setAnswers(prev => {
            const currentQuestionAnswers = prev[questionId] || {};
            return {
                ...prev,
                [questionId]: {
                    ...currentQuestionAnswers,
                    [optionId]: isTrue
                }
            };
        });
    }, []);

    const handleMCChange = useCallback((questionId: string, optionId: string, checked: boolean) => {
        setAnswers(prev => {
            const currentAnswers = prev[questionId] || [];
            if (checked) {
                return { ...prev, [questionId]: [...currentAnswers, optionId] };
            } else {
                return { ...prev, [questionId]: currentAnswers.filter((idStr: string) => idStr !== optionId) };
            }
        });
    }, []);

    const executeSubmission = async () => {
        if (!id) return;
        setIsSubmitting(true);
        
        const formData = new FormData();
        const jsonPayload: any[] = [];

        questions.forEach(q => {
            let responseJson = {};
            const studentAnswer = answers[q.question_id!];
            let fileToUpload: File | null = null;

            if (studentAnswer !== undefined && studentAnswer !== null && studentAnswer !== '') {
                switch (q.question_type) {
                    case 'UC': 
                    case 'SA':
                    case 'ES': 
                        responseJson = { option: studentAnswer }; 
                        break;
                    case 'MC': 
                    case 'TF': 
                        responseJson = { options: studentAnswer }; 
                        break;
                    case 'FL':
                        fileToUpload = studentAnswer as File;
                        break;
                }
            }

            jsonPayload.push({
                submission_question: q.question_id!,
                activity: id,
                submission: responseJson
            });

            if (fileToUpload) {
                formData.append(`file_${q.question_id!}`, fileToUpload);
            }
        });

        formData.append('data', JSON.stringify(jsonPayload));

        try {
            await api.post(`/activities/${id}/submit/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setToast({ message: "Trabalho enviado com sucesso!", type: 'success' });
            setTimeout(() => navigate(`/atividade/consulta/${id}`), 2000);
        } catch (error) {
            setToast({ message: "Erro ao enviar trabalho. Tente novamente.", type: 'error' });
            setIsSubmitting(false);
        }
    };

    const handleSubmit = () => {
        const unanswered = questions.filter(q => {
            const ans = answers[q.question_id!];
            if (ans === undefined || ans === null || ans === '') return true;
            if (q.question_type === 'TF' && Object.keys(ans).length !== (q.question_options?.length || 0)) return true;
            if (q.question_type === 'MC' && ans.length === 0) return true;
            return false;
        });

        if (unanswered.length > 0) {
            setConfirmModal({
                isOpen: true,
                message: `Você deixou ${unanswered.length} questão(ões) incompletas ou em branco. Deseja enviar mesmo assim?`,
                onConfirm: () => {
                    setConfirmModal(null);
                    executeSubmission();
                }
            });
            return;
        }

        executeSubmission();
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><span className="loading loading-spinner loading-lg text-[#1E3A8A]"></span></div>;
    if (!activity) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-[#0F172A]">
            <AntiCheatWrapper activityId={id!} isActive={activity.activity_type === 'SIM'} />
            {toast && (
                <div className="toast toast-top toast-end z-[100]">
                    <div className={`alert ${toast.type === 'success' ? 'alert-success bg-[#14B8A6] text-white' : 'alert-error bg-[#F97316] text-white'}`}>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {confirmModal?.isOpen && (
                <div className="fixed inset-0 bg-[#0F172A] bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#FFFFFF] p-6 rounded-lg shadow-xl max-w-md w-full border border-[#E2E8F0]">
                        <h3 className="text-lg font-bold text-[#1E3A8A] mb-4">Atenção</h3>
                        <p className="text-[#0F172A] mb-6">{confirmModal.message}</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setConfirmModal(null)} className="btn btn-outline border-[#3B82F6] text-[#3B82F6] hover:bg-[#F8FAFC]">Cancelar</button>
                            <button onClick={confirmModal.onConfirm} className="btn bg-[#F59E0B] hover:bg-[#D97706] text-white border-none">Enviar mesmo assim</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="bg-[#1E3A8A] text-[#FFFFFF] py-4 px-6 sticky top-0 z-40 shadow-md">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold truncate">{activity.name}</h1>
                        <p className="text-sm opacity-80">Responda com atenção e revise antes de enviar.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                            {Object.keys(answers).length} / {questions.length} Respondidas
                        </span>
                        <button onClick={() => navigate(-1)} className="btn btn-sm btn-ghost text-[#FFFFFF] hover:bg-white/10">Sair</button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto mt-8 p-4 flex flex-col gap-8">
                {questions.map((q, index) => {
                    const questionOptions = q.question_options || [];
                    const currentAnswer = answers[q.question_id!];

                    return (
                        <div key={q.question_id} className="card bg-[#FFFFFF] shadow-sm border border-[#E2E8F0]">
                            <div className="card-body p-6 md:p-8">
                                <div className="flex gap-4 border-b border-[#F8FAFC] pb-4 mb-6">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F8FAFC] font-bold text-[#1E3A8A] shrink-0 border border-[#E2E8F0]">
                                        {index + 1}
                                    </span>
                                    <h3 className="text-lg font-medium text-[#0F172A] leading-relaxed whitespace-pre-wrap">
                                        {q.question_description}
                                    </h3>
                                </div>

                                <div className="pl-0 md:pl-12">
                                    {q.question_type === 'UC' && (
                                        <div className="flex flex-col gap-3">
                                            {questionOptions.map((opt: any) => (
                                                <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${currentAnswer === opt.id ? 'bg-[#F8FAFC] border-[#3B82F6]' : 'hover:bg-[#F8FAFC] border-transparent'}`}>
                                                    <input type="radio" name={`uc_${q.question_id}`} checked={currentAnswer === opt.id} onChange={() => handleAnswerChange(q.question_id!, opt.id)} className="radio radio-primary mt-0.5 border-[#CBD5E1]" />
                                                    <span className="text-[#0F172A]">
                                                        <strong className="mr-2 text-[#3B82F6] opacity-80">{opt.id})</strong>
                                                        {opt.text}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {q.question_type === 'MC' && (
                                        <div className="flex flex-col gap-3">
                                            {questionOptions.map((opt: any) => (
                                                <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${(currentAnswer || []).includes(opt.id) ? 'bg-[#F8FAFC] border-[#3B82F6]' : 'hover:bg-[#F8FAFC] border-transparent'}`}>
                                                    <input type="checkbox" checked={(currentAnswer || []).includes(opt.id)} onChange={(e) => handleMCChange(q.question_id!, opt.id, e.target.checked)} className="checkbox checkbox-primary mt-0.5 border-[#CBD5E1]" />
                                                    <span className="text-[#0F172A]">
                                                        <strong className="mr-2 text-[#3B82F6] opacity-80">{opt.id})</strong>
                                                        {opt.text}
                                                    </span>
                                                </label>
                                            ))}
                                            <span className="text-xs text-[#0F172A] opacity-60 mt-2">* Selecione uma ou mais opções.</span>
                                        </div>
                                    )}

                                    {q.question_type === 'TF' && (
                                        <div className="flex flex-col gap-4">
                                            {questionOptions.map((opt: any) => (
                                                <div key={opt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                                                    <span className="text-[#0F172A] flex-1">
                                                        <strong className="mr-2 text-[#3B82F6] opacity-80">{opt.id}.</strong>
                                                        {opt.text}
                                                    </span>
                                                    <div className="join shrink-0 shadow-sm">
                                                        <input type="radio" aria-label="Verdadeiro" className="join-item btn btn-sm bg-[#FFFFFF] hover:bg-[#F8FAFC] checked:bg-[#3B82F6] checked:text-[#FFFFFF] border-[#E2E8F0]" checked={currentAnswer?.[opt.id] === true} onChange={() => handleTFChange(q.question_id!, opt.id, true)} />
                                                        <input type="radio" aria-label="Falso" className="join-item btn btn-sm bg-[#FFFFFF] hover:bg-[#F8FAFC] checked:bg-[#F59E0B] checked:text-[#FFFFFF] border-[#E2E8F0]" checked={currentAnswer?.[opt.id] === false} onChange={() => handleTFChange(q.question_id!, opt.id, false)} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {(q.question_type === 'SA' || q.question_type === 'ES') && (
                                        <textarea 
                                            value={currentAnswer || ''}
                                            onChange={(e) => handleAnswerChange(q.question_id!, e.target.value)}
                                            placeholder="Digite sua resposta aqui..."
                                            className="textarea textarea-bordered w-full h-40 bg-[#F8FAFC] focus:bg-[#FFFFFF] text-base leading-relaxed border-[#E2E8F0] focus:ring-2 focus:ring-[#3B82F6] text-[#0F172A]"
                                        />
                                    )}

                                    {q.question_type === 'FL' && (
                                        <div className="flex flex-col gap-3">
                                            <input 
                                                type="file" 
                                                onChange={(e) => handleAnswerChange(q.question_id!, e.target.files ? e.target.files[0] : null)}
                                                className="file-input file-input-bordered w-full max-w-md bg-[#FFFFFF] text-[#0F172A] border-[#E2E8F0] focus:ring-2 focus:ring-[#3B82F6]"
                                            />
                                            {currentAnswer instanceof File && (
                                                <div className="text-sm font-medium text-[#1E3A8A] bg-[#F8FAFC] border border-[#3B82F6] p-3 rounded-md max-w-md truncate">
                                                    ✓ Arquivo anexado: {currentAnswer.name}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="flex justify-end mt-8 border-t border-[#E2E8F0] pt-8">
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="btn bg-[#3B82F6] hover:bg-[#1E3A8A] text-[#FFFFFF] px-12 h-14 text-lg border-none shadow-md transition-colors disabled:bg-[#CBD5E1]"
                    >
                        {isSubmitting ? <span className="loading loading-spinner"></span> : 'Finalizar Prova e Enviar'}
                    </button>
                </div>
            </main>
        </div>
    );
}
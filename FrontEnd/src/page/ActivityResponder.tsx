import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { retrieveActivity } from '../services/ActivityCrud';
import { api } from '../services/api';
import { type Activity, type QuestionDefinition } from '../types/Activity';

export default function ActivityResponder() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [activity, setActivity] = useState<Activity | null>(null);
    const [questions, setQuestions] = useState<QuestionDefinition[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadActivityData = async () => {
            if (!id) return;
            try {
                const actData = await retrieveActivity(id);
                setActivity(actData);

                const qRes = await api.get(`/activities/${id}/questions/`);
                setQuestions(qRes.data);
            } catch (error) {
                alert("Erro ao carregar a prova. Verifique sua conexão.");
                navigate('/atividades');
            } finally {
                setIsLoading(false);
            }
        };
        loadActivityData();
    }, [id]);

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleTFChange = (questionId: string, optionId: string, isTrue: boolean) => {
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
    };

    const handleMCChange = (questionId: string, optionId: string, checked: boolean) => {
        setAnswers(prev => {
            const currentAnswers = prev[questionId] || [];
            if (checked) {
                return { ...prev, [questionId]: [...currentAnswers, optionId] };
            } else {
                return { ...prev, [questionId]: currentAnswers.filter((id: string) => id !== optionId) };
            }
        });
    };

    const handleSubmit = async () => {
        if (!id) return;
        
        const unanswered = questions.filter(q => {
            const ans = answers[q.question_id!];
            if (ans === undefined || ans === null || ans === '') return true;
            if (q.question_type === 'TF' && Object.keys(ans).length !== (q.question_options?.length || 0)) return true;
            if (q.question_type === 'MC' && ans.length === 0) return true;
            return false;
        });

        if (unanswered.length > 0) {
            const confirmEmpty = window.confirm(`Você deixou ${unanswered.length} questão(ões) incompletas ou em branco. Deseja enviar mesmo assim?`);
            if (!confirmEmpty) return;
        }

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

            // O modelo de dados limpo para o Django processar
            jsonPayload.push({
                submission_question: q.question_id!,
                activity: id,
                submission: responseJson
            });

            // Anexa o arquivo fisicamente ao FormData, mapeado pelo ID da questão
            if (fileToUpload) {
                formData.append(`file_${q.question_id!}`, fileToUpload);
            }
        });

        // Converte todo o array estruturado em uma única string JSON para burlar a limitação do FormData
        formData.append('data', JSON.stringify(jsonPayload));

        try {
            // Como mudamos para FormData, enviamos direto pela API para garantir os headers corretos
            await api.post(`/activity/${id}/submit/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Trabalho enviado com sucesso!");
            navigate(`/atividade/consulta/${id}`);
        } catch (error) {
            alert("Erro ao enviar trabalho. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F2F5F7]"><span className="loading loading-spinner loading-lg text-[#621708]"></span></div>;
    if (!activity) return null;

    return (
        <div className="min-h-screen bg-[#F2F5F7] pb-20">
            <header className="bg-[#621708] text-white py-4 px-6 sticky top-0 z-50 shadow-md">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold truncate">{activity.name}</h1>
                        <p className="text-sm opacity-80">Responda com atenção e revise antes de enviar.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                            {Object.keys(answers).length} / {questions.length} Respondidas
                        </span>
                        <button onClick={() => navigate(-1)} className="btn btn-sm btn-ghost text-white">Sair</button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto mt-8 p-4 flex flex-col gap-8">
                {questions.map((q, index) => {
                    const questionOptions = q.question_options || [];
                    const currentAnswer = answers[q.question_id!];

                    return (
                        <div key={q.question_id} className="card bg-white shadow-sm border border-gray-200">
                            <div className="card-body p-6 md:p-8">
                                <div className="flex gap-4 border-b border-gray-100 pb-4 mb-6">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-gray-700 shrink-0">
                                        {index + 1}
                                    </span>
                                    <h3 className="text-lg font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                                        {q.question_description}
                                    </h3>
                                </div>

                                <div className="pl-0 md:pl-12">
                                    {q.question_type === 'UC' && (
                                        <div className="flex flex-col gap-3">
                                            {questionOptions.map((opt: any) => (
                                                <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${currentAnswer === opt.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50 border-transparent'}`}>
                                                    <input type="radio" name={`uc_${q.question_id}`} checked={currentAnswer === opt.id} onChange={() => handleAnswerChange(q.question_id!, opt.id)} className="radio radio-primary mt-0.5" />
                                                    <span className="text-gray-700">
                                                        <strong className="mr-2 text-gray-400">{opt.id})</strong>
                                                        {opt.text}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {q.question_type === 'MC' && (
                                        <div className="flex flex-col gap-3">
                                            {questionOptions.map((opt: any) => (
                                                <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${(currentAnswer || []).includes(opt.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50 border-transparent'}`}>
                                                    <input type="checkbox" checked={(currentAnswer || []).includes(opt.id)} onChange={(e) => handleMCChange(q.question_id!, opt.id, e.target.checked)} className="checkbox checkbox-primary mt-0.5" />
                                                    <span className="text-gray-700">
                                                        <strong className="mr-2 text-gray-400">{opt.id})</strong>
                                                        {opt.text}
                                                    </span>
                                                </label>
                                            ))}
                                            <span className="text-xs text-gray-400 mt-2">* Selecione uma ou mais opções.</span>
                                        </div>
                                    )}

                                    {q.question_type === 'TF' && (
                                        <div className="flex flex-col gap-4">
                                            {questionOptions.map((opt: any) => (
                                                <div key={opt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg border border-gray-100 bg-gray-50">
                                                    <span className="text-gray-700 flex-1">
                                                        <strong className="mr-2 text-gray-500">{opt.id}.</strong>
                                                        {opt.text}
                                                    </span>
                                                    <div className="join shrink-0">
                                                        <input type="radio" aria-label="Verdadeiro" className="join-item btn btn-sm bg-white hover:bg-green-50 checked:bg-green-500 checked:text-white border-gray-300" checked={currentAnswer?.[opt.id] === true} onChange={() => handleTFChange(q.question_id!, opt.id, true)} />
                                                        <input type="radio" aria-label="Falso" className="join-item btn btn-sm bg-white hover:bg-red-50 checked:bg-red-500 checked:text-white border-gray-300" checked={currentAnswer?.[opt.id] === false} onChange={() => handleTFChange(q.question_id!, opt.id, false)} />
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
                                            className="textarea textarea-bordered w-full h-40 bg-gray-50 focus:bg-white text-base leading-relaxed"
                                        />
                                    )}

                                    {/* NOVA INTERFACE: File Upload */}
                                    {q.question_type === 'FL' && (
                                        <div className="flex flex-col gap-3">
                                            <input 
                                                type="file" 
                                                onChange={(e) => handleAnswerChange(q.question_id!, e.target.files ? e.target.files[0] : null)}
                                                className="file-input file-input-bordered w-full max-w-md bg-white text-gray-700"
                                            />
                                            {currentAnswer instanceof File && (
                                                <div className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 p-3 rounded-md max-w-md truncate">
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

                <div className="flex justify-end mt-8 border-t border-gray-300 pt-8">
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="btn bg-[#621708] hover:bg-black text-white px-12 h-14 text-lg border-none shadow-xl"
                    >
                        {isSubmitting ? <span className="loading loading-spinner"></span> : 'Finalizar Prova e Enviar'}
                    </button>
                </div>
            </main>
        </div>
    );
}
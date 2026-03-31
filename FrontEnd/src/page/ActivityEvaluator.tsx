import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';
import { api } from '../services/api';
import { type QuestionDefinition } from '../types/Activity';

interface SubmissionDetail {
    submission_id: string;
    submission_grade: number;
    teacher_feedback: string;
    submission: any;
    submission_question: string;
}

interface StudentGroup {
    student_id: string;
    student_name: string;
    submitted_at: string;
    submissions: string;
}

export default function ActivityEvaluator() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [activityQuestions, setActivityQuestions] = useState<QuestionDefinition[]>([]);
    const [studentsData, setStudentsData] = useState<StudentGroup[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [activeSubmissions, setActiveSubmissions] = useState<SubmissionDetail[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [evaluationForm, setEvaluationForm] = useState<Record<string, { grade: number, feedback: string }>>({});

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!id) return;
            try {
                const [questionsRes, studentsRes] = await Promise.all([
                    api.get(`/activities/${id}/questions/response/`),
                    api.get(`/activities/${id}/submissions/grouped/`)
                ]);
                
                setActivityQuestions(questionsRes.data);
                setStudentsData(studentsRes.data);
                
                if (studentsRes.data.length > 0) {
                    // Passa os dados brutos como fallback para contornar o delay do useState
                    handleSelectStudent(studentsRes.data[0], questionsRes.data);
                }
            } catch (error) {
                alert("Erro ao carregar a infraestrutura da prova. Verifique sua conexão e a estrutura da API.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    // --- MOTOR DE AUTO-CORREÇÃO ---
    const calculateAutoGrade = (sub: SubmissionDetail, q: QuestionDefinition) => {
        const studentAns = sub.submission;
        const expectedAns = q.question_response;

        if (!studentAns || !expectedAns || Object.keys(studentAns).length === 0 || Object.keys(expectedAns).length === 0) return 0;

        let isCorrect = false;

        try {
            if (q.question_type === 'UC') {
                isCorrect = expectedAns.answers?.includes(studentAns.option);
            } else if (q.question_type === 'MC') {
                const sOpts = studentAns.options || [];
                const eOpts = expectedAns.answers || [];
                isCorrect = sOpts.length === eOpts.length && sOpts.every((val: string) => eOpts.includes(val));
            } else if (q.question_type === 'TF') {
                const sOpts = studentAns.options || {};
                const eOpts = expectedAns.answers || {};
                const sKeys = Object.keys(sOpts);
                const eKeys = Object.keys(eOpts);
                isCorrect = sKeys.length === eKeys.length && sKeys.every(k => sOpts[k] === eOpts[k]);
            } else if (q.question_type === 'SA' || q.question_type === 'ES') {
                const sText = String(studentAns.option || '').trim().toLowerCase();
                const eText = String(expectedAns.expected_text || '').trim().toLowerCase();
                isCorrect = sText === eText && sText.length > 0;
            }
        } catch (e) {
            isCorrect = false;
        }

        return isCorrect ? q.question_expected_result : 0;
    };

    const handleSelectStudent = async (student: StudentGroup, currentQuestions = activityQuestions) => {
        if (selectedStudentId === student.student_id && activeSubmissions.length > 0) return;
        
        setSelectedStudentId(student.student_id);
        setIsFetchingDetails(true);
        setActiveSubmissions([]);
        
        try {
            const endpoint = student.submissions.startsWith('/') ? student.submissions : `/${student.submissions}`;
            console.log(endpoint, student.submissions, student);
            const res = await api.get(endpoint);
            const submissionsData: SubmissionDetail[] = res.data;
            
            setActiveSubmissions(submissionsData);
            
            const initialFormState: Record<string, { grade: number, feedback: string }> = {};
            submissionsData.forEach(sub => {
                const q = currentQuestions.find(aq => aq.question_id === sub.submission_question);
                let currentGrade = sub.submission_grade || 0;

                // Aplica a auto-correção apenas se a nota atual for 0 e a questão existir
                if (q && currentGrade === 0) {
                    const autoGrade = calculateAutoGrade(sub, q);
                    if (autoGrade > 0) currentGrade = autoGrade;
                }

                initialFormState[sub.submission_id] = {
                    grade: currentGrade,
                    feedback: sub.teacher_feedback || ''
                };
            });
            setEvaluationForm(initialFormState);
        } catch (error) {
            alert("Erro ao carregar as respostas deste aluno.");
        } finally {
            setIsFetchingDetails(false);
        }
    };

    const handleFormChange = (submissionId: string, field: 'grade' | 'feedback', value: any, maxGrade?: number) => {
        setEvaluationForm(prev => {
            let finalValue = value;
            
            if (field === 'grade' && maxGrade !== undefined) {
                let numValue = Number(value);
                if (isNaN(numValue)) numValue = 0;
                if (numValue > maxGrade) numValue = maxGrade;
                if (numValue < 0) numValue = 0;
                finalValue = numValue;
            }

            return {
                ...prev,
                [submissionId]: {
                    ...prev[submissionId],
                    [field]: finalValue
                }
            };
        });
    };

    const handleSaveEvaluation = async () => {
        if (!selectedStudentId || !id) return;
        setIsSaving(true);
        
        const payload = Object.entries(evaluationForm).map(([subId, data]) => ({
            submission_id: subId,
            submission_grade: data.grade,
            teacher_feedback: data.feedback
        }));

        try {
            await api.patch(`/activities/${id}/student/${selectedStudentId}/submit-review/`, { evaluations: payload });
            alert("Avaliação salva com sucesso!");
        } catch (error) {
            alert("Erro ao salvar avaliação.");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedStudent = studentsData.find(s => s.student_id === selectedStudentId);
    const filteredStudents = studentsData.filter(s => s.student_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const renderStudentAnswer = (submission: any, question: QuestionDefinition) => {
        if (!submission || Object.keys(submission).length === 0) {
            return <span className="text-gray-400 italic">Nenhuma resposta fornecida.</span>;
        }

        switch (question.question_type) {
            case 'UC': {
                const optId = submission.option;
                const opt = question.question_options?.find((o: any) => o.id === optId);
                return <p><strong className="text-[#621708] mr-2">{optId})</strong> {opt?.text || 'Alternativa desconhecida'}</p>;
            }
            case 'MC': {
                const optIds = submission.options || [];
                return (
                    <ul className="flex flex-col gap-1">
                        {optIds.map((id: string) => {
                            const opt = question.question_options?.find((o: any) => o.id === id);
                            return <li key={id}><strong className="text-[#621708] mr-2">{id})</strong> {opt?.text || ''}</li>;
                        })}
                    </ul>
                );
            }
            case 'TF': {
                const answers = submission.options || {};
                return (
                    <ul className="flex flex-col gap-2">
                        {Object.entries(answers).map(([id, isTrue]) => {
                            const opt = question.question_options?.find((o: any) => o.id === id);
                            return (
                                <li key={id} className="flex items-start gap-2">
                                    <span className={`font-bold w-6 text-center rounded ${isTrue ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {isTrue ? 'V' : 'F'}
                                    </span>
                                    <span><strong className="text-gray-500 mr-1">{id}.</strong> {opt?.text || ''}</span>
                                </li>
                            );
                        })}
                    </ul>
                );
            }
            case 'SA':
            case 'ES':
                return <p className="whitespace-pre-wrap">{submission.option || ''}</p>;
            default:
                return <pre className="text-xs text-gray-500">{JSON.stringify(submission, null, 2)}</pre>;
        }
    };

    const renderExpectedAnswer = (question: QuestionDefinition) => {
        const response = question.question_response;
        if (!response || Object.keys(response).length === 0) {
            return <span className="text-gray-400 italic">Sem gabarito registrado.</span>;
        }

        switch (question.question_type) {
            case 'UC': 
            case 'MC': {
                const correctIds = response.answers || [];
                return (
                    <ul className="flex flex-col gap-1">
                        {correctIds.map((id: string) => {
                            const opt = question.question_options?.find((o: any) => o.id === id);
                            return <li key={id}><strong className="text-indigo-600 mr-2">{id})</strong> {opt?.text || ''}</li>;
                        })}
                    </ul>
                );
            }
            case 'TF': {
                const correctAnswers = response.answers || {};
                return (
                    <ul className="flex flex-col gap-2">
                        {Object.entries(correctAnswers).map(([id, isTrue]) => {
                            const opt = question.question_options?.find((o: any) => o.id === id);
                            return (
                                <li key={id} className="flex items-start gap-2">
                                    <span className={`font-bold w-6 text-center rounded ${isTrue ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {isTrue ? 'V' : 'F'}
                                    </span>
                                    <span><strong className="text-gray-500 mr-1">{id}.</strong> {opt?.text || ''}</span>
                                </li>
                            );
                        })}
                    </ul>
                );
            }
            case 'SA':
            case 'ES':
                return <p className="whitespace-pre-wrap">{response.expected_text || ''}</p>;
            default:
                return <pre className="text-xs text-gray-500">{JSON.stringify(response, null, 2)}</pre>;
        }
    };

    if (isLoading) return <div className="min-h-screen bg-[#F2F5F7] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-[#621708]"></span></div>;

    return (
        <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
            <NavBar />
            
            <div className="flex-1 flex overflow-hidden">
                <aside className="w-1/4 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-64px)]">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-gray-700">Submissões ({studentsData.length})</h2>
                            <button onClick={() => navigate(-1)} className="btn btn-xs btn-ghost">Voltar</button>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Pesquisar aluno..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input input-sm input-bordered w-full bg-[#F2F5F7]"
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-2">
                        {filteredStudents.length === 0 ? (
                            <p className="text-gray-400 text-center mt-10 text-sm">Nenhum aluno encontrado.</p>
                        ) : (
                            filteredStudents.map(student => (
                                <button 
                                    key={student.student_id}
                                    onClick={() => handleSelectStudent(student)}
                                    className={`w-full text-left p-4 rounded-lg mb-2 transition-colors border ${selectedStudentId === student.student_id ? 'bg-[#621708] text-white border-[#621708]' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'}`}
                                >
                                    <div className="font-bold truncate">{student.student_name}</div>
                                    <div className={`text-xs mt-1 ${selectedStudentId === student.student_id ? 'text-gray-300' : 'text-gray-500'}`}>
                                        Enviado: {new Date(student.submitted_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-8 h-[calc(100vh-64px)] relative">
                    {!selectedStudent ? (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            Selecione um aluno na lista para iniciar a avaliação.
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
                            <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-4 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Avaliação: {selectedStudent.student_name}</h2>
                                    <p className="text-gray-500 text-sm">A nota foi calculada automaticamente onde possível. Revise antes de salvar.</p>
                                </div>
                                <button onClick={handleSaveEvaluation} disabled={isSaving || isFetchingDetails} className="btn bg-[#F6AA1C] hover:bg-yellow-600 text-white border-none px-8 shadow-md">
                                    {isSaving ? 'Salvando...' : 'Salvar Avaliação'}
                                </button>
                            </header>

                            {isFetchingDetails ? (
                                <div className="flex justify-center items-center py-20">
                                    <span className="loading loading-spinner loading-md text-[#621708]"></span>
                                </div>
                            ) : (
                                activityQuestions.map((q, index) => {
                                    const sub = activeSubmissions.find(s => s.submission_question === q.question_id);
                                    
                                    if (!sub) {
                                        return (
                                            <div key={q.question_id} className="card bg-gray-50 border border-dashed border-gray-300">
                                                <div className="card-body p-6 flex flex-row items-center gap-4 text-gray-400">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-300 text-white text-xs font-bold shrink-0">{index + 1}</span>
                                                    <p className="italic flex-1">O aluno deixou esta questão em branco ou não enviou resposta.</p>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const currentForm = evaluationForm[sub.submission_id] || { grade: 0, feedback: '' };

                                    return (
                                        <div key={sub.submission_id} className="card bg-white shadow-sm border border-gray-200">
                                            <div className="card-body p-6 flex flex-col lg:flex-row gap-8">
                                                
                                                <div className="flex-1 flex flex-col gap-4">
                                                    <div className="flex gap-3">
                                                        <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-800 text-white text-xs font-bold shrink-0">{index + 1}</span>
                                                        <p className="font-medium text-gray-800">{q.question_description}</p>
                                                    </div>

                                                    <div className="pl-9 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Resposta do Aluno</span>
                                                        <div className="font-sans text-gray-700">
                                                            {renderStudentAnswer(sub.submission, q)}
                                                        </div>
                                                    </div>

                                                    <div className="pl-9">
                                                        <span className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Gabarito Esperado</span>
                                                        <div className="text-gray-600">
                                                            {renderExpectedAnswer(q)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full lg:w-72 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-6">
                                                    <div className="form-control">
                                                        <label className="label py-0 pb-1">
                                                            <span className="label-text font-bold text-gray-600 text-xs uppercase">Nota Obtida</span>
                                                            <span className="label-text-alt text-gray-400">Max: {q.question_expected_result}</span>
                                                        </label>
                                                        <input 
                                                            type="number" step="0.1" min="0" max={q.question_expected_result}
                                                            value={currentForm.grade === 0 ? '' : currentForm.grade}
                                                            onChange={(e) => handleFormChange(sub.submission_id, 'grade', e.target.value, q.question_expected_result)}
                                                            className="input input-bordered bg-green-50 text-green-900 font-bold text-lg focus:border-green-500" 
                                                        />
                                                    </div>

                                                    <div className="form-control flex-1">
                                                        <label className="label py-0 pb-1">
                                                            <span className="label-text font-bold text-gray-600 text-xs uppercase">Feedback Específico</span>
                                                        </label>
                                                        <textarea 
                                                            value={currentForm.feedback}
                                                            onChange={(e) => handleFormChange(sub.submission_id, 'feedback', e.target.value)}
                                                            placeholder="Comentário sobre o erro ou acerto..."
                                                            className="textarea textarea-bordered h-full min-h-[100px] bg-gray-50 text-sm" 
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
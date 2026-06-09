import { useState, useEffect } from 'react';
import { type QuestionDefinition } from '../../types/Activity';
import QuestionForm from './QuestionForm';
import QuestionList from './QuestionList';
import { api } from '../../services/api';
import { listCourses } from '../../services/CourseCrud';
import { listBimestres } from '../../services/BimestreCrud';

interface QuestionManagerProps {
    activityId: string;
}

export default function QuestionManager({ activityId }: QuestionManagerProps) {
    const [questions, setQuestions] = useState<QuestionDefinition[]>([]);
    const [editingQuestion, setEditingQuestion] = useState<QuestionDefinition | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Bank state
    const [activeTab, setActiveTab] = useState<'CREATE' | 'BANK'>('CREATE');
    const [bankQuestions, setBankQuestions] = useState<QuestionDefinition[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [bimestres, setBimestres] = useState<any[]>([]);
    const [filterCourse, setFilterCourse] = useState('');
    const [filterBimester, setFilterBimester] = useState('');

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/activities/${activityId}/questions/response/`);
            setQuestions(response.data);
        } catch (error) {
            console.error("Erro ao carregar questões:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBankData = async () => {
        try {
            const [cData, bData] = await Promise.all([listCourses(), listBimestres()]);
            setCourses(cData);
            setBimestres(bData);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (activityId) fetchQuestions();
        fetchBankData();
    }, [activityId]);

    const fetchBankQuestions = async () => {
        try {
            const params = new URLSearchParams();
            if (filterCourse) params.append('course', filterCourse);
            if (filterBimester) params.append('bimester', filterBimester);
            
            const response = await api.get(`/question/bank/?${params.toString()}`);
            setBankQuestions(response.data);
        } catch (error) {
            console.error("Erro ao carregar banco de questões:", error);
        }
    };

    useEffect(() => {
        if (activeTab === 'BANK') {
            fetchBankQuestions();
        }
    }, [activeTab, filterCourse, filterBimester]);

    const handleSaveQuestion = async (questionData: Partial<QuestionDefinition>) => {
        try {
            if (editingQuestion?.question_id) {
                // UPDATE
                await api.put(`/question/update/${editingQuestion.question_id}/`, {
                    ...questionData,
                    question_order: editingQuestion.question_order
                });
            } else {
                // CREATE
                await api.post(`/question/create/`, {
                    ...questionData,
                    activity: [activityId],
                    question_order: questions.length
                });
            }
            setEditingQuestion(null);
            fetchQuestions(); // Atualiza a lista vinda do banco
        } catch (error) {
            alert("Erro ao salvar questão no servidor.");
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm("Excluir esta questão?")) return;
        try {
            await api.delete(`/question/delete/${id}/`);
            fetchQuestions();
        } catch (error) {
            alert("Erro ao eliminar questão.");
        }
    };

    const handleMoveQuestion = async (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const newQuestions = [...questions];
        
        // Swap locally
        const temp = newQuestions[index];
        newQuestions[index] = newQuestions[newIndex];
        newQuestions[newIndex] = temp;
        
        // Update local orders
        newQuestions[index].question_order = index;
        newQuestions[newIndex].question_order = newIndex;
        
        setQuestions(newQuestions);

        // Sync with backend
        try {
            await Promise.all([
                api.put(`/question/update/${newQuestions[index].question_id}/`, newQuestions[index]),
                api.put(`/question/update/${newQuestions[newIndex].question_id}/`, newQuestions[newIndex])
            ]);
        } catch (error) {
            alert("Erro ao reordenar questões no servidor.");
            fetchQuestions(); // Revert on failure
        }
    };

    const handleLinkQuestion = async (qId: string) => {
        try {
            await api.post(`/activities/${activityId}/link-questions/`, { question_ids: [qId] });
            alert("Questão vinculada com sucesso!");
            fetchQuestions();
        } catch (error) {
            alert("Erro ao vincular questão.");
        }
    };

    return (
        <section className="flex flex-col gap-6 w-full bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-xl font-bold text-gray-800">Questões da Atividade</h3>
            
            {isLoading ? (
                <div className="flex justify-center p-10"><span className="loading loading-spinner"></span></div>
            ) : (
                <QuestionList 
                    questions={questions} 
                    onEdit={(q) => setEditingQuestion(q)} 
                    onDelete={handleDeleteQuestion}
                    onMoveUp={(index) => handleMoveQuestion(index, 'up')}
                    onMoveDown={(index) => handleMoveQuestion(index, 'down')}
                />
            )}

            <div className="border-t pt-4">
                <div className="tabs tabs-boxed mb-4">
                    <a className={`tab ${activeTab === 'CREATE' ? 'tab-active font-bold' : ''}`} onClick={() => setActiveTab('CREATE')}>Criar Questão</a> 
                    <a className={`tab ${activeTab === 'BANK' ? 'tab-active font-bold' : ''}`} onClick={() => setActiveTab('BANK')}>Banco de Questões</a> 
                </div>

                {activeTab === 'CREATE' && (
                    <QuestionForm 
                        initialData={editingQuestion || undefined}
                        onSave={handleSaveQuestion}
                        onCancel={() => setEditingQuestion(null)}
                    />
                )}

                {activeTab === 'BANK' && (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex gap-4 mb-4">
                            <select className="select select-bordered w-full max-w-xs" value={filterBimester} onChange={e => setFilterBimester(e.target.value)}>
                                <option value="">Todos os Bimestres</option>
                                {bimestres.map(b => (
                                    <option key={b.bimester_id} value={b.bimester_id}>{b.name}</option>
                                ))}
                            </select>
                            <select className="select select-bordered w-full max-w-xs" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
                                <option value="">Todas as Matérias</option>
                                {courses.map(c => (
                                    <option key={c.course_id} value={c.course_id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                            {bankQuestions.map(q => (
                                <div key={q.question_id} className="bg-white p-3 border rounded shadow-sm flex justify-between items-center">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-700 line-clamp-2">{q.question_description}</p>
                                        <span className="text-xs text-gray-500">Tipo: {q.question_type} | Valor: {q.question_expected_result}</span>
                                    </div>
                                    <button 
                                        className="btn btn-sm btn-outline btn-success ml-4"
                                        onClick={() => handleLinkQuestion(q.question_id!)}
                                    >
                                        Vincular
                                    </button>
                                </div>
                            ))}
                            {bankQuestions.length === 0 && (
                                <p className="text-gray-500 text-center py-4">Nenhuma questão encontrada no banco.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
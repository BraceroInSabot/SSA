import { useState, useEffect } from 'react';
import { type QuestionDefinition } from '../../types/Activity';
import QuestionForm from './QuestionForm';
import QuestionList from './QuestionList';
import { api } from '../../services/api';

interface QuestionManagerProps {
    activityId: string;
}

export default function QuestionManager({ activityId }: QuestionManagerProps) {
    const [questions, setQuestions] = useState<QuestionDefinition[]>([]);
    const [editingQuestion, setEditingQuestion] = useState<QuestionDefinition | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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

    useEffect(() => {
        if (activityId) fetchQuestions();
    }, [activityId]);

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

            <QuestionForm 
                initialData={editingQuestion || undefined}
                onSave={handleSaveQuestion}
                onCancel={() => setEditingQuestion(null)}
            />
        </section>
    );
}
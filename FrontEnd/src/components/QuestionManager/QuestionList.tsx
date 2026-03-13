import { type QuestionDefinition } from '../../types/Activity';

interface QuestionListProps {
    questions: QuestionDefinition[];
    onEdit: (question: QuestionDefinition) => void;
    onDelete: (id: string) => void;
}

export default function QuestionList({ questions, onEdit, onDelete }: QuestionListProps) {
    if (questions.length === 0) {
        return (
            <div className="p-8 text-center text-gray-400 italic bg-gray-50 rounded-lg border border-gray-100">
                Ainda não existem questões nesta atividade.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {questions.map((q, index) => (
                <div key={q.question_id || index} className="group flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-all shadow-sm">
                    <div className="flex flex-col gap-1 max-w-[70%]">
                        <div className="flex items-center gap-2">
                            <span className="badge badge-sm bg-gray-800 text-white">Q{index + 1}</span>
                            <span className="text-xs font-bold uppercase text-blue-600">{q.question_type}</span>
                        </div>
                        <p className="text-gray-700 font-medium line-clamp-2">{q.question_description}</p>
                        <span className="text-xs text-gray-500">Valor: <b className="text-green-700">{q.question_expected_result} pts</b></span>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => onEdit(q)}
                            className="btn btn-square btn-ghost btn-sm text-blue-600"
                            title="Editar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button 
                            onClick={() => q.question_id && onDelete(q.question_id)}
                            className="btn btn-square btn-ghost btn-sm text-red-600"
                            title="Eliminar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
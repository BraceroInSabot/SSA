import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { type Activity } from '../../../types/Activity';
import ActivityCard from '../../ActivityCard/ActivityCard';

interface MainMenuProps {
    activities: Activity[];
    selectedCourseId: string | null;
    onActivityCreated: () => void;
}

export default function MainMenu({ activities, selectedCourseId }: MainMenuProps) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleStartNewActivity = () => {
        if (!selectedCourseId) return;
        // Navega para o editor enviando o courseId no state
        navigate('/atividade/novo', { state: { courseId: selectedCourseId } });
    };

    if (!selectedCourseId) {
        return (
            <main className="w-full lg:w-3/4 flex flex-col gap-4">
                <div className="card bg-white shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                    Selecione um curso para gerenciar atividades.
                </div>
            </main>
        );
    }

    return (
        <main className="w-full lg:w-3/4 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2 px-2">
                <h2 className="text-xl font-bold text-gray-800">Atividades do Curso</h2>
                
                {user?.is_teacher && (
                    <button 
                        type="button" 
                        onClick={handleStartNewActivity}
                        className="bg-[#621708] hover:bg-black transition-colors text-white font-bold py-2 px-4 rounded shadow-md"
                    >
                        Criar Atividade
                    </button>
                )}
            </div>

            {activities.length === 0 ? (
                <div className="card bg-white shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                    Nenhuma atividade publicada ou rascunho disponível.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {activities.map((activity) => (
                        <ActivityCard key={activity.activity_id} activity={activity} />
                    ))}
                </div>
            )}
        </main>
    );
}
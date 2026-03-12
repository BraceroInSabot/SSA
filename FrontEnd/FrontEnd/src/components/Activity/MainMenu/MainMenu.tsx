import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { type Activity } from '../../../types/Activity';
import ActivityCard from '../../ActivityCard/ActivityCard';
import CreateActivityModal from '../../CreateActivityModal/CreateActivityModal';

interface MainMenuProps {
    activities: Activity[];
    selectedCourseId: string | null;
    onActivityCreated: () => void;
}

export default function MainMenu({ activities, selectedCourseId, onActivityCreated }: MainMenuProps) {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!selectedCourseId) {
        return (
            <main className="w-full lg:w-3/4 flex flex-col gap-4">
                <div className="card bg-white shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                    Selecione um curso para ver ou criar atividades.
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
                        onClick={() => setIsModalOpen(true)} 
                        className="cursor-pointer bg-[#621708] hover:bg-red-900 transition-colors flex items-center justify-center text-white font-bold py-1 px-3 rounded text-sm"
                    >
                        Criar Atividade
                    </button>
                )}
            </div>

            {activities.length === 0 ? (
                <div className="card bg-white shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                    Nenhuma atividade encontrada para este curso.
                </div>
            ) : (
                activities.map((activity) => (
                    <ActivityCard key={activity.activity_id} activity={activity} />
                ))
            )}

            <CreateActivityModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                selectedCourseId={selectedCourseId}
                onSuccess={onActivityCreated}
            />
        </main>
    );
}
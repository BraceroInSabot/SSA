import { useState } from 'react';
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
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleStartNewActivity = () => {
        if (!selectedCourseId) return;
        navigate('/atividade/novo', { state: { courseId: selectedCourseId } });
    };

    if (!selectedCourseId) {
        return (
            <main className="w-full flex flex-col gap-4">
                <div className="card bg-white shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                    Selecione um bimestre para visualizar as atividades.
                </div>
            </main>
        );
    }

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentActivities = activities.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(activities.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <main className="w-full flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2 px-2">
                <h2 className="text-xl font-bold text-gray-800">Atividades</h2>
                
                {user?.is_teacher && (
                    <button 
                        type="button" 
                        onClick={handleStartNewActivity}
                        className="bg-[#3B82F6] hover:bg-blue-700 transition-colors text-white font-bold py-2 px-4 rounded-lg shadow-md"
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
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                        {currentActivities.map((activity) => (
                            <ActivityCard key={activity.activity_id} activity={activity} />
                        ))}
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <div className="join shadow-sm">
                                <button 
                                    className="join-item btn btn-sm bg-white border-gray-200 hover:bg-gray-50"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    «
                                </button>
                                
                                {[...Array(totalPages)].map((_, index) => (
                                    <button 
                                        key={index} 
                                        className={`join-item btn btn-sm ${currentPage === index + 1 ? 'bg-[#1E3A8A] text-white hover:bg-[#1e326b] border-[#1E3A8A]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        onClick={() => handlePageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                
                                <button 
                                    className="join-item btn btn-sm bg-white border-gray-200 hover:bg-gray-50"
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
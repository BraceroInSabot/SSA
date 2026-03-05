import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { createActivity } from '../../../services/ActivityCrud';
import { type Activity } from '../../../types/Activity';

interface MainMenuProps {
    activities: Activity[];
    selectedCourseId: string | null;
    onActivityCreated: () => void;
}

function MainMenu({ activities, selectedCourseId, onActivityCreated }: MainMenuProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const modalRef = useRef<HTMLDialogElement>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [totalGrade, setTotalGrade] = useState(0);
    const [hasSubmission, setHasSubmission] = useState(true);
    const [toBeLaunched, setToBeLaunched] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const openModal = () => modalRef.current?.showModal();

    const closeModal = () => {
        modalRef.current?.close();
        setName('');
        setDescription('');
        setTotalGrade(0);
        setHasSubmission(true);
        setToBeLaunched('');
        setDueDate('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedCourseId) return;

        setIsLoading(true);

        try {
            await createActivity({
                name,
                description,
                total_grade: totalGrade,
                has_submission: hasSubmission,
                to_be_launched: toBeLaunched,
                due_date: dueDate,
                course: selectedCourseId,
                is_active: true,
                lauched_at: new Date().toISOString()
            });

            onActivityCreated();
            closeModal();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                        onClick={openModal} 
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
                    <div key={activity.activity_id} className="card bg-white shadow-sm border border-gray-200">
                        <div className="card-body flex-col sm:flex-row justify-between items-start sm:items-center p-6 gap-4">
                            <div className="flex-1">
                                <h3 className="card-title text-lg text-gray-800">{activity.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Prazo
                                    </span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {formatDateTime(activity.due_date)}
                                    </span>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Nota Total
                                    </span>
                                    <span className="text-xl font-bold text-indigo-600">
                                        {activity.total_grade !== null ? String(activity.total_grade) : '-'}
                                    </span>
                                </div>

                                <span className={`badge border-none ${activity.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {activity.is_active ? 'Ativa' : 'Inativa'}
                                </span>

                                <button 
                                    onClick={() => navigate(`/atividade/${activity.activity_id}`)}
                                    className="btn btn-ghost btn-circle btn-sm text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}

            <dialog ref={modalRef} className="modal text-gray-800">
                <div className="modal-box bg-white max-w-2xl">
                    <h3 className="font-bold text-lg mb-6">Registrar Nova Atividade</h3>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Nome da Atividade</span>
                            </label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input input-bordered w-full bg-gray-50" 
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Descrição</span>
                            </label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="textarea textarea-bordered w-full bg-gray-50 h-24" 
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="label">
                                    <span className="label-text font-medium text-gray-700">Nota Total</span>
                                </label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={totalGrade}
                                    onChange={(e) => setTotalGrade(Number(e.target.value))}
                                    className="input input-bordered w-full bg-gray-50" 
                                    required
                                />
                            </div>

                            <div className="flex-1 flex items-center mt-8">
                                <label className="cursor-pointer label gap-4">
                                    <span className="label-text font-medium text-gray-700">Exige Envio?</span>
                                    <input 
                                        type="checkbox" 
                                        checked={hasSubmission}
                                        onChange={(e) => setHasSubmission(e.target.checked)}
                                        className="checkbox checkbox-primary" 
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="label">
                                    <span className="label-text font-medium text-gray-700">Data de Lançamento</span>
                                </label>
                                <input 
                                    type="datetime-local" 
                                    value={toBeLaunched}
                                    onChange={(e) => setToBeLaunched(e.target.value)}
                                    className="input input-bordered w-full bg-gray-50" 
                                    required
                                />
                            </div>

                            <div className="flex-1">
                                <label className="label">
                                    <span className="label-text font-medium text-gray-700">Data de Entrega</span>
                                </label>
                                <input 
                                    type="datetime-local" 
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="input input-bordered w-full bg-gray-50" 
                                    required
                                />
                            </div>
                        </div>

                        <div className="modal-action mt-6">
                            <button 
                                type="button" 
                                onClick={closeModal} 
                                className="btn btn-ghost"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn bg-[#621708] hover:bg-red-900 text-white border-none"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Salvando...' : 'Salvar Atividade'}
                            </button>
                        </div>
                    </form>
                </div>
                
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeModal}>close</button>
                </form>
            </dialog>
        </main>
    );
}

export default MainMenu;
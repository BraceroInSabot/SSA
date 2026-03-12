import { 
    useRef, 
    useState, 
    useEffect,
    //@ts-ignore 
    FormEvent 
} from 'react';
import { createActivity } from '../../services/ActivityCrud';

interface CreateActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCourseId: string;
    onSuccess: () => void;
}

export default function CreateActivityModal({ isOpen, onClose, selectedCourseId, onSuccess }: CreateActivityModalProps) {
    const modalRef = useRef<HTMLDialogElement>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [totalGrade, setTotalGrade] = useState(0);
    const [hasSubmission, setHasSubmission] = useState(true);
    const [toBeLaunched, setToBeLaunched] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            modalRef.current?.showModal();
        } else {
            modalRef.current?.close();
        }
    }, [isOpen]);

    const handleClose = () => {
        setName('');
        setDescription('');
        setTotalGrade(0);
        setHasSubmission(true);
        setToBeLaunched('');
        setDueDate('');
        onClose();
    };

    const handleSubmit = async (e: FormEvent) => {
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
                lauched_at: new Date().toISOString(),
                attached_files: []
            });

            onSuccess();
            handleClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <dialog ref={modalRef} className="modal text-gray-800" onCancel={handleClose}>
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
                            onClick={handleClose} 
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
                <button onClick={handleClose}>close</button>
            </form>
        </dialog>
    );
}
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from "../components/NavBar/NavBar";
import { useAuth } from '../contexts/AuthContext';
import { retrieveActivity, updateActivity, uploadActivityFile, detachActivityFile } from '../services/ActivityCrud';
import { type Activity } from '../types/Activity';

function SingleActivity() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [activity, setActivity] = useState<Activity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const editModalRef = useRef<HTMLDialogElement>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        total_grade: 0,
        has_submission: true,
        to_be_launched: '',
        due_date: '',
        is_active: true
    });

    const fetchActivityDetails = async () => {
        if (!id) return;
        
        setIsLoading(true);
        try {
            const response = await retrieveActivity(id);
            setActivity(response);
        } catch (error) {
            console.error(error);
            setActivity(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivityDetails();
    }, [id]);

    const formatDateTime = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatForInput = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    const openEditModal = () => {
        if (activity) {
            setEditForm({
                name: activity.name,
                description: activity.description,
                total_grade: Number(activity.total_grade),
                has_submission: activity.has_submission,
                to_be_launched: formatForInput(activity.to_be_launched),
                due_date: formatForInput(activity.due_date),
                is_active: activity.is_active
            });
        }
        editModalRef.current?.showModal();
    };

    const closeEditModal = () => {
        editModalRef.current?.close();
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setIsSaving(true);
        try {
            await updateActivity(id, editForm);
            await fetchActivityDetails();
            closeEditModal();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!id || !selectedFile) return;

        setIsUploading(true);
        try {
            await uploadActivityFile(id, selectedFile);
            await fetchActivityDetails();
            setSelectedFile(null);
            
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileDetach = async (fileId: string) => {
        if (!window.confirm('Tem certeza que deseja remover este arquivo permanentemente?')) return;
        
        setDeletingFileId(fileId);
        try {
            await detachActivityFile(fileId);
            await fetchActivityDetails();
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingFileId(null);
        }
    };

    const extractFilename = (url: string) => {
        return url.split('/').pop() || 'Arquivo';
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
                <NavBar />
                <div className="flex-1 flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-[#621708]"></span>
                </div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
                <NavBar />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-700">Atividade não encontrada</h2>
                    <button onClick={() => navigate(-1)} className="btn btn-outline">Voltar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
            <NavBar />
            
            <main className="flex-1 p-4 lg:p-10 max-w-5xl mx-auto w-full">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-gray-500 hover:text-[#621708] transition-colors mb-6 font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Voltar para Atividades
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#621708] px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`badge border-none ${activity.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                    {activity.is_active ? 'Ativa' : 'Inativa'}
                                </span>
                                {activity.has_submission && (
                                    <span className="badge bg-blue-100 text-blue-800 border-none">
                                        Exige Envio
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{activity.name}</h1>
                        </div>

                        {user?.is_teacher && (
                            <button 
                                onClick={openEditModal}
                                className="btn bg-[#F6AA1C] hover:bg-yellow-600 text-white border-none shrink-0"
                            >
                                Editar Atividade
                            </button>
                        )}
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Lançamento
                                </span>
                                <span className="text-gray-800 font-medium">
                                    {formatDateTime(activity.to_be_launched)}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Prazo de Entrega
                                </span>
                                <span className="text-gray-800 font-medium">
                                    {formatDateTime(activity.due_date)}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Nota Total
                                </span>
                                <span className="text-2xl font-bold text-indigo-600">
                                    {String(activity.total_grade)}
                                </span>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Descrição da Atividade</h3>
                            <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {activity.description}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Arquivos Anexos</h3>
                            
                            {(!activity.attached_files || activity.attached_files.length === 0) ? (
                                <p className="text-sm text-gray-500 italic mb-6">Nenhum arquivo anexado a esta atividade.</p>
                            ) : (
                                <ul className="flex flex-col gap-3 mb-8">
                                    {activity.attached_files.map((fileRecord) => (
                                        <li key={fileRecord.attached_files_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 shrink-0">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-700 truncate">
                                                    {extractFilename(fileRecord.file)}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <a 
                                                    href={fileRecord.file} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-ghost text-indigo-600 hover:bg-indigo-50 shrink-0"
                                                >
                                                    Baixar
                                                </a>
                                                {user?.is_teacher && (
                                                    <button 
                                                        onClick={() => handleFileDetach(fileRecord.attached_files_id)}
                                                        disabled={deletingFileId === fileRecord.attached_files_id}
                                                        className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50 shrink-0"
                                                    >
                                                        {deletingFileId === fileRecord.attached_files_id ? 'Removendo...' : 'Remover'}
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {user?.is_teacher && (
                                <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">Anexar Novo Arquivo</h4>
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                        <input 
                                            type="file" 
                                            id="file-upload"
                                            onChange={handleFileChange}
                                            className="file-input file-input-bordered w-full max-w-xs bg-white" 
                                        />
                                        <button 
                                            onClick={handleFileUpload}
                                            disabled={!selectedFile || isUploading}
                                            className="btn bg-[#621708] hover:bg-red-900 text-white border-none w-full sm:w-auto"
                                        >
                                            {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {user?.is_student && activity.has_submission && activity.is_active && (
                            <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
                                <button className="btn bg-[#621708] hover:bg-red-900 text-white border-none px-8">
                                    Enviar Trabalho
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <dialog ref={editModalRef} className="modal text-gray-800">
                    <div className="modal-box bg-white max-w-2xl">
                        <h3 className="font-bold text-lg mb-6">Editar Atividade</h3>
                        
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium text-gray-700">Nome da Atividade</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="input input-bordered w-full bg-gray-50" 
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium text-gray-700">Descrição</span>
                                </label>
                                <textarea 
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
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
                                        value={editForm.total_grade}
                                        onChange={(e) => setEditForm({...editForm, total_grade: Number(e.target.value)})}
                                        className="input input-bordered w-full bg-gray-50" 
                                        required
                                    />
                                </div>

                                <div className="flex-1 flex items-center mt-8 gap-6">
                                    <label className="cursor-pointer label gap-2">
                                        <span className="label-text font-medium text-gray-700">Exige Envio?</span>
                                        <input 
                                            type="checkbox" 
                                            checked={editForm.has_submission}
                                            onChange={(e) => setEditForm({...editForm, has_submission: e.target.checked})}
                                            className="checkbox checkbox-primary" 
                                        />
                                    </label>

                                    <label className="cursor-pointer label gap-2">
                                        <span className="label-text font-medium text-gray-700">Ativa?</span>
                                        <input 
                                            type="checkbox" 
                                            checked={editForm.is_active}
                                            onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                                            className="checkbox checkbox-success" 
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
                                        value={editForm.to_be_launched}
                                        onChange={(e) => setEditForm({...editForm, to_be_launched: e.target.value})}
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
                                        value={editForm.due_date}
                                        onChange={(e) => setEditForm({...editForm, due_date: e.target.value})}
                                        className="input input-bordered w-full bg-gray-50" 
                                        required
                                    />
                                </div>
                            </div>

                            <div className="modal-action mt-6">
                                <button 
                                    type="button" 
                                    onClick={closeEditModal} 
                                    className="btn btn-ghost"
                                    disabled={isSaving}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn bg-[#F6AA1C] hover:bg-yellow-600 text-white border-none"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={closeEditModal}>close</button>
                    </form>
                </dialog>
            </main>
        </div>
    );
}

export default SingleActivity;
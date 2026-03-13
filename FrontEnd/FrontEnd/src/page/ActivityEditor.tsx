import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar/NavBar';
import QuestionManager from '../components/QuestionManager/QuestionManager';
import { createActivity, retrieveActivity, updateActivity, uploadActivityFile, detachActivityFile } from '../services/ActivityCrud';
import { api } from '../services/api';

export default function ActivityEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const [activityId, setActivityId] = useState<string | null>(id || null);
    const [status, setStatus] = useState<string>('DRF');
    const [isLoading, setIsLoading] = useState(false);
    const courseId = location.state?.courseId;

    // Estado Unificado
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        to_be_launched: '',
        due_date: '',
        total_grade: 10,
        activity_type: 'TST',
        is_active: true,
        has_submission: true
    });

    // Gerenciamento de Arquivos
    const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

    const formatForInput = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    const loadActivity = async (targetId: string) => {
        try {
            const res = await retrieveActivity(targetId);
            setFormData({
                name: res.name,
                description: res.description,
                to_be_launched: formatForInput(res.to_be_launched),
                due_date: formatForInput(res.due_date),
                //@ts-ignore
                total_grade: res.total_grade,
                activity_type: res.activity_type,
                is_active: res.is_active,
                has_submission: res.has_submission
            });
            setStatus(res.status || 'DRF');
            setAttachedFiles(res.attached_files || []);
        } catch (error) {
            console.error("Erro ao carregar atividade:", error);
            navigate('/atividades');
        }
    };

    useEffect(() => {
        if (id) loadActivity(id);
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSaveMetadata = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            ...formData,
            course: courseId || '',
            to_be_launched: new Date(formData.to_be_launched).toISOString(),
            due_date: new Date(formData.due_date).toISOString(),
        };

        try {
            if (activityId) {
                //@ts-ignore
                await updateActivity(activityId, payload);
                // Feedback silencioso ou toast poderia entrar aqui
            } else {
                if (!courseId) throw new Error("Curso não identificado.");
                const res = await createActivity(payload as any);
                setActivityId(res.activity_id);
                setStatus('DRF');
                window.history.replaceState(null, '', `/atividade/editar/${res.activity_id}`);
            }
        } catch (err) {
            alert("Erro ao salvar os dados da atividade.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!activityId) return;
        setIsLoading(true);
        try {
            await api.patch(`/activity/${activityId}/publish/`);
            setStatus('PUB');
            alert("Atividade publicada com sucesso!");
        } catch (error: any) {
            alert(error.response?.data?.detail || "Erro ao publicar a atividade.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- LÓGICA DE ARQUIVOS ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!activityId || !selectedFile) return;
        setIsUploading(true);
        try {
            await uploadActivityFile(activityId, selectedFile);
            await loadActivity(activityId);
            setSelectedFile(null);
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error) {
            alert("Erro ao enviar arquivo.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileDetach = async (fileId: string) => {
        if (!window.confirm('Remover este arquivo permanentemente?')) return;
        setDeletingFileId(fileId);
        try {
            await detachActivityFile(fileId);
            await loadActivity(activityId!);
        } catch (error) {
            alert("Erro ao remover arquivo.");
        } finally {
            setDeletingFileId(null);
        }
    };

    const isTeacher = user?.is_teacher;

    return (
        <div className="min-h-screen bg-[#F2F5F7] pb-12">
            <NavBar />
            
            <main className="max-w-6xl mx-auto p-4 lg:p-8">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-[#621708] transition-colors mb-6 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    Voltar
                </button>

                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-300 pb-4 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {status === 'DRF' ? (
                                <span className="badge bg-yellow-100 text-yellow-800 border-none font-bold">RASCUNHO</span>
                            ) : (
                                <span className="badge bg-green-100 text-green-800 border-none font-bold">PUBLICADA</span>
                            )}
                            <span className={`badge border-none ${formData.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                                {formData.is_active ? 'Ativa' : 'Inativa'}
                            </span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-gray-800 tracking-tight">
                            {formData.name || 'Nova Atividade'}
                        </h1>
                    </div>
                    
                    {isTeacher && activityId && status === 'DRF' && (
                        <button onClick={handlePublish} disabled={isLoading} className="btn bg-[#621708] hover:bg-black text-white border-none shadow-md px-8">
                            {isLoading ? 'Processando...' : 'Publicar Atividade Oficial'}
                        </button>
                    )}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* COLUNA ESQUERDA: Configurações e Metadados */}
                    <aside className="lg:col-span-1 flex flex-col gap-6">
                        <form id="metadata-form" onSubmit={handleSaveMetadata} className="card bg-white shadow-sm border border-gray-200 sticky top-8">
                            <div className="card-body p-6 gap-4">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Detalhes Gerais</h2>
                                
                                <div className="form-control">
                                    <label className="label-text font-semibold mb-1 text-gray-700">Título</label>
                                    <input name="name" value={formData.name} onChange={handleChange} disabled={!isTeacher} className="input input-bordered bg-gray-50 text-gray-800" required />
                                </div>

                                <div className="form-control">
                                    <label className="label-text font-semibold mb-1 text-gray-700">Descrição</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} disabled={!isTeacher} className="textarea textarea-bordered h-28 bg-gray-50 text-gray-800 leading-relaxed" required />
                                </div>

                                <div className="grid grid-cols-1 gap-4 mt-2">
                                    <div className="form-control">
                                        <label className="label-text font-semibold mb-1 text-gray-500 text-xs uppercase">Lançamento</label>
                                        <input type="datetime-local" name="to_be_launched" value={formData.to_be_launched} onChange={handleChange} disabled={!isTeacher} className="input input-bordered bg-gray-50" required />
                                    </div>
                                    <div className="form-control">
                                        <label className="label-text font-semibold mb-1 text-gray-500 text-xs uppercase">Prazo de Entrega</label>
                                        <input type="datetime-local" name="due_date" value={formData.due_date} onChange={handleChange} disabled={!isTeacher} className="input input-bordered bg-gray-50" required />
                                    </div>
                                </div>

                                <div className="form-control mt-2">
                                    <label className="label-text font-semibold mb-1 text-gray-500 text-xs uppercase">Nota Total Máxima</label>
                                    <input type="number" step="0.1" name="total_grade" value={formData.total_grade} onChange={handleChange} disabled={!isTeacher} className="input input-bordered bg-gray-50 text-xl font-bold text-indigo-600" required />
                                </div>

                                {isTeacher && (
                                    <>
                                        <div className="flex gap-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <label className="cursor-pointer flex items-center gap-2">
                                                <input type="checkbox" name="has_submission" checked={formData.has_submission} onChange={handleChange} className="checkbox checkbox-sm checkbox-primary" />
                                                <span className="text-sm font-medium">Exige Envio</span>
                                            </label>
                                            <label className="cursor-pointer flex items-center gap-2">
                                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="checkbox checkbox-sm checkbox-success" />
                                                <span className="text-sm font-medium">Ativa</span>
                                            </label>
                                        </div>
                                        <button type="submit" className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-100 mt-2" disabled={isLoading}>
                                            {activityId ? 'Salvar Alterações' : 'Iniciar Rascunho'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </aside>

                    {/* COLUNA DIREITA: Arquivos e Questões */}
                    <section className="lg:col-span-2 flex flex-col gap-8">
                        {!activityId ? (
                            <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white text-center text-gray-400 p-8">
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p className="text-lg">Preencha os detalhes ao lado e inicie o rascunho<br/>para desbloquear anexos e questões.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8">
                                
                                {/* GESTÃO DE ARQUIVOS */}
                                <div className="card bg-white shadow-sm border border-gray-200">
                                    <div className="card-body p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" /></svg>
                                            Arquivos de Apoio
                                        </h3>
                                        
                                        {attachedFiles.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic mb-4">Nenhum material de apoio anexado.</p>
                                        ) : (
                                            <ul className="flex flex-col gap-2 mb-6">
                                                {attachedFiles.map((file) => (
                                                    <li key={file.attached_files_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                                                        <span className="text-sm font-medium text-gray-700 truncate mr-4">
                                                            {file.file.split('/').pop()}
                                                        </span>
                                                        <div className="flex gap-2 shrink-0">
                                                            <a href={file.file} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline text-indigo-600">Download</a>
                                                            {isTeacher && (
                                                                <button onClick={() => handleFileDetach(file.attached_files_id)} className="btn btn-xs btn-ghost text-red-500 hover:bg-red-50" disabled={deletingFileId === file.attached_files_id}>
                                                                    Remover
                                                                </button>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {isTeacher && (
                                            <div className="flex flex-col sm:flex-row gap-3 items-center bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                                                <input type="file" id="file-upload" onChange={handleFileChange} className="file-input file-input-sm file-input-bordered w-full bg-white" />
                                                <button onClick={handleFileUpload} disabled={!selectedFile || isUploading} className="btn btn-sm bg-[#621708] text-white hover:bg-black w-full sm:w-auto border-none">
                                                    {isUploading ? 'Enviando...' : 'Anexar Arquivo'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* MOTOR DE QUESTÕES */}
                                {formData.activity_type === 'TST' && (
                                    <div className="card bg-white shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-6">
                                            <QuestionManager activityId={activityId} />
                                        </div>
                                    </div>
                                )}

                                {/* BOTÃO DO ALUNO */}
                                {!isTeacher && formData.has_submission && status === 'PUB' && (
                                    <div className="flex justify-end mt-4">
                                        <button className="btn bg-[#621708] text-white hover:bg-black border-none px-12 py-4 h-auto text-lg shadow-lg">
                                            Responder e Enviar Trabalho
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
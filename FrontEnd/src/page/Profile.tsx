import { useState, useEffect, useRef, useCallback } from 'react';
import NavBar from '../components/NavBar/NavBar';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
    id: string | number;
    name: string;
    email: string;
    image: string | null;
    is_student: boolean;
    is_teacher: boolean;
}

export default function ProfilePage() {
    const { refreshUser } = useAuth();
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingCSV, setIsUploadingCSV] = useState(false);

    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const fetchProfile = useCallback(async () => {
        try {
            const response = await api.get('/user/info');
            setProfile(response.data);
        } catch (error) {
            showToast("Erro ao carregar dados do perfil.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            await api.patch('/user/update/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchProfile();
            if (refreshUser) await refreshUser();
            showToast("Imagem atualizada com sucesso.", "success");
        } catch (error) {
            showToast("Erro ao fazer upload da imagem.", "error");
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [fetchProfile, refreshUser, showToast]);

    const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newEmail || newEmail === profile?.email) {
            setIsEditingEmail(false);
            return;
        }

        try {
            await api.patch('/user/update/', { email: newEmail });
            await fetchProfile();
            if (refreshUser) await refreshUser();
            setIsEditingEmail(false);
            showToast("E-mail alterado com sucesso.", "success");
        } catch (error) {
            showToast("Erro ao atualizar o e-mail. Verifique se ele já está em uso.", "error");
        }
    }, [newEmail, profile?.email, fetchProfile, refreshUser, showToast]);

    const handlePasswordSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentPassword || !newPassword) return;

        try {
            await api.patch('/user/update/', { 
                current_password: currentPassword, 
                new_password: newPassword 
            });
            setIsEditingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            showToast("Senha alterada com sucesso.", "success");
        } catch (error) {
            showToast("Erro ao alterar a senha. Verifique as credenciais.", "error");
        }
    }, [currentPassword, newPassword, showToast]);

    const handleCSVUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingCSV(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/user/import-students/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast(`Importação concluída: ${response.data.criados} alunos criados com sucesso.`, "success");
        } catch (error: any) {
            showToast(error.response?.data?.error || "Erro ao processar o arquivo CSV.", "error");
        } finally {
            setIsUploadingCSV(false);
            if (csvInputRef.current) csvInputRef.current.value = '';
        }
    }, [showToast]);

    if (isLoading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-[#1E3A8A]"></span></div>;
    if (!profile) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-[#0F172A]">Erro ao carregar perfil.</div>;

    const userRole = profile.is_teacher ? 'Professor' : profile.is_student ? 'Aluno' : 'Usuário';

    return (
        <div className="flex flex-row min-h-screen bg-[#F8FAFC] font-sans">
            <NavBar />
            
            {toast && (
                <div className="toast toast-top toast-end z-[100]">
                    <div className={`alert ${toast.type === 'success' ? 'alert-success bg-[#14B8A6] text-[#FFFFFF]' : 'alert-error bg-[#F97316] text-[#FFFFFF]'}`}>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
            
            <main className="flex-1 p-4 lg:p-10 max-w-4xl mx-auto w-full">
                <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden mb-8">
                    
                    <div className="bg-[#1E3A8A] px-8 py-10 flex flex-col items-center sm:flex-row sm:items-end gap-6 relative">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-[#FFFFFF] overflow-hidden bg-[#FFFFFF] shadow-md">
                                <img 
                                    src={
                                        profile?.image 
                                            ? profile.image 
                                            : `https://ui-avatars.com/api/?name=${profile?.name}&background=1E3A8A&color=fff&size=256&bold=true`
                                    }
                                    alt="Foto de Perfil" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingImage}
                                className="absolute inset-0 bg-[#0F172A]/50 text-[#FFFFFF] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full font-bold text-sm"
                            >
                                {isUploadingImage ? 'Enviando...' : 'Trocar Foto'}
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>

                        <div className="text-center sm:text-left mb-2 text-[#FFFFFF]">
                            <h1 className="text-3xl font-black">{profile.name}</h1>
                            <span className="inline-block mt-2 px-3 py-1 bg-[#3B82F6] rounded-full text-sm font-semibold tracking-wide border border-[#FFFFFF]/20">
                                Perfil: {userRole}
                            </span>
                        </div>
                    </div>

                    <div className="p-8">
                        <h2 className="text-xl font-bold text-[#1E3A8A] border-b border-[#F8FAFC] pb-4 mb-6">Credenciais e Segurança</h2>

                        <div className="space-y-6">
                            <div className="p-5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <span className="block text-xs font-bold text-[#0F172A] opacity-60 uppercase tracking-wider mb-1">Endereço de E-mail</span>
                                        <p className="text-[#0F172A] font-medium text-lg">{profile.email}</p>
                                    </div>
                                    {!isEditingEmail && (
                                        <button 
                                            onClick={() => {
                                                setIsEditingEmail(true);
                                                setNewEmail(profile.email);
                                            }} 
                                            className="btn btn-sm bg-[#FFFFFF] border-[#E2E8F0] text-[#3B82F6] hover:bg-[#F8FAFC] hover:border-[#3B82F6]"
                                        >
                                            Alterar E-mail
                                        </button>
                                    )}
                                </div>

                                {isEditingEmail && (
                                    <form onSubmit={handleEmailSubmit} className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-col gap-3">
                                        <div className="form-control">
                                            <input 
                                                type="email" 
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="Digite o novo e-mail" 
                                                required 
                                                className="input input-bordered w-full max-w-md bg-[#FFFFFF] text-[#0F172A] border-[#E2E8F0] focus:ring-2 focus:ring-[#3B82F6]" 
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" className="btn btn-sm bg-[#3B82F6] hover:bg-[#1E3A8A] text-[#FFFFFF] border-none">Salvar Alteração</button>
                                            <button type="button" onClick={() => setIsEditingEmail(false)} className="btn btn-sm btn-ghost text-[#0F172A]">Cancelar</button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            <div className="p-5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <span className="block text-xs font-bold text-[#0F172A] opacity-60 uppercase tracking-wider mb-1">Senha de Acesso</span>
                                        <p className="text-[#0F172A] font-medium text-lg">••••••••••••</p>
                                    </div>
                                    {!isEditingPassword && (
                                        <button 
                                            onClick={() => {
                                                setIsEditingPassword(true);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                            }} 
                                            className="btn btn-sm bg-[#FFFFFF] border-[#E2E8F0] text-[#3B82F6] hover:bg-[#F8FAFC] hover:border-[#3B82F6]"
                                        >
                                            Alterar Senha
                                        </button>
                                    )}
                                </div>

                                {isEditingPassword && (
                                    <form onSubmit={handlePasswordSubmit} className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-col gap-3">
                                        <div className="form-control w-full max-w-md">
                                            <label className="label py-1"><span className="label-text font-semibold text-[#0F172A]">Senha Atual</span></label>
                                            <input 
                                                type="password" 
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required 
                                                className="input input-bordered bg-[#FFFFFF] text-[#0F172A] border-[#E2E8F0] focus:ring-2 focus:ring-[#3B82F6]" 
                                            />
                                        </div>
                                        <div className="form-control w-full max-w-md">
                                            <label className="label py-1"><span className="label-text font-semibold text-[#0F172A]">Nova Senha</span></label>
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required 
                                                className="input input-bordered bg-[#FFFFFF] text-[#0F172A] border-[#E2E8F0] focus:ring-2 focus:ring-[#3B82F6]" 
                                            />
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button type="submit" className="btn btn-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#FFFFFF] border-none">Atualizar Senha</button>
                                            <button type="button" onClick={() => setIsEditingPassword(false)} className="btn btn-sm btn-ghost text-[#0F172A]">Cancelar</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {profile.is_teacher && (
                    <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E2E8F0] p-8">
                        <h2 className="text-xl font-bold text-[#1E3A8A] border-b border-[#F8FAFC] pb-4 mb-6">Administração: Importar Alunos</h2>
                        
                        <div className="p-5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <span className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-1">Importação em Lote (CSV)</span>
                                <p className="text-[#0F172A] text-sm opacity-80">O arquivo deve conter os cabeçalhos exatos: <strong>Nome Completo; RA</strong> separados por ponto e vírgula.</p>
                            </div>
                            
                            <div className="shrink-0">
                                <button 
                                    onClick={() => csvInputRef.current?.click()}
                                    disabled={isUploadingCSV}
                                    className="btn bg-[#3B82F6] hover:bg-[#1E3A8A] text-[#FFFFFF] border-none shadow-md disabled:bg-[#CBD5E1]"
                                >
                                    {isUploadingCSV ? 'Processando...' : 'Carregar CSV'}
                                </button>
                                <input 
                                    type="file" 
                                    ref={csvInputRef} 
                                    onChange={handleCSVUpload} 
                                    accept=".csv" 
                                    className="hidden" 
                                />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
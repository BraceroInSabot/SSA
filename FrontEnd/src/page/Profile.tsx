import { useState, useEffect, useRef } from 'react';
import NavBar from '../components/NavBar/NavBar';
import { api } from '../services/api';
// ATENÇÃO: Verifique se o caminho do seu AuthContext está correto
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
    const { refreshUser } = useAuth(); // Importação vital para manter a NavBar atualizada
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados de UI para os painéis de edição
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingCSV, setIsUploadingCSV] = useState(false);

    // Estados Controlados dos Formulários
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Referências ocultas para os inputs de arquivo
    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/user/info');
            setProfile(response.data);
        } catch (error) {
            alert("Erro ao carregar dados do perfil.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- HANDLERS DE AÇÃO ---
    
    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
            if (refreshUser) await refreshUser(); // Sincroniza o estado global
        } catch (error) {
            alert("Erro ao fazer upload da imagem.");
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newEmail || newEmail === profile?.email) {
            setIsEditingEmail(false);
            return;
        }

        try {
            await api.patch('/user/update/', { email: newEmail });
            await fetchProfile();
            if (refreshUser) await refreshUser(); // Sincroniza o estado global
            setIsEditingEmail(false);
            alert("E-mail alterado com sucesso.");
        } catch (error) {
            alert("Erro ao atualizar o e-mail. Verifique se ele já está em uso.");
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
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
            alert("Senha alterada com sucesso.");
        } catch (error) {
            alert("Erro ao alterar a senha. Verifique se a senha atual está correta ou se a nova senha atende aos requisitos.");
        }
    };

    const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingCSV(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/user/import-students/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(`Importação concluída: ${response.data.criados} alunos criados com sucesso.`);
        } catch (error: any) {
            alert(error.response?.data?.error || "Erro ao processar o arquivo CSV. Verifique a formatação.");
        } finally {
            setIsUploadingCSV(false);
            if (csvInputRef.current) csvInputRef.current.value = '';
        }
    };

    if (isLoading) return <div className="min-h-screen bg-[#F2F5F7] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-[#BC3908]"></span></div>;
    if (!profile) return <div className="min-h-screen bg-[#F2F5F7] flex items-center justify-center">Erro ao carregar perfil.</div>;

    const userRole = profile.is_teacher ? 'Professor' : profile.is_student ? 'Aluno' : 'Usuário';

    return (
        <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
            <NavBar />
            
            <main className="flex-1 p-4 lg:p-10 max-w-4xl mx-auto w-full">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    
                    {/* CABEÇALHO DO PERFIL */}
                    <div className="bg-gradient-to-r from-[#BC3908] to-[#8a2905] px-8 py-10 flex flex-col items-center sm:flex-row sm:items-end gap-6 relative">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                                <img 
                                    src={
                                        profile?.image 
                                            ? profile.image 
                                            : `https://ui-avatars.com/api/?name=${profile?.name}&background=BC3908&color=fff&size=256&bold=true`
                                    }
                                    alt="Foto de Perfil" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingImage}
                                className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full font-bold text-sm"
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

                        <div className="text-center sm:text-left mb-2 text-white">
                            <h1 className="text-3xl font-black">{profile.name}</h1>
                            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm font-semibold tracking-wide backdrop-blur-sm border border-white/30">
                                Perfil: {userRole}
                            </span>
                        </div>
                    </div>

                    {/* CORPO DO PERFIL */}
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4 mb-6">Credenciais e Segurança</h2>

                        <div className="space-y-6">
                            {/* BLOCO: EMAIL */}
                            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Endereço de E-mail</span>
                                        <p className="text-gray-800 font-medium text-lg">{profile.email}</p>
                                    </div>
                                    {!isEditingEmail && (
                                        <button 
                                            onClick={() => {
                                                setIsEditingEmail(true);
                                                setNewEmail(profile.email);
                                            }} 
                                            className="btn btn-sm bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                                        >
                                            Alterar E-mail
                                        </button>
                                    )}
                                </div>

                                {isEditingEmail && (
                                    <form onSubmit={handleEmailSubmit} className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-3">
                                        <div className="form-control">
                                            <input 
                                                type="email" 
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="Digite o novo e-mail" 
                                                required 
                                                className="input input-bordered w-full max-w-md bg-white" 
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" className="btn btn-sm bg-[#621708] hover:bg-black text-white border-none">Salvar Alteração</button>
                                            <button type="button" onClick={() => setIsEditingEmail(false)} className="btn btn-sm btn-ghost">Cancelar</button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* BLOCO: SENHA */}
                            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Senha de Acesso</span>
                                        <p className="text-gray-800 font-medium text-lg">••••••••••••</p>
                                    </div>
                                    {!isEditingPassword && (
                                        <button 
                                            onClick={() => {
                                                setIsEditingPassword(true);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                            }} 
                                            className="btn btn-sm bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                                        >
                                            Alterar Senha
                                        </button>
                                    )}
                                </div>

                                {isEditingPassword && (
                                    <form onSubmit={handlePasswordSubmit} className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-3">
                                        <div className="form-control w-full max-w-md">
                                            <label className="label py-1"><span className="label-text font-semibold">Senha Atual</span></label>
                                            <input 
                                                type="password" 
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required 
                                                className="input input-bordered bg-white" 
                                            />
                                        </div>
                                        <div className="form-control w-full max-w-md">
                                            <label className="label py-1"><span className="label-text font-semibold">Nova Senha</span></label>
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required 
                                                className="input input-bordered bg-white" 
                                            />
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button type="submit" className="btn btn-sm bg-[#F6AA1C] hover:bg-yellow-600 text-white border-none">Atualizar Senha</button>
                                            <button type="button" onClick={() => setIsEditingPassword(false)} className="btn btn-sm btn-ghost">Cancelar</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BLOCO DE ADMINISTRAÇÃO: PROFESSOR */}
                {profile.is_teacher && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4 mb-6">Administração: Importar Alunos</h2>
                        
                        <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <span className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Importação em Lote (CSV)</span>
                                <p className="text-gray-700 text-sm">O arquivo deve conter os cabeçalhos exatos: <strong>Nome Completo; RA</strong> separados por ponto e vírgula.</p>
                            </div>
                            
                            <div className="shrink-0">
                                <button 
                                    onClick={() => csvInputRef.current?.click()}
                                    disabled={isUploadingCSV}
                                    className="btn bg-[#621708] hover:bg-black text-white border-none shadow-md"
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
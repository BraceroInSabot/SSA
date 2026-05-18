import { useState } from 'react';
import EntrarButton from '../Buttons/Entrar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

function NavBar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMinimized, setIsMinimized] = useState(false);

    return (
        <aside className={`bg-[#1E3A8A] min-h-screen shadow-xl sticky top-0 flex flex-col z-50 shrink-0 transition-all duration-300 ${isMinimized ? 'w-20' : 'w-64'}`}>
            {/* Logo and Toggle Area */}
            <div className={`h-20 flex items-center border-b border-white/10 shrink-0 px-4 ${isMinimized ? 'justify-center' : 'justify-between'}`}>
                {!isMinimized && (
                    <button 
                        onClick={() => navigate(isAuthenticated ? '/atividades' : '/')} 
                        className="btn btn-ghost hover:bg-[#1e326b] p-2 rounded-md transition-colors"
                    >
                        <span className="text-white font-black text-3xl tracking-widest">SSA</span>
                    </button>
                )}
                
                <button 
                    onClick={() => setIsMinimized(!isMinimized)} 
                    className="btn btn-ghost btn-sm text-white/80 hover:bg-[#1e326b] hover:text-white p-2"
                    title={isMinimized ? "Expandir" : "Minimizar"}
                >
                    {isMinimized ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Navigation Links */}
            <nav className={`flex-1 py-6 flex flex-col gap-2 ${isMinimized ? 'px-2' : 'px-4'}`}>
                {isAuthenticated && (
                    <>
                        <button 
                            onClick={() => navigate('/atividades')} 
                            className={`btn border-none w-full ${isMinimized ? 'justify-center px-0' : 'justify-start'} ${location.pathname.startsWith('/atividade') || location.pathname === '/atividades' ? 'bg-[#3B82F6] text-white' : 'btn-ghost text-white/80 hover:bg-[#3B82F6]/50 hover:text-white'}`}
                            title={isMinimized ? "Atividades" : undefined}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6 ${!isMinimized && 'mr-2'}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                            {!isMinimized && <span>Atividades</span>}
                        </button>
                        
                        {user?.is_teacher && (
                        <button 
                            onClick={() => navigate('/bimestres')} 
                            className={`btn border-none w-full ${isMinimized ? 'justify-center px-0' : 'justify-start'} ${location.pathname.startsWith('/bimestre') ? 'bg-[#3B82F6] text-white' : 'btn-ghost text-white/80 hover:bg-[#3B82F6]/50 hover:text-white'}`}
                            title={isMinimized ? "Bimestres" : undefined}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6 ${!isMinimized && 'mr-2'}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            {!isMinimized && <span>Bimestres</span>}
                        </button>
                        )}
                    </>
                )}
            </nav>

            {/* User Area - Pushed to Bottom */}
            <div className={`mt-auto flex-none border-t border-white/10 ${isMinimized ? 'p-2' : 'p-4'}`}>
                {isAuthenticated ? (
                    <div className="flex flex-col gap-4">
                        <div className={`flex items-center bg-[#1e326b] rounded-lg ${isMinimized ? 'p-2 justify-center' : 'p-3 gap-3'}`}>
                            <div className="avatar">
                                <div className="w-10 rounded-full border-2 border-[#3B82F6] bg-white">
                                    <img 
                                        src={
                                            user?.image 
                                                ? user.image 
                                                : `https://ui-avatars.com/api/?name=${user?.name}&background=1E3A8A&color=fff&size=256&bold=true`
                                        }
                                        alt="Avatar do Usuário" 
                                    />
                                </div>
                            </div>
                            {!isMinimized && (
                                <span className="text-white font-bold text-sm truncate max-w-[150px] opacity-90">
                                    {user?.name}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <button 
                                onClick={() => navigate('/perfil')} 
                                className={`btn btn-sm ${isMinimized ? 'justify-center px-0' : 'justify-start'} ${location.pathname === '/perfil' ? 'bg-[#3B82F6] text-white border-none' : 'btn-ghost text-white/80 hover:bg-[#3B82F6]/50 hover:text-white'} w-full`}
                                title={isMinimized ? "Meu Perfil" : undefined}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${!isMinimized && 'mr-2'}`}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                {!isMinimized && <span>Meu Perfil</span>}
                            </button>
                            <button 
                                onClick={logout} 
                                className={`btn btn-sm btn-ghost text-red-400 hover:bg-red-500/20 hover:text-red-300 w-full ${isMinimized ? 'justify-center px-0' : 'justify-start'}`}
                                title={isMinimized ? "Sair do Sistema" : undefined}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${!isMinimized && 'mr-2'}`}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                </svg>
                                {!isMinimized && <span>Sair</span>}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center w-full">
                        {!isMinimized ? (
                            <EntrarButton is_navigate={true} />
                        ) : (
                            <button onClick={() => navigate('/')} className="btn btn-circle btn-sm bg-white text-[#1E3A8A] hover:bg-gray-200" title="Entrar">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}

export default NavBar;
import Logo from '../../assets/img/Logo.svg';
import EntrarButton from '../Buttons/Entrar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function NavBar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    console.log(user)

    return (
        <div className="navbar bg-[#BC3908] px-4 md:px-8 h-16 shadow-md sticky top-0 z-50">
            <div className="flex-1">
                <button 
                    onClick={() => navigate(isAuthenticated ? '/' : '/login')} 
                    className="btn btn-ghost hover:bg-transparent p-0"
                >
                    <img src={Logo} alt="Logo" className="w-32 h-10 object-contain" />
                </button>
            </div>

            <div className="flex-none">
                {isAuthenticated ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost rounded-btn gap-3 hover:bg-black/10 transition-colors">
                            <div className="flex flex-col items-end">
                                <span className="text-white font-bold text-sm truncate max-w-[150px]">
                                    {user?.name}
                                </span>
                            </div>
                            
                            <div className="avatar">
                                <div className="w-10 rounded-full border-2 border-[#F6AA1C] bg-white">
                                    <img 
                                        src={
                                        user?.image 
                                            ? `${import.meta.env.VITE_MEDIA_URL || 'http://127.0.0.1:8000'}${user?.image}` 
                                            : ''
                                    }
                                        alt="Avatar do Usuário" 
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-white rounded-box w-52 border border-gray-100 text-gray-700">
                            <li><a onClick={() => navigate('/perfil')} className="hover:text-[#BC3908] font-medium py-3">Meu Perfil</a></li>
                            <div className="divider my-0"></div>
                            <li><a onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold py-3">Sair do Sistema</a></li>
                        </ul>
                    </div>
                ) : (
                    <EntrarButton is_navigate={true} />
                )}
            </div>
        </div>
    );
}

export default NavBar;
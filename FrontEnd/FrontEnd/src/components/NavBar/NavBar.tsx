import Logo from '../../assets/img/Logo.svg'
import EntrarButton from '../Buttons/Entrar' 
import { useAuth } from '../../contexts/AuthContext';

function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  
  console.log(user)

  return (
    <div className="navbar justify-between bg-[#BC3908] p-1 h-[50px] pl-5 pr-5">
        <div className="flex">
            <a href="/login">
                <img src={Logo} alt="Logo" className="w-20 h-20 object-contain" />
            </a>
        </div>
        {isAuthenticated ? (
            <div>
                <div className="flex">
                    <span className="text-white font-bold mr-4 self-center">
                        {user?.name}
                    </span>
                </div>
                <button onClick={logout} className="btn bg-[#F6AA1C] text-white btn-outline">
                    Sair
                </button>
            </div>
        ) : (
            <div className="flex">
                <EntrarButton is_navigate={true} />
            </div>
        )}
    </div>
  )
}

export default NavBar;
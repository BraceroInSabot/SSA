import Logo from '../../assets/img/Logo.svg'
//@ts-ignore
import EntrarButton from '../Buttons/Entrar' 

function NavBar() {
  return (
    <div className="navbar justify-between bg-[#BC3908] p-1 h-50px pl-5 pr-5">
        <div className="flex">
            <a href="/login">
                <img src={Logo} alt="Logo" className="w-20 h-20 object-contain" />
            </a>
        </div>
        <div className="flex">
            <EntrarButton is_navigate={true} />
        </div>
    </div>
  )
}

export default NavBar;
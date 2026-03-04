import '../../assets/css/ButtonsStyle.css';
import { useNavigate } from 'react-router';

interface EntrarButtonProps {
  is_navigate: boolean;
}


function EntrarButton({ is_navigate }: EntrarButtonProps) {
  const navigate = useNavigate();
  
  return (
    <>
      {is_navigate ? (
      <button onClick={() => {navigate('/login')}} className="entrarbtn cursor-pointer bg-[#F6AA1C] flex items-center justify-center text-white font-bold py-2 px-4 rounded">
        Ir para o Login
      </button>
      ) : (
        <button onClick={() => {navigate('/login')}} className="entrarbtn cursor-pointer bg-[#F6AA1C] flex items-center justify-center text-white font-bold py-2 px-4 rounded">
        Entrar
      </button>
      )} 
    </>
  )
}

export default EntrarButton;
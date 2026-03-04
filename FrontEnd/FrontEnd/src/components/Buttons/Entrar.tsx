import '../../assets/css/ButtonsStyle.css';
import { useNavigate } from 'react-router';

interface EntrarButtonProps {
  is_navigate: boolean;
  type?: "button" | "submit";
}

function EntrarButton({ is_navigate, type = "button" }: EntrarButtonProps) {
  const navigate = useNavigate();
  
  if (is_navigate) {
      return (
        <button 
          type="button"
          onClick={() => navigate('/login')} 
          className="entrarbtn cursor-pointer bg-[#F6AA1C] flex items-center justify-center text-white font-bold py-2 px-4 rounded"
        >
          Ir para o Login
        </button>
      );
  }

  return (
    <button 
      type={type} 
      className="entrarbtn cursor-pointer bg-[#F6AA1C] flex items-center justify-center text-white font-bold py-2 px-4 rounded"
    >
      Entrar
    </button>
  );
}

export default EntrarButton;
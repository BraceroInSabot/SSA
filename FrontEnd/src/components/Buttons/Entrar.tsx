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
          onClick={() => navigate('/')} 
          className="entrarbtn cursor-pointer bg-[#3B82F6] hover:bg-[#2563EB] flex items-center justify-center text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-1"
        >
          Ir para o Login
        </button>
      );
  }

  return (
    <button 
      type={type} 
      className="entrarbtn cursor-pointer bg-[#3B82F6] hover:bg-[#2563EB] flex items-center justify-center text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-1"
    >
      Entrar
    </button>
  );
}

export default EntrarButton;
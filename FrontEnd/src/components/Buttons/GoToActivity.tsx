import '../../assets/css/ButtonsStyle.css';
import { useNavigate } from 'react-router';

function GoToActivity() {
  const navigate = useNavigate();
  return (
    <div>
        <button 
            type="button" 
            onClick={() => {navigate('/atividades')}} 
            className="entrarbtn cursor-pointer bg-transparent border border-[#3B82F6] hover:bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6] font-semibold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-1"
        >
            Atividades
        </button>
    </div>
  )
}

export default GoToActivity;
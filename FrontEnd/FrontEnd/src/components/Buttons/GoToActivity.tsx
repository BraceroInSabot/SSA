import '../../assets/css/ButtonsStyle.css';
import { useNavigate } from 'react-router';

function GoToActivity() {
  const navigate = useNavigate();
  return (
    <div>
        <button onClick={() => {navigate('/atividades')}} className="entrarbtn cursor-pointer bg-[#621708] flex items-center justify-center text-white font-bold py-2 px-4 rounded">
            Atividades
        </button>
    </div>
  )
}

export default GoToActivity;
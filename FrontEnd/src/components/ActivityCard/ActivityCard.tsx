import { useNavigate } from 'react-router-dom';
import { type Activity } from '../../types/Activity';
import { formatDateTime } from '../../utils/DateFormatter';
import { useEffect, useState } from 'react';

interface ActivityCardProps {
    activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
    const [isDraft, setIsDraft] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        new Date(activity.due_date) < new Date() ? setIsValid(false) : setIsValid(true);
        activity.status === 'DRF' ? setIsDraft(true) : setIsDraft(false);
    }, [isValid])

    return (
        <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body flex-col sm:flex-row justify-between items-start sm:items-center p-6 gap-4">
                <div className="flex-1">
                    <h3 className="card-title text-lg text-gray-800">{activity.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Prazo
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                            {formatDateTime(activity.due_date)}
                        </span>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Nota Total
                        </span>
                        <span className="text-xl font-bold text-indigo-600">
                            {activity.total_grade !== null ? String(activity.total_grade) : '-'}
                        </span>
                    </div>

                    <span className={`badge border-none 
                        ${
                            isDraft ? 'bg-yellow-100 text-yellow-800' :
                            !isValid ? 'bg-red-100 text-red-800' : 
                            activity.is_active ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'}
                        `}>
                        {
                            isDraft ? 'Não publicada' :
                            new Date(activity.due_date) < new Date() ? 'Vencida' :
                            activity.is_active ? 'Ativa' : 'Inativa'
                        }
                    </span>

                    <button 
                        onClick={() => navigate(`/atividade/consulta/${activity.activity_id}`)}
                        className="btn btn-ghost btn-circle btn-sm text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
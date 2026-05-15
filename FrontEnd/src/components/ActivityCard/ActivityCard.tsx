import { useNavigate } from 'react-router-dom';
import { type Activity } from '../../types/Activity';
import { formatDateTime } from '../../utils/DateFormatter';
import { useEffect, useState } from 'react';

interface ActivityCardProps {
    activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
    const [isDraft, setIsDraft] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsExpired(new Date(activity.due_date) < new Date());
        setIsDraft(activity.status === 'DRF');
    }, [activity]);

    const getActivityTypeLabel = (type: string) => {
        switch (type) {
            case 'TST': return 'Avaliação';
            case 'FIL': return 'Envio de Arquivo';
            case 'LAB': return 'Laboratório Prático';
            case 'PRJ': return 'Projeto';
            case 'ATV': return 'Atividade Convencional';
            default: return 'Atividade';
        }
    };

    return (
        <div className="card bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div className="card-body p-5 md:p-6 flex flex-col md:flex-row justify-between gap-6">
                
                {/* INFO COLUMN */}
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-1 bg-[#F8FAFC] border border-gray-200 text-gray-600 rounded-md uppercase tracking-wider">
                            {getActivityTypeLabel(activity.activity_type)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider
                            ${isDraft ? 'bg-[#FEF3C7] text-[#92400E]' : 
                              isExpired ? 'bg-[#FEE2E2] text-[#991B1B]' : 
                              activity.is_active ? 'bg-[#DCFCE7] text-[#166534]' : 
                              'bg-gray-100 text-gray-600'}
                        `}>
                            {isDraft ? 'Rascunho' : isExpired ? 'Encerrada' : activity.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#0F172A] leading-tight">
                        {activity.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {activity.description || "Nenhuma descrição fornecida."}
                    </p>
                </div>

                {/* METRICS & ACTION COLUMN */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <div className="flex flex-row md:flex-col justify-between w-full md:w-auto gap-4 md:gap-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 md:mb-0">
                                Prazo de Entrega
                            </span>
                            <span className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-[#0F172A]'}`}>
                                {formatDateTime(activity.due_date)}
                            </span>
                        </div>

                        <div className="flex flex-col md:mt-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 md:mb-0">
                                Valor Total
                            </span>
                            <span className="text-lg font-black text-[#3B82F6]">
                                {activity.total_grade !== null ? `${String(activity.total_grade)} pts` : '-'}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate(`/atividade/consulta/${activity.activity_id}`)}
                        className="btn w-full md:w-auto bg-[#3B82F6] hover:bg-blue-700 text-white border-none shadow-sm px-8"
                    >
                        Acessar
                    </button>
                </div>
            </div>
        </div>
    );
}
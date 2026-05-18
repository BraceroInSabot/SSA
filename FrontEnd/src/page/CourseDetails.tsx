import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';
import { retrieveCourse, updateCourse, deleteCourse, getCourseAnalytics } from '../services/CourseCrud';
import type { Course } from '../types/Courses';

export default function CourseDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState<Course | null>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteConfirmStep, setDeleteConfirmStep] = useState(1);

    useEffect(() => {
        if (id) {
            loadCourseData(id);
        }
    }, [id]);

    const loadCourseData = async (courseId: string) => {
        setLoading(true);
        try {
            const courseData = await retrieveCourse(courseId);
            setCourse(courseData);
            const analyticsData = await getCourseAnalytics(courseId);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error("Error loading course details:", error);
            alert("Erro ao carregar detalhes do curso.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!course) return;
        const newStatus = !course.is_active;
        const actionText = newStatus ? "Reativar" : "Desativar";
        
        if (!newStatus) {
            const confirm = window.confirm(`Deseja realmente desativar o curso ${course.course_name}? Ele será ocultado das listagens ativas, mas o histórico será preservado.`);
            if (!confirm) return;
        }
        
        try {
            await updateCourse(course.course_id, { is_active: newStatus });
            setCourse({ ...course, is_active: newStatus });
        } catch (error) {
            console.error(`Error toggling course status:`, error);
            alert(`Erro ao ${actionText.toLowerCase()} o curso.`);
        }
    };

    const handleOpenDelete = () => {
        setDeleteConfirmStep(1);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirmStep === 1) {
            setDeleteConfirmStep(2);
            return;
        }
        if (course && deleteConfirmStep === 2) {
            try {
                await deleteCourse(course.course_id);
                setDeleteModalOpen(false);
                navigate('/bimestres'); // Redirect after deletion
            } catch (error) {
                console.error("Error deleting course:", error);
                alert("Erro ao excluir curso permanentemente.");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex bg-[#F8FAFC] min-h-screen">
                <NavBar />
                <main className="flex-1 p-8 flex justify-center items-center">
                    <span className="loading loading-spinner loading-lg text-[#3B82F6]"></span>
                </main>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex bg-[#F8FAFC] min-h-screen">
                <NavBar />
                <main className="flex-1 p-8">
                    <h1 className="text-2xl font-bold text-red-600">Curso não encontrado.</h1>
                </main>
            </div>
        );
    }

    return (
        <div className="flex bg-[#F8FAFC] min-h-screen">
            <NavBar />
            <main className="flex-1 p-4 lg:p-8 max-w-[1400px] mx-auto overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
                            {course.course_name}
                            {!course.is_active && <span className="badge badge-error gap-1 text-white">Desativado</span>}
                        </h1>
                        <p className="text-gray-500 mt-1">Ano: {course.course_year}</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleToggleActive} 
                            className={`btn ${course.is_active ? 'btn-warning' : 'btn-success text-white'}`}
                        >
                            {course.is_active ? 'Desativar Curso' : 'Reativar Curso'}
                        </button>
                        <button 
                            onClick={handleOpenDelete} 
                            className="btn btn-error text-white"
                        >
                            Excluir Permanentemente
                        </button>
                    </div>
                </div>

                {analytics && (
                    <div className="flex flex-col gap-8">
                        {/* Highlights Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card bg-white shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center">
                                <h3 className="text-lg font-semibold text-gray-500 mb-2">Média Global do Curso</h3>
                                <div className="text-5xl font-black text-[#3B82F6]">
                                    {analytics.global_average}%
                                </div>
                                <p className="text-sm text-gray-400 mt-2">Aproveitamento total consolidado</p>
                            </div>
                            <div className="card bg-white shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center">
                                <h3 className="text-lg font-semibold text-gray-500 mb-2">Total de Atividades Ativas</h3>
                                <div className="text-5xl font-black text-[#1E3A8A]">
                                    {analytics.total_activities}
                                </div>
                                <p className="text-sm text-gray-400 mt-2">Atividades cadastradas e visíveis</p>
                            </div>
                        </div>

                        {/* Activities Analytics & List */}
                        <div className="card bg-white shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Desempenho por Atividade</h2>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-700">
                                            <th>Atividade</th>
                                            <th className="text-center">Envios</th>
                                            <th className="text-center">Média / Valor</th>
                                            <th className="text-center">Acertos</th>
                                            <th className="text-center">Erros</th>
                                            <th className="text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.activities_metrics.map((act: any) => (
                                            <tr key={act.activity_id} className="hover">
                                                <td className="font-medium">{act.name}</td>
                                                <td className="text-center">{act.submission_count}</td>
                                                <td className="text-center">
                                                    <span className="font-bold">{act.average_grade}</span> / {act.total_grade}
                                                </td>
                                                <td className="text-center">
                                                    <span className="text-green-600 font-semibold">{act.hit_rate}%</span>
                                                </td>
                                                <td className="text-center">
                                                    <span className="text-red-500 font-semibold">{act.miss_rate}%</span>
                                                </td>
                                                <td className="text-right">
                                                    <button 
                                                        onClick={() => navigate(`/atividade/${act.activity_id}/avaliar`)}
                                                        className="btn btn-sm btn-outline text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white"
                                                    >
                                                        Avaliar Submissões
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {analytics.activities_metrics.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="text-center py-4 text-gray-500">Nenhuma atividade vinculada a este curso.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Engagement Ranking */}
                        <div className="card bg-white shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Engajamento dos Alunos (Ranking)</h2>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-700">
                                            <th>Posição</th>
                                            <th>Aluno</th>
                                            <th className="text-center">Submissões Realizadas</th>
                                            <th className="text-center">Pendências</th>
                                            <th className="text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.engagement_ranking.map((student: any, index: number) => (
                                            <tr key={student.student_id} className="hover">
                                                <td className="font-bold text-gray-500">#{index + 1}</td>
                                                <td className="font-medium flex items-center gap-3">
                                                    <div className="avatar placeholder">
                                                        <div className="bg-neutral text-neutral-content rounded-full w-8">
                                                            <span className="text-xs">{student.student_name.charAt(0)}</span>
                                                        </div>
                                                    </div>
                                                    {student.student_name}
                                                </td>
                                                <td className="text-center font-semibold text-[#1E3A8A]">{student.submissions}</td>
                                                <td className="text-center text-red-500 font-semibold">{student.pendencies}</td>
                                                <td className="text-center">
                                                    {student.pendencies === 0 ? (
                                                        <span className="badge badge-success text-white">Em dia</span>
                                                    ) : (
                                                        <span className="badge badge-warning text-white">Pendente</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {analytics.engagement_ranking.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4 text-gray-500">Nenhum dado de engajamento disponível.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box border-t-4 border-red-500">
                        <h3 className="font-bold text-xl text-red-600 mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Excluir Curso Permanentemente
                        </h3>
                        {deleteConfirmStep === 1 ? (
                            <>
                                <p className="mb-4 text-gray-700">Tem certeza que deseja excluir o curso <strong>{course.course_name}</strong>?</p>
                                <div className="alert alert-warning shadow-sm mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <div>
                                        <h3 className="font-bold">Atenção!</h3>
                                        <div className="text-sm">Esta ação removerá todas as atividades exclusivas deste curso e todas as métricas não poderão ser recuperadas.</div>
                                    </div>
                                </div>
                                <div className="modal-action">
                                    <button className="btn btn-ghost text-gray-600" onClick={() => setDeleteModalOpen(false)}>Cancelar</button>
                                    <button className="btn btn-error text-white" onClick={handleConfirmDelete}>Estou ciente, continuar</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="mb-4 text-gray-700">Para confirmar a <strong>perda irrecuperável</strong> dos dados deste curso, clique em Confirmar Exclusão Definitiva.</p>
                                <div className="modal-action">
                                    <button className="btn btn-ghost text-gray-600" onClick={() => setDeleteModalOpen(false)}>Cancelar</button>
                                    <button className="btn btn-error text-white" onClick={handleConfirmDelete}>Confirmar Exclusão Definitiva</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

import { useRef, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { createCourse } from '../../../services/CourseCrud';
import { type Course } from '../../../types/Courses';

interface AsideMenuProps {
    courses: Course[];
    selectedCourseId: string | null;
    onCourseSelected: (id: string) => void;
    onCourseCreated: () => void;
}

function AsideMenu({ courses, selectedCourseId, onCourseSelected, onCourseCreated }: AsideMenuProps) {
    const { user } = useAuth();
    const modalRef = useRef<HTMLDialogElement>(null);

    const [courseName, setCourseName] = useState('');
    const [courseYear, setCourseYear] = useState(new Date().getFullYear());
    const [color, setColor] = useState('#621708');
    const [isLoading, setIsLoading] = useState(false);

    const openModal = () => modalRef.current?.showModal();
    
    const closeModal = () => {
        modalRef.current?.close();
        setCourseName('');
        setCourseYear(new Date().getFullYear());
        setColor('#621708');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await createCourse({ course_name: courseName, course_year: courseYear.toString(), color });
            onCourseCreated();
            closeModal();
        } catch (error) {
            console.error("Falha ao criar curso", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <aside className="w-full lg:w-1/4 bg-[#621708] rounded-xl shadow-md p-4 text-white">
            <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-xl font-bold">Cursos Ativos</h2>
                
                {user?.is_teacher && (
                    <button 
                        type="button" 
                        onClick={openModal} 
                        className="cursor-pointer bg-[#F6AA1C] hover:bg-yellow-600 transition-colors flex items-center justify-center text-white font-bold py-1 px-3 rounded text-sm"
                    >
                        Criar Curso
                    </button>
                )}
            </div>

            <ul className="menu w-full text-base-content">
                {courses.map((course) => {
                    
                    return (
                        <li key={course.course_id || Math.random()}> 
                            <a 
                                className={selectedCourseId === course.course_id ? "active font-bold text-white bg-white/20" : "hover:bg-white/10 text-gray-300"}
                                onClick={() => {
                                    onCourseSelected(course.course_id);
                                }}
                            >
                                {course.course_name}
                            </a>
                        </li>
                    );
                })}
            </ul>

            <dialog ref={modalRef} className="modal text-gray-800">
                <div className="modal-box bg-white">
                    <h3 className="font-bold text-lg mb-6">Registrar Novo Curso</h3>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Nome do Curso</span>
                            </label>
                            <input 
                                type="text" 
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="Ex: Processos Ágeis" 
                                className="input input-bordered w-full bg-gray-50" 
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="label">
                                    <span className="label-text font-medium text-gray-700">Ano</span>
                                </label>
                                <input 
                                    type="number" 
                                    value={courseYear}
                                    onChange={(e) => setCourseYear(Number(e.target.value))}
                                    className="input input-bordered w-full bg-gray-50" 
                                    required
                                />
                            </div>

                            <div className="w-1/3">
                                <label className="label">
                                    <span className="label-text font-medium text-gray-700">Cor (Hex)</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="color" 
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="h-12 w-full cursor-pointer rounded-md border border-gray-300" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-action mt-6">
                            <button 
                                type="button" 
                                onClick={closeModal} 
                                className="btn btn-ghost"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn bg-[#621708] hover:bg-red-900 text-white border-none"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Salvando...' : 'Salvar Curso'}
                            </button>
                        </div>
                    </form>
                </div>
                
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeModal}>close</button>
                </form>
            </dialog>
        </aside>
    );
}

export default AsideMenu;
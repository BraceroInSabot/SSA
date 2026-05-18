import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar/NavBar';
import type { Bimestre } from '../types/Bimestre';
import type { Course } from '../types/Courses';
import { listBimestres, createBimestre, updateBimestre, deleteBimestre } from '../services/BimestreCrud';
import { listCourses } from '../services/CourseCrud';

export default function Bimestres() {
    const [bimestres, setBimestres] = useState<Bimestre[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBimestre, setEditingBimestre] = useState<Bimestre | null>(null);
    const [formData, setFormData] = useState({ name: '', year: new Date().getFullYear(), courses: [] as string[] });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bimestreToDelete, setBimestreToDelete] = useState<Bimestre | null>(null);
    const [deleteConfirmStep, setDeleteConfirmStep] = useState(1);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [bims, crs] = await Promise.all([listBimestres(), listCourses()]);
            setBimestres(bims);
            setCourses(crs);
        } catch (error) {
            console.error("Error loading data:", error);
            alert("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (bimestre?: Bimestre) => {
        if (bimestre) {
            setEditingBimestre(bimestre);
            setFormData({ name: bimestre.name, year: bimestre.year, courses: bimestre.courses });
        } else {
            setEditingBimestre(null);
            setFormData({ name: '', year: new Date().getFullYear(), courses: [] });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBimestre(null);
    };

    const handleCourseToggle = (courseId: string) => {
        setFormData(prev => {
            if (prev.courses.includes(courseId)) {
                return { ...prev, courses: prev.courses.filter(id => id !== courseId) };
            } else {
                return { ...prev, courses: [...prev.courses, courseId] };
            }
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBimestre) {
                await updateBimestre(editingBimestre.id, formData);
            } else {
                await createBimestre(formData);
            }
            handleCloseModal();
            loadData();
        } catch (error) {
            console.error("Error saving:", error);
            alert("Erro ao salvar o bimestre.");
        }
    };

    const handleOpenDelete = (bimestre: Bimestre) => {
        setBimestreToDelete(bimestre);
        setDeleteConfirmStep(1);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirmStep === 1) {
            setDeleteConfirmStep(2);
            return;
        }
        if (bimestreToDelete && deleteConfirmStep === 2) {
            try {
                await deleteBimestre(bimestreToDelete.id);
                setDeleteModalOpen(false);
                loadData();
            } catch (error) {
                console.error("Error deleting:", error);
                alert("Erro ao excluir bimestre.");
            }
        }
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <NavBar />
            <main className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#1E3A8A]">Gerenciar Bimestres</h1>
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="btn bg-[#3B82F6] hover:bg-[#2563EB] text-white border-none"
                    >
                        Novo Bimestre
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center"><span className="loading loading-spinner loading-lg text-[#3B82F6]"></span></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bimestres.map(bimestre => (
                            <div key={bimestre.id} className="card bg-white shadow-lg p-6 rounded-xl border border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">{bimestre.name} - {bimestre.year}</h2>
                                <p className="text-gray-600 mb-4">
                                    Matérias vinculadas: {bimestre.courses.length}
                                </p>
                                <div className="flex gap-2 mt-auto">
                                    <button 
                                        onClick={() => handleOpenModal(bimestre)} 
                                        className="btn btn-sm btn-outline text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleOpenDelete(bimestre)} 
                                        className="btn btn-sm btn-outline text-red-500 hover:bg-red-500 hover:text-white"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                        {bimestres.length === 0 && (
                            <p className="text-gray-500 col-span-full">Nenhum bimestre encontrado.</p>
                        )}
                    </div>
                )}
            </main>
            {isModalOpen && (
                <div className="modal modal-open bg-black/50">
                    <div className="modal-box w-11/12 max-w-3xl bg-white text-gray-800 shadow-2xl border border-gray-100">
                        <h3 className="font-bold text-xl mb-4 text-gray-900">{editingBimestre ? 'Editar Bimestre' : 'Novo Bimestre'}</h3>
                        <form onSubmit={handleSave} className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className="form-control flex-1">
                                    <label className="label"><span className="label-text font-semibold text-gray-600">Nome do Bimestre</span></label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="input input-bordered w-full bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                        value={formData.name} 
                                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                        placeholder="Ex: 1º Bimestre"
                                    />
                                </div>
                                <div className="form-control w-1/3">
                                    <label className="label"><span className="label-text font-semibold text-gray-600">Ano</span></label>
                                    <input 
                                        type="number" 
                                        required 
                                        className="input input-bordered w-full bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                        value={formData.year} 
                                        onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} 
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2 text-gray-800">Vincular Matérias (Ano {formData.year})</h4>
                                <p className="text-sm text-gray-500 mb-3">Selecione as matérias que farão parte deste bimestre. Apenas matérias do mesmo ano letivo são exibidas.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                                    {courses.filter(c => Number(c.course_year) === formData.year).map(course => (
                                        <label key={course.course_id} className="cursor-pointer flex items-center gap-3 p-2 hover:bg-gray-200 rounded transition-colors">
                                            <input 
                                                type="checkbox" 
                                                className="checkbox checkbox-primary" 
                                                checked={formData.courses.includes(course.course_id)}
                                                onChange={() => handleCourseToggle(course.course_id)}
                                            />
                                            <span className="label-text font-medium text-gray-700">{course.course_name}</span>
                                        </label>
                                    ))}
                                    {courses.filter(c => Number(c.course_year) === formData.year).length === 0 && (
                                        <p className="text-gray-400 italic p-2 text-sm">Nenhuma matéria encontrada para o ano {formData.year}.</p>
                                    )}
                                </div>
                            </div>

                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost text-gray-500 hover:bg-gray-100" onClick={handleCloseModal}>Cancelar</button>
                                <button type="submit" className="btn bg-[#3B82F6] hover:bg-[#2563EB] text-white border-none shadow-md">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-xl text-red-600 mb-4">Excluir Bimestre</h3>
                        {deleteConfirmStep === 1 ? (
                            <>
                                <p className="mb-4">Tem certeza que deseja excluir o bimestre <strong>{bimestreToDelete?.name}</strong>?</p>
                                <div className="alert alert-warning">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <span><strong>Atenção:</strong> Ao excluir este bimestre, todas as matérias associadas serão desvinculadas automaticamente.</span>
                                </div>
                                <div className="modal-action mt-6">
                                    <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Cancelar</button>
                                    <button className="btn btn-error text-white" onClick={handleConfirmDelete}>Continuar</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="mb-4">Para confirmar a exclusão e o <strong>desvínculo automático de {bimestreToDelete?.courses.length} matérias</strong>, clique em Confirmar Exclusão.</p>
                                <div className="modal-action">
                                    <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Cancelar</button>
                                    <button className="btn btn-error text-white" onClick={handleConfirmDelete}>Confirmar Exclusão</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

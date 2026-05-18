import { useState, useEffect } from 'react';
import NavBar from "../components/NavBar/NavBar";
import MainMenu from '../components/Activity/MainMenu/MainMenu';
import { listActivities } from '../services/ActivityCrud';
import { listBimestres } from '../services/BimestreCrud';
import { listCourses } from '../services/CourseCrud';
import type { Bimestre } from '../types/Bimestre';
import type { Course } from '../types/Courses';

function Activities() {
    const [bimestres, setBimestres] = useState<Bimestre[]>([]);
    const [selectedBimestreId, setSelectedBimestreId] = useState<string | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [activityNameFilter, setActivityNameFilter] = useState('');
    const [activities, setActivities] = useState<any[]>([]);

    const fetchBimestres = async () => {
        try {
            const response = await listBimestres();
            // Sort by newest year, then by name
            const sorted = response.sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));
            setBimestres(sorted);
            
            if (sorted.length > 0 && !selectedBimestreId) {
                const currentYear = new Date().getFullYear();
                const currentYearBimestres = sorted.filter(b => b.year === currentYear);
                
                if (currentYearBimestres.length > 0) {
                    setSelectedBimestreId(currentYearBimestres[0].id);
                } else {
                    setSelectedBimestreId(sorted[0].id);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await listCourses();
            setCourses(response);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchActivities = async () => {
        if (!selectedBimestreId) return;
        try {
            const response = await listActivities({
                bimestre_id: selectedBimestreId,
                course_id: selectedCourseId || undefined,
                name: activityNameFilter
            });
            setActivities(response);
        } catch (error) {
            console.error(error);
            setActivities([]);
        }
    };

    useEffect(() => {
        fetchBimestres();
        fetchCourses();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (selectedBimestreId) {
                fetchActivities();
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [selectedBimestreId, selectedCourseId, activityNameFilter]);

    const handleActivityCreated = () => {
        if (selectedBimestreId) {
            fetchActivities();
        }
    };

    return (
        <div className="flex flex-row min-h-screen bg-[#F8FAFC]">
            <NavBar />
            
            <div className="flex-1 flex flex-col gap-6 p-4 lg:p-10 max-w-[1080px] mx-auto w-full">
                {/* Filtros Container */}
                <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                    <div className="flex-1 w-full md:w-auto">
                        <label className="label">
                            <span className="label-text font-bold text-gray-700">Selecione o Bimestre</span>
                        </label>
                        <select 
                            className="select select-bordered w-full md:max-w-xs bg-gray-50"
                            value={selectedBimestreId || ''}
                            onChange={(e) => setSelectedBimestreId(e.target.value)}
                        >
                            {bimestres.map(b => (
                                <option key={b.id} value={b.id}>{b.name} - {b.year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 w-full md:w-auto">
                        <label className="label">
                            <span className="label-text font-bold text-gray-700">Selecione a Turma</span>
                        </label>
                        <select 
                            className="select select-bordered w-full md:max-w-xs bg-gray-50"
                            value={selectedCourseId || ''}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                        >
                            <option value="">Todas as Turmas</option>
                            {courses.map(c => (
                                <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 w-full md:w-auto">
                        <label className="label">
                            <span className="label-text font-bold text-gray-700">Buscar Atividade</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="Nome da atividade..." 
                            className="input input-bordered w-full bg-gray-50" 
                            value={activityNameFilter}
                            onChange={(e) => setActivityNameFilter(e.target.value)}
                        />
                    </div>
                </div>
                
                <MainMenu 
                    activities={activities} 
                    selectedCourseId={selectedBimestreId} // Passed to bypass "Select a course" check in MainMenu
                    onActivityCreated={handleActivityCreated}
                /> 
            </div>
        </div>
    );
}

export default Activities;
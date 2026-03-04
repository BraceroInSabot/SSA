import { useState, useEffect } from 'react';
import NavBar from "../components/NavBar/NavBar";
import AsideMenu from '../components/Activity/AsideMenu/AsideMenu';
import MainMenu from '../components/Activity/MainMenu/MainMenu';

// 1. Defina os contratos de dados que o backend vai te entregar
interface Course {
    id: string; // UUID é string, não número
    name: string;
}

interface ActivityItem {
    id: string;
    title: string;
    description: string;
    grade: number | null;
}

function Activity() {
    // 2. Tipagem estrita no estado. Sem 'never[]'
    const [courses, setCourses] = useState<Course[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    // 3. Centralização da lógica de busca para que o AsideMenu possa chamá-la de novo
    const fetchCourses = async () => {
        // TODO: Substituir pelo Axios -> const response = await api.get('/courses/'); setCourses(response.data);
        
        // Mock provisório com a tipagem exata do backend
        setCourses([
            { id: "123e4567-e89b-12d3-a456-426614174000", name: "Processos Ágeis" },
            { id: "123e4567-e89b-12d3-a456-426614174001", name: "Arquitetura de Software" },
            { id: "123e4567-e89b-12d3-a456-426614174002", name: "Engenharia de Dados" }
        ]);
    };

    const fetchActivities = async () => {
        // TODO: Chamada real da API depois
        setActivities([
            { id: "act-01", title: "Atividade 1", description: "Modelagem de banco de dados relacional.", grade: 1 },
            { id: "act-02", title: "Atividade 2", description: "Implementação de CI/CD com GitHub Actions.", grade: null },
            { id: "act-03", title: "Atividade 3", description: "Estruturação de API RESTful em Django.", grade: 2 }
        ]);
    };

    useEffect(() => {
        fetchCourses();
        fetchActivities();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
            <NavBar />
            
            <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-10">
                <AsideMenu 
                    courses={courses} 
                    onCourseCreated={fetchCourses} 
                />
                
                {/* ATENÇÃO: Você precisará refatorar o MainMenu para aceitar 
                  a prop em inglês 'activities' e a tipagem correta. 
                */}
                <MainMenu atividades={activities} /> 
            </div>
        </div>
    );
}

export default Activity;
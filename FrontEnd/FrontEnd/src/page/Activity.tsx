import { useState, useEffect } from 'react';
import NavBar from "../components/NavBar/NavBar";
import AsideMenu from '../components/Activity/AsideMenu/AsideMenu';
import MainMenu from '../components/Activity/MainMenu/MainMenu';

const mockCursos = [
    { id: 1, nome: "Processo de Desenvolvimento e Metodologias Ágeis" },
    { id: 2, nome: "Arquitetura de Software" },
    { id: 3, nome: "Engenharia de Dados" }
];

const mockAtividades = [
    { id: 101, titulo: "Atividade 1", descricao: "Modelagem de banco de dados relacional.", nota: 1 },
    { id: 102, titulo: "Atividade 2", descricao: "Implementação de CI/CD com GitHub Actions.", nota: null },
    { id: 103, titulo: "Atividade 3", descricao: "Estruturação de API RESTful em Django.", nota: 2 }
];

function Activity() {
    const [cursos, setCursos] = useState([]);
    const [atividades, setAtividades] = useState([]);

    useEffect(() => {
        setCursos(mockCursos);
        setAtividades(mockAtividades);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
            <NavBar />
            
            <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-10">
                
                <AsideMenu cursos={cursos} />
                <MainMenu atividades={atividades} />
            </div>
        </div>
    );
}

export default Activity;
import { useState, useEffect } from 'react';
import NavBar from "../components/NavBar/NavBar";

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
                <aside className="w-full lg:w-1/4 bg-[#621708] rounded-xl shadow-md p-4 text-white">
                    <h2 className="text-xl font-bold mb-4 px-4">Cursos Ativos</h2>
                    <ul className="menu w-full">
                        {cursos.map((curso) => (
                            <li key={curso.id}>
                                <a className="hover:bg-white/10 active:bg-white/20">{curso.nome}</a>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="w-full lg:w-3/4 flex flex-col gap-4">
                    {atividades.map((atividade) => (
                        <div key={atividade.id} className="card bg-white shadow-sm border border-gray-200">
                            <div className="card-body flex-col sm:flex-row justify-between items-start sm:items-center p-6">
                                <div>
                                    <h3 className="card-title text-lg text-gray-800">{atividade.titulo}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{atividade.descricao}</p>
                                </div>
                                <div className="mt-4 sm:mt-0 flex flex-col items-end">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Nota Total
                                    </span>
                                    <span className="text-2xl font-bold text-indigo-600">
                                        {atividade.nota !== null ? atividade.nota : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
}

export default Activity;
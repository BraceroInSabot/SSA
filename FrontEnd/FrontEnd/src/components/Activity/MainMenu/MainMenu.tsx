interface MainMenuProps {
    atividades: { id: number; titulo: string; descricao: string; nota: number | null }[];
}

function MainMenu({ atividades }: MainMenuProps) {
    return (
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
    )
}

export default MainMenu;
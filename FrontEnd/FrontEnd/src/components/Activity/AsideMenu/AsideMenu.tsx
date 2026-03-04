interface AsideMenuProps {
    cursos: { id: number; nome: string }[];
}
function AsideMenu({cursos}: AsideMenuProps) {
    return (
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
    )
}

export default AsideMenu;
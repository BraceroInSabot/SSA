import LoginForm from "../components/LoginForm/LoginForm";

function Login() {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
            {/* Seção Institucional - Esquerda (oculta em telas pequenas) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1E3A8A] flex-col justify-between p-12 lg:p-20 text-white relative overflow-hidden">
                {/* Elementos visuais de fundo para dar tom profissional e moderno */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white blur-[100px]"></div>
                    <div className="absolute bottom-10 -right-20 w-[400px] h-[400px] rounded-full bg-[#3B82F6] blur-[100px]"></div>
                </div>

                <div className="z-10">
                    <div className="text-6xl font-bold tracking-wider mb-2">SSA</div>
                </div>

                <div className="z-10 max-w-xl">
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                        Gestão educacional <br />
                        <span className="text-[#3B82F6]">inteligente</span> e segura.
                    </h1>
                    <p className="text-lg opacity-80 leading-relaxed mb-10">
                        Plataforma do ensino técnico. Crie, distribua e corrija avaliações.
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-lg backdrop-blur-sm border border-white/5 shadow-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
                            <span className="text-sm font-semibold">Auto-Correção</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-lg backdrop-blur-sm border border-white/5 shadow-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
                            <span className="text-sm font-semibold">Ciclo de Vida Seguro</span>
                        </div>
                    </div>
                </div>

                <div className="z-10 text-sm opacity-60 font-medium">
                    &copy; {new Date().getFullYear()} SSA. Todos os direitos reservados.
                </div>
            </div>

            {/* Seção de Login - Direita */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-[#F8FAFC]">
                <LoginForm />
            </div>
        </div>
    );
}

export default Login;

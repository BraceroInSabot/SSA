import NavBar from "../components/NavBar/NavBar";
import LoginForm from "../components/LoginForm/LoginForm";
import '../assets/css/Login.css';

function Login() {
    return (
        <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
            <NavBar />
            
            <LoginForm />
        </div>
    );
}

export default Login;
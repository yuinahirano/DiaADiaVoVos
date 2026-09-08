import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ReturnButton() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    return (
        <button
            className={`btn btn-${theme === "light" ? "dark" : "light"} mb-3 d-flex align-items-center gap-2`}
            onClick={() => navigate(-1)}
        >
            <ArrowLeft size={18} />
            Voltar
        </button>
    )
}
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import logoImg from "../assets/logo_DiaADia.png";

export default function PaginaLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await login(email, senha);

      const role = user?.role || user?.tipo || localStorage.getItem("userRole");

      if (role === "cuidador") {
        navigate("/home-cuidador");
      } else if (role === "idoso") {
        navigate("/home-idoso");
      } else {
        navigate("/tipo-usuario");
      }
    } catch (error) {
      const msg =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.message ||
        "E-mail ou senha incorretos.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: "#EBF3FF", fontFamily: "Arial, sans-serif" }}
    >
      <div
        className="bg-white p-4 p-md-5 w-100 shadow-sm text-center"
        style={{ maxWidth: "460px", borderRadius: "35px" }}
      >
        <div className="mb-4 text-center">
          <img
            src={logoImg}
            alt="Logo Dia a Dia Vovôs"
            style={{
              maxWidth: "220px",
              maxHeight: "220px",
              objectFit: "contain",
            }}
          />
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="email"
              placeholder="E-mail"
              className="form-control py-2 fw-bold"
              style={{
                backgroundColor: "#E5ECF0",
                border: "2px solid #1A2229",
                borderRadius: "16px",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Senha"
              className="form-control py-2 fw-bold"
              style={{
                backgroundColor: "#E5ECF0",
                border: "2px solid #1A2229",
                borderRadius: "16px",
              }}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn fw-bold py-2 border-0 w-100 mb-3"
            style={{
              backgroundColor: "#FFEB60",
              color: "#000",
              borderRadius: "20px",
              fontSize: "1.2rem",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/cadastro")}
            className="btn btn-link text-decoration-none text-dark fw-bold"
          >
            Não tem uma conta? Cadastre-se
          </button>
        </form>
      </div>
    </div>
  );
}
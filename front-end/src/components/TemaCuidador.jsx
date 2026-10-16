import { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";

// Layout das rotas do cuidador: aplica o tema escuro só enquanto
// o usuário está dentro delas e remove ao sair.
export default function TemaCuidador() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    return () => document.body.classList.remove("dark");
  }, [theme]);

  return <Outlet />;
}
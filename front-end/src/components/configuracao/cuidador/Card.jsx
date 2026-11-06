import React, { useContext } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";

export default function CardsConfig() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  return (
    <div className="container mt-4 d-flex justify-content-center">
      <div
        className="shadow-sm rounded-4 p-4"
        style={{
          maxWidth: "400px",
          width: "100%",
          height: "auto",
          backgroundColor: '#ffffff'
        }}
      >
        <h2 className="h4 fw-bold mb-5 d-flex justify-content-center">Temas</h2>

        <div className="d-flex justify-content-between align-items-center">
          <strong className="fs-5">Modo Escuro:</strong>

          <label className="switch mb-0">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleTheme}
            />
            <span className="slider">
              <span className="thumb" />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

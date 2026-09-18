import React from "react";

export default function ButtonEdit({ onClick }) {
  return (
    <button style={styles.btnEdit} onClick={onClick} aria-label="Editar">
      <i className="bi bi-pencil-fill"></i>
    </button>
  );
}

const styles = {
  btnEdit: {
    backgroundColor: "#e3f2fd",
    color: "#0d6efd",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.2s",
  },
};
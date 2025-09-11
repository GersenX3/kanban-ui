import React from "react";

const Dashboard = () => {
  const user = "Usuario"; // luego lo reemplazas con datos de la API

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bienvenido, {user} 👋</h1>
      <p>Has iniciado sesión correctamente.</p>
    </div>
  );
};

export default Dashboard;

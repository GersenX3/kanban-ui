import React, { useState } from "react";

import {
  Grid,
  Theme,
  Header,
  Button,
  Modal,
  HeaderName,
  HeaderGlobalAction,
  HeaderGlobalBar,
  PasswordInput,
  TextInput,
  Checkbox,
  InlineNotification,
} from "@carbon/react";
import { Logout, Switcher } from "@carbon/icons-react";
import Board from "./Board";

const Dashboard = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageKind, setMessageKind] = useState("info");

  const token = localStorage.getItem("token");

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.reload();
  }

  async function handleUpdate() {
    try {
      setMessage(null); // Limpiar mensajes anteriores

      // Lógica para cambiar la contraseña
      if (newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          setMessage("Las contraseñas no coinciden.");
          setMessageKind("error");
          return;
        }

        // Validación adicional en el frontend
        if (newPassword.length < 6) {
          setMessage("La contraseña debe tener al menos 6 caracteres.");
          setMessageKind("error");
          return;
        }

        // Debug: Log del payload que se envía
        const payload = {
          new_password: newPassword,
          confirm_password: confirmPassword,
        };
        console.log("Enviando payload:", payload);
        console.log("Token:", token);

        const res = await fetch("http://localhost:5000/auth/change-password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        console.log("Status de respuesta:", res.status);
        console.log("Headers de respuesta:", [...res.headers.entries()]);

        // Obtener la respuesta completa para debug
        const responseText = await res.text();
        console.log("Respuesta completa del servidor:", responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error("Error parsing JSON:", e);
          setMessage("Error: Respuesta inválida del servidor");
          setMessageKind("error");
          return;
        }

        if (!res.ok) {
          // Manejar errores HTTP específicos
          if (res.status === 401) {
            setMessage("Sesión expirada. Por favor, inicia sesión nuevamente.");
            setMessageKind("error");
            handleLogout();
            return;
          }
          if (res.status === 422) {
            console.error("Error 422 - Datos enviados:", payload);
            console.error("Respuesta del servidor:", data);
          }
        }

        setMessage(data.msg);
        setMessageKind(res.ok ? "success" : "error");

        if (res.ok) {
          setNewPassword("");
          setConfirmPassword("");
          setIsModalOpen(false);
        }
        return;
      }

      // Lógica para eliminar la cuenta
      if (deleteEmail && confirmDelete) {
        if (!deleteEmail.includes("@")) {
          setMessage("Por favor, introduce un email válido.");
          setMessageKind("error");
          return;
        }

        const res = await fetch("http://localhost:5000/auth/delete-account", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: deleteEmail }),
        });

        if (!res.ok) {
          if (res.status === 401) {
            setMessage("Sesión expirada. Por favor, inicia sesión nuevamente.");
            setMessageKind("error");
            handleLogout();
            return;
          }
        }

        const data = await res.json();
        setMessage(data.msg);
        setMessageKind(res.ok ? "success" : "error");

        if (res.ok) {
          setTimeout(() => {
            handleLogout();
          }, 2000); // Dar tiempo para mostrar el mensaje de éxito
        }
        return;
      }

      // Si no se llenó ningún campo, muestra un mensaje de advertencia
      setMessage("Por favor, llena los campos para actualizar tu información.");
      setMessageKind("warning");
    } catch (err) {
      console.error("Error:", err);
      setMessage("Error de conexión con el servidor");
      setMessageKind("error");
    }
  }

  // Función para limpiar el formulario cuando se cierra el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewPassword("");
    setConfirmPassword("");
    setDeleteEmail("");
    setConfirmDelete(false);
    setMessage(null);
  };

  return (
    <Theme theme="g100">
      <Grid fullWidth style={{ minHeight: "100vh", padding: "0" }}>
        <Header style={{ color: "white" }}>
          <HeaderName href="#" prefix="Kanban Board - ">
            Bienvenido {user}
          </HeaderName>
          <HeaderGlobalBar>
            <HeaderGlobalAction
              aria-label="Settings"
              onClick={() => setIsModalOpen(true)}
              tooltipAlignment="end"
            >
              <Switcher size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="Logout"
              onClick={handleLogout}
              tooltipAlignment="end"
            >
              <Logout size={20} fill="#ae1820" />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>

        <Board />
      </Grid>

      <Modal
        aria-label="User settings"
        modalHeading="User Configuration"
        open={isModalOpen}
        onRequestClose={handleCloseModal}
        onRequestSubmit={handleUpdate}
        onSecondarySubmit={handleCloseModal}
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
      >
        <div style={{ marginBottom: "1rem" }}>
          <h4 style={{ marginBottom: "0.5rem", color: "#f4f4f4" }}>
            Cambiar Contraseña
          </h4>
          <PasswordInput
            id="new-password"
            labelText="Nueva Contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Introduce nueva contraseña"
          />
          <br />
          <PasswordInput
            id="confirm-password"
            labelText="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirma nueva contraseña"
          />
        </div>

        <div
          style={{
            marginTop: "2rem",
            paddingTop: "1rem",
            borderTop: "1px solid #525252",
          }}
        >
          <h4 style={{ marginBottom: "0.5rem", color: "#da1e28" }}>
            Eliminar Cuenta (¡Peligro!)
          </h4>
          <TextInput
            id="delete-email"
            labelText="Email de Confirmación"
            value={deleteEmail}
            onChange={(e) => setDeleteEmail(e.target.value)}
            placeholder="Introduce tu email para confirmar"
          />
          <br />
          <Checkbox
            id="confirm-delete"
            labelText="Entiendo que esta acción es irreversible"
            checked={confirmDelete}
            onChange={(e, { checked }) => setConfirmDelete(checked)}
          />
        </div>
      </Modal>

      {message && (
        <InlineNotification
          kind={messageKind}
          lowContrast
          subtitle={message}
          title={
            messageKind === "error"
              ? "Error"
              : messageKind === "success"
              ? "Éxito"
              : "Información"
          }
          onCloseButtonClick={() => setMessage(null)}
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 100000000,
          }}
        />
      )}
    </Theme>
  );
};

export default Dashboard;

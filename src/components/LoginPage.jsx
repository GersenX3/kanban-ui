import React, { useState } from "react";
import {
  Button,
  Form,
  FormGroup,
  TextInput,
  Tile,
  Link,
  InlineNotification,
  PasswordInput,
  Theme,
} from "@carbon/react";

// Main application component containing the login and sign-up page.
const LoginPage = ({ onLogin }) => {
  // State to manage the form's mode (login or sign-up)
  const [isLogin, setIsLogin] = useState(true);
  // State for form input values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // State for user feedback messages
  const [message, setMessage] = useState(null);
  const [messageKind, setMessageKind] = useState("info");

  // 🔹 Nuevo handleSubmit con fetch a tu API Flask
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    try {
      if (isLogin) {
        // LOGIN
        const response = await fetch("http://localhost:5000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.access_token); // guarda el JWT
          setMessage("¡Inicio de sesión exitoso!");
          setMessageKind("success");
          if (onLogin) onLogin();
        } else {
          setMessage(data.msg || "Error al iniciar sesión.");
          setMessageKind("error");
        }
      } else {
        // REGISTER
        if (password !== confirmPassword) {
          setMessage("Error: Las contraseñas no coinciden.");
          setMessageKind("error");
          return;
        }

        const response = await fetch("http://localhost:5000/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage("¡Registro exitoso! Ahora puedes iniciar sesión.");
          setMessageKind("success");
          setIsLogin(true); // pasa al formulario de login
        } else {
          setMessage(data.msg || "Error al registrarse.");
          setMessageKind("error");
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Error de conexión con el servidor.");
      setMessageKind("error");
    }
  };

  // Function to toggle between login and sign-up views
  const handleToggleForm = () => {
    setIsLogin(!isLogin);
    // Reset form fields and messages when switching
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMessage(null);
  };

  return (
    <>
      <Theme as="section" theme="g100">
        <div
          className="cds--grid"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="cds--row">
            <h1
              style={{
                paddingBottom: "2rem",
              }}
            >
              Kanban - React
            </h1>
            <div className="cds--col-sm-12 cds--col-md-6 cds--offset-md-3 cds--col-lg-4 cds--offset-lg-4">
              <Tile style={{ padding: "2rem" }}>
                <h2
                  className="cds--type-alpha"
                  style={{ marginBottom: "1rem" }}
                >
                  {isLogin ? "Iniciar Sesión" : "Registrarse"}
                </h2>

                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <TextInput
                      id="email"
                      labelText="Correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      style={{ marginBottom: "1.5rem" }}
                    />
                    <PasswordInput
                      id="password"
                      labelText="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <br />
                    {!isLogin && (
                      <PasswordInput
                        id="confirm-password"
                        labelText="Confirmar Contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    )}
                  </FormGroup>

                  <div>
                    <Button
                      kind="primary"
                      type="submit"
                      style={{ width: "100%", marginTop: "1rem" }}
                    >
                      {isLogin ? "Iniciar Sesión" : "Registrarse"}
                    </Button>
                  </div>
                </Form>

                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  {isLogin ? (
                    <Link href="#" onClick={handleToggleForm}>
                      ¿No tienes una cuenta? Regístrate.
                    </Link>
                  ) : (
                    <Link href="#" onClick={handleToggleForm}>
                      ¿Ya tienes una cuenta? Inicia sesión.
                    </Link>
                  )}
                </div>
              </Tile>
            </div>
          </div>
        </div>
        {/* Display feedback messages */}
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 1000,
          }}
        >
          {message && (
            <InlineNotification
              kind={messageKind}
              lowContrast={true}
              subtitle={message}
              title={messageKind === "error" ? "Error" : "Éxito"}
              onCloseButtonClick={() => setMessage(null)}
            />
          )}
        </div>
      </Theme>
    </>
  );
};

export default LoginPage;

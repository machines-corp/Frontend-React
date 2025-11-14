import React, { useState, useEffect } from "react";
import "./perfil.css";
import { loginUser, registerUser } from "../../api/auth";

/**
 * Componente Perfil:
 * - Muestra un formulario de Log in.
 * - Al "loguear" reemplaza el formulario por la información del perfil.
 * - Permite editar y cerrar sesión.
 *
 * Nota: autenticación simulada; en una app real enviar credenciales al backend.
 */

export default function Perfil() {
  const [isLogged, setIsLogged] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    password2: "",
    email: "",
    role: "talent", // talent | company
    companyName: "",
  });
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("perfil");
    if (saved) {
      setProfile(JSON.parse(saved));
      setIsLogged(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser(form.username, form.password);
      if (res.error) {
        setError(res.error);
        return;
      }

      const user = {
        nombre: res.username,
        email: res.email,
        role: res.role,
        companyName: res.company_name,
        id: res.id,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          res.username
        )}&background=0D8ABC&color=fff`,
      };

      localStorage.setItem("perfil", JSON.stringify(user));
      setProfile(user);
      setIsLogged(true);
    } catch (err) {
      alert("Error al conectar con el servidor.");
      console.error(err);
    }
  };

    const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.password2) {
    alert("Las contraseñas no coinciden");
    return;
    }

    try {
        const res = await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        company_name: form.companyName,
        });

        if (res.id) {
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        setIsRegistering(false);
        } 

        if (res.error) {
          console.error("Error en registro:", res.error);

          // Mostrar error específico
          alert(JSON.stringify(res.error, null, 2));
          return;
        }
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        setIsRegistering(false);
    
    } catch (err) {
        alert("Error al conectar con el servidor.");
        console.error(err);
    }
    };


  const handleLogout = () => {
    setIsLogged(false);
    setProfile(null);
    localStorage.removeItem("perfil");
    setEditing(false);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const nombre = e.target.nombre.value.trim() || profile.nombre;
    const email = e.target.email.value.trim() || profile.email;
    const updated = { ...profile, nombre, email };
    updated.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nombre
    )}&background=0D8ABC&color=fff`;
    setProfile(updated);
    localStorage.setItem("perfil", JSON.stringify(updated));
    setEditing(false);
  };

  return (
    <div className="perfil-container">
      {!isLogged ? (
        <form
          onSubmit={isRegistering ? handleRegister : handleLogin}
          className="perfil-form"
        >
          <h2 className="perfil-title">
            {isRegistering ? "Crear cuenta" : "Iniciar sesión"}
          </h2>

          {isRegistering && (
            <div className="field">
              <label>Tipo de cuenta:</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="ui-select"
              >
                <option value="talent">Busco trabajo</option>
                <option value="company">Soy empresa</option>
              </select>
            </div>
          )}

          <div className="field">
            <label>Usuario:</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Nombre de usuario"
              required
              className="ui-input"
            />
          </div>

          {isRegistering && form.role === "company" && (
            <div className="field">
              <label>Nombre de la empresa:</label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Mi Empresa SpA"
                required
                className="ui-input"
              />
            </div>
          )}
          {isRegistering && (
            <div className="field">
              <label>Correo electrónico:</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
                className="ui-input"
              />
            </div>
          )}

          <div className="field">
            <label>Contraseña:</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Contraseña"
              required
              className="ui-input"
            />
          </div>
          {isRegistering && (
          <div className="field">
            <label>Confirmar contraseña:</label>
            <input
              name="password2"
              type="password"
              value={form.password2}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              required
              className="ui-input"
              autoComplete="new-password"
            />
          </div>
          )}
          <div className="perfil-actions">
            <button type="submit" className="btn-primary">
              {isRegistering ? "Registrarse" : "Entrar"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? "Ya tengo cuenta" : "Crear cuenta"}
            </button>
          </div>
        </form>
      ) : (
        <div className="perfil-view">
          <div className="perfil-header">
            <img
              src={profile.avatar}
              alt="avatar"
              className="perfil-avatar"
            />
            <div>
              <h3 className="perfil-name">{profile.nombre}</h3>
              <p className="perfil-email">{profile.email}</p>
              <p className="perfil-role">
                Tipo: {profile.role === "company" ? "Empresa" : "Usuario"}
              </p>
            </div>
          </div>

          {editing ? (
            <form
              onSubmit={handleProfileSave}
              className="perfil-edit-form"
            >
              <div className="field">
                <label>Nombre:</label>
                <input
                  name="nombre"
                  defaultValue={profile.nombre}
                  className="ui-input"
                />
              </div>
              <div className="field">
                <label>Email:</label>
                <input
                  name="email"
                  defaultValue={profile.email}
                  className="ui-input"
                />
              </div>
              <div className="perfil-actions">
                <button type="submit" className="btn-primary">
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="perfil-actions">
              <button
                className="btn-primary"
                onClick={() => setEditing(true)}
              >
                Editar perfil
              </button>
              <button
                className="btn-secondary"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

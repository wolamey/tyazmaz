import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./Auth.scss";
import logo from "../../assets/img/logo.png";

export default function Auth({ onAuthSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    const formData = new URLSearchParams();
    formData.append("username", username.trim());
    formData.append("password", password.trim());
    formData.append("grant_type", "password");

    try {
      const response = await fetch("http://85.140.62.250:4545/api/v1/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        Cookies.set("authToken", data.access_token, {
          secure: false,
          sameSite: "Lax",
          expires: 7,
        });
        Cookies.set("userRole", data.role, {
          secure: false,
          sameSite: "Lax",
          expires: 7,
        });
        // Cookies.set("username", username, { secure: false, sameSite: "Lax", expires: 7 });
        Cookies.set("user_id", data.user_id, {
          secure: false,
          sameSite: "Lax",
          expires: 7,
        });

        onAuthSuccess();
    setLoading(false)

        navigate("/");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Неверный логин или пароль");
    setLoading(false)

      }
    } catch (err) {
      console.error("Ошибка при запросе:", err);
      setError("Ошибка подключения к серверу");
    setLoading(false)

    }
  };

  return (
    <div className="auth">
          {loading && (
        <div className="overlay">
          {" "}
          <div className="loader"></div>{" "}
        </div>
      )}
      <img src={logo} className="auth_logo logo" alt="Логотип" />
      <form onSubmit={handleSubmit} className="auth_form">
        <p className="auth_title">Авторизация</p>
        <input
          type="text"
          className="auth_input"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          className="auth_input"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="auth_error">{error}</p>}
        <input type="submit" className="auth_submit" value="Вход" />
      </form>
    </div>
  );
}

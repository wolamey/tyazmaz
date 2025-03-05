import React, { useState, useEffect, useRef } from "react";
import "./Home.scss";
import axios from "axios";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Cookies from "js-cookie";

import { useNavigate } from "react-router-dom";

const CodeBlock = ({ codeString }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(codeString)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  return (
    <div style={{ position: "relative" }}>
      <button className="copy_button" onClick={handleCopy}>
        {copied ? "Скопировано!" : "Скопировать"}
      </button>
      <SyntaxHighlighter language="json" style={vs2015}>
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};
const UserEditPopup = ({ user, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    user_id: user.id,
    name: user.name,
    username: user.username,
    password: "",
    role: user.role,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const fetchUserData = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        throw new Error("Токен не найден");
      }

      const response = await fetch(
        "http://85.140.62.250:4545/api/v1/users/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Не удалось получить данные о пользователе");
      }

      const data = await response.json();
      console.log("Данные пользователя:", data);
      return data.id;
    } catch (error) {
      console.error("Ошибка при получении данных о пользователе:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const token = Cookies.get("authToken");
  
      const userData = {
        user_id: formData.user_id,
        name: formData.name,
        username: formData.username,
        role: formData.role,
      };
  
      if (formData.password) {
        userData.password = formData.password;
      } else {
        userData.password = null;
      }
  
      const response = await fetch(
        "http://85.140.62.250:4545/api/v1/users/me",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === updatedUser.id ? updatedUser : user
          )
        );
      } else {
        console.error("Ошибка обновления пользователя:", response.status);
      }
    } catch (err) {
      console.error("Ошибка при обновлении пользователя:", err);
    } finally {
      setLoading(false);
    }

    onClose();
    window.location.reload();
  };

  const handleDelete = async (id) => {
    setLoading(true);

    if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      try {
        const token = Cookies.get("authToken");
        const response = await fetch(
          `http://85.140.62.250:4545/api/v1/users/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          alert(`Юзер успешно удален`);
          onClose();
          window.location.reload();
        } else {
          console.error("Ошибка удаления пользователя:", response.status);
          alert("Ошибка удаления пользователя");
        }
      } catch (err) {
        console.error("Ошибка при удалении пользователя:", err);
        alert("Ошибка удаления пользователя");
      } finally {
        setLoading(false);
      }
    }
  };  return (
    <div className="popup">
      <div className="popup_content">
        <h3>Редактировать пользователя</h3>
        <form onSubmit={handleSubmit}>
          <input
            className="home_users_new_input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Имя пользователя"
            required
          />
          <input
            className="home_users_new_input"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Логин"
            required
          />
          <input
            className="home_users_new_input"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Новый пароль"
            
          />
          <select
            className="home_users_new_input"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
          >
            <option value="admin">Администратор</option>
            <option value="manager">Пользователь</option>
          </select>

          <button
            type="button"
            className="delete_user button"
            onClick={() => handleDelete(formData.user_id)}
          >
            Удалить пользователя
          </button>
          <div className="popup_actions">
            <button type="submit" className="button">
              Сохранить
            </button>
            <button type="button" className="button" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Home() {
  const inputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [errorText, setErrorText] = useState("");
  const homeDownloadRef = useRef(null);
  const homeResultRef = useRef(null);
  const homeUsersRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [idProduct, setIdProduct] = useState("");
  const [idParentCE, setIdParentCE] = useState("");
  const [tm, setTm] = useState("");
  const [typeOperation, setTypeOperation] = useState("");

  const [loading, setLoading] = useState(false);

  const [extraInfo, setExtraInfo] = useState("");

  const handleRefactor = async () => {
    setLoading(true);

    const token = Cookies.get("authToken");
    if (!token) {
      setErrorText("Не найден токен авторизации.");
      setLoading(false);
      return;
    }

    const userId = Cookies.get("user_id");
    if (!userId) {
      setErrorText("ID пользователя не найден в куках.");
      setLoading(false);
      return;
    }

    const data = {
      extra_info: extraInfo,
    };

  try {
    const response = await axios.post(
      `http://85.140.62.250:4545/api/v1/refactor?upload_id=${uploadId}&id_product=${idProduct}&id_parent_ce=${idParentCE}&tm=${tm}&type_operation=${typeOperation}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

      const { text, json } = response.data;
      setServerText(text);
      setCodeString(JSON.stringify(json, null, 2));
      console.log("Обновлённый текст:", text);
      console.log("Обновлённый JSON:", JSON.stringify(json, null, 2));
    } catch (error) {
      console.error("Ошибка при рефакторе документа:", error);
      setErrorText("Ошибка при рефакторе документа.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        throw new Error("Токен не найден");
      }

      const response = await fetch(
        "http://85.140.62.250:4545/api/v1/users/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Не удалось получить данные о пользователе");
      }

      const data = await response.json();
      console.log("Данные пользователя:", data);
      return data.id;
    } catch (error) {
      console.error("Ошибка при получении данных о пользователе:", error);
    }
  };

  const [serverText, setServerText] = useState("");
  const [uploadId, setUploadId] = useState(-1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const curFile = inputRef.current?.files[0];
    if (!curFile) {
      setErrorText("Файл не выбран.");
      setLoading(false);
      return;
    }

    const token = Cookies.get("authToken");
    if (!token) {
      setErrorText("Не найден токен авторизации.");
      setLoading(false);
      return;
    }
    const userId = Cookies.get("user_id");

    if (!userId) {
      setErrorText("ID пользователя не найден в куках.");
      setLoading(false);
      return;
    }

    const formData1 = new FormData();

    formData1.append("file", curFile);

    console.log("Файл:", formData1.get("file"));

    if (
      curFile === "" ||
      idProduct === "" ||
      idParentCE === "" ||
      tm === "" ||
      typeOperation === ""
    ) {
      alert("введите все данные об изделии");
      setLoading(false);
      return;
    }

    try {
      formData1.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      console.log(formData1);

      const response = await axios.post(
        `http://85.140.62.250:4545/api/v1/upload?user_id=${userId}&id_product=${idProduct}&id_parent_ce=${idParentCE}&tm=${tm}&type_operation=${typeOperation}`,
        formData1,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { text, json, upload } = response.data;
      setServerText(text);
      // json.header_tp.route = tm;
      setCodeString(JSON.stringify(json, null, 2));
      setUploadId(upload);
      console.log(JSON.stringify(json, null, 2));
    } catch (error) {
      console.error("Ошибка при загрузке документа:", error);
      setErrorText("Ошибка при загрузке документа.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const token = Cookies.get("authToken");
      const response = await axios.get(
        "http://85.140.62.250:4545/api/v1/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error("API вернул некорректный формат данных:", response.data);
        setUsers([]);
      }
    } catch (err) {
      console.error("Ошибка при загрузке пользователей:", err);
      handleLogout();
      setError("Не удалось загрузить список пользователей.");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleClosePopup = () => {
    setEditingUser(null);
  };

  const handleSaveUser = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const [codeString, setCodeString] = useState(``);

  function updateImageDisplay() {
    setLoading(true);

    const curFile = inputRef.current.files[0];
    if (!curFile) {
      setImageUrl(null);
      setErrorText("Файл не выбран.");
      setLoading(false);

      return;
    }

    const formData = new FormData();
    formData.append("file", curFile);

    const token = Cookies.get("authToken");
    console.log(formData);
    axios
      .post("http://85.140.62.250:4545/api/v1/preview", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const { file_path } = response.data;
        if (file_path) {
          setImageUrl(file_path);
          setErrorText("");
        } else {
          throw new Error("Не удалось получить ссылку на файл.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке:", error);
        setImageUrl(null);
        setErrorText("Ошибка при обработке файла.");
        setLoading(false);
      });
  }

  const scrollToRef = (ref) => {
    window.scrollTo({
      top: ref.current.offsetTop,
      behavior: "smooth",
    });
  };

  const handleButtonClick = (ref, buttonId) => {
    scrollToRef(ref);
    updateActiveButton(buttonId);
  };

  const handleScroll = () => {
    const sections = [
      { ref: homeDownloadRef, buttonId: "downloadButton" },
      { ref: homeResultRef, buttonId: "resultButton" },
      { ref: homeUsersRef, buttonId: "usersButton" },
    ];

    let activeSection = null;

    sections.forEach((section) => {
      const element = section.ref.current;
      if (
        element.getBoundingClientRect().top < window.innerHeight * 0.3 &&
        element.getBoundingClientRect().bottom > window.innerHeight * 0.3
      ) {
        activeSection = section.buttonId;
      }
    });

    updateActiveButton(activeSection);
  };

  const updateActiveButton = (activeButtonId) => {
    const buttons = document.querySelectorAll(".home_left_item_button");
    buttons.forEach((button) => {
      if (button.id === activeButtonId) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("authToken");
    Cookies.remove("userRole");
    Cookies.remove("user_id");

    navigate("/auth");
  };

  const [userData, setUserData] = useState({
    username: "",
    name: "",
    password: "",
    role: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSubmitNewUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { username, name, password, role } = userData;

    if (!username || !name || !password || !role) {
      alert("Все поля обязательны для заполнения!");
      setLoading(false);

      return;
    }

    try {
      const response = await fetch(
        "http://85.140.62.250:4545/api/v1/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
          body: JSON.stringify(userData),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        alert(`Ошибка: ${result.detail || "Что-то пошло не так"}`);
        setLoading(false);
      }

      if (response.ok) {
        alert("Пользователь успешно зарегистрирован!");
        setLoading(false);
        window.location.reload();
      }
    } catch (error) {
      alert("Сетевая ошибка");
      console.error(error);
      setLoading(false);
    }
  };

  const downloadFile = async (uploadId) => {
    const token = Cookies.get("authToken");
    if (!token) {
      setErrorText("Не найден токен авторизации.");
      return;
    }

    try {
      const response = await axios.get(
        `http://85.140.62.250:4545/api/v1/save?upload_id=${uploadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `file_${uploadId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Ошибка при скачивании файла:", error);
      setErrorText("Ошибка при скачивании файла.");
    }
  };

  return (
    <div className="home">
      {loading && (
        <div className="overlay">
          {" "}
          <div className="loader"></div>{" "}
        </div>
      )}
      <div className="home_left">
        <div className="home_left_buttons">
          <button
            id="downloadButton"
            className="home_left_item_button button"
            onClick={() => handleButtonClick(homeDownloadRef, "downloadButton")}
          >
            Загрузка файла
          </button>
          <button
            id="resultButton"
            className="home_left_item_button button"
            onClick={() => handleButtonClick(homeResultRef, "resultButton")}
          >
            Результат
          </button>
          <button
            id="usersButton"
            className="home_left_item_button button"
            onClick={() => handleButtonClick(homeUsersRef, "usersButton")}
          >
            Пользователи
          </button>
        </div>
        <button onClick={handleLogout} className="home_exit button">
          Выйти
        </button>
      </div>
      <div className="home_body">
        <form
          className="home_download"
          onSubmit={handleSubmit}
          ref={homeDownloadRef}
        >
          <div className="home_download_top">
            <div action="" className="home_download_top_form">
              <div className="home_download_el">
                <label
                  className="home_download_el_name button"
                  htmlFor="home_file_upload"
                >
                  Загрузить файл (выбрать путь)
                </label>
                <input
                  id="home_file_upload"
                  type="file"
                  className="home_download_button button"
                  ref={inputRef}
                  onChange={updateImageDisplay}
                />
              </div>
            </div>
          </div>
          <div className="home_file_preview">
            {errorText ? (
              <p style={{ color: "red" }}>{errorText}</p>
            ) : imageUrl ? (
              <img src={imageUrl} alt="Uploaded file" />
            ) : (
              <p>Предосмотр загруженного файла</p>
            )}
          </div>

          <div className="home_params">
            <div className="home_params_wrapper">
              <div className="home_params_item_name">id изделия</div>
              <input
                type="text"
                className="home_params_item_value"
                value={idProduct}
                onChange={(e) => setIdProduct(e.target.value)}
                placeholder="id изделия"
                required
              />
              <div className="home_params_item_name">id родительской СЕ</div>
              <input
                type="text"
                className="home_params_item_value"
                value={idParentCE}
                onChange={(e) => setIdParentCE(e.target.value)}
                placeholder="id родительской СЕ"
                required
              />
              <div className="home_params_item_name">ТМ</div>
              <input
                type="text"
                className="home_params_item_value"
                value={tm}
                onChange={(e) => setTm(e.target.value)}
                placeholder="ТМ"
                required
              />
              <div className="home_params_item_name">тип операции</div>
              <input
                type="text"
                className="home_params_item_value"
                value={typeOperation}
                onChange={(e) => setTypeOperation(e.target.value)}
                placeholder="тип операции"
                required
              />
            </div>

            <input
              type="submit"
              className="home_params_submit button"
              value="Обработать"
            />
          </div>
        </form>
        <div className="home_result" ref={homeResultRef}>
          <CodeBlock codeString={codeString} />

          <div className="home_result_txt">
            <div className="home_result_txt_item">{serverText}</div>
            <div className="home_result_txt_buttons">
              <button
                disabled={uploadId === -1 ? true : false}
                onClick={() => downloadFile(uploadId)}
                className="home_result_txt_button_down button"
              >
                Скачать
              </button>
            </div>
          </div>
        </div>

        <textarea
          className="home_params_item_value refactor"
          value={extraInfo}
          onChange={(e) => setExtraInfo(e.target.value)}
          placeholder="пояснения"
          required
        />

        <input
          type="submit"
          className="home_params_submit button refactor"
          value="Рефактор"
          onClick={handleRefactor}
        />

        <div className="home_users" ref={homeUsersRef}>
          {loadingUsers && <p>Загрузка пользователей...</p>}
          <div className="home_users_list">
            <p className="home_users_list_title">Список пользователей</p>
            <div className="home_users_list_wrapper">
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <div className="home_users_item" key={user.id}>
                    <div className="home_users_item_name">{user.name}</div>
                    {Cookies.get("userRole") === "admin" && (
                      <button
                        className="home_users_item_edit button"
                        onClick={() => handleEditUser(user)}
                      >
                        Редактировать
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>Пользователи не найдены.</p>
              )}
            </div>
          </div>
          {editingUser && (
            <UserEditPopup
              user={editingUser}
              onClose={handleClosePopup}
              onSave={handleSaveUser}
            />
          )}

          {Cookies.get("userRole") === "admin" && (
            <div className="home_users_create_new">
              <p className="home_users_new_title">
                Создание нового пользователя
              </p>
              <form
                onSubmit={handleSubmitNewUser}
                className="home_users_new_user"
              >
                <div className="home_users_new_user_body">
                  <input
                    type="text"
                    className="home_users_new_input"
                    placeholder="Имя пользователя"
                    name="username"
                    value={userData.username}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    className="home_users_new_input"
                    placeholder="Логин (почта)"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="password"
                    className="home_users_new_input"
                    placeholder="Пароль"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <select
                    name="role"
                    className="home_users_new_select"
                    value={userData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option disabled value="">
                      Выбрать роль
                    </option>
                    <option value="admin">Администратор</option>
                    <option value="manager">Пользователь</option>
                  </select>
                </div>
                <input
                  type="submit"
                  className="home_users_new_submit button"
                  value="Добавить нового пользователя"
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

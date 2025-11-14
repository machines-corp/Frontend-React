import { extractErrors } from "../utils/errors";

const API_URL = "http://localhost:8090/api/auth/";

export async function loginUser(username, password) {
  const res = await fetch(`${API_URL}login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    return { error: extractErrors(json) };
  }
  return res.json();
}

export async function registerUser(data) {
  const res = await fetch(`${API_URL}register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    return { error: extractErrors(json) };
  }

  return json;
}

export async function logoutUser() {
  const res = await fetch(`${API_URL}logout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return res.ok;
}



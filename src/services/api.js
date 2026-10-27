
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://ts.idicorp.ir"
).replace(/\/+$/, "");

async function readResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { detail: text } : {};
}

async function request(path, options = {}, accessToken = null) {
  const headers = new Headers(options.headers || {});

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await readResponse(response);

  if (!response.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : typeof data?.message === "string"
          ? data.message
          : `Request failed (${response.status})`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function getLoginChallenge() {
  return request("/api/auth/login");
}

export function login({
  username,
  password,
  salt,
  captcha_answer,
}) {
  return request("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      salt,
      captcha_answer,
    }),
  });
}

export function getTasks(accessToken, filters = {}) {
  const params = new URLSearchParams();

  if (filters.completed !== "" && filters.completed !== undefined) {
    params.set("completed", String(filters.completed));
  }

  if (filters.q?.trim()) {
    params.set("q", filters.q.trim());
  }

  const query = params.toString();
  const path = query ? `/api/tasks?${query}` : "/api/tasks";

  return request(path, {}, accessToken);
}

export function getTask(accessToken, taskId) {
  return request(
    `/api/tasks/${encodeURIComponent(taskId)}`,
    {},
    accessToken
  );
}

export function createTask(accessToken, task) {
  return request(
    "/api/tasks",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    },
    accessToken
  );
}

export function updateTask(accessToken, taskId, task) {
  return request(
    `/api/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    },
    accessToken
  );
}

export function patchTask(accessToken, taskId, changes) {
  return request(
    `/api/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(changes),
    },
    accessToken
  );
}

export function deleteTask(accessToken, taskId) {
  return request(
    `/api/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "DELETE",
    },
    accessToken
  );
}

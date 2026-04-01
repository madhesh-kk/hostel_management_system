// ─── Central API Client ─────────────────────────────────────────────────────
// All calls to Spring Boot backend go through here.
// Base URL: http://localhost:8080

const BASE_URL = "http://localhost:8081/api";

// ── JWT Token helpers ────────────────────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem("jwt_token");
export const setToken = (token: string) => localStorage.setItem("jwt_token", token);
export const removeToken = () => localStorage.removeItem("jwt_token");
export const isLoggedIn = () => !!getToken();

// ── Base fetch with auth header ──────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ── Types ────────────────────────────────────────────────────────────────────
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  roomNumber: string | null;
  course: string;
  year: number;
  guardianName: string;
  guardianPhone: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  occupied: number;
  floor: number;
  roomType: string;
  status: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await apiFetch<{ token: string; email: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },
  logout: () => {
    removeToken();
  },
};

// ── Students ─────────────────────────────────────────────────────────────────
export const studentsApi = {
  getAll: () => apiFetch<Student[]>("/students"),

  add: (data: {
    name: string;
    email: string;
    phone: string;
    roomNumber?: string;
    course: string;
    year: number;
    guardianName: string;
    guardianPhone: string;
  }) =>
    apiFetch<Student>("/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: {
      name: string;
      email: string;
      phone: string;
      roomNumber?: string;
      course: string;
      year: number;
      guardianName: string;
      guardianPhone: string;
    }
  ) =>
    apiFetch<Student>(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/students/${id}`, { method: "DELETE" }),
};

// ── Rooms ─────────────────────────────────────────────────────────────────────
export const roomsApi = {
  getAll: () => apiFetch<Room[]>("/rooms"),

  add: (data: {
    roomNumber: string;
    capacity: number;
    floor: number;
    roomType: string;
    status: string;
  }) =>
    apiFetch<Room>("/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: {
      roomNumber: string;
      capacity?: number;
      floor: number;
      roomType: string;
      status: string;
    }
  ) =>
    apiFetch<Room>(`/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/rooms/${id}`, { method: "DELETE" }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => apiFetch<DashboardStats>("/dashboard/stats"),
};

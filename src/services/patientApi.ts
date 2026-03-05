import { Patient } from "@/types/patient";

function getEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

const API_BASE = getEnvVar("VITE_API_BASE");
const AUTH_HEADER =
  "Basic " + btoa(`${getEnvVar("VITE_API_USER")}:${getEnvVar("VITE_API_PASSWORD")}`);

const headers: HeadersInit = {
  Authorization: AUTH_HEADER,
  "Content-Type": "application/json",
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function fetchPatients(): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/Patient/GetList`, { headers });
  return handleResponse<Patient[]>(res);
}

export async function fetchPatient(id: number): Promise<Patient> {
  const res = await fetch(`${API_BASE}/Patient/Get/${id}`, { headers });
  return handleResponse<Patient>(res);
}

export async function updatePatient(patient: Patient): Promise<void> {
  const res = await fetch(`${API_BASE}/Patient/Update`, {
    method: "POST",
    headers,
    body: JSON.stringify(patient),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
}
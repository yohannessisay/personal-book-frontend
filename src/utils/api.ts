import { toast } from "vue-sonner";
import { isTokenExpired } from "./jwt";

 
const API_URL = "http://localhost:3000";
 
const getAuthToken = () => {
  return localStorage.getItem("token");
};
 
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData?.message || "An error occurred";
    return { success: false, message: errorMessage, data: null };
  }
  return { success: true, message: "", data: await response.json() };
};
 

const requestWithAuth = async (url: string, method: string, body?: object) => {
  const token = getAuthToken();

  if (token && isTokenExpired(token)) {
    localStorage.removeItem("token");
    toast.error("Session expired. Please log in again.");
    return { success: false, message: "Token expired. Please log in again.", data: null };
  }



  const headers: HeadersInit = new Headers({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  try {
    const response = await fetch(`${API_URL}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return await handleResponse(response);
  } catch (error: any) { 
    console.log(error);
    
    return { success: false, message: "Network error. Please try again later.", data: null };
  }
};

export const getWithoutAuth = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData?.message || `Error: ${response.status}`;
      return { success: false, message: errorMessage, data: null };
    }

    const data = await response.json();
    return { success: true, message: '', data };
  } catch (error: any) {
    console.error("Error fetching data:", error);
    return { success: false, message: "Network error. Please try again later.", data: null };
  }
};

// GET Request
export const get = async (url: string) => {
  return await requestWithAuth(url, 'GET');
};

// POST Request
export const post = async (url: string, body: object) => {
  return await requestWithAuth(url, 'POST', body);
};

// PUT Request
export const put = async (url: string, body: object) => {
  return await requestWithAuth(url, 'PUT', body);
};

// DELETE Request
export const deleteRequest = async (url: string) => {
  return await requestWithAuth(url, 'DELETE');
};


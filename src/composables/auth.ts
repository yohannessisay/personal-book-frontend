import { reactive, computed } from "vue";



interface AuthState {
  fullname: string | null;
  email: string | null;
  token: string | null;
}

const authState: AuthState = reactive({
  fullname: null,
  email:null,
  token: null,
});

export function useAuth() {
  const setAuthData = (token: string, fullname: string,email:string) => {
    authState.token = token;
    authState.fullname = fullname;
    localStorage.setItem("token", token);
    localStorage.setItem("fullname", fullname);
    localStorage.setItem("email", email);
  };

  const clearAuthData = () => {
    authState.token = null;
    authState.email = null;
    authState.fullname = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const loadAuthData = () => {
    try {
      const token = localStorage.getItem("token");
      const fullname = localStorage.getItem("fullname");
      const email = localStorage.getItem("email");
      authState.token = token || null;
      authState.fullname =fullname || null;
      authState.email =email || null;
    } catch (error) {
      console.error("Failed to load auth data:", error);
      authState.token = null;
      authState.email = null;
    authState.fullname = null;
    }
  };
 
  loadAuthData();
 
  const isAuthenticated = computed(() => !!authState.token);

  const getUser = computed(() => ({ fullname: authState.fullname, email: authState.email }));

  const login = async (email: string, password: string) => {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setAuthData(data.token, data.fullname,data.email);
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    clearAuthData();
  };

  return {
    isAuthenticated,
    getUser,
    login,
    logout,
  };
}

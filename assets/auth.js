(function(global){
  const STORAGE_KEY = "iyasaka_admin_auth_v1";
  const PASS_KEY = "iyasaka_admin_password_v1";
  const DEFAULT_PASSWORD = "iyasaka1234";
  function getStoredPassword(){ return localStorage.getItem(PASS_KEY) || DEFAULT_PASSWORD; }
  function isAuthed(){ return sessionStorage.getItem(STORAGE_KEY) === "1"; }
  function login(password){ if(password === getStoredPassword()){ sessionStorage.setItem(STORAGE_KEY, "1"); return true; } return false; }
  function logout(){ sessionStorage.removeItem(STORAGE_KEY); }
  function setPassword(nextPassword){ if(!nextPassword) return false; localStorage.setItem(PASS_KEY, nextPassword); return true; }
  global.AuthManager = { getStoredPassword, isAuthed, login, logout, setPassword };
})(window);

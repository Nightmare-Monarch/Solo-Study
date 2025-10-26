// SWITCH BOXES
const loginBox = document.getElementById("loginBox");
const signupBox = document.getElementById("signupBox");

document.getElementById("switchToSignUp").addEventListener("click", () => {
  loginBox.style.display = "none";
  signupBox.style.display = "block";
});
document.getElementById("switchToLogin").addEventListener("click", () => {
  loginBox.style.display = "block";
  signupBox.style.display = "none";
});

// TOGGLE PASSWORD - SIGNUP
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
togglePassword.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  togglePassword.textContent = type === "password" ? "👁️" : "🙈";
});

// TOGGLE PASSWORD - LOGIN
const togglePasswordLogin = document.getElementById("togglePasswordLogin");
const passwordLogin = document.getElementById("passwordLogin");
togglePasswordLogin.addEventListener("click", () => {
  const type = passwordLogin.type === "password" ? "text" : "password";
  passwordLogin.type = type;
  togglePasswordLogin.textContent = type === "password" ? "👁️" : "🙈";
});

// FAKE LOCALSTORAGE USER DB
let users = JSON.parse(localStorage.getItem("users")) || [];

// SIGNUP
document.getElementById("signupBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if(password.length < 8) return alert("Password must be at least 8 characters!");
  if(!username || !email) return alert("Enter all fields!");
  if(users.find(u => u.username === username || u.email === email)) return alert("Username or email already exists!");

  users.push({ username, email, password });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Sign up successful! You can now login.");
  loginBox.style.display = "block";
  signupBox.style.display = "none";
});

// LOGIN
document.getElementById("loginBtn").addEventListener("click", () => {
  const loginInput = document.getElementById("userLogin").value.trim();
  const password = document.getElementById("passwordLogin").value;

  const user = users.find(u => (u.username === loginInput || u.email === loginInput) && u.password === password);
  if(user){
    // ✅ SET CURRENT USER
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("Login successful! Welcome " + user.username);
    window.location.href = "index.html";
  } else {
    alert("Invalid username/email or password!");
  }
});

const toggle_theme = document.querySelector(".dark-mode-btn");
const dark = document.querySelector(".dark-mode-btn .dark");
const light = document.querySelector(".dark-mode-btn .light");

let currentTheme = localStorage.getItem("quiz-app-theme") || "dark";
toggleTheme(currentTheme);

toggle_theme.onclick = () => {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  localStorage.setItem("quiz-app-theme", currentTheme);
  toggleTheme(currentTheme);
};

function toggleTheme(state_theme) {
  const isLight = state_theme === "light";
  document.body.classList.toggle("light-mode", isLight);
  light.style.display = isLight ? "block" : "none";
  dark.style.display = isLight ? "none" : "block";
}

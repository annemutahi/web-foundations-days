const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearButton = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

const DRAFT_KEY = "quicknote-draft";
const THEME_KEY = "quicknote-dark-theme";
const CHARACTER_LIMIT = 200;

function updateCounts() {
  const characters = noteText.value.length;
  const trimmedText = noteText.value.trim();
  const words = trimmedText ? trimmedText.split(/\s+/).length : 0;

  charCount.textContent = `${characters} / ${CHARACTER_LIMIT} characters`;
  wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
  charCount.classList.toggle("warning", characters > 180);
  charCount.classList.toggle("over", characters > CHARACTER_LIMIT);
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, noteText.value);
}

function setTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  localStorage.setItem(THEME_KEY, String(isDark));
}

noteText.value = localStorage.getItem(DRAFT_KEY) || "";
const savedTheme = localStorage.getItem(THEME_KEY);
setTheme(savedTheme === "true");
updateCounts();

noteText.addEventListener("input", () => {
  updateCounts();
  saveDraft();
});

clearButton.addEventListener("click", () => {
  noteText.value = "";
  updateCounts();
  localStorage.removeItem(DRAFT_KEY);
  noteText.focus();
});

themeToggle.addEventListener("click", () => {
  setTheme(!document.body.classList.contains("dark"));
});

noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    noteText.value = "";
    updateCounts();
    localStorage.removeItem(DRAFT_KEY);
  }
});

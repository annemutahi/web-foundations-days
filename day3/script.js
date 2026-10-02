let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
  const searchTerm = String(word).toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(searchTerm));
}

function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  return notes.reduce((longest, note) =>
    note.text.length > longest.text.length ? note : longest
  );
}

function countByCategory() {
  return notes.reduce((counts, note) => {
    counts[note.category] = (counts[note.category] || 0) + 1;
    return counts;
  }, {});
}

function getSummary() {
  const counts = countByCategory();
  const categorySummary = ["personal", "work", "study"]
    .filter((category) => counts[category])
    .map((category) => `${counts[category]} ${category}`)
    .join(", ");

  return `${notes.length} notes: ${categorySummary}.`;
}

function normalizeText(text) {
  return String(text).trim().replace(/\s+/g, " ").toLowerCase();
}

function isDuplicate(text) {
  const normalizedText = normalizeText(text);
  return notes.some((note) => normalizeText(note.text) === normalizedText);
}

function addNote(text, category) {
  const trimmedText = String(text).trim();

  if (trimmedText.length < 1 || trimmedText.length > 200) {
    console.log("Note not added: text must be 1-200 characters.");
    return false;
  }

  if (isDuplicate(trimmedText)) {
    console.log("Note not added: a note with the same text already exists.");
    return false;
  }

  if (!["personal", "work", "study"].includes(category)) {
    console.log("Note not added: category must be personal, work, or study.");
    return false;
  }

  const nextId = notes.reduce((largestId, note) => Math.max(largestId, note.id), 0) + 1;
  notes.push({ id: nextId, text: trimmedText, category });
  return true;
}

console.log("searchNotes('JAVASCRIPT'):", searchNotes("JAVASCRIPT"));
console.log("longestNote():", longestNote());
console.log("countByCategory():", countByCategory());
console.log("getSummary():", getSummary());
console.log("isDuplicate('  BUY   MILK AND BREAD '):", isDuplicate("  BUY   MILK AND BREAD "));
console.log("addNote('Plan weekend', 'personal') expected true:", addNote("Plan weekend", "personal"));
console.log("addNote(' plan   weekend ', 'personal') expected false:", addNote(" plan   weekend ", "personal"));
console.log("addNote('', 'work') expected false:", addNote("", "work"));
console.log("addNote('New note', 'other') expected false:", addNote("New note", "other"));
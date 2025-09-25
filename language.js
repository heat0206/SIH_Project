// This object will hold the loaded translations (flattened with dotted keys)
let translations = {};

// Convert nested translation objects into dotted-key map matching element IDs
function flattenTranslations(object, prefix = "") {
  const flat = {};
  for (const key in object) {
    if (!Object.prototype.hasOwnProperty.call(object, key)) continue;
    const value = object[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(flat, flattenTranslations(value, path));
    } else {
      flat[path] = value;
    }
  }
  return flat;
}

// Function to fetch the language file and update the page
const setLanguage = async (lang) => {
  const response = await fetch(`languages/${lang}.json`);
  const raw = await response.json();
  translations = flattenTranslations(raw);

  // Update <html lang="...">
  const htmlEl = document.documentElement;
  if (htmlEl) htmlEl.setAttribute("lang", lang);

  // Update document title if provided
  if (translations.title) {
    document.title = translations.title;
    const titleEl = document.getElementById("title");
    if (titleEl) titleEl.textContent = translations.title;
  }

  // Update static text using element IDs that match dotted keys
  for (const key in translations) {
    if (!Object.prototype.hasOwnProperty.call(translations, key)) continue;
    const element = document.getElementById(key);
    if (element) {
      element.textContent = translations[key];
    }
  }

  // Update dynamic parts of the class cards on pages that have them (safe checks)
  updateClassCard('1', { total: 45, present: 43, absent: 2 });
  updateClassCard('2', { total: 38, present: 36, absent: 2 });

  // Update the active state of the language buttons
  document.querySelectorAll('.lang-switch a').forEach(link => {
    link.classList.toggle('active', link.dataset.lang === lang);
  });

  // Save the user's preference
  localStorage.setItem('selectedLanguage', lang);
};

// Helper function to update the text inside a class card
function updateClassCard(cardId, data) {
    const totalStudentsEl = document.getElementById(`totalStudentsLabel_${cardId}`);
    const summaryEl = document.getElementById(`attendanceSummaryLabel_${cardId}`);
    const statusEl = document.getElementById(`statusMarkedLabel_${cardId}`);
    const viewEditEl = document.getElementById(`viewEditLink_${cardId}`);

    if (totalStudentsEl && translations.totalStudentsLabel) {
        totalStudentsEl.textContent = `${translations.totalStudentsLabel}: ${data.total}`;
    }
    if (summaryEl && translations.presentLabel && translations.absentLabel) {
        summaryEl.textContent = `${translations.presentLabel}: ${data.present}, ${translations.absentLabel}: ${data.absent}`;
    }
    if (statusEl && translations.statusMarkedLabel) {
        statusEl.textContent = translations.statusMarkedLabel;
    }
    if (viewEditEl && translations.viewEditLink) {
        viewEditEl.textContent = translations.viewEditLink;
    }
}

// When the page loads, check for a saved language or default to English
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('selectedLanguage') || 'en';
  setLanguage(savedLang);
});
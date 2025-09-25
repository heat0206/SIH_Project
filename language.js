// This object will hold the loaded translations
let translations = {};

// Function to fetch the language file and update the page
const setLanguage = async (lang) => {
  // Fetch the correct JSON file based on the selected language
  const response = await fetch(`languages/${lang}.json`);
  translations = await response.json();

  // Update static text using IDs
  document.getElementById('pageTitle').textContent = translations.pageTitle;
  document.getElementById('navDashboard').textContent = translations.navDashboard;
  document.getElementById('navReports').textContent = translations.navReports;
  document.getElementById('profileLink').textContent = translations.profileLink;
  document.getElementById('logoutLink').textContent = translations.logoutLink;
  document.getElementById('welcomeMessage').textContent = translations.welcomeMessage;
  
  // Update the footer
  document.getElementById('footerText').textContent = translations.footerText;
  document.getElementById('footerHelpLink').textContent = translations.footerHelpLink;

  // Update dynamic parts of the class cards (example for one card)
  updateClassCard('1', { total: 45, present: 43, absent: 2 });
  updateClassCard('2', { total: 38, present: 36, absent: 2 });
  // Add calls for your other cards here...

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

    if (totalStudentsEl) {
        totalStudentsEl.textContent = `${translations.totalStudentsLabel}: ${data.total}`;
    }
    if (summaryEl) {
        summaryEl.textContent = `${translations.presentLabel}: ${data.present}, ${translations.absentLabel}: ${data.absent}`;
    }
    if (statusEl) {
        statusEl.textContent = translations.statusMarkedLabel;
    }
    if (viewEditEl) {
        viewEditEl.textContent = translations.viewEditLink;
    }
}


// When the page loads, check for a saved language or default to English
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('selectedLanguage') || 'en';
  setLanguage(savedLang);
});
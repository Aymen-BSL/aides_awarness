// home.js - Dashboard Home/Accueil Component

// Initialize home page
window.initHome = function () {
  console.log("Home: Initializing...");
  const user = getCurrentUser();

  if (!user) {
    console.error("No user found");
    return;
  }

  renderHomePage(user);
};

// Render home page
function renderHomePage(user) {
  const container = document.getElementById("homeTab");

  if (!container) {
    console.error("Home container not found");
    return;
  }

  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.username;

  const roleLabel =
    {
      ADMIN: "Administrateur",
      MEDICAL_PROFESSIONAL: "Professionnel Médical",
      USER: "Utilisateur",
    }[user.role] || "Utilisateur";

  // Get time-based greeting
  const hour = new Date().getHours();
  let greeting = "Bonjour";
  if (hour < 12) greeting = "Bonjour";
  else if (hour < 18) greeting = "Bon après-midi";
  else greeting = "Bonsoir";

  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-primary to-red-700 rounded-lg p-8 mb-6 text-white">
        <h1 class="text-3xl font-bold mb-2">🎗️ ${greeting}, ${displayName} !</h1>
        <p class="text-lg opacity-90">Bienvenue sur la plateforme AIDES de sensibilisation contre le VIH/SIDA</p>
        <p class="text-sm mt-2 opacity-75">Rôle: ${roleLabel}</p>
      </div>
      
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-dark-card rounded-lg p-6 text-center hover:bg-opacity-80 transition">
          <div class="text-4xl mb-3">📰</div>
          <h3 class="text-white text-2xl font-bold mb-1" id="articlesCount">...</h3>
          <p class="text-text-secondary text-sm">Articles Disponibles</p>
        </div>
        
        <div class="bg-dark-card rounded-lg p-6 text-center hover:bg-opacity-80 transition">
          <div class="text-4xl mb-3">💬</div>
          <h3 class="text-white text-2xl font-bold mb-1" id="forumsCount">...</h3>
          <p class="text-text-secondary text-sm">Discussions Forum</p>
        </div>
        
        <div class="bg-dark-card rounded-lg p-6 text-center hover:bg-opacity-80 transition">
          <div class="text-4xl mb-3">📝</div>
          <h3 class="text-white text-2xl font-bold mb-1" id="quizzesCount">...</h3>
          <p class="text-text-secondary text-sm">Quiz Disponibles</p>
        </div>
      </div>
      
      <!-- Information Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- About Platform -->
        <div class="bg-dark-card rounded-lg p-6">
          <h2 class="text-white text-xl font-bold mb-4">
            <i class="fas fa-info-circle text-primary mr-2"></i>
            À propos de la plateforme
          </h2>
          <p class="text-text-secondary mb-3">
            Cette plateforme est dédiée à la prévention et la sensibilisation contre le VIH/SIDA.
          </p>
          <ul class="space-y-2 text-text-secondary text-sm">
            <li><i class="fas fa-check text-green-500 mr-2"></i>Accédez à des articles informatifs</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>Participez aux discussions</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>Testez vos connaissances avec nos quiz</li>
            <li><i class="fas fa-check text-green-500 mr-2"></i>Soutenez notre communauté</li>
          </ul>
        </div>
        
        <!-- Quick Actions -->
        <div class="bg-dark-card rounded-lg p-6">
          <h2 class="text-white text-xl font-bold mb-4">
            <i class="fas fa-bolt text-primary mr-2"></i>
            Actions Rapides
          </h2>
          <div class="space-y-3">
            <button onclick="switchTab('articles')" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition text-left">
              <i class="fas fa-newspaper mr-2"></i>Lire les Articles
            </button>
            <button onclick="switchTab('forums')" 
                    class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition text-left">
              <i class="fas fa-comments mr-2"></i>Rejoindre le Forum
            </button>
            <button onclick="switchTab('quiz')" 
                    class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition text-left">
              <i class="fas fa-clipboard-check mr-2"></i>Passer un Quiz
            </button>
          </div>
        </div>
      </div>
      
      <!-- Important Notice -->
      <div class="mt-6 bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg p-4">
        <div class="flex items-start">
          <i class="fas fa-exclamation-triangle text-yellow-500 text-xl mr-3 mt-1"></i>
          <div>
            <h3 class="text-yellow-500 font-bold mb-1">Information Importante</h3>
            <p class="text-yellow-300 text-sm">
              En cas de doute ou de besoin d'aide, n'hésitez pas à consulter un professionnel de santé.
              Les informations sur cette plateforme sont à but éducatif uniquement.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load stats
  loadHomeStats();
}

// Load statistics for home page
async function loadHomeStats() {
  try {
    // Load articles count
    const articlesResponse = await fetch("/aids/api/articles/list.php");
    const articlesData = await articlesResponse.json();
    if (articlesData.success) {
      document.getElementById("articlesCount").textContent =
        articlesData.data.articles.length;
    }
  } catch (error) {
    console.error("Error loading articles count:", error);
    document.getElementById("articlesCount").textContent = "0";
  }

  try {
    // Load forums count
    const forumsResponse = await fetch("/aids/api/forums/list.php");
    const forumsData = await forumsResponse.json();
    if (forumsData.success) {
      document.getElementById("forumsCount").textContent =
        forumsData.data.posts.length;
    }
  } catch (error) {
    console.error("Error loading forums count:", error);
    document.getElementById("forumsCount").textContent = "0";
  }

  try {
    // Load quizzes count
    const quizzesResponse = await fetch("/aids/api/quiz/get.php");
    const quizzesData = await quizzesResponse.json();
    if (quizzesData.success) {
      document.getElementById("quizzesCount").textContent =
        quizzesData.data.length;
    }
  } catch (error) {
    console.error("Error loading quizzes count:", error);
    document.getElementById("quizzesCount").textContent = "0";
  }
}

// Helper function to switch tabs (called by quick action buttons)
function switchTab(tabName) {
  // Find the menu item with the matching data-tab
  const menuItem = document.querySelector(`[data-tab="${tabName}"]`);
  if (menuItem) {
    menuItem.click();
  }
}

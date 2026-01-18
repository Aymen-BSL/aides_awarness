// auth.js - Gestion de l'authentification

// Configuration de l'API
const API_BASE_URL = "/aids/api";

// Gestion du formulaire de connexion
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("errorMessage");

    // Cacher les erreurs précédentes
    errorDiv.classList.add("hidden");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Rediriger vers le tableau de bord
        window.location.href = "/aids/public/pages/dashboard/index.html";
      } else {
        // Afficher l'erreur
        errorDiv.textContent =
          data.message || "Email ou mot de passe incorrect";
        errorDiv.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      errorDiv.textContent = "Erreur de connexion. Veuillez réessayer.";
      errorDiv.classList.remove("hidden");
    }
  });
}

// Gestion du formulaire d'inscription
if (document.getElementById("registerForm")) {
  document
    .getElementById("registerForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;

      const errorDiv = document.getElementById("errorMessage");
      const successDiv = document.getElementById("successMessage");

      // Cacher les messages précédents
      errorDiv.classList.add("hidden");
      successDiv.classList.add("hidden");

      // Vérifier que les mots de passe correspondent
      if (password !== confirmPassword) {
        errorDiv.textContent = "Les mots de passe ne correspondent pas";
        errorDiv.classList.remove("hidden");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            firstName,
            lastName,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Afficher le message de succès
          successDiv.textContent = "Compte créé avec succès ! Redirection...";
          successDiv.classList.remove("hidden");

          // Rediriger vers la page de connexion après 2 secondes
          setTimeout(() => {
            window.location.href = "/public/connexion.html";
          }, 2000);
        } else {
          // Afficher l'erreur
          errorDiv.textContent = data.message || "Erreur lors de l'inscription";
          errorDiv.classList.remove("hidden");
        }
      } catch (error) {
        console.error("Erreur d'inscription:", error);
        errorDiv.textContent = "Erreur d'inscription. Veuillez réessayer.";
        errorDiv.classList.remove("hidden");
      }
    });
}

// Fonction pour vérifier si l'utilisateur est connecté
function isAuthenticated() {
  return localStorage.getItem("token") !== null;
}

// Fonction pour obtenir les informations de l'utilisateur
function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

// Fonction pour se déconnecter
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/public/connexion.html";
}

// Fonction pour obtenir le token
function getToken() {
  return localStorage.getItem("token");
}

// Fonction pour faire des requêtes API authentifiées
async function authenticatedFetch(url, options = {}) {
  const token = getToken();

  if (!token) {
    window.location.href = "/public/connexion.html";
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Si non autorisé, rediriger vers la connexion
  if (response.status === 401) {
    logout();
  }

  return response;
}

// Export des fonctions pour utilisation dans d'autres fichiers
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    isAuthenticated,
    getCurrentUser,
    logout,
    getToken,
    authenticatedFetch,
  };
}

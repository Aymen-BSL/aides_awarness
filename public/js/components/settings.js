// settings.js - Settings component

// Load user data and show settings
async function loadSettings() {
  const user = getCurrentUser();

  if (!user) {
    return;
  }

  const container = document.getElementById("settingsTab");

  container.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <h2 class="text-white text-2xl font-bold mb-8">Paramètres du compte</h2>
            
            <!-- Profile Section -->
            <div class="bg-dark-card rounded-lg p-6 mb-6">
                <h3 class="text-white text-xl font-semibold mb-6 flex items-center">
                    <i class="fas fa-user-circle text-primary mr-3"></i>
                    Informations du profil
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-white text-sm mb-2">Nom d'utilisateur *</label>
                        <input type="text" 
                               id="profileUsername"
                               value="${user.username}" 
                               class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition">
                    </div>
                    
                    <div>
                        <label class="block text-text-secondary text-sm mb-2">Role</label>
                        <input type="text" 
                               value="${user.role}" 
                               disabled
                               class="w-full px-4 py-3 bg-dark text-text-secondary rounded-lg border border-gray-600 cursor-not-allowed">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-white text-sm mb-2">Email *</label>
                        <input type="email" 
                               id="profileEmail"
                               value="${user.email}"
                               class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition">
                    </div>
                    
                    <div>
                        <label class="block text-white text-sm mb-2">Prénom</label>
                        <input type="text" 
                               id="profileFirstName"
                               value="${user.first_name || ""}"
                               placeholder="Votre prénom"
                               class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition">
                    </div>
                </div>
                
                <div class="mb-6">
                    <label class="block text-white text-sm mb-2">Nom</label>
                    <input type="text" 
                           id="profileLastName"
                           value="${user.last_name || ""}"
                           placeholder="Votre nom"
                           class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition">
                </div>
                
                <div id="profileMessage" class="hidden mb-4"></div>
                
                <button onclick="updateProfile()" 
                        class="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
                    <i class="fas fa-save mr-2"></i>Enregistrer les modifications
                </button>
            </div>
            
            <!-- Password Section -->
            <div class="bg-dark-card rounded-lg p-6">
                <h3 class="text-white text-xl font-semibold mb-6 flex items-center">
                    <i class="fas fa-lock text-primary mr-3"></i>
                    Changer le mot de passe
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="md:col-span-2">
                        <label class="block text-white text-sm mb-2">Mot de passe actuel *</label>
                        <input type="password" 
                               id="currentPassword"
                               placeholder="Votre mot de passe actuel"
                               class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition">
                    </div>
                    
                    <div>
                        <label class="block text-white text-sm mb-2">Nouveau mot de passe *</label>
                        <input type="password" 
                               id="newPassword"
                               placeholder="Minimum 6 caractères"
                               class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition">
                    </div>
                    
                    <div>
                        <label class="block text-white text-sm mb-2">Confirmer le nouveau mot de passe *</label>
                        <input type="password" 
                               id="confirmPassword"
                               placeholder="Retapez le nouveau mot de passe"
                               class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition">
                    </div>
                </div>
                
                <div id="passwordMessage" class="hidden mb-4"></div>
                
                <button onclick="changePassword()" 
                        class="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
                    <i class="fas fa-key mr-2"></i>Changer le mot de passe
                </button>
            </div>
        </div>
    `;
}

// Update profile
async function updateProfile() {
  const username = document.getElementById("profileUsername").value.trim();
  const email = document.getElementById("profileEmail").value.trim();
  const first_name = document.getElementById("profileFirstName").value.trim();
  const last_name = document.getElementById("profileLastName").value.trim();
  const messageDiv = document.getElementById("profileMessage");

  if (!username || !email) {
    showMessage(
      messageDiv,
      "Le nom d'utilisateur et l'email sont requis",
      "error",
    );
    return;
  }

  try {
    const response = await authenticatedFetch("/aids/api/user/profile.php", {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        first_name,
        last_name,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Update local storage with new user data
      localStorage.setItem("user", JSON.stringify(result.data));
      showMessage(messageDiv, result.message, "success");

      // Reload dashboard to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showMessage(messageDiv, result.message, "error");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    showMessage(messageDiv, "Erreur de connexion", "error");
  }
}

// Change password
async function changePassword() {
  const current_password = document.getElementById("currentPassword").value;
  const new_password = document.getElementById("newPassword").value;
  const confirm_password = document.getElementById("confirmPassword").value;
  const messageDiv = document.getElementById("passwordMessage");

  if (!current_password || !new_password || !confirm_password) {
    showMessage(messageDiv, "Tous les champs sont requis", "error");
    return;
  }

  if (new_password.length < 6) {
    showMessage(
      messageDiv,
      "Le nouveau mot de passe doit contenir au moins 6 caractères",
      "error",
    );
    return;
  }

  if (new_password !== confirm_password) {
    showMessage(messageDiv, "Les mots de passe ne correspondent pas", "error");
    return;
  }

  try {
    const response = await authenticatedFetch("/aids/api/user/password.php", {
      method: "POST",
      body: JSON.stringify({
        current_password,
        new_password,
      }),
    });

    const result = await response.json();

    if (result.success) {
      showMessage(messageDiv, result.message, "success");

      // Clear password fields
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmPassword").value = "";
    } else {
      showMessage(messageDiv, result.message, "error");
    }
  } catch (error) {
    console.error("Error changing password:", error);
    showMessage(messageDiv, "Erreur de connexion", "error");
  }
}

// Helper function to show messages
function showMessage(element, message, type) {
  element.classList.remove("hidden");

  if (type === "success") {
    element.className =
      "bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-4";
  } else {
    element.className =
      "bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4";
  }

  element.textContent = message;
}

// Initialize settings when tab is shown
if (document.getElementById("settingsTab")) {
  loadSettings();
}

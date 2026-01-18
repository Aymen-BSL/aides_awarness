// adminManagement.js - Admin user management component

let allUsers = [];
let editingUserId = null;

// Load all users
async function loadAllUsers() {
  console.log("loadAllUsers: Starting API call...");
  try {
    const response = await authenticatedFetch("/aids/api/admin/users/list.php");
    console.log("loadAllUsers: Got response:", response);
    const result = await response.json();
    console.log("loadAllUsers: Parsed JSON:", result);

    if (result.success) {
      allUsers = result.data;
      console.log("loadAllUsers: Loaded", allUsers.length, "users");
      renderUsersTable();
    } else {
      console.error("loadAllUsers: API returned error:", result.message);
      showAdminError(
        result.message || "Erreur lors du chargement des utilisateurs",
      );
    }
  } catch (error) {
    console.error("loadAllUsers: Exception caught:", error);
    showAdminError("Erreur de connexion");
  }
}

// Render users table
function renderUsersTable() {
  console.log("renderUsersTable: Starting, users count:", allUsers.length);
  const container = document.getElementById("adminManagementContent");
  console.log("renderUsersTable: Container element:", container);

  if (!container) {
    console.error("renderUsersTable: Container not found!");
    return;
  }

  const currentUser = getCurrentUser();
  console.log("renderUsersTable: Current user:", currentUser);

  const usersHTML = allUsers
    .map((user) => {
      const roleClass =
        {
          ADMIN: "bg-red-500",
          MEDICAL_PROFESSIONAL: "bg-blue-500",
          USER: "bg-gray-500",
        }[user.role] || "bg-gray-500";

      const canDelete = user.id !== currentUser.id;
      const canBan = user.id !== currentUser.id;
      const createdDate = new Date(user.created_at).toLocaleDateString("fr-FR");

      // Ban status
      let banStatus = "";
      if (user.is_banned) {
        if (user.ban_until) {
          const banDate = new Date(user.ban_until).toLocaleString("fr-FR");
          banStatus = `<span class="bg-orange-500 text-white text-xs px-2 py-1 rounded" title="Jusqu'au ${banDate}">Temporaire</span>`;
        } else {
          banStatus =
            '<span class="bg-red-600 text-white text-xs px-2 py-1 rounded">Permanent</span>';
        }
      } else {
        banStatus =
          '<span class="bg-green-600 text-white text-xs px-2 py-1 rounded">Actif</span>';
      }

      return `
            <tr class="border-b border-gray-700 hover:bg-dark">
                <td class="px-4 py-3 text-white">${user.username}</td>
                <td class="px-4 py-3 text-text-secondary">${user.email}</td>
                <td class="px-4 py-3">
                    <span class="${roleClass} text-white text-xs px-2 py-1 rounded">${user.role}</span>
                </td>
                <td class="px-4 py-3 text-text-secondary">${user.first_name || "-"} ${user.last_name || "-"}</td>
                <td class="px-4 py-3">${banStatus}</td>
                <td class="px-4 py-3 text-text-secondary text-sm">${createdDate}</td>
                <td class="px-4 py-3">
                    <button onclick="editUser(${user.id})" 
                            class="text-blue-500 hover:text-blue-400 mr-2 transition"
                            title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${
                      canBan && !user.is_banned
                        ? `
                        <button onclick="showBanModal(${user.id}, '${user.username}')" 
                                class="text-orange-500 hover:text-orange-400 mr-2 transition"
                                title="Bannir">
                            <i class="fas fa-ban"></i>
                        </button>
                    `
                        : ""
                    }
                    ${
                      canBan && user.is_banned
                        ? `
                        <button onclick="unbanUser(${user.id}, '${user.username}')" 
                                class="text-green-500 hover:text-green-400 mr-2 transition"
                                title="Débannir">
                            <i class="fas fa-check-circle"></i>
                        </button>
                    `
                        : ""
                    }
                    ${
                      canDelete
                        ? `
                        <button onclick="deleteUser(${user.id}, '${user.username}')" 
                                class="text-red-500 hover:text-red-400 transition"
                                title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    `
                        : `
                        <span class="text-gray-600" title="Impossible de supprimer votre propre compte">
                            <i class="fas fa-trash"></i>
                        </span>
                    `
                    }
                </td>
            </tr>
        `;
    })
    .join("");

  container.innerHTML = `
        <div class="max-w-7xl mx-auto">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-white text-2xl font-bold">Gestion des utilisateurs</h2>
                <div class="text-text-secondary">
                    <i class="fas fa-users mr-2"></i><span id="userCount">${allUsers.length}</span> utilisateur(s)
                </div>
            </div>
            
            <!-- Search Box -->
            <div class="mb-6 max-w-md">
                <div class="relative">
                    <input type="text" 
                           id="userSearch"
                           placeholder="Rechercher par nom d'utilisateur, email, ou nom..."
                           class="w-full px-4 py-3 pl-12 bg-dark-card text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition"
                           oninput="filterUsers()">
                    <i class="fas fa-search absolute left-4 top-4 text-text-secondary"></i>
                </div>
            </div>
            
            <div id="adminMessage" class="hidden mb-4"></div>
            
            <div class="bg-dark-card rounded-lg overflow-hidden">
                <table class="w-full">
                    <thead class="bg-dark">
                        <tr>
                            <th class="px-4 py-3 text-left text-white font-semibold">Nom d'utilisateur</th>
                            <th class="px-4 py-3 text-left text-white font-semibold">Email</th>
                            <th class="px-4 py-3 text-left text-white font-semibold">Rôle</th>
                            <th class="px-4 py-3 text-left text-white font-semibold">Nom complet</th>
                            <th class="px-4 py-3 text-left text-white font-semibold">Statut</th>
                            <th class="px-4 py-3 text-left text-white font-semibold">Date d'inscription</th>
                            <th class="px-4 py-3 text-left text-white font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${usersHTML}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Edit User Modal -->
        <div id="editUserModal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onclick="closeEditModal(event)">
            <div class="bg-dark-card rounded-lg p-8 max-w-md w-full mx-4" onclick="event.stopPropagation()">
                <h3 class="text-white text-xl font-bold mb-6">Modifier l'utilisateur</h3>
                
                <div class="mb-4">
                    <label class="block text-white text-sm mb-2">Email *</label>
                    <input type="email" 
                           id="editEmail"
                           class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
                </div>
                
                <div class="mb-4">
                    <label class="block text-white text-sm mb-2">Prénom</label>
                    <input type="text" 
                           id="editFirstName"
                           class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
                </div>
                
                <div class="mb-4">
                    <label class="block text-white text-sm mb-2">Nom</label>
                    <input type="text" 
                           id="editLastName"
                           class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
                </div>
                
                <div class="mb-6">
                    <label class="block text-white text-sm mb-2">Rôle *</label>
                    <select id="editRole" 
                            class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
                        <option value="USER">Utilisateur</option>
                        <option value="MEDICAL_PROFESSIONAL">Professionnel médical</option>
                        <option value="ADMIN">Administrateur</option>
                    </select>
                </div>
                
                <div id="editUserMessage" class="hidden mb-4"></div>
                
                <div class="flex gap-3">
                    <button onclick="saveUserChanges()" 
                            class="flex-1 bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
                        <i class="fas fa-save mr-2"></i>Enregistrer
                    </button>
                    <button onclick="closeEditModal()" 
                            class="flex-1 bg-gray-600 hover:bg-opacity-80 text-white font-semibold py-3 px-6 rounded-lg transition">
                        Annuler
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Ban User Modal -->
        <div id="banUserModal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onclick="closeBanModal(event)">
            <div class="bg-dark-card rounded-lg p-8 max-w-md w-full mx-4" onclick="event.stopPropagation()">
                <h3 class="text-white text-xl font-bold mb-6">Bannir l'utilisateur</h3>
                
                <div class="mb-4">
                    <p class="text-white mb-4">Bannir <span id="banUsername" class="text-primary font-bold"></span>?</p>
                </div>
                
                <div class="mb-4">
                    <label class="block text-white text-sm mb-2">Durée du bannissement *</label>
                    <select id="banDuration" 
                            class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
                        <option value="1day">1 jour</option>
                        <option value="7days">7 jours</option>
                        <option value="30days">30 jours</option>
                        <option value="permanent">Permanent</option>
                    </select>
                </div>
                
                <div class="mb-6">
                    <label class="block text-white text-sm mb-2">Raison (optionnelle)</label>
                    <textarea id="banReason" 
                              rows="3"
                              placeholder="Ex: Spam, comportement inapproprié..."
                              class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition"></textarea>
                </div>
                
                <div id="banMessage" class="hidden mb-4"></div>
                
                <div class="flex gap-3">
                    <button onclick="executeBan()" 
                            class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                        <i class="fas fa-ban mr-2"></i>Bannir
                    </button>
                    <button onclick="closeBanModal()" 
                            class="flex-1 bg-gray-600 hover:bg-opacity-80 text-white font-semibold py-3 px-6 rounded-lg transition">
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    `;
}

let banningUserId = null;

// Show ban modal
function showBanModal(userId, username) {
  banningUserId = userId;
  document.getElementById("banUsername").textContent = username;
  document.getElementById("banDuration").value = "1day";
  document.getElementById("banReason").value = "";
  document.getElementById("banUserModal").classList.remove("hidden");
}

// Close ban modal
function closeBanModal(event) {
  if (!event || event.target.id === "banUserModal") {
    document.getElementById("banUserModal").classList.add("hidden");
    banningUserId = null;
  }
}

// Execute ban
async function executeBan() {
  const duration = document.getElementById("banDuration").value;
  const reason = document.getElementById("banReason").value.trim();
  const messageDiv = document.getElementById("banMessage");

  try {
    const response = await authenticatedFetch("/aids/api/admin/users/ban.php", {
      method: "POST",
      body: JSON.stringify({
        user_id: banningUserId,
        duration,
        reason: reason || null,
      }),
    });

    const result = await response.json();

    if (result.success) {
      closeBanModal();
      showAdminMessage(result.message, "success");
      loadAllUsers();
    } else {
      showModalMessage(messageDiv, result.message, "error");
    }
  } catch (error) {
    console.error("Error banning user:", error);
    showModalMessage(messageDiv, "Erreur de connexion", "error");
  }
}

// Unban user
async function unbanUser(userId, username) {
  if (!confirm(`Débannir l'utilisateur "${username}" ?`)) {
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/admin/users/unban.php",
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      },
    );

    const result = await response.json();

    if (result.success) {
      showAdminMessage(result.message, "success");
      loadAllUsers();
    } else {
      showAdminMessage(result.message, "error");
    }
  } catch (error) {
    console.error("Error unbanning user:", error);
    showAdminMessage("Erreur de connexion", "error");
  }
}

// Filter users based on search input
function filterUsers() {
  const searchTerm = document.getElementById("userSearch").value.toLowerCase();
  const rows = document.querySelectorAll("tbody tr");
  let visibleCount = 0;

  rows.forEach((row) => {
    const username = row.cells[0].textContent.toLowerCase();
    const email = row.cells[1].textContent.toLowerCase();
    const fullName = row.cells[3].textContent.toLowerCase();

    const matches =
      username.includes(searchTerm) ||
      email.includes(searchTerm) ||
      fullName.includes(searchTerm);

    if (matches) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });

  // Update user count
  document.getElementById("userCount").textContent = visibleCount;
}

// Edit user
function editUser(userId) {
  const user = allUsers.find((u) => u.id === userId);
  if (!user) return;

  editingUserId = userId;

  document.getElementById("editEmail").value = user.email;
  document.getElementById("editFirstName").value = user.first_name || "";
  document.getElementById("editLastName").value = user.last_name || "";
  document.getElementById("editRole").value = user.role;

  document.getElementById("editUserModal").classList.remove("hidden");
}

// Close edit modal
function closeEditModal(event) {
  if (
    !event ||
    event.target.id === "editUserModal" ||
    event.type === "function"
  ) {
    document.getElementById("editUserModal").classList.add("hidden");
    editingUserId = null;
  }
}

// Save user changes
async function saveUserChanges() {
  const email = document.getElementById("editEmail").value.trim();
  const first_name = document.getElementById("editFirstName").value.trim();
  const last_name = document.getElementById("editLastName").value.trim();
  const role = document.getElementById("editRole").value;
  const messageDiv = document.getElementById("editUserMessage");

  if (!email) {
    showModalMessage(messageDiv, "L'email est requis", "error");
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/admin/users/update.php",
      {
        method: "POST",
        body: JSON.stringify({
          user_id: editingUserId,
          email,
          first_name,
          last_name,
          role,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      closeEditModal();
      showAdminMessage(result.message, "success");
      loadAllUsers();
    } else {
      showModalMessage(messageDiv, result.message, "error");
    }
  } catch (error) {
    console.error("Error updating user:", error);
    showModalMessage(messageDiv, "Erreur de connexion", "error");
  }
}

// Delete user
async function deleteUser(userId, username) {
  if (
    !confirm(
      `Êtes-vous sûr de vouloir supprimer l'utilisateur "${username}" ?\n\nCette action est irréversible.`,
    )
  ) {
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/admin/users/delete.php",
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      },
    );

    const result = await response.json();

    if (result.success) {
      showAdminMessage(result.message, "success");
      loadAllUsers();
    } else {
      showAdminMessage(result.message, "error");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showAdminMessage("Erreur de connexion", "error");
  }
}

// Show admin message
function showAdminMessage(message, type) {
  const messageDiv = document.getElementById("adminMessage");
  messageDiv.classList.remove("hidden");

  if (type === "success") {
    messageDiv.className =
      "bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-4";
  } else {
    messageDiv.className =
      "bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4";
  }

  messageDiv.textContent = message;

  setTimeout(() => {
    messageDiv.classList.add("hidden");
  }, 5000);
}

// Show modal message
function showModalMessage(element, message, type) {
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

// Show error
function showAdminError(message) {
  const container = document.getElementById("adminManagementTab");
  container.innerHTML = `
        <div class="max-w-3xl mx-auto text-center">
            <i class="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
            <h2 class="text-white text-2xl font-bold mb-4">Erreur</h2>
            <p class="text-text-secondary mb-6">${message}</p>
            <button onclick="loadAllUsers()" 
                    class="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
                Réessayer
            </button>
        </div>
    `;
}

// Initialize admin management - call this when tab is shown
window.initAdminManagement = function () {
  console.log("initAdminManagement called, current users:", allUsers.length);
  if (!allUsers.length) {
    console.log("Loading users...");
    loadAllUsers();
  } else {
    console.log("Users already loaded, rendering table");
    renderUsersTable();
  }
};

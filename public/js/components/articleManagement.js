// articleManagement.js - Article Management Component

let articlesList = [];
let currentArticle = null;
let editingArticleId = null;
let articleFilter = "all"; // 'all', 'published', 'draft'

// Initialize article management
window.initArticleManagement = function () {
  console.log("Article Management: Initializing...");
  loadAllArticles();
};

// Load all articles
async function loadAllArticles() {
  console.log("Article Management: Loading articles...");
  try {
    const response = await authenticatedFetch(
      "/aids/api/admin/articles/list.php",
    );
    const result = await response.json();
    console.log("Article Management: Result", result);

    if (result.success) {
      articlesList = result.data;
      console.log("Article Management: Loaded articles:", articlesList);
      renderArticleList();
    } else {
      showArticleError(
        result.message || "Erreur lors du chargement des articles",
      );
    }
  } catch (error) {
    console.error("Article Management: Error loading articles:", error);
    showArticleError("Erreur de connexion");
  }
}

// Render article list
function renderArticleList() {
  const container = document.getElementById("articleManagementContent");

  // Filter articles
  let filteredArticles = articlesList;
  if (articleFilter === "published") {
    filteredArticles = articlesList.filter(
      (a) => a.status.toUpperCase() === "PUBLISHED",
    );
  } else if (articleFilter === "draft") {
    filteredArticles = articlesList.filter(
      (a) => a.status.toUpperCase() === "DRAFT",
    );
  }

  const articlesHTML =
    filteredArticles.length > 0
      ? filteredArticles
          .map((article) => createArticleMgmtCard(article))
          .join("")
      : '<p class="text-text-secondary text-center py-8">Aucun article trouvé</p>';

  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-white text-2xl font-bold">Gestion des Articles</h2>
        <button onclick="showCreateArticleModal()" 
                class="bg-primary hover:bg-opacity-90 text-white font-semibold py-2 px-6 rounded-lg transition">
          <i class="fas fa-plus mr-2"></i>Nouvel Article
        </button>
      </div>
      
      <!-- Filters -->
      <div class="flex gap-2 mb-6">
        <button onclick="setArticleFilter('all')" 
                class="px-4 py-2 rounded-lg font-semibold transition ${articleFilter === "all" ? "bg-primary text-white" : "bg-dark-card text-text-secondary hover:text-white"}">
          Tous (${articlesList.length})
        </button>
        <button onclick="setArticleFilter('published')" 
                class="px-4 py-2 rounded-lg font-semibold transition ${articleFilter === "published" ? "bg-green-600 text-white" : "bg-dark-card text-text-secondary hover:text-white"}">
          Publiés (${articlesList.filter((a) => a.status.toUpperCase() === "PUBLISHED").length})
        </button>
        <button onclick="setArticleFilter('draft')" 
                class="px-4 py-2 rounded-lg font-semibold transition ${articleFilter === "draft" ? "bg-yellow-600 text-white" : "bg-dark-card text-text-secondary hover:text-white"}">
          Brouillons (${articlesList.filter((a) => a.status.toUpperCase() === "DRAFT").length})
        </button>
      </div>
      
      <div id="articleMessage" class="hidden mb-4"></div>
      
      <div class="space-y-4">
        ${articlesHTML}
      </div>
    </div>
    
    ${createArticleModal()}
  `;

  attachArticleListeners();
}

// Set article filter
function setArticleFilter(filter) {
  articleFilter = filter;
  renderArticleList();
}

// Create article management card (renamed to avoid collision with articleFeed.js)
function createArticleMgmtCard(article) {
  const statusBadge =
    article.status.toUpperCase() === "PUBLISHED"
      ? '<span class="bg-green-600 text-white text-xs px-2 py-1 rounded">✓ Publié</span>'
      : '<span class="bg-yellow-600 text-white text-xs px-2 py-1 rounded">📝 Brouillon</span>';

  const statusAction =
    article.status.toUpperCase() === "PUBLISHED"
      ? '<button class="btn-toggle-status text-yellow-500 hover:text-yellow-400 transition text-sm font-semibold" data-article-id="' +
        article.id +
        '" data-status="DRAFT"><i class="fas fa-eye-slash mr-1"></i>Dépublier</button>'
      : '<button class="btn-toggle-status text-green-500 hover:text-green-400 transition text-sm font-semibold" data-article-id="' +
        article.id +
        '" data-status="PUBLISHED"><i class="fas fa-check mr-1"></i>Publier</button>';

  return `
    <div class="bg-dark-card rounded-lg p-6">
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-white text-xl font-bold">${article.title}</h3>
            ${statusBadge}
          </div>
          <p class="text-text-secondary text-sm mb-2">
            <i class="fas fa-user mr-1"></i>Par: ${article.author_name || "Unknown"} | 
            <i class="fas fa-tag mr-1"></i>${article.category}
          </p>
          <p class="text-text-secondary text-sm line-clamp-2">${(article.content || "").substring(0, 150)}...</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn-edit-article text-blue-500 hover:text-blue-400 transition text-sm font-semibold"
                data-article-id="${article.id}">
          <i class="fas fa-edit mr-1"></i>Modifier
        </button>
        ${statusAction}
        <button class="btn-delete-article text-red-500 hover:text-red-400 transition text-sm font-semibold"
                data-article-id="${article.id}"
                data-article-title="${article.title.replace(/"/g, "&quot;")}">
          <i class="fas fa-trash mr-1"></i>Supprimer
        </button>
      </div>
    </div>
  `;
}

// Create article modal
function createArticleModal() {
  return `
    <div id="articleModal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onclick="closeArticleModal(event)">
      <div class="bg-dark-card rounded-lg p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <h3 id="articleModalTitle" class="text-white text-xl font-bold mb-6">Nouvel Article</h3>
        
        <div class="mb-4">
          <label class="block text-white text-sm mb-2">Titre *</label>
          <input type="text" id="articleTitle" 
                 class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
        </div>
        
        <div class="mb-4">
          <label class="block text-white text-sm mb-2">Catégorie *</label>
          <select id="articleCategory"
                  class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
            <option value="">Sélectionner une catégorie</option>
            <option value="Prévention">Prévention</option>
            <option value="Traitement">Traitement</option>
            <option value="Actualités">Actualités</option>
            <option value="Témoignages">Témoignages</option>
            <option value="Recherche">Recherche</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-white text-sm mb-2">Contenu *</label>
          <textarea id="articleContent" rows="10"
                    class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition"></textarea>
          <p class="text-text-secondary text-xs mt-1">Minimum 50 caractères</p>
        </div>
        
        <div class="mb-6">
          <label class="block text-white text-sm mb-2">Image de Couverture (optionnel)</label>
          
          <!-- Upload Image -->
          <div class="mb-3">
            <label for="articleImageFile" class="block text-text-secondary text-xs mb-2">
              <i class="fas fa-upload mr-1"></i>Télécharger une image (JPG, PNG, GIF, WebP - Max 5MB)
            </label>
            <input type="file" id="articleImageFile" accept="image/*"
                   class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-opacity-90">
            <div id="uploadProgress" class="hidden mt-2">
              <div class="w-full bg-dark rounded-full h-2">
                <div id="uploadProgressBar" class="bg-primary h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
              </div>
              <p class="text-primary text-xs mt-1">Téléchargement en cours...</p>
            </div>
          </div>
          
          <!-- OR text -->
          <p class="text-text-secondary text-center text-xs my-2">OU</p>
          
          <!-- Image URL -->
          <div>
            <label for="articleImageUrl" class="block text-text-secondary text-xs mb-2">
              <i class="fas fa-link mr-1"></i>URL de l'image
            </label>
            <input type="text" id="articleImageUrl" 
                   placeholder="https://example.com/image.jpg"
                   class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
          </div>
          
          <!-- Image Preview -->
          <div id="imagePreview" class="hidden mt-3">
            <img id="previewImage" src="" alt="Preview" class="w-full h-48 object-cover rounded-lg">
          </div>
        </div>
        
        <div class="mb-6">
          <label class="block text-white text-sm mb-2">Statut</label>
          <div class="flex gap-4">
            <label class="flex items-center text-white cursor-pointer">
              <input type="radio" name="articleStatus" value="DRAFT" checked class="mr-2">
              📝 Sauvegarder comme brouillon
            </label>
            <label class="flex items-center text-white cursor-pointer">
              <input type="radio" name="articleStatus" value="PUBLISHED" class="mr-2">
              ✅ Publier immédiatement
            </label>
          </div>
        </div>
        
        <div id="articleModalMessage" class="hidden mb-4"></div>
        
        <div class="flex gap-3">
          <button onclick="saveArticle()" 
                  class="flex-1 bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
            <i class="fas fa-save mr-2"></i>Enregistrer
          </button>
          <button onclick="closeArticleModal()" 
                  class="flex-1 bg-gray-600 hover:bg-opacity-80 text-white font-semibold py-3 px-6 rounded-lg transition">
            Annuler
          </button>
        </div>
      </div>
    </div>
  `;
}

// Attach event listeners
function attachArticleListeners() {
  // Edit buttons
  document.querySelectorAll(".btn-edit-article").forEach((btn) => {
    btn.addEventListener("click", function () {
      const articleId = parseInt(this.dataset.articleId);
      showEditArticleModal(articleId);
    });
  });

  // Toggle status buttons
  document.querySelectorAll(".btn-toggle-status").forEach((btn) => {
    btn.addEventListener("click", function () {
      const articleId = parseInt(this.dataset.articleId);
      const newStatus = this.dataset.status;
      toggleArticleStatus(articleId, newStatus);
    });
  });

  // Delete buttons
  document.querySelectorAll(".btn-delete-article").forEach((btn) => {
    btn.addEventListener("click", function () {
      const articleId = parseInt(this.dataset.articleId);
      const title = this.dataset.articleTitle;
      deleteArticle(articleId, title);
    });
  });
}

// Show create article modal
function showCreateArticleModal() {
  editingArticleId = null;
  document.getElementById("articleModalTitle").textContent = "Nouvel Article";
  document.getElementById("articleTitle").value = "";
  document.getElementById("articleCategory").value = "";
  document.getElementById("articleContent").value = "";
  document.getElementById("articleImageUrl").value = "";
  document.getElementById("articleImageFile").value = "";
  document.getElementById("imagePreview").classList.add("hidden");
  document.querySelector('input[name="articleStatus"][value="DRAFT"]').checked =
    true;
  document.getElementById("articleModal").classList.remove("hidden");

  // Add event listeners for image handling
  setupImageHandlers();
}

// Setup image upload and preview handlers
function setupImageHandlers() {
  const fileInput = document.getElementById("articleImageFile");
  const urlInput = document.getElementById("articleImageUrl");
  const preview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImage");

  // File input change handler
  fileInput.addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);

    // Clear URL input when file is selected
    urlInput.value = "";
  });

  // URL input change handler
  urlInput.addEventListener("input", function () {
    if (this.value.trim()) {
      // Clear file input when URL is provided
      fileInput.value = "";

      // Show preview if valid URL
      if (this.value.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
        previewImg.src = this.value;
        preview.classList.remove("hidden");
      } else {
        preview.classList.add("hidden"); // Hide if URL is not an image
      }
    } else {
      preview.classList.add("hidden");
    }
  });
}

// Show edit article modal
function showEditArticleModal(articleId) {
  const article = articlesList.find((a) => a.id === articleId);
  if (!article) return;

  editingArticleId = articleId;
  document.getElementById("articleModalTitle").textContent =
    "Modifier l'Article";
  document.getElementById("articleTitle").value = article.title;
  document.getElementById("articleCategory").value = article.category;
  document.getElementById("articleContent").value = article.content;
  document.getElementById("articleImageUrl").value = article.image_url || "";
  document.querySelector(
    `input[name="articleStatus"][value="${article.status}"]`,
  ).checked = true;
  document.getElementById("articleModal").classList.remove("hidden");
}

// Close article modal
function closeArticleModal(event) {
  if (!event || event.target.id === "articleModal") {
    document.getElementById("articleModal").classList.add("hidden");
    editingArticleId = null;
  }
}

// Save article
async function saveArticle() {
  const title = document.getElementById("articleTitle").value.trim();
  const category = document.getElementById("articleCategory").value;
  const content = document.getElementById("articleContent").value.trim();
  let imageUrl = document.getElementById("articleImageUrl").value.trim();
  const imageFile = document.getElementById("articleImageFile").files[0];
  const status = document.querySelector(
    'input[name="articleStatus"]:checked',
  ).value;
  const messageDiv = document.getElementById("articleModalMessage");

  if (!title || title.length < 5) {
    showModalMessage(
      messageDiv,
      "Le titre doit contenir au moins 5 caractères",
      "error",
    );
    return;
  }

  if (!category) {
    showModalMessage(messageDiv, "La catégorie est requise", "error");
    return;
  }

  if (!content || content.length < 50) {
    showModalMessage(
      messageDiv,
      "Le contenu doit contenir au moins 50 caractères",
      "error",
    );
    return;
  }

  // Upload image file if provided
  if (imageFile && !imageUrl) {
    showModalMessage(messageDiv, "Téléchargement de l'image...", "success");

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      // Get JWT token manually for file upload
      const token = localStorage.getItem("token");

      const uploadResponse = await fetch(
        "/aids/api/admin/articles/upload-image.php",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set Content-Type - browser will set it automatically with boundary for FormData
          },
          body: formData,
        },
      );

      const uploadResult = await uploadResponse.json();

      if (uploadResult.success) {
        imageUrl = uploadResult.image_url;
      } else {
        showModalMessage(
          messageDiv,
          uploadResult.message || "Erreur lors du téléchargement de l'image",
          "error",
        );
        return;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showModalMessage(
        messageDiv,
        "Erreur lors du téléchargement de l'image",
        "error",
      );
      return;
    }
  }

  const endpoint = editingArticleId
    ? "/aids/api/admin/articles/update.php"
    : "/aids/api/admin/articles/create.php";

  const data = editingArticleId
    ? {
        article_id: editingArticleId,
        title,
        category,
        content,
        image_url: imageUrl,
        status,
      }
    : { title, category, content, image_url: imageUrl, status };

  try {
    const response = await authenticatedFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      closeArticleModal();
      showArticleMessage(result.message, "success");
      loadAllArticles();
    } else {
      showModalMessage(messageDiv, result.message, "error");
    }
  } catch (error) {
    console.error("Error saving article:", error);
    showModalMessage(messageDiv, "Erreur de connexion", "error");
  }
}

// Toggle article status
async function toggleArticleStatus(articleId, newStatus) {
  const article = articlesList.find((a) => a.id === articleId);
  const action = newStatus === "published" ? "publier" : "dépublier";

  if (!confirm(`Êtes-vous sûr de vouloir ${action} cet article ?`)) {
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/admin/articles/update.php",
      {
        method: "POST",
        body: JSON.stringify({
          article_id: articleId,
          title: article.title,
          category: article.category,
          content: article.content,
          image_url: article.image_url,
          status: newStatus,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      showArticleMessage(result.message, "success");
      loadAllArticles();
    } else {
      showArticleMessage(result.message, "error");
    }
  } catch (error) {
    console.error("Error toggling status:", error);
    showArticleMessage("Erreur de connexion", "error");
  }
}

// Delete article
async function deleteArticle(articleId, title) {
  if (
    !confirm(
      `Êtes-vous sûr de vouloir supprimer l'article "${title}" ?\n\nCette action est irréversible.`,
    )
  ) {
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/admin/articles/delete.php",
      {
        method: "POST",
        body: JSON.stringify({ article_id: articleId }),
      },
    );

    const result = await response.json();

    if (result.success) {
      showArticleMessage(result.message, "success");
      loadAllArticles();
    } else {
      showArticleMessage(result.message, "error");
    }
  } catch (error) {
    console.error("Error deleting article:", error);
    showArticleMessage("Erreur de connexion", "error");
  }
}

// Show article message
function showArticleMessage(message, type) {
  const messageDiv = document.getElementById("articleMessage");
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
function showArticleError(message) {
  const container = document.getElementById("articleManagementContent");
  container.innerHTML = `
    <div class="max-w-3xl mx-auto text-center">
      <i class="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
      <h2 class="text-white text-2xl font-bold mb-4">Erreur</h2>
      <p class="text-text-secondary mb-6">${message}</p>
      <button onclick="loadAllArticles()" 
              class="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
        Réessayer
      </button>
    </div>
  `;
}

// articles.js - Component for displaying articles

// Load and display articles
async function loadArticles() {
  try {
    const response = await fetch("/aids/api/articles/list.php");
    const result = await response.json();

    if (result.success) {
      displayArticles(result.data.articles);
    } else {
      showError("Erreur lors du chargement des articles");
    }
  } catch (error) {
    console.error("Error loading articles:", error);
    showError("Erreur de connexion");
  }
}

// Display articles in grid
function displayArticles(articles) {
  const container = document.getElementById("articlesTab");

  if (!articles || articles.length === 0) {
    container.innerHTML = `
            <div class="bg-dark-card rounded-lg p-8 text-center">
                <i class="fas fa-newspaper text-primary text-6xl mb-4"></i>
                <h2 class="text-white text-2xl font-bold mb-4">Aucun article</h2>
                <p class="text-text-secondary">Aucun article n'est disponible pour le moment.</p>
            </div>
        `;
    return;
  }

  const articlesHTML = articles
    .map((article) => createArticleCard(article))
    .join("");

  container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-white text-2xl font-bold mb-2">Articles</h2>
            <p class="text-text-secondary">Informations et ressources sur le VIH/SIDA</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${articlesHTML}
        </div>
    `;

  // Add click listeners to read more buttons
  articles.forEach((article) => {
    const button = document.getElementById(`read-${article.id}`);
    if (button) {
      button.addEventListener("click", () => showArticleDetail(article.id));
    }
  });
}

// Create article card HTML
function createArticleCard(article) {
  const author =
    article.author_first_name && article.author_last_name
      ? `${article.author_first_name} ${article.author_last_name}`
      : article.author_username;

  const publishedDate = new Date(article.published_at).toLocaleDateString(
    "fr-FR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return `
        <div class="bg-dark-card rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition duration-300">
            ${
              article.cover_image
                ? `
                <img src="${article.cover_image}" alt="${article.title}" class="w-full h-64 object-cover">
            `
                : `
                <div class="w-full h-64 bg-gradient-to-br from-primary to-red-700 flex items-center justify-center">
                    <i class="fas fa-newspaper text-white text-6xl opacity-50"></i>
                </div>
            `
            }
            
            <div class="p-6">
                <h3 class="text-white text-xl font-bold mb-2 line-clamp-2">${article.title}</h3>
                
                <p class="text-text-secondary text-sm mb-4 line-clamp-3">
                    ${article.excerpt || ""}
                </p>
                
                <div class="flex items-center justify-between text-text-secondary text-sm mb-4">
                    <div class="flex items-center space-x-4">
                        <span><i class="fas fa-user mr-1"></i>${author}</span>
                        <span><i class="fas fa-calendar mr-1"></i>${publishedDate}</span>
                    </div>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4 text-text-secondary text-sm">
                        <span><i class="fas fa-heart mr-1"></i>${article.likes_count || 0}</span>
                        <span><i class="fas fa-comment mr-1"></i>${article.comments_count || 0}</span>
                    </div>
                    
                    <button 
                        id="read-${article.id}"
                        class="bg-primary hover:bg-opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Lire plus
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Show article detail modal
async function showArticleDetail(articleId) {
  try {
    const response = await fetch(
      `/aids/api/articles/detail.php?id=${articleId}`,
    );
    const result = await response.json();

    if (result.success) {
      displayArticleModal(result.data);
    } else {
      showError("Article non trouvé");
    }
  } catch (error) {
    console.error("Error loading article:", error);
    showError("Erreur de chargement");
  }
}

// Display article in modal
function displayArticleModal(article) {
  const author =
    article.author_first_name && article.author_last_name
      ? `${article.author_first_name} ${article.author_last_name}`
      : article.author_username;

  const publishedDate = new Date(article.published_at).toLocaleDateString(
    "fr-FR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const likeButtonClass = article.user_has_liked
    ? "bg-primary text-white"
    : "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white";

  const likeIcon = article.user_has_liked ? "fas fa-heart" : "far fa-heart";

  const modalHTML = `
        <div id="articleModal" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div class="bg-dark-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="sticky top-0 bg-dark-card border-b border-gray-700 p-6 flex justify-between items-center">
                    <h2 class="text-white text-2xl font-bold pr-8">${article.title}</h2>
                    <button onclick="closeArticleModal()" class="text-white hover:text-primary text-3xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div class="p-6">
                    <!-- Meta info -->
                    <div class="flex items-center justify-between text-text-secondary text-sm mb-6 pb-4 border-b border-gray-700">
                        <div class="flex items-center space-x-4">
                            <span><i class="fas fa-user mr-1"></i>${author}</span>
                            <span><i class="fas fa-calendar mr-1"></i>${publishedDate}</span>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span><i class="fas fa-heart mr-1"></i><span id="likesCount">${article.likes_count || 0}</span></span>
                            <span><i class="fas fa-comment mr-1"></i>${article.comments_count || 0}</span>
                        </div>
                    </div>
                    
                    <!-- Article content -->
                    <div class="text-white prose prose-invert max-w-none mb-8" style="white-space: pre-line;">
                        ${article.content}
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-700">
                        <button 
                            id="likeButton" 
                            onclick="toggleLike(${article.id})"
                            class="${likeButtonClass} font-semibold py-2 px-6 rounded-lg transition"
                        >
                            <i id="likeIcon" class="${likeIcon} mr-2"></i>
                            <span id="likeText">${article.user_has_liked ? "Favori" : "Aimer"}</span>
                        </button>
                    </div>
                    
                    <!-- Comments section -->
                    <div class="mb-4" id="commentsSection">
                        <h3 class="text-white text-xl font-bold mb-4">
                            Commentaires (<span id="commentsCount">${article.comments_count || 0}</span>)
                        </h3>
                        
                        <!-- Add comment form -->
                        <div class="mb-6">
                            <textarea 
                                id="commentInput"
                                placeholder="Ajouter un commentaire..."
                                class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition resize-none"
                                rows="3"
                            ></textarea>
                            <button 
                                onclick="addComment(${article.id})"
                                class="mt-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2 px-6 rounded-lg transition"
                            >
                                <i class="fas fa-comment mr-2"></i>Commenter
                            </button>
                        </div>
                        
                        <!-- Comments list -->
                        <div id="commentsList" class="space-y-4">
                            <!-- Comments will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  // Add modal to body
  const existingModal = document.getElementById("articleModal");
  if (existingModal) {
    existingModal.remove();
  }

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Prevent body scroll
  document.body.style.overflow = "hidden";

  // Load comments for this article
  loadComments(article.id);
}

// Load comments for an article
async function loadComments(articleId) {
  try {
    const response = await fetch(
      `/aids/api/articles/comments/list.php?article_id=${articleId}`,
    );
    const result = await response.json();

    if (result.success) {
      displayComments(result.data, articleId);
    }
  } catch (error) {
    console.error("Error loading comments:", error);
  }
}

// Display comments
function displayComments(comments, articleId) {
  const commentsList = document.getElementById("commentsList");
  const currentUser = getCurrentUser();

  if (!comments || comments.length === 0) {
    commentsList.innerHTML =
      '<p class="text-text-secondary text-center py-4">Aucun commentaire pour le moment. Soyez le premier à commenter!</p>';
    return;
  }

  const commentsHTML = comments
    .map((comment) => {
      const author =
        comment.first_name && comment.last_name
          ? `${comment.first_name} ${comment.last_name}`
          : comment.username;

      const commentDate = new Date(comment.created_at).toLocaleDateString(
        "fr-FR",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      );

      const canDelete =
        currentUser &&
        (currentUser.id === comment.user_id || currentUser.role === "ADMIN");

      return `
            <div class="bg-dark p-4 rounded-lg">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-bold">${author.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <p class="text-white font-semibold text-sm">${author}</p>
                            <p class="text-text-secondary text-xs">${commentDate}</p>
                        </div>
                    </div>
                    ${
                      canDelete
                        ? `
                        <button 
                            onclick="deleteComment(${comment.id}, ${articleId})"
                            class="text-red-500 hover:text-red-400 transition"
                            title="Supprimer"
                        >
                            <i class="fas fa-trash"></i>
                        </button>
                    `
                        : ""
                    }
                </div>
                <p class="text-white text-sm">${comment.content}</p>
            </div>
        `;
    })
    .join("");

  commentsList.innerHTML = commentsHTML;
}

// Add a comment
async function addComment(articleId) {
  const input = document.getElementById("commentInput");
  const content = input.value.trim();

  if (!content) {
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/articles/comments/add.php",
      {
        method: "POST",
        body: JSON.stringify({
          article_id: articleId,
          content: content,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      // Clear input
      input.value = "";

      // Reload comments
      loadComments(articleId);

      // Update comment count
      const commentsCount = document.getElementById("commentsCount");
      if (commentsCount) {
        const currentCount = parseInt(commentsCount.textContent) || 0;
        commentsCount.textContent = currentCount + 1;
      }

      // Reload articles to update counts in card view
      loadArticles();
    } else {
      showError(result.message || "Erreur lors de l'ajout du commentaire");
    }
  } catch (error) {
    console.error("Error adding comment:", error);
    showError("Erreur lors de l'ajout du commentaire");
  }
}

// Delete a comment
async function deleteComment(commentId, articleId) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/articles/comments/delete.php",
      {
        method: "POST",
        body: JSON.stringify({
          comment_id: commentId,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      // Reload comments
      loadComments(articleId);

      // Update comment count
      const commentsCount = document.getElementById("commentsCount");
      if (commentsCount) {
        const currentCount = parseInt(commentsCount.textContent) || 0;
        commentsCount.textContent = Math.max(0, currentCount - 1);
      }

      // Reload articles to update counts
      loadArticles();
    } else {
      showError(result.message || "Erreur lors de la suppression");
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    showError("Erreur lors de la suppression");
  }
}

// Close article modal
function closeArticleModal() {
  const modal = document.getElementById("articleModal");
  if (modal) {
    modal.remove();
    document.body.style.overflow = "auto";
  }
}

// Toggle like on article
async function toggleLike(articleId) {
  try {
    const response = await authenticatedFetch("/aids/api/articles/like.php", {
      method: "POST",
      body: JSON.stringify({ article_id: articleId }),
    });

    const result = await response.json();

    if (result.success) {
      // Update UI
      const likesCount = document.getElementById("likesCount");
      const likeButton = document.getElementById("likeButton");
      const likeIcon = document.getElementById("likeIcon");
      const likeText = document.getElementById("likeText");

      if (likesCount) likesCount.textContent = result.data.likes_count;

      if (result.data.liked) {
        likeButton.className =
          "bg-primary text-white font-semibold py-2 px-6 rounded-lg transition";
        likeIcon.className = "fas fa-heart mr-2";
        likeText.textContent = "Favori";
      } else {
        likeButton.className =
          "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-2 px-6 rounded-lg transition";
        likeIcon.className = "far fa-heart mr-2";
        likeText.textContent = "Aimer";
      }

      // Reload articles to update counts
      loadArticles();
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    showError("Erreur lors de l'action");
  }
}

// Show error message
function showError(message) {
  console.error(message);
  // Could add a toast notification here
}

// Initialize articles when dashboard loads
if (document.getElementById("articlesTab")) {
  loadArticles();
}

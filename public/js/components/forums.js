// forums.js - Forum component

// Global state
let currentView = "categories"; // 'categories', 'posts', 'detail'
let currentCategory = null;
let currentPost = null;

// Load and display forum categories
async function loadForumCategories() {
  try {
    const response = await fetch("/aids/api/forums/categories/list.php");
    const result = await response.json();

    if (result.success) {
      displayCategories(result.data);
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

// Display categories grid
function displayCategories(categories) {
  const container = document.getElementById("forumsTab");

  const categoriesHTML = categories
    .map(
      (cat) => `
        <div onclick="showCategoryPosts(${cat.id}, '${cat.name}')" 
             class="bg-dark-card rounded-lg p-6 cursor-pointer hover:bg-opacity-80 transition">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <i class="${cat.icon} text-white text-2xl"></i>
                </div>
                <span class="text-text-secondary text-sm">${cat.posts_count} posts</span>
            </div>
            <h3 class="text-white text-xl font-bold mb-2">${cat.name}</h3>
            <p class="text-text-secondary text-sm">${cat.description}</p>
        </div>
    `,
    )
    .join("");

  container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-white text-2xl font-bold mb-2">Forums</h2>
            <p class="text-text-secondary">Partagez vos expériences et posez vos questions</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${categoriesHTML}
        </div>
    `;

  currentView = "categories";
}

// Show posts in a category
async function showCategoryPosts(categoryId, categoryName) {
  currentCategory = { id: categoryId, name: categoryName };

  try {
    const response = await fetch(
      `/aids/api/forums/posts/list.php?category_id=${categoryId}`,
    );
    const result = await response.json();

    if (result.success) {
      displayPosts(result.data);
    }
  } catch (error) {
    console.error("Error loading posts:", error);
  }
}

// Display posts list
function displayPosts(posts) {
  const container = document.getElementById("forumsTab");

  const postsHTML =
    posts.length > 0
      ? posts
          .map((post) => {
            const author =
              post.first_name && post.last_name
                ? `${post.first_name} ${post.last_name}`
                : post.username;

            const timeAgo = getTimeAgo(post.created_at);

            return `
            <div onclick="showPostDetail(${post.id})" 
                 class="bg-dark-card rounded-lg p-6 cursor-pointer hover:bg-opacity-80 transition">
                <div class="flex gap-4">
                    <div class="flex flex-col items-center">
                        <button class="text-text-secondary hover:text-primary transition">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <span class="text-white font-bold my-1">${post.vote_score}</span>
                        <button class="text-text-secondary hover:text-primary transition">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-white text-lg font-bold mb-2">${post.title}</h3>
                        <p class="text-text-secondary text-sm mb-3 line-clamp-2">${post.content}</p>
                        <div class="flex items-center gap-4 text-text-secondary text-sm">
                            <span><i class="fas fa-user mr-1"></i>${author}</span>
                            <span><i class="fas fa-clock mr-1"></i>${timeAgo}</span>
                            <span><i class="fas fa-comment mr-1"></i>${post.comments_count} commentaires</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
          })
          .join("")
      : '<p class="text-text-secondary text-center py-8">Aucun post dans cette catégorie. Soyez le premier à créer un!</p>';

  container.innerHTML = `
        <div class="mb-6">
            <button onclick="loadForumCategories()" class="text-primary hover:underline mb-4">
                <i class="fas fa-arrow-left mr-2"></i>Retour aux catégories
            </button>
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-white text-2xl font-bold mb-2">${currentCategory.name}</h2>
                </div>
                <button onclick="showCreatePostForm()" 
                        class="bg-primary hover:bg-opacity-90 text-white font-semibold py-2 px-6 rounded-lg transition">
                    <i class="fas fa-plus mr-2"></i>Nouveau post
                </button>
            </div>
        </div>
        <div class="space-y-4">
            ${postsHTML}
        </div>
    `;

  currentView = "posts";
}

// Show create post form
function showCreatePostForm() {
  const container = document.getElementById("forumsTab");

  container.innerHTML = `
        <div class="mb-6">
            <button onclick="showCategoryPosts(${currentCategory.id}, '${currentCategory.name}')" 
                    class="text-primary hover:underline mb-4">
                <i class="fas fa-arrow-left mr-2"></i>Retour aux posts
            </button>
            <h2 class="text-white text-2xl font-bold">Créer un post</h2>
        </div>
        
        <div class="bg-dark-card rounded-lg p-6">
            <div class="mb-4">
                <label class="block text-white text-sm font-medium mb-2">Titre</label>
                <input 
                    id="postTitle"
                    type="text"
                    placeholder="Titre de votre post"
                    class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition"
                />
            </div>
            
            <div class="mb-6">
                <label class="block text-white text-sm font-medium mb-2">Contenu</label>
                <textarea 
                    id="postContent"
                    placeholder="Partagez vos pensées..."
                    rows="8"
                    class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition resize-none"
                ></textarea>
            </div>
            
            <div id="postError" class="hidden bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm mb-4"></div>
            
            <div class="flex gap-4">
                <button onclick="createPost()" 
                        class="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
                    <i class="fas fa-paper-plane mr-2"></i>Publier
                </button>
                <button onclick="showCategoryPosts(${currentCategory.id}, '${currentCategory.name}')" 
                        class="bg-gray-600 hover:bg-opacity-80 text-white font-semibold py-3 px-6 rounded-lg transition">
                    Annuler
                </button>
            </div>
        </div>
    `;
}

// Helper function to get time ago
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "À l'instant";
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
  if (seconds < 2592000) return `il y a ${Math.floor(seconds / 86400)} j`;
  return date.toLocaleDateString("fr-FR");
}

// Initialize forums when tab is loaded
if (document.getElementById("forumsTab")) {
  loadForumCategories();
}

// Create new post
async function createPost() {
  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();
  const errorDiv = document.getElementById("postError");

  if (!title || !content) {
    errorDiv.textContent = "Le titre et le contenu sont requis";
    errorDiv.classList.remove("hidden");
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/forums/posts/create.php",
      {
        method: "POST",
        body: JSON.stringify({
          category_id: currentCategory.id,
          title: title,
          content: content,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      // Return to posts list
      showCategoryPosts(currentCategory.id, currentCategory.name);
    } else {
      errorDiv.textContent =
        result.message || "Erreur lors de la création du post";
      errorDiv.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error creating post:", error);
    errorDiv.textContent = "Erreur lors de la création du post";
    errorDiv.classList.remove("hidden");
  }
}

// Show post detail with comments
async function showPostDetail(postId) {
  try {
    const response = await fetch(
      `/aids/api/forums/posts/detail.php?id=${postId}`,
    );
    const result = await response.json();

    if (result.success) {
      currentPost = result.data;
      displayPostDetail(result.data);
    }
  } catch (error) {
    console.error("Error loading post:", error);
  }
}

// Display full post with comments
function displayPostDetail(post) {
  const container = document.getElementById("forumsTab");
  const author =
    post.first_name && post.last_name
      ? `${post.first_name} ${post.last_name}`
      : post.username;

  const timeAgo = getTimeAgo(post.created_at);

  const commentsHTML =
    post.comments.length > 0
      ? post.comments.map((comment) => createCommentHTML(comment)).join("")
      : '<p class="text-text-secondary text-center py-4">Aucun commentaire. Soyez le premier!</p>';

  container.innerHTML = `
        <div class="mb-6">
            <button onclick="showCategoryPosts(${currentCategory.id}, '${currentCategory.name}')" 
                    class="text-primary hover:underline mb-4">
                <i class="fas fa-arrow-left mr-2"></i>Retour aux posts
            </button>
        </div>
        
        <div class="bg-dark-card rounded-lg p-6 mb-6">
            <div class="flex gap-4 mb-4">
                <div class="flex flex-col items-center">
                    <button onclick="votePost(${post.id}, 1)" 
                            id="postUpvote"
                            class="text-text-secondary hover:text-green-500 transition">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <span id="postVoteScore" class="text-white font-bold my-1">${post.vote_score}</span>
                    <button onclick="votePost(${post.id}, -1)"
                            id="postDownvote"
                            class="text-text-secondary hover:text-red-500 transition">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
                <div class="flex-1">
                    <h1 class="text-white text-2xl font-bold mb-4">${post.title}</h1>
                   <div class="flex items-center gap-4 text-text-secondary text-sm mb-4">
                        <span><i class="fas fa-user mr-1"></i>${author}</span>
                        <span><i class="fas fa-clock mr-1"></i>${timeAgo}</span>
                        <span><i class="fas fa-comment mr-1"></i>${post.comments_count} commentaires</span>
                    </div>
                    <p class="text-white whitespace-pre-line mb-4">${post.content}</p>
                    ${
                      getCurrentUser() && getCurrentUser().role === "ADMIN"
                        ? `
                        <button onclick="adminDeletePost(${post.id})" 
                                class="text-red-600 hover:text-red-500 transition text-sm font-semibold"
                                title="Supprimer (Admin)">
                            <i class="fas fa-trash-alt mr-1"></i>Supprimer ce post (Admin)
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        </div>
        
        <div class="bg-dark-card rounded-lg p-6">
            <h3 class="text-white text-xl font-bold mb-4">Commentaires (${post.comments.length})</h3>
            
            <div id="addCommentForm" class="mb-6">
                <textarea 
                    id="commentContent"
                    placeholder="Ajouter un commentaire..."
                    rows="3"
                    class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition resize-none"
                ></textarea>
                <button onclick="addForumComment()"
                        class="mt-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2 px-6 rounded-lg transition">
                    <i class="fas fa-comment mr-2"></i>Commenter
                </button>
            </div>
            
            <div id="commentsList" class="space-y-4">
                ${commentsHTML}
            </div>
        </div>
    `;
}

// Store vote states
let userVotes = { posts: {}, comments: {} };

// Create comment HTML
function createCommentHTML(comment) {
  const author =
    comment.first_name && comment.last_name
      ? `${comment.first_name} ${comment.last_name}`
      : comment.username;

  const timeAgo = getTimeAgo(comment.created_at);
  const currentUser = getCurrentUser();
  const canDelete = currentUser && currentUser.id === comment.author_id;

  return `
        <div class="bg-dark p-4 rounded-lg">
            <div class="flex gap-3 mb-2">
                <div class="flex flex-col items-center">
                    <button onclick="voteComment(${comment.id}, 1)" 
                            id="commentUp${comment.id}"
                            class="text-text-secondary hover:text-green-500 transition text-sm">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <span id="commentVote${comment.id}" class="text-white text-sm font-bold my-1">${comment.vote_score}</span>
                    <button onclick="voteComment(${comment.id}, -1)"
                            id="commentDown${comment.id}"
                            class="text-text-secondary hover:text-red-500 transition text-sm">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <div>
                            <span class="text-white font-semibold text-sm">${author}</span>
                            <span class="text-text-secondary text-xs ml-2">${timeAgo}</span>
                        </div>
                        ${
                          canDelete
                            ? `
                            <button onclick="deleteForumComment(${comment.id})" 
                                    class="text-red-500 hover:text-red-400 transition text-sm"
                                    title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        `
                            : currentUser && currentUser.role === "ADMIN"
                              ? `
                            <button onclick="adminDeleteComment(${comment.id})" 
                                    class="text-red-600 hover:text-red-500 transition text-sm font-semibold"
                                    title="Supprimer (Admin)">
                                <i class="fas fa-shield-alt mr-1"></i><i class="fas fa-trash"></i>
                            </button>
                        `
                              : ""
                        }
                    </div>
                    <p class="text-white text-sm whitespace-pre-line">${comment.content}</p>
                </div>
            </div>
        </div>
    `;
}

// Vote on post
async function votePost(postId, voteValue) {
  try {
    // Toggle: if clicking same vote, remove it
    const currentVote = userVotes.posts[postId] || 0;
    const newVote = currentVote === voteValue ? 0 : voteValue;

    const response = await authenticatedFetch(
      "/aids/api/forums/posts/vote.php",
      {
        method: "POST",
        body: JSON.stringify({
          post_id: postId,
          vote_value: newVote,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      document.getElementById("postVoteScore").textContent =
        result.data.vote_score;

      // Update UI colors
      const upBtn = document.getElementById("postUpvote");
      const downBtn = document.getElementById("postDownvote");

      userVotes.posts[postId] = newVote;

      if (newVote === 1) {
        upBtn.classList.add("text-green-500");
        upBtn.classList.remove("text-text-secondary");
        downBtn.classList.add("text-text-secondary");
        downBtn.classList.remove("text-red-500");
      } else if (newVote === -1) {
        downBtn.classList.add("text-red-500");
        downBtn.classList.remove("text-text-secondary");
        upBtn.classList.add("text-text-secondary");
        upBtn.classList.remove("text-green-500");
      } else {
        upBtn.classList.add("text-text-secondary");
        upBtn.classList.remove("text-green-500");
        downBtn.classList.add("text-text-secondary");
        downBtn.classList.remove("text-red-500");
      }
    }
  } catch (error) {
    console.error("Error voting:", error);
  }
}

// Vote on comment
async function voteComment(commentId, voteValue) {
  try {
    // Toggle: if clicking same vote, remove it
    const currentVote = userVotes.comments[commentId] || 0;
    const newVote = currentVote === voteValue ? 0 : voteValue;

    const response = await authenticatedFetch(
      "/aids/api/forums/comments/vote.php",
      {
        method: "POST",
        body: JSON.stringify({
          comment_id: commentId,
          vote_value: newVote,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      document.getElementById(`commentVote${commentId}`).textContent =
        result.data.vote_score;

      // Update UI colors
      const upBtn = document.getElementById(`commentUp${commentId}`);
      const downBtn = document.getElementById(`commentDown${commentId}`);

      userVotes.comments[commentId] = newVote;

      if (newVote === 1) {
        upBtn.classList.add("text-green-500");
        upBtn.classList.remove("text-text-secondary");
        downBtn.classList.add("text-text-secondary");
        downBtn.classList.remove("text-red-500");
      } else if (newVote === -1) {
        downBtn.classList.add("text-red-500");
        downBtn.classList.remove("text-text-secondary");
        upBtn.classList.add("text-text-secondary");
        upBtn.classList.remove("text-green-500");
      } else {
        upBtn.classList.add("text-text-secondary");
        upBtn.classList.remove("text-green-500");
        downBtn.classList.add("text-text-secondary");
        downBtn.classList.remove("text-red-500");
      }
    }
  } catch (error) {
    console.error("Error voting:", error);
  }
}

// Add comment to post
async function addForumComment() {
  const content = document.getElementById("commentContent").value.trim();

  if (!content) {
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/forums/comments/add.php",
      {
        method: "POST",
        body: JSON.stringify({
          post_id: currentPost.id,
          content: content,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      // Reload post detail
      showPostDetail(currentPost.id);
    }
  } catch (error) {
    console.error("Error adding comment:", error);
  }
}

// Delete forum comment
async function deleteForumComment(commentId) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/forums/comments/delete.php",
      {
        method: "POST",
        body: JSON.stringify({
          comment_id: commentId,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      // Reload post detail
      showPostDetail(currentPost.id);
    } else {
      alert(result.message || "Erreur lors de la suppression");
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    alert("Erreur lors de la suppression");
  }
}

// Admin delete post (can delete ANY post)
async function adminDeletePost(postId) {
  if (
    !confirm(
      "[ADMIN] Êtes-vous sûr de vouloir supprimer ce post ?\n\nCette action supprimera également tous les commentaires associés.",
    )
  ) {
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/admin/forums/posts/delete.php",
      {
        method: "POST",
        body: JSON.stringify({
          post_id: postId,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      // Return to category posts list
      showCategoryPosts(currentCategory.id, currentCategory.name);
    } else {
      alert(result.message || "Erreur lors de la suppression");
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("Erreur lors de la suppression");
  }
}

// Admin delete comment (can delete ANY comment)
async function adminDeleteComment(commentId) {
  if (!confirm("[ADMIN] Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/admin/forums/comments/delete.php",
      {
        method: "POST",
        body: JSON.stringify({
          comment_id: commentId,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      // Reload post detail
      showPostDetail(currentPost.id);
    } else {
      alert(result.message || "Erreur lors de la suppression");
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    alert("Erreur lors de la suppression");
  }
}

// quizManagement.js - Quiz and Question Management Component

let managedQuizzes = [];
let currentQuiz = null;
let currentQuestions = [];
let quizView = "quizzes"; // 'quizzes' or 'questions' (renamed to avoid conflict)
let editingQuizId = null;
let editingQuestionId = null;

// Initialize quiz management
window.initQuizManagement = function () {
  console.log("Quiz Management: Initializing...");
  loadAllQuizzes();
};

// Load all quizzes
async function loadAllQuizzes() {
  console.log("Quiz Management: Loading quizzes...");
  try {
    const response = await authenticatedFetch("/aids/api/admin/quiz/list.php");
    console.log("Quiz Management: Response received", response);
    const result = await response.json();
    console.log("Quiz Management: Result", result);

    if (result.success) {
      managedQuizzes = result.data;
      console.log("Quiz Management: Loaded quizzes:", managedQuizzes);
      renderQuizList();
    } else {
      showQuizError(result.message || "Erreur lors du chargement des quiz");
    }
  } catch (error) {
    console.error("Quiz Management: Error loading quizzes:", error);
    showQuizError("Erreur de connexion");
  }
}

// Render quiz list
function renderQuizList() {
  const container = document.getElementById("quizManagementContent");
  quizView = "quizzes";

  const activeQuizzes = managedQuizzes.filter((q) => q.active);
  const inactiveQuizzes = managedQuizzes.filter((q) => !q.active);

  const activeHTML =
    activeQuizzes.length > 0
      ? activeQuizzes.map((quiz) => createQuizCard(quiz)).join("")
      : '<p class="text-text-secondary text-center py-4">Aucun quiz actif</p>';

  const inactiveHTML =
    inactiveQuizzes.length > 0
      ? inactiveQuizzes.map((quiz) => createQuizCard(quiz)).join("")
      : '<p class="text-text-secondary text-center py-4">Aucun quiz inactif</p>';

  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-white text-2xl font-bold">Gestion des Quiz</h2>
        <button onclick="showCreateQuizModal()" 
                class="bg-primary hover:bg-opacity-90 text-white font-semibold py-2 px-6 rounded-lg transition">
          <i class="fas fa-plus mr-2"></i>Nouveau Quiz
        </button>
      </div>
      
      <div id="quizMessage" class="hidden mb-4"></div>
      
      <div class="mb-8">
        <h3 class="text-white text-lg font-semibold mb-4">Quiz Actifs (${activeQuizzes.length})</h3>
        <div class="space-y-4">
          ${activeHTML}
        </div>
      </div>
      
      ${
        inactiveQuizzes.length > 0
          ? `
        <div>
          <h3 class="text-white text-lg font-semibold mb-4">Quiz Inactifs (${inactiveQuizzes.length})</h3>
          <div class="space-y-4">
            ${inactiveHTML}
          </div>
        </div>
      `
          : ""
      }
    </div>
    
    ${createQuizModal()}
  `;

  // Add event listeners after rendering
  attachQuizCardListeners();
}

// Create quiz card HTML
function createQuizCard(quiz) {
  const statusBadge = quiz.active
    ? '<span class="bg-green-600 text-white text-xs px-2 py-1 rounded">Actif</span>'
    : '<span class="bg-gray-600 text-white text-xs px-2 py-1 rounded">Inactif</span>';

  const cardId = `quiz-card-${quiz.id}`;

  return `
    <div class="bg-dark-card rounded-lg p-6" id="${cardId}">
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-white text-xl font-bold">${quiz.title}</h3>
            ${statusBadge}
          </div>
          <p class="text-text-secondary text-sm mb-3">${quiz.description || "Aucune description"}</p>
          <div class="text-text-secondary text-sm">
            <i class="fas fa-question-circle mr-1"></i>${quiz.question_count} question(s)
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn-edit-quiz text-blue-500 hover:text-blue-400 transition text-sm font-semibold"
                data-quiz-id="${quiz.id}"
                data-quiz-title="${quiz.title.replace(/"/g, "&quot;")}"
                data-quiz-description="${(quiz.description || "").replace(/"/g, "&quot;")}"
                data-quiz-active="${quiz.active}">
          <i class="fas fa-edit mr-1"></i>Modifier
        </button>
        <button class="btn-manage-questions text-primary hover:text-opacity-80 transition text-sm font-semibold"
                data-quiz-id="${quiz.id}"
                data-quiz-title="${quiz.title.replace(/"/g, "&quot;")}">
          <i class="fas fa-tasks mr-1"></i>Gérer Questions
        </button>
        <button class="btn-delete-quiz text-red-500 hover:text-red-400 transition text-sm font-semibold"
                data-quiz-id="${quiz.id}"
                data-quiz-title="${quiz.title.replace(/"/g, "&quot;")}">
          <i class="fas fa-trash mr-1"></i>Supprimer
        </button>
      </div>
    </div>
  `;
}

// Create quiz modal HTML
function createQuizModal() {
  return `
    <div id="quizModal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onclick="closeQuizModal(event)">
      <div class="bg-dark-card rounded-lg p-8 max-w-md w-full mx-4" onclick="event.stopPropagation()">
        <h3 id="quizModalTitle" class="text-white text-xl font-bold mb-6">Nouveau Quiz</h3>
        
        <div class="mb-4">
          <label class="block text-white text-sm mb-2">Titre *</label>
          <input type="text" id="quizTitle" 
                 class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
        </div>
        
        <div class="mb-4">
          <label class="block text-white text-sm mb-2">Description</label>
          <textarea id="quizDescription" rows="3"
                    class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition"></textarea>
        </div>
        
        <div class="mb-6">
          <label class="flex items-center text-white text-sm cursor-pointer">
            <input type="checkbox" id="quizActive" checked class="mr-2">
            Actif
          </label>
        </div>
        
        <div id="quizModalMessage" class="hidden mb-4"></div>
        
        <div class="flex gap-3">
          <button onclick="saveQuiz()" 
                  class="flex-1 bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
            <i class="fas fa-save mr-2"></i>Enregistrer
          </button>
          <button onclick="closeQuizModal()" 
                  class="flex-1 bg-gray-600 hover:bg-opacity-80 text-white font-semibold py-3 px-6 rounded-lg transition">
            Annuler
          </button>
        </div>
      </div>
    </div>
  `;
}

// Attach event listeners to quiz card buttons
function attachQuizCardListeners() {
  // Edit quiz buttons
  document.querySelectorAll(".btn-edit-quiz").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = parseInt(this.dataset.quizId);
      const title = this.dataset.quizTitle;
      const description = this.dataset.quizDescription;
      const active = this.dataset.quizActive === "true";
      showEditQuizModal(id, title, description, active);
    });
  });

  // Manage questions buttons
  document.querySelectorAll(".btn-manage-questions").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = parseInt(this.dataset.quizId);
      const title = this.dataset.quizTitle;
      manageQuestions(id, title);
    });
  });

  // Delete quiz buttons
  document.querySelectorAll(".btn-delete-quiz").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = parseInt(this.dataset.quizId);
      const title = this.dataset.quizTitle;
      deleteQuiz(id, title);
    });
  });
}

// Show create quiz modal
function showCreateQuizModal() {
  editingQuizId = null;
  document.getElementById("quizModalTitle").textContent = "Nouveau Quiz";
  document.getElementById("quizTitle").value = "";
  document.getElementById("quizDescription").value = "";
  document.getElementById("quizActive").checked = true;
  document.getElementById("quizModal").classList.remove("hidden");
}

// Show edit quiz modal
function showEditQuizModal(id, title, description, active) {
  editingQuizId = id;
  document.getElementById("quizModalTitle").textContent = "Modifier le Quiz";
  document.getElementById("quizTitle").value = title;
  document.getElementById("quizDescription").value = description;
  document.getElementById("quizActive").checked = active;
  document.getElementById("quizModal").classList.remove("hidden");
}

// Close quiz modal
function closeQuizModal(event) {
  if (!event || event.target.id === "quizModal") {
    document.getElementById("quizModal").classList.add("hidden");
    editingQuizId = null;
  }
}

// Save quiz
async function saveQuiz() {
  const title = document.getElementById("quizTitle").value.trim();
  const description = document.getElementById("quizDescription").value.trim();
  const active = document.getElementById("quizActive").checked;
  const messageDiv = document.getElementById("quizModalMessage");

  if (!title) {
    showModalMessage(messageDiv, "Le titre est requis", "error");
    return;
  }

  const endpoint = editingQuizId
    ? "/aids/api/admin/quiz/update.php"
    : "/aids/api/admin/quiz/create.php";
  const data = editingQuizId
    ? { quiz_id: editingQuizId, title, description, active }
    : { title, description, active };

  try {
    const response = await authenticatedFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      closeQuizModal();
      showQuizMessage(result.message, "success");
      loadAllQuizzes();
    } else {
      showModalMessage(messageDiv, result.message, "error");
    }
  } catch (error) {
    console.error("Error saving quiz:", error);
    showModalMessage(messageDiv, "Erreur de connexion", "error");
  }
}

// Delete quiz
async function deleteQuiz(id, title) {
  if (
    !confirm(
      `Êtes-vous sûr de vouloir supprimer le quiz "${title}" ?\n\nCela supprimera toutes les questions et options associées.`,
    )
  ) {
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/admin/quiz/delete.php",
      {
        method: "POST",
        body: JSON.stringify({ quiz_id: id }),
      },
    );

    const result = await response.json();

    if (result.success) {
      showQuizMessage(result.message, "success");
      loadAllQuizzes();
    } else {
      showQuizMessage(result.message, "error");
    }
  } catch (error) {
    console.error("Error deleting quiz:", error);
    showQuizMessage("Erreur de connexion", "error");
  }
}

// Manage questions for a quiz
async function manageQuestions(quizId, quizTitle) {
  currentQuiz = { id: quizId, title: quizTitle };

  try {
    const response = await fetch(
      `/aids/api/admin/quiz/questions/list.php?quiz_id=${quizId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const result = await response.json();

    if (result.success) {
      currentQuestions = result.data;
      renderQuestionManagement();
    } else {
      showQuizError(result.message);
    }
  } catch (error) {
    console.error("Error loading questions:", error);
    showQuizError("Erreur de connexion");
  }
}

// Render question management view
function renderQuestionManagement() {
  const container = document.getElementById("quizManagementContent");
  quizView = "questions";

  const questionsHTML =
    currentQuestions.length > 0
      ? currentQuestions.map((q) => createQuestionCard(q)).join("")
      : '<p class="text-text-secondary text-center py-8">Aucune question. Créez-en une!</p>';

  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <button onclick="loadAllQuizzes()" class="text-primary hover:underline mb-4">
          <i class="fas fa-arrow-left mr-2"></i>Retour aux Quiz
        </button>
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-white text-2xl font-bold mb-1">${currentQuiz.title}</h2>
            <p class="text-text-secondary">Questions (${currentQuestions.length})</p>
          </div>
          <button onclick="showCreateQuestionModal()" 
                  class="bg-primary hover:bg-opacity-90 text-white font-semibold py-2 px-6 rounded-lg transition">
            <i class="fas fa-plus mr-2"></i>Nouvelle Question
          </button>
        </div>
      </div>
      
      <div id="quizMessage" class="hidden mb-4"></div>
      
      <div class="space-y-4">
        ${questionsHTML}
      </div>
    </div>
    
    ${createQuestionModal()}
  `;
}

// Create question card
function createQuestionCard(question) {
  const optionsHTML = question.options
    .map(
      (opt, idx) =>
        `<li class="text-text-secondary text-sm">Option ${idx + 1}: ${opt.option_text} <span class="text-primary">(Score: ${opt.risk_score})</span></li>`,
    )
    .join("");

  return `
    <div class="bg-dark-card rounded-lg p-6">
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <h3 class="text-white font-semibold mb-2">Q${question.order_number}: ${question.question_text}</h3>
          <ul class="space-y-1">
            ${optionsHTML}
          </ul>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button onclick="deleteQuestion(${question.id}, '${encodeURIComponent(question.question_text)}')"
                class="text-red-500 hover:text-red-400 transition text-sm font-semibold">
          <i class="fas fa-trash mr-1"></i>Supprimer
        </button>
      </div>
    </div>
  `;
}

// Create question modal
function createQuestionModal() {
  return `
    <div id="questionModal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onclick="closeQuestionModal(event)">
      <div class="bg-dark-card rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <h3 class="text-white text-xl font-bold mb-6">Nouvelle Question</h3>
        
        <div class="mb-4">
          <label class="block text-white text-sm mb-2">Question *</label>
          <textarea id="questionText" rows="3"
                    class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition"></textarea>
        </div>
        
        <div class="mb-4">
          <label class="block text-white text-sm mb-2">Numéro d'ordre</label>
          <input type="number" id="questionOrder" value="1" min="1"
                 class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
        </div>
        
        <div class="mb-6">
          <label class="block text-white text-sm mb-2">Options (minimum 2) *</label>
          <div id="optionsList" class="space-y-3"></div>
          <button onclick="addOption()" 
                  class="mt-3 text-primary hover:text-opacity-80 text-sm font-semibold">
            <i class="fas fa-plus mr-1"></i>Ajouter une option
          </button>
        </div>
        
        <div id="questionModalMessage" class="hidden mb-4"></div>
        
        <div class="flex gap-3">
          <button onclick="saveQuestion()" 
                  class="flex-1 bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
            <i class="fas fa-save mr-2"></i>Enregistrer
          </button>
          <button onclick="closeQuestionModal()" 
                  class="flex-1 bg-gray-600 hover:bg-opacity-80 text-white font-semibold py-3 px-6 rounded-lg transition">
            Annuler
          </button>
        </div>
      </div>
    </div>
  `;
}

let optionCount = 0;

// Show create question modal
function showCreateQuestionModal() {
  optionCount = 0;
  document.getElementById("questionText").value = "";
  const nextOrder = currentQuestions.length + 1;
  document.getElementById("questionOrder").value = nextOrder;
  document.getElementById("optionsList").innerHTML = "";

  // Add 2 default options
  addOption();
  addOption();

  document.getElementById("questionModal").classList.remove("hidden");
}

// Add option field
function addOption() {
  const container = document.getElementById("optionsList");
  const optionId = optionCount++;

  const optionHTML = `
    <div class="flex gap-2" id="option${optionId}">
      <input type="text" 
             id="optionText${optionId}" 
             placeholder="Texte de l'option"
             class="flex-1 px-4 py-2 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
      <input type="number" 
             id="optionScore${optionId}" 
             placeholder="Score"
             min="0" max="10" value="0"
             class="w-24 px-4 py-2 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
      <button onclick="removeOption(${optionId})" 
              class="text-red-500 hover:text-red-400 transition px-3">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", optionHTML);
}

// Remove option field
function removeOption(optionId) {
  const optionElement = document.getElementById(`option${optionId}`);
  if (optionElement) {
    optionElement.remove();
  }
}

// Close question modal
function closeQuestionModal(event) {
  if (!event || event.target.id === "questionModal") {
    document.getElementById("questionModal").classList.add("hidden");
  }
}

// Save question
async function saveQuestion() {
  const questionText = document.getElementById("questionText").value.trim();
  const orderNumber = parseInt(document.getElementById("questionOrder").value);
  const messageDiv = document.getElementById("questionModalMessage");

  if (!questionText) {
    showModalMessage(messageDiv, "Le texte de la question est requis", "error");
    return;
  }

  // Collect options
  const options = [];
  const optionsList = document.getElementById("optionsList");
  const optionDivs = optionsList.querySelectorAll('[id^="option"]');

  optionDivs.forEach((div) => {
    const id = div.id.replace("option", "");
    const textInput = document.getElementById(`optionText${id}`);
    const scoreInput = document.getElementById(`optionScore${id}`);

    if (textInput && scoreInput) {
      const text = textInput.value.trim();
      const score = parseInt(scoreInput.value) || 0;

      if (text) {
        options.push({ option_text: text, risk_score: score });
      }
    }
  });

  if (options.length < 2) {
    showModalMessage(messageDiv, "Au moins 2 options sont requises", "error");
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/admin/quiz/questions/create.php",
      {
        method: "POST",
        body: JSON.stringify({
          quiz_id: currentQuiz.id,
          question_text: questionText,
          order_number: orderNumber,
          options: options,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      closeQuestionModal();
      showQuizMessage(result.message, "success");
      manageQuestions(currentQuiz.id, encodeURIComponent(currentQuiz.title));
    } else {
      showModalMessage(messageDiv, result.message, "error");
    }
  } catch (error) {
    console.error("Error saving question:", error);
    showModalMessage(messageDiv, "Erreur de connexion", "error");
  }
}

// Delete question
async function deleteQuestion(id, questionText) {
  if (
    !confirm(
      `Êtes-vous sûr de vouloir supprimer cette question ?\n\n"${decodeURIComponent(questionText)}"\n\nToutes les options seront supprimées.`,
    )
  ) {
    return;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/admin/quiz/questions/delete.php",
      {
        method: "POST",
        body: JSON.stringify({ question_id: id }),
      },
    );

    const result = await response.json();

    if (result.success) {
      showQuizMessage(result.message, "success");
      manageQuestions(currentQuiz.id, encodeURIComponent(currentQuiz.title));
    } else {
      showQuizMessage(result.message, "error");
    }
  } catch (error) {
    console.error("Error deleting question:", error);
    showQuizMessage("Erreur de connexion", "error");
  }
}

// Show quiz message
function showQuizMessage(message, type) {
  const messageDiv = document.getElementById("quizMessage");
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
function showQuizError(message) {
  const container = document.getElementById("quizManagementContent");
  container.innerHTML = `
    <div class="max-w-3xl mx-auto text-center">
      <i class="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
      <h2 class="text-white text-2xl font-bold mb-4">Erreur</h2>
      <p class="text-text-secondary mb-6">${message}</p>
      <button onclick="loadAllQuizzes()" 
              class="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
        Réessayer
      </button>
    </div>
  `;
}

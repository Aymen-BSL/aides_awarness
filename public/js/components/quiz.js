// quiz.js - Quiz component for risk assessment

let allQuizzes = [];
let selectedQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];

// Load quiz on tab open
async function loadQuiz() {
  try {
    const response = await fetch("/aids/api/quiz/get.php");
    const result = await response.json();

    if (result.success) {
      allQuizzes = result.data;
      showQuizSelection();
    } else {
      showQuizError("Erreur lors du chargement des quiz");
    }
  } catch (error) {
    console.error("Error loading quiz:", error);
    showQuizError("Erreur de connexion");
  }
}

// Show quiz selection screen
function showQuizSelection() {
  const container = document.getElementById("quizTab");

  const quizzesHTML = allQuizzes
    .map(
      (quiz) => `
    <div class="bg-dark-card rounded-lg p-6 hover:bg-opacity-80 transition cursor-pointer" 
         onclick="selectQuiz(${quiz.id})">
      <h3 class="text-white text-xl font-bold mb-2">${quiz.title}</h3>
      <p class="text-text-secondary mb-4">${quiz.description || "Quiz d'évaluation"}</p>
      <div class="flex items-center justify-between">
        <span class="text-text-secondary text-sm">
          <i class="fas fa-question-circle mr-2"></i>${quiz.questions.length} questions
        </span>
        <span class="text-primary font-semibold">
          Commencer <i class="fas fa-arrow-right ml-2"></i>
        </span>
      </div>
    </div>
  `,
    )
    .join("");

  container.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <i class="fas fa-clipboard-check text-primary text-6xl mb-4"></i>
        <h2 class="text-white text-3xl font-bold mb-2">Quiz Disponibles</h2>
        <p class="text-text-secondary">Sélectionnez un quiz pour commencer</p>
      </div>
      
      <div class="grid gap-4">
        ${quizzesHTML}
      </div>
    </div>
  `;
}

// Select a quiz
function selectQuiz(quizId) {
  selectedQuiz = allQuizzes.find((q) => q.id === quizId);
  if (selectedQuiz) {
    showQuizStart();
  }
}

// Show quiz start screen
function showQuizStart() {
  const container = document.getElementById("quizTab");

  container.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <div class="bg-dark-card rounded-lg p-8 text-center">
                <i class="fas fa-clipboard-check text-primary text-6xl mb-6"></i>
                <h2 class="text-white text-3xl font-bold mb-4">${selectedQuiz.title}</h2>
                <p class="text-text-secondary text-lg mb-8">${selectedQuiz.description}</p>
                
                <div class="bg-dark rounded-lg p-6 mb-8 text-left">
                    <h3 class="text-white text-xl font-semibold mb-4">À propos de ce quiz :</h3>
                    <ul class="text-text-secondary space-y-2">
                        <li><i class="fas fa-check text-primary mr-2"></i>${selectedQuiz.questions.length} questions</li>
                        <li><i class="fas fa-check text-primary mr-2"></i>Anonyme et confidentiel</li>
                        <li><i class="fas fa-check text-primary mr-2"></i>Résultats instantanés</li>
                        <li><i class="fas fa-check text-primary mr-2"></i>Recommandations personnalisées</li>
                    </ul>
                </div>
                
                <div class="flex gap-4 justify-center">
                    <button onclick="showQuizSelection()" 
                            class="bg-gray-600 hover:bg-opacity-80 text-white font-semibold py-4 px-8 rounded-lg transition">
                        <i class="fas fa-arrow-left mr-2"></i>Retour
                    </button>
                    <button onclick="startQuiz()" 
                            class="bg-primary hover:bg-opacity-90 text-white font-semibold py-4 px-8 rounded-lg text-lg transition">
                        <i class="fas fa-play mr-2"></i>Commencer le quiz
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Start quiz
function startQuiz() {
  currentQuestionIndex = 0;
  userAnswers = [];
  showQuestion();
}

// Show current question
function showQuestion() {
  const container = document.getElementById("quizTab");
  const question = selectedQuiz.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

  const optionsHTML = question.options
    .map(
      (option) => `
        <label class="flex items-center p-4 bg-dark rounded-lg cursor-pointer hover:bg-opacity-80 transition quiz-option">
            <input type="radio" 
                   name="answer" 
                   value="${option.id}" 
                   class="w-5 h-5 text-primary">
            <span class="ml-3 text-white">${option.option_text}</span>
        </label>
    `,
    )
    .join("");

  container.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <div class="bg-dark-card rounded-lg p-8">
                <!-- Progress bar -->
                <div class="mb-6">
                    <div class="flex justify-between text-sm text-text-secondary mb-2">
                        <span>Question ${currentQuestionIndex + 1} sur ${selectedQuiz.questions.length}</span>
                        <span>${Math.round(progress)}%</span>
                    </div>
                    <div class="w-full bg-dark rounded-full h-2">
                        <div class="bg-primary h-2 rounded-full transition-all duration-300" 
                             style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <!-- Question -->
                <h3 class="text-white text-2xl font-bold mb-6">${question.question_text}</h3>
                
                <!-- Options -->
                <div class="space-y-3 mb-8">
                    ${optionsHTML}
                </div>
                
                <div id="quizError" class="hidden bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4"></div>
                
                <!-- Navigation -->
                <div class="flex justify-between">
                    <button onclick="previousQuestion()" 
                            class="bg-gray-600 hover:bg-opacity-80 text-white font-semibold py-3 px-6 rounded-lg transition ${currentQuestionIndex === 0 ? "invisible" : ""}">
                        <i class="fas fa-arrow-left mr-2"></i>Précédent
                    </button>
                    
                    <button onclick="nextQuestion()" 
                            class="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
                        ${currentQuestionIndex === selectedQuiz.questions.length - 1 ? '<i class="fas fa-check mr-2"></i>Terminer' : 'Suivant<i class="fas fa-arrow-right ml-2"></i>'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Next question
function nextQuestion() {
  const selectedOption = document.querySelector('input[name="answer"]:checked');
  const errorDiv = document.getElementById("quizError");

  if (!selectedOption) {
    errorDiv.textContent = "Veuillez sélectionner une réponse";
    errorDiv.classList.remove("hidden");
    return;
  }

  // Save answer
  const question = selectedQuiz.questions[currentQuestionIndex];
  userAnswers[currentQuestionIndex] = {
    question_id: question.id,
    option_id: parseInt(selectedOption.value),
  };

  if (currentQuestionIndex === selectedQuiz.questions.length - 1) {
    // Submit quiz
    submitQuiz();
  } else {
    // Next question
    currentQuestionIndex++;
    showQuestion();
  }
}

// Previous question
function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();

    // Pre-select previous answer if exists
    if (userAnswers[currentQuestionIndex]) {
      setTimeout(() => {
        const previousAnswer = userAnswers[currentQuestionIndex].option_id;
        const radio = document.querySelector(
          `input[name="answer"][value="${previousAnswer}"]`,
        );
        if (radio) {
          radio.checked = true;
        }
      }, 100);
    }
  }
}

// Submit quiz
async function submitQuiz() {
  try {
    const response = await authenticatedFetch("/aids/api/quiz/submit.php", {
      method: "POST",
      body: JSON.stringify({
        quiz_id: selectedQuiz.id,
        answers: userAnswers,
      }),
    });

    const result = await response.json();

    if (result.success) {
      showResults(result.data);
    } else {
      showQuizError(result.message || "Erreur lors de la soumission");
    }
  } catch (error) {
    console.error("Error submitting quiz:", error);
    showQuizError("Erreur de connexion");
  }
}

// Show results
function showResults(results) {
  const container = document.getElementById("quizTab");

  const riskConfig = {
    LOW: {
      label: "Faible risque",
      color: "green-500",
      icon: "check-circle",
      message:
        "Votre évaluation indique un faible risque. Continuez à maintenir ces bonnes pratiques!",
      recommendations: [
        "Continuez à utiliser des préservatifs systématiquement",
        "Faites un test de dépistage régulièrement (tous les 6-12 mois)",
        "Restez informé(e) sur la prévention du VIH",
      ],
    },
    MODERATE: {
      label: "Risque modéré",
      color: "yellow-500",
      icon: "exclamation-triangle",
      message:
        "Votre évaluation indique un risque modéré. Il est important de prendre des mesures préventives.",
      recommendations: [
        "Faites un test de dépistage dès que possible",
        "Utilisez systématiquement des préservatifs",
        "Consultez un professionnel de santé pour des conseils personnalisés",
        "Envisagez la PrEP (prophylaxie pré-exposition) si vous êtes à risque élevé",
      ],
    },
    HIGH: {
      label: "Risque élevé",
      color: "orange-500",
      icon: "exclamation-circle",
      message:
        "Votre évaluation indique un risque élevé. Il est fortement recommandé de consulter un professionnel.",
      recommendations: [
        "Faites un test de dépistage immédiatement",
        "Consultez un professionnel de santé dès que possible",
        "Discutez de la PrEP avec votre médecin",
        "Évitez les comportements à risque",
        "Contactez une ligne d'assistance: 0 800 840 800 (Sida Info Service)",
      ],
    },
    VERY_HIGH: {
      label: "Risque très élevé",
      color: "red-500",
      icon: "times-circle",
      message:
        "Votre évaluation indique un risque très élevé. Une consultation médicale urgente est recommandée.",
      recommendations: [
        "URGENT: Consultez un médecin immédiatement",
        "Faites un test de dépistage en urgence",
        "Demandez le TPE (traitement post-exposition) si exposition récente (<72h)",
        "Appelez Sida Info Service: 0 800 840 800",
        "Ne partagez pas de matériel d'injection",
        "Utilisez systématiquement des préservatifs",
      ],
    },
  };

  const config = riskConfig[results.risk_level];

  const recommendationsHTML = config.recommendations
    .map(
      (rec) =>
        `<li class="flex items-start"><i class="fas fa-arrow-right text-primary mr-3 mt-1"></i><span>${rec}</span></li>`,
    )
    .join("");

  container.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <div class="bg-dark-card rounded-lg p-8">
                <div class="text-center mb-8">
                    <i class="fas fa-${config.icon} text-${config.color} text-6xl mb-4"></i>
                    <h2 class="text-white text-3xl font-bold mb-2">Résultats de votre évaluation</h2>
                </div>
                
                <!-- Score -->
                <div class="bg-dark rounded-lg p-6 mb-6 text-center">
                    <p class="text-text-secondary mb-2">Votre score</p>
                    <p class="text-white text-5xl font-bold mb-4">${results.total_score}</p>
                    <div class="inline-block px-6 py-2 bg-${config.color} bg-opacity-20 border border-${config.color} rounded-full">
                        <span class="text-${config.color} font-semibold">${config.label}</span>
                    </div>
                </div>
                
                <!-- Message -->
                <div class="bg-dark rounded-lg p-6 mb-6">
                    <p class="text-white text-lg">${config.message}</p>
                </div>
                
                <!-- Recommendations -->
                <div class="bg-dark rounded-lg p-6 mb-8">
                    <h3 class="text-white text-xl font-bold mb-4">Recommandations :</h3>
                    <ul class="text-text-secondary space-y-3">
                        ${recommendationsHTML}
                    </ul>
                </div>
                
                <!-- Actions -->
                <div class="flex gap-4 justify-center">
                    <button onclick="startQuiz()" 
                            class="bg-gray-600 hover:bg-opacity-80 text-white font-semibold py-3 px-6 rounded-lg transition">
                        <i class="fas fa-redo mr-2"></i>Refaire le quiz
                    </button>
                    <button onclick="showQuizSelection()" 
                            class="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
                        <i class="fas fa-list mr-2"></i>Liste des quiz
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Show error
function showQuizError(message) {
  const container = document.getElementById("quizTab");
  container.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <div class="bg-dark-card rounded-lg p-8 text-center">
                <i class="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
                <h2 class="text-white text-2xl font-bold mb-4">Erreur</h2>
                <p class="text-text-secondary mb-6">${message}</p>
                <button onclick="loadQuiz()" 
                        class="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
                    Réessayer
                </button>
            </div>
        </div>
    `;
}

// Initialize quiz when tab is shown
if (document.getElementById("quizTab")) {
  loadQuiz();
}

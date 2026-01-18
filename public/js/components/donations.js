// donations.js - Donation Component

let recipientsList = [];
let selectedRecipient = null;
let myDonations = [];
let receivedDonations = [];
let donationsCurrentUser = null;
let donationView = "give"; // 'give' or 'received'

// Initialize donations
window.initDonations = function () {
  console.log("Donations: Initializing...");
  donationsCurrentUser = JSON.parse(localStorage.getItem("user"));
  loadRecipients();
  loadMyDonations();

  // Load received donations if user is admin or medical
  if (
    donationsCurrentUser &&
    (donationsCurrentUser.role === "ADMIN" ||
      donationsCurrentUser.role === "MEDICAL_PROFESSIONAL")
  ) {
    loadReceivedDonations();
  }
};

// Load recipients (admins and medical professionals)
async function loadRecipients() {
  try {
    const response = await fetch("/aids/api/donations/recipients.php");
    const result = await response.json();

    if (result.success) {
      recipientsList = result.data;
      renderDonations();
    } else {
      showDonationError("Erreur lors du chargement des destinataires");
    }
  } catch (error) {
    console.error("Error loading recipients:", error);
    showDonationError("Erreur de connexion");
  }
}

// Load user's donation history
async function loadMyDonations() {
  try {
    const response = await authenticatedFetch(
      "/aids/api/donations/my-donations.php",
    );
    const result = await response.json();

    if (result.success) {
      myDonations = result.data.donations;
      updateDonationStats(result.data);
    }
  } catch (error) {
    console.error("Error loading my donations:", error);
  }
}

// Load received donations (for admins/medical)
async function loadReceivedDonations() {
  try {
    const response = await fetch(
      `/aids/api/donations/stats.php?user_id=${donationsCurrentUser.id}`,
    );
    const result = await response.json();

    if (result.success) {
      receivedDonations = result.data;
      renderDonations();
    }
  } catch (error) {
    console.error("Error loading received donations:", error);
  }
}

// Render donations view
function renderDonations() {
  const container = document.getElementById("donationsContent");

  const isReceiver =
    donationsCurrentUser &&
    (donationsCurrentUser.role === "ADMIN" ||
      donationsCurrentUser.role === "MEDICAL_PROFESSIONAL");

  // Show tabs for receivers
  const tabsHTML = isReceiver
    ? `
    <div class="flex gap-2 mb-6">
      <button onclick="switchDonationView('give')" 
              class="px-6 py-3 rounded-lg font-semibold transition ${donationView === "give" ? "bg-primary text-white" : "bg-dark-card text-text-secondary hover:text-white"}">
        <i class="fas fa-heart mr-2"></i>Faire un Don
      </button>
      <button onclick="switchDonationView('received')" 
              class="px-6 py-3 rounded-lg font-semibold transition ${donationView === "received" ? "bg-primary text-white" : "bg-dark-card text-text-secondary hover:text-white"}">
        <i class="fas fa-gift mr-2"></i>Dons Reçus
      </button>
    </div>
  `
    : "";

  container.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h2 class="text-white text-2xl font-bold mb-2">Dons</h2>
        <p class="text-text-secondary">Soutenir notre communauté</p>
      </div>
      
      ${tabsHTML}
      
      <div id="donationMessage" class="hidden mb-4"></div>
      
      <div id="donationViewContent">
        ${donationView === "give" ? renderGiveView() : renderReceivedView()}
      </div>
    </div>
    
    ${createDonationModal()}
  `;
}

// Switch between give and received views
window.switchDonationView = function (view) {
  donationView = view;
  renderDonations();
};

// Render give donations view
function renderGiveView() {
  const recipientsHTML = recipientsList
    .map((recipient) => createRecipientCard(recipient))
    .join("");

  return `
    <!-- My Donation Stats -->
    <div id="myDonationStats" class="bg-dark-card rounded-lg p-6 mb-6">
      <h3 class= "text-white text-xl font-semibold mb-4">Mes Contributions</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-dark rounded-lg p-4 text-center">
          <p class="text-text-secondary text-sm mb-1">Total Donné</p>
          <p class="text-primary text-3xl font-bold" id="totalDonated">0€</p>
        </div>
        <div class="bg-dark rounded-lg p-4 text-center">
          <p class="text-text-secondary text-sm mb-1">Nombre de Dons</p>
          <p class="text-primary text-3xl font-bold" id="donationCount">0</p>
        </div>
        <div class="bg-dark rounded-lg p-4 text-center">
          <p class="text-text-secondary text-sm mb-1">Dernier Don</p>
          <p class="text-white text-lg font-semibold" id="lastDonation">-</p>
        </div>
      </div>
    </div>
    
    <!-- Recipients List -->
    <div>
      <h3 class="text-white text-xl font-semibold mb-4">Destinataires</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${recipientsHTML}
      </div>
    </div>
  `;
}

// Render received donations view
function renderReceivedView() {
  if (!receivedDonations) {
    return '<p class="text-text-secondary text-center py-8">Chargement...</p>';
  }

  const recentHTML =
    receivedDonations.recent_donations.length > 0
      ? receivedDonations.recent_donations
          .map(
            (donation) => `
        <div class="bg-dark rounded-lg p-4 mb-3">
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="text-white font-semibold">${donation.donor_name || donation.donor_username || "Anonyme"}</p>
              <p class="text-text-secondary text-sm">${new Date(donation.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
            <p class="text-primary text-xl font-bold">${parseFloat(donation.amount).toFixed(0)}€</p>
          </div>
          ${donation.message ? `<p class="text-text-secondary text-sm italic">"${donation.message}"</p>` : ""}
        </div>
      `,
          )
          .join("")
      : '<p class="text-text-secondary text-center py-4">Aucun don reçu pour le moment</p>';

  return `
    <!-- Received Stats -->
    <div class="bg-dark-card rounded-lg p-6 mb-6">
      <h3 class="text-white text-xl font-semibold mb-4">Statistiques</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-dark rounded-lg p-6 text-center">
          <p class="text-text-secondary mb-2">Total Reçu</p>
          <p class="text-green-500 text-4xl font-bold">${parseFloat(receivedDonations.total_amount).toFixed(0)}€</p>
        </div>
        <div class="bg-dark rounded-lg p-6 text-center">
          <p class="text-text-secondary mb-2">Nombre de Dons</p>
          <p class="text-primary text-4xl font-bold">${receivedDonations.donation_count}</p>
        </div>
      </div>
    </div>
    
    <!-- Recent Donations -->
    <div class="bg-dark-card rounded-lg p-6">
      <h3 class="text-white text-xl font-semibold mb-4">Dons Récents</h3>
      ${recentHTML}
    </div>
  `;
}

// Create recipient card
function createRecipientCard(recipient) {
  const displayName =
    recipient.first_name && recipient.last_name
      ? `${recipient.first_name} ${recipient.last_name}`
      : recipient.username;

  const roleLabel =
    recipient.role === "ADMIN" ? "Administrateur" : "Professionnel Médical";
  const roleClass = recipient.role === "ADMIN" ? "bg-primary" : "bg-blue-600";

  const donationBadge =
    recipient.total_donations > 0
      ? `<span class="text-green-500 font-semibold">💰 ${parseFloat(recipient.total_donations).toFixed(0)}€ (${recipient.donation_count})</span>`
      : '<span class="text-text-secondary text-sm">Aucun don reçu</span>';

  return `
    <div class="bg-dark-card rounded-lg p-6 hover:bg-opacity-80 transition">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-white text-lg font-bold mb-1">${displayName}</h3>
          <span class="${roleClass} text-white text-xs px-2 py-1 rounded">${roleLabel}</span>
        </div>
        <div class="text-4xl">👤</div>
      </div>
      
      <div class="mb-4">
        ${donationBadge}
      </div>
      
      <button onclick="showDonationModal(${recipient.id}, '${displayName.replace(/'/g, "\\'")}')" 
              class="w-full bg-primary hover:bg-opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition">
        <i class="fas fa-heart mr-2"></i>Faire un don
      </button>
    </div>
  `;
}

// Create donation modal
function createDonationModal() {
  return `
    <div id="donationModal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onclick="closeDonationModal(event)">
      <div class="bg-dark-card rounded-lg p-8 max-w-md w-full mx-4" onclick="event.stopPropagation()">
        <h3 id="donationModalTitle" class="text-white text-xl font-bold mb-6"></h3>
        
        <!-- Amount Selection -->
        <div class="mb-6">
          <label class="block text-white text-sm mb-3">Montant *</label>
          <div class="grid grid-cols-4 gap-2 mb-2">
            <button onclick="selectAmount(10)" class="amount-btn py-3 px-4 bg-dark text-white rounded-lg hover:bg-primary transition" data-amount="10">10€</button>
            <button onclick="selectAmount(25)" class="amount-btn py-3 px-4 bg-dark text-white rounded-lg hover:bg-primary transition" data-amount="25">25€</button>
            <button onclick="selectAmount(50)" class="amount-btn py-3 px-4 bg-dark text-white rounded-lg hover:bg-primary transition" data-amount="50">50€</button>
            <button onclick="selectAmount(100)" class="amount-btn py-3 px-4 bg-dark text-white rounded-lg hover:bg-primary transition" data-amount="100">100€</button>
          </div>
          <input type="number" id="customAmount" placeholder="Autre montant (5€ - 1000€)" min="5" max="1000" step="5"
                 class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
        </div>
        
        <!-- Optional Donor Name -->
        <div class="mb-4">
          <label class="block text-white text-sm mb-2">Nom (optionnel)</label>
          <input type="text" id="donorName" placeholder="Laissez vide pour rester anonyme" maxlength="100"
                 class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition">
          <p class="text-text-secondary text-xs mt-1">Par défaut, votre nom d'utilisateur sera utilisé</p>
        </div>
        
        <!-- Optional Message -->
        <div class="mb-6">
          <label class="block text-white text-sm mb-2">Message (optionnel)</label>
          <textarea id="donationMessageInput" rows="3" placeholder="Un petit mot d'encouragement..." maxlength="200"
                    class="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none transition"></textarea>
          <p class="text-text-secondary text-xs mt-1">Max 200 caractères</p>
        </div>
        
        <div id="donationModalError" class="hidden mb-4"></div>
        
        <div class="flex gap-3">
          <button onclick="submitDonation()" 
                  class="flex-1 bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
            <i class="fas fa-heart mr-2"></i>Envoyer le don
          </button>
          <button onclick="closeDonationModal()" 
                  class="flex-1 bg-gray-600 hover:bg-opacity-80 text-white font-semibold py-3 px-6 rounded-lg transition">
            Annuler
          </button>
        </div>
      </div>
    </div>
  `;
}

// Show donation modal
window.showDonationModal = function (recipientId, recipientName) {
  selectedRecipient = { id: recipientId, name: recipientName };
  document.getElementById("donationModalTitle").textContent =
    `Soutenir ${recipientName}`;
  document.getElementById("customAmount").value = "";
  document.getElementById("donorName").value = "";
  document.getElementById("donationMessageInput").value = "";
  document
    .querySelectorAll(".amount-btn")
    .forEach((btn) => btn.classList.remove("bg-primary"));
  document.getElementById("donationModal").classList.remove("hidden");
};

// Close donation modal
window.closeDonationModal = function (event) {
  if (!event || event.target.id === "donationModal") {
    document.getElementById("donationModal").classList.add("hidden");
    selectedRecipient = null;
  }
};

// Select predefined amount
window.selectAmount = function (amount) {
  document.querySelectorAll(".amount-btn").forEach((btn) => {
    btn.classList.remove("bg-primary");
  });
  event.target.classList.add("bg-primary");
  document.getElementById("customAmount").value = amount;
};

// Submit donation
window.submitDonation = async function () {
  const amountInput = document.getElementById("customAmount").value;
  const donorName = document.getElementById("donorName").value.trim();
  const message = document.getElementById("donationMessageInput").value.trim();
  const errorDiv = document.getElementById("donationModalError");

  if (!amountInput || parseFloat(amountInput) <= 0) {
    showModalDonationMessage(
      errorDiv,
      "Veuillez sélectionner un montant",
      "error",
    );
    return;
  }

  const amount = parseFloat(amountInput);

  if (amount < 5 || amount > 1000) {
    showModalDonationMessage(
      errorDiv,
      "Le montant doit être entre 5€ et 1000€",
      "error",
    );
    return;
  }

  const data = {
    recipient_id: selectedRecipient.id,
    amount: amount,
  };

  if (donorName) {
    data.donor_name = donorName;
  }

  if (message) {
    data.message = message;
  }

  try {
    const response = await authenticatedFetch(
      "/aids/api/donations/create.php",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    const result = await response.json();

    if (result.success) {
      closeDonationModal();
      showDonationMessage(result.message, "success");
      loadRecipients();
      loadMyDonations();
      if (
        donationsCurrentUser &&
        (donationsCurrentUser.role === "ADMIN" ||
          donationsCurrentUser.role === "MEDICAL_PROFESSIONAL")
      ) {
        loadReceivedDonations();
      }
    } else {
      showModalDonationMessage(errorDiv, result.message, "error");
    }
  } catch (error) {
    console.error("Error submitting donation:", error);
    showModalDonationMessage(errorDiv, "Erreur de connexion", "error");
  }
};

// Update donation stats
function updateDonationStats(data) {
  const totalElem = document.getElementById("totalDonated");
  const countElem = document.getElementById("donationCount");
  const lastElem = document.getElementById("lastDonation");

  if (totalElem) totalElem.textContent = `${data.total_donated.toFixed(0)}€`;
  if (countElem) countElem.textContent = data.count;

  if (lastElem && data.donations.length > 0) {
    const lastDonation = data.donations[0];
    const recipientName =
      lastDonation.recipient_first_name && lastDonation.recipient_last_name
        ? `${lastDonation.recipient_first_name} ${lastDonation.recipient_last_name}`
        : lastDonation.recipient_username;
    lastElem.textContent = `${lastDonation.amount}€ à ${recipientName}`;
  }
}

// Show donation message
function showDonationMessage(message, type) {
  const messageDiv = document.getElementById("donationMessage");
  if (!messageDiv) return;

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

// Show modal donation message
function showModalDonationMessage(element, message, type) {
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
function showDonationError(message) {
  const container = document.getElementById("donationsContent");
  container.innerHTML = `
    <div class="max-w-3xl mx-auto text-center">
      <i class="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
      <h2 class="text-white text-2xl font-bold mb-4">Erreur</h2>
      <p class="text-text-secondary mb-6">${message}</p>
      <button onclick="initDonations()" 
              class="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition">
        Réessayer
      </button>
    </div>
  `;
}


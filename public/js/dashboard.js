// dashboard.js - Main dashboard logic

document.addEventListener("DOMContentLoaded", function () {
  // Check authentication
  if (!isAuthenticated()) {
    window.location.href = "/aids/public/pages/login.html";
    return;
  }

  const user = getCurrentUser();

  // Update user info in sidebar
  const userName = document.getElementById("userName");
  const userInitial = document.getElementById("userInitial");
  const roleBadge = document.getElementById("roleBadge");

  if (user) {
    const displayName =
      user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.username;

    userName.textContent = displayName;
    userInitial.textContent = displayName.charAt(0).toUpperCase();

    // Update role badge
    const roleLabels = {
      ADMIN: { text: "Admin", class: "bg-red-600" },
      MEDICAL_PROFESSIONAL: { text: "Pro Médical", class: "bg-blue-600" },
      USER: { text: "Utilisateur", class: "bg-gray-600" },
    };

    const roleInfo = roleLabels[user.role] || roleLabels.USER;
    roleBadge.textContent = roleInfo.text;
    roleBadge.className = `text-xs px-2 py-1 rounded text-white ${roleInfo.class}`;
  }

  // Show/hide management section based on role
  if (user.role === "ADMIN" || user.role === "MEDICAL_PROFESSIONAL") {
    document.getElementById("managementSection").classList.remove("hidden");

    // Show specific management items
    if (user.role === "ADMIN") {
      document.getElementById("usersMenuItem").classList.remove("hidden");
    }

    document
      .getElementById("quizManagementMenuItem")
      .classList.remove("hidden");
    document
      .getElementById("articleManagementMenuItem")
      .classList.remove("hidden");
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  menuToggle?.addEventListener("click", function () {
    sidebar.classList.toggle("sidebar-hidden");
    sidebarOverlay.classList.toggle("hidden");
  });

  sidebarOverlay?.addEventListener("click", function () {
    sidebar.classList.add("sidebar-hidden");
    sidebarOverlay.classList.add("hidden");
  });

  // Tab navigation
  const menuItems = document.querySelectorAll(".menu-item[data-tab]");
  const tabContents = document.querySelectorAll(".tab-content");

  menuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const tabName = this.getAttribute("data-tab");

      // Remove active class from all menu items
      menuItems.forEach((mi) => mi.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Hide all tab contents
      tabContents.forEach((content) => content.classList.add("hidden"));

      // Show selected tab content
      const selectedTab = document.getElementById(`${tabName}Tab`);
      if (selectedTab) {
        selectedTab.classList.remove("hidden");

        // Initialize specific tab content
        initializeTab(tabName);
      }

      // Close mobile menu after selecting a tab
      if (window.innerWidth < 768) {
        sidebar.classList.add("sidebar-hidden");
        sidebarOverlay.classList.add("hidden");
      }
    });
  });

  // Initialize tab content
  function initializeTab(tabName) {
    switch (tabName) {
      case "home":
        if (typeof window.initHome === "function") {
          window.initHome();
        }
        break;
      case "articles":
        // Articles auto-load via articleFeed.js
        break;
      case "donations":
        if (typeof window.initDonations === "function") {
          window.initDonations();
        }
        break;
      case "quizManagement":
        if (typeof window.initQuizManagement === "function") {
          window.initQuizManagement();
        }
        break;
      case "articleManagement":
        if (typeof window.initArticleManagement === "function") {
          window.initArticleManagement();
        }
        break;
      case "users":
        if (typeof window.initAdminManagement === "function") {
          window.initAdminManagement();
        }
        break;
    }
  }

  // Logout functionality
  document.getElementById("logoutBtn")?.addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      window.location.href = "/aids/public/index.html";
    }
  });

  // Initialize home tab by default
  if (typeof window.initHome === "function") {
    window.initHome();
  }
});

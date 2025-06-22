// Splash screen animation
document.addEventListener("DOMContentLoaded", function () {
  const splashScreen = document.querySelector(".splash-screen");
  const loadingText = document.querySelector(".loading-text");

  // Simulate loading progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      loadingText.textContent = "Siap!";

      // Hide splash screen after completion
      setTimeout(() => {
        splashScreen.classList.add("hidden");

        // Remove from DOM after animation
        setTimeout(() => {
          splashScreen.classList.add("remove");
          setTimeout(() => splashScreen.remove(), 800);
        }, 500);
      }, 500);
    } else {
      loadingText.textContent = `Memuat... ${Math.min(
        100,
        Math.round(progress)
      )}%`;
    }
  }, 200);

  // Optional: Hide splash screen when clicked (for testing)
  splashScreen.addEventListener("click", function () {
    clearInterval(progressInterval);
    splashScreen.classList.add("hidden");
    setTimeout(() => {
      splashScreen.classList.add("remove");
      setTimeout(() => splashScreen.remove(), 800);
    }, 100);
  });
});

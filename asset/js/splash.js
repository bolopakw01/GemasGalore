// Splash screen animation
document.addEventListener("DOMContentLoaded", function () {
  const splashScreen = document.querySelector(".splash-screen");
  const loadingText = document.querySelector(".loading-text");

  if (!splashScreen) {
    document.body.classList.remove("splash-active");
    return;
  }

  // Pastikan scroll terkunci saat splash tampil
  document.body.classList.add("splash-active");

  function unlockScrollAndHideSplash(delayBeforeRemove = 500) {
    splashScreen.classList.add("hidden");
    document.body.classList.remove("splash-active");

    setTimeout(() => {
      splashScreen.classList.add("remove");
      setTimeout(() => splashScreen.remove(), 800);
    }, delayBeforeRemove);
  }

  // Simulate loading progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      if (loadingText) loadingText.textContent = "Siap!";

      // Hide splash screen & unlock scroll after completion
      setTimeout(() => {
        unlockScrollAndHideSplash(500);
      }, 500);
    } else if (loadingText) {
      loadingText.textContent = `Memuat... ${Math.min(
        100,
        Math.round(progress)
      )}%`;
    }
  }, 200);

  // Optional: Hide splash screen when clicked
  splashScreen.addEventListener("click", function () {
    clearInterval(progressInterval);
    unlockScrollAndHideSplash(100);
  });
});

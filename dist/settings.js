document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("settingsForm");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const messageDiv = document.getElementById("message");

  // Load the current API key on page load
  chrome.storage.local.get("apiKey", function (data) {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const apiKey = apiKeyInput.value;

    // Save the API key in Chrome storage
    chrome.storage.local.set({ apiKey }, function () {
      messageDiv.textContent = "API key saved.";
    });
  });
});

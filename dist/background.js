chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startPrompt") {
    console.log("Received startPrompt message");
  } else if (request.action === "submitPrompt") {
    console.log("Prompt: " + request.prompt);
    console.log("Sender: ");
    console.log(sender);

    const tabId = sender.tab.id;

    chrome.storage.local.get("apiKey", function (data) {
      const apiKey = data.apiKey || ""; // Use empty string as default if API key is not set
      const requestUrl = "https://api.openai.com/v1/chat/completions";
      const requestHeaders = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };

      const apiRequestBody = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: request.prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      };

      fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(apiRequestBody),
      })
        .then((response) => response.json())
        .then((data) => {
          sendResponse({
            type: "response",
            text: data.choices[0].message.content,
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          sendResponse({
            type: "response",
            text: "Error occurred during API request.",
          });
        });
    });

    return true;
  }
});


( () => {
  let previousKey = null;
  let popupContainer = null;
  let activeElement = null;

  document.addEventListener("keypress", (event) => {
    activeElement = document.activeElement;
     if (
       activeElement && (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "INPUT") && event.key === "/"
     ) {

      if (previousKey === "/") {
        console.log("Prompt mode activated");
        chrome.runtime.sendMessage({
          action: "startPrompt"
        });

        showPromptPopup(activeElement);

      } else {
        previousKey = event.key;
      }
     }

  });


  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, text, target } = obj;

    if (type === "response") {
      console.log(text)
      if (
        target &&
        (target.tagName === "TEXTAREA" || target.tagName === "INPUT")
      ) {
        target.value += text;
      }
    } 

  });

  function showPromptPopup(activeElement) {
    if (popupContainer) {
      dismissPopup();
    }
    popupContainer = document.createElement("div");
    popupContainer.id = "promptPopup";
    popupContainer.innerHTML = `
      <textarea id="promptTextarea" placeholder="Enter your prompt..."></textarea>
      <button id="submitButton">Submit</button>
      <button id="dismissButton">Dismiss</button>
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = `
      #promptPopup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 400px;
        background-color: white;
        padding: 20px;
        border: 1px solid #ccc;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 9999;
      }

      #promptTextarea {
        width: 100%;
        height: 120px;
        margin-bottom: 10px;
      }

      #submitButton,
      #dismissButton {
        padding: 5px 10px;
        margin-left: 10px;
      }
    `;

    popupContainer.appendChild(styleElement);

    document.body.appendChild(popupContainer);

    const promptTextarea = document.getElementById("promptTextarea");
    const submitButton = document.getElementById("submitButton");
    const dismissButton = document.getElementById("dismissButton");

    submitButton.addEventListener("click", submitPrompt);
    dismissButton.addEventListener("click", dismissPopup);

    setTimeout(() => {
      promptTextarea.focus(); // Focus on the promptTextarea
    }, 0);

    function submitPrompt() {
      const prompt = promptTextarea.value;
      const waitingMessage = "<<waiting for response>>";

      if (!activeElement) {
        return;
      }
      const activeElementValue = activeElement.value;
      activeElement.value = activeElementValue.substr(
        0,
        activeElementValue.length - 2
      );
      activeElement.value += waitingMessage;
      
      chrome.runtime.sendMessage({ action: "submitPrompt", prompt: prompt}, (response) => {
          console.log("== Inside the callback function ==");
            // console.log(response);
          if (response && response.type === "response") {
            console.log(response);

            // Append the response to the activeElement value
            if (
              activeElement &&
              (activeElement.tagName === "TEXTAREA" ||
                activeElement.tagName === "INPUT")
            ) {
              const currentValue = activeElement.value;
              const updatedValue = currentValue.replace(
                waitingMessage,
                response.text
              );
              activeElement.value = updatedValue;
              activeElement.focus();
              previousKey = null;
              activeElement = null; // Reset the activeElement variable
            }
          }
        });


      dismissPopup();
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        dismissPopup();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        submitPrompt();
      }
    });

    function dismissPopup() {
      popupContainer.remove();
      popupContainer = null;
    }
  }

})();
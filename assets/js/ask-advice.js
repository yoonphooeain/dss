const adviceInput = document.getElementById("advice-input");
const adviceSubmit = document.getElementById("advice-submit");
const adviceResponse = document.getElementById("advice-response");
const adviceNextStep = document.getElementById("advice-next-step");
const promptButtons = document.querySelectorAll(".prompt-chip");

function generateAdvice(message) {
  const text = message.toLowerCase();

  if (text.includes("camera")) {
    return "If camera quality is your top priority, start with recent iPhone Pro models or Samsung Ultra models, then use the DSS page to increase the camera weight for a more exact ranking.";
  }

  if (text.includes("gaming") || text.includes("performance")) {
    return "For gaming and demanding apps, focus on phones with stronger performance scores. Increase the performance weight in the DSS evaluation and compare the latest flagship models first.";
  }

  if (text.includes("battery")) {
    return "If battery life matters most, compare phones with higher battery scores and give the battery criterion a larger weight in the DSS calculation.";
  }

  if (text.includes("budget") || text.includes("under") || text.includes("$")) {
    return "For a budget-focused choice, combine lower price with solid battery and performance scores. Use the Products page filters first, then run the DSS evaluation with a higher price weight.";
  }

  if (text.includes("iphone") || text.includes("samsung")) {
    return "If you are deciding between iPhone and Samsung, use the Analytics page to review trend differences and then run the DSS evaluation with your own priorities.";
  }

  return "Start by deciding which criteria matter most to you, then move to the DSS Evaluation page and assign weights for price, camera, battery, and performance.";
}

function handleAdvice() {
  const message = adviceInput.value.trim();

  if (!message) {
    adviceResponse.textContent = "Please write a short question first so the system can respond.";
    adviceNextStep.textContent = "Try a quick prompt like 'Best camera phone under $800'.";
    return;
  }

  adviceResponse.textContent = generateAdvice(message);
  adviceNextStep.textContent = "Next step: open the DSS Evaluation page, select a few phones, and use weights that match your needs.";
}

promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    adviceInput.value = button.dataset.prompt;
    handleAdvice();
  });
});

adviceSubmit?.addEventListener("click", handleAdvice);

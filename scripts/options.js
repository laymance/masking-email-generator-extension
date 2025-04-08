document.addEventListener("DOMContentLoaded", function() {
    const domainInput = document.getElementById("domainInput");
    const saveButton = document.getElementById("saveDomain");
    const emailList = document.getElementById("emailList");
    const optionSelectors = document.querySelectorAll(".optionSelector");
    const checkboxIcon = document.querySelector(".inputFieldIcon");

    const populateEmailList = (emails) => {
        const emailFragment = document.createDocumentFragment();
        emails.slice(-250).forEach(email => {
            const li = document.createElement("li");
            li.textContent = email;
            emailFragment.appendChild(li);
        });
        emailList.appendChild(emailFragment);
    };

    const saveData = () => {
        chrome.storage.local.set({
            domain: domainInput.value,
            generationOption: document.querySelector(".optionSelector:checked")?.value || "1",
            inputFieldIcon: checkboxIcon.checked
        });
    };
    chrome.storage.local.get(["domain", "emails", "generationOption", "inputFieldIcon"], (data) => {
        if (data.domain) domainInput.value = data.domain;

        document.querySelector(`.optionSelector[value="${data.generationOption || 1}"]`).checked = true;
        document.querySelector(".inputFieldIcon").checked = data.inputFieldIcon ?? true;

        if (data.emails) populateEmailList(data.emails);
    });

    // Trigger save when domain input field changes
    domainInput.addEventListener("input", saveData);

    // Trigger save when checkbox is toggled
    checkboxIcon.addEventListener("change", saveData);

    // Trigger save when any radio option is selected
    optionSelectors.forEach((selector) => {
        selector.addEventListener("change", saveData);
    });
});

function injectIcon(input) {
    if (input.dataset.emailHelperInjected) return;
    input.dataset.emailHelperInjected = "true";

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.width = input.offsetWidth + "px";

    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const icon = document.createElement("img");
    icon.src = chrome.runtime.getURL("icons/icon-128.png");
    icon.classList = "email-masking-extension-icon";
    icon.style.display = "none";

    wrapper.appendChild(icon);

    function showIcon() {
        icon.classList.add("email-masking-extension-icon-visible");
        input.classList.add("email-masking-extension-icon-input-visible");
    }

    function hideIcon() {
        setTimeout(() => {
            icon.classList.remove("email-masking-extension-icon-visible");
            input.classList.remove("email-masking-extension-icon-input-visible");
        }, 200);
    }

    input.addEventListener("focus", showIcon);
    input.addEventListener("blur", hideIcon);
    // Show icon when hovering over the field - disabled for now
    // wrapper.addEventListener("mouseenter", showIcon);
    // wrapper.addEventListener("mouseleave", hideIcon);

    icon.addEventListener("click", () => {
        const siteDomain = window.location.hostname.replace(/^www\./, '');

        chrome.runtime.sendMessage({ action: "generateEmail", siteDomain: siteDomain }, (response) => {
            if (response && response.email) {
                input.value = response.email;
            }
        });
    });
}

chrome.storage.local.get(["inputFieldIcon"], (data) => {

    if (data.inputFieldIcon || data.inputFieldIcon === "") {
        // Find all email input fields and add the button
        function attachToEmailFields() {
            document.querySelectorAll('input[type="email"]').forEach(injectIcon);
        }

        // Run on page load
        attachToEmailFields();

        // Listen for dynamically added fields
        let observer = new MutationObserver(attachToEmailFields);
        observer.observe(document.body, { childList: true, subtree: true });
    }
});
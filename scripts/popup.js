document.addEventListener("DOMContentLoaded", () => {
    // Function to replace "mydomain.com" in the labels dynamically
    const updateTextWithDomain = (domain) => {
        const domainSpans = document.querySelectorAll(".email-masking-extension-domain");
        domainSpans.forEach((label) => {
            label.textContent = label.textContent.replace(/mydomain\.com/g, domain);
        });
    };

    // Function to validate and sanitize domain
    const sanitizeDomain = (domain) => {
        // Regex for formats: sub.example.com, example.com
        const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (typeof domain === 'string' && domain.trim().length > 0) {
            domain = domain.trim(); // Remove leading/trailing whitespaces

            if (domainRegex.test(domain)) {
                return domain; // Return the sanitized domain if valid
            }
        }

        console.warn('Invalid domain provided:', domain);
        return null;
    };
    chrome.storage.local.get(["domain", "emails", "generationOption"], (data) => {
        const sanitizedDomain = sanitizeDomain(data.domain);
        let selectedOption = data?.generationOption || 1; // default to 1

        document.querySelector(`.optionSelector[value="${selectedOption}"]`).checked = true;

        if (!sanitizedDomain) {
            document.getElementById("mainContent").style.display = "none";
            document.getElementById("emailDisplay").style.display = "none";
            document.getElementById("notConfigured").style.display = "block";
            return;
        }

        updateTextWithDomain(data.domain);
    });

    const preferencesLink = document.getElementById('extensionPreferencesLink');
    preferencesLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage(); // Open the options/preferences page (as embedded by default)
        } else {
            // Fallback for older browsers
            window.open(chrome.runtime.getURL('options.html'));
        }
    });
    document.getElementById("generateEmail").addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                let url = new URL(tabs[0].url);
                let siteDomain = url.hostname.replace(/^www\./, "");
                const generationOption = document.querySelector(".optionSelector:checked")?.value || "1";

                chrome.runtime.sendMessage({ action: "generateEmail", siteDomain: siteDomain, generationOption: generationOption }, (response) => {
                    // Set the generated email text
                    document.getElementById("generatedEmailDisplay").textContent = response.email;

                    // Hide the main content and show the email display section
                    document.getElementById("mainContent").style.display = "none";
                    document.getElementById("notConfigured").style.display = "none";
                    document.getElementById("emailDisplay").style.display = "block";
                });
            }
        });
    });

    document.getElementById("copyToClipboard").addEventListener("click", () => {
        const emailText = document.getElementById("generatedEmailDisplay").textContent;

        // Copy the text to clipboard and provide feedback
        navigator.clipboard.writeText(emailText).then(() => {
            const copyButton = document.getElementById("copyToClipboard");
            const originalText = copyButton.textContent;

            // Change button text to "✔ Copied"
            copyButton.textContent = "✔ Copied";

            // Revert the button text back to the original after a short delay
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 2200); // 2.2 seconds delay
        }).catch((err) => {
            console.error("Failed to copy email: ", err);
        });
    });

});
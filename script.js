// Define constants for DOM elements to avoid repeated queries
const prompt = document.querySelector("#prompt");
const chatContainer = document.querySelector(".chat-container");
const imageButton = document.querySelector("#image");
const imageInput = document.querySelector("#imageInput");
const submitButton = document.querySelector("#submit");
const imagePreview = document.querySelector("#imagePreview");
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;
const helpBtn = document.getElementById("help-btn-id");
const helpBox = document.getElementById("help-info");

let isGenerating = false;
let user = { message: null, file: { mime_type: null, data: null } };

// API URL
const ApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCEhcb7ee0JC4UiN47kYTm2NFD9z_PkxTc";

// Function to create chat boxes dynamically
function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

// Function to check if the user is near the bottom of the chat container
function isUserNearBottom(container, offset = 100) {
    return container.scrollHeight - container.scrollTop - container.clientHeight < offset;
}

// Function to scroll the chat container to the bottom smoothly
function scrollToBottom(container) {
    if (isUserNearBottom(container)) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
}

// Function to handle API response and create typewriter effect with Markdown parsing
async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");
    
    let requestOptions = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                { parts: [{ text: user.message }, ...(user.file.data ? [{ "inline_data": user.file }] : [])] }
            ]
        })
    };

    try {
        let response = await fetch(ApiUrl, requestOptions);
        let data = await response.json();
        
        // Check if the response has valid content
        if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
            text.innerHTML = "❌ Sorry, I couldn't generate a response.";
            return;
        }

        let apiResponse = data.candidates[0].content.parts[0].text;
        let responseText = '';
        let i = 0;
        let typingSpeed = 15;
        
        // Function to type out the response progressively
        function typeWriter() {
            if (i < apiResponse.length) {
                responseText += apiResponse.charAt(i);
                text.innerHTML = marked.parse(responseText); // Use plain text first to avoid multiple markdown parses
                i++;
                scrollToBottom(chatContainer);
                setTimeout(typeWriter, typingSpeed);
            } else {
                text.innerHTML = marked.parse(responseText); // Parse final Markdown once typing is complete
            }
        }

        typeWriter();
    } catch (error) {
        console.error("Error:", error);
        let text = aiChatBox.querySelector(".ai-chat-area");
        text.innerHTML = "❌ An error occurred while fetching data.";
    } finally {
        isGenerating = false;
        prompt.disabled = false;
        submitButton.disabled = false;
        imageButton.disabled = false;
        scrollToBottom(chatContainer);

        // Clear file data to prevent ghost images in new chats
        user.file = { mime_type: null, data: null };
    }
}

// Function to handle user chat input and start the AI response process
function handleChatResponse(message) {
    if (isGenerating) return;

    isGenerating = true;
    prompt.disabled = true;
    submitButton.disabled = true;
    imageButton.disabled = true;

    user.message = message;
    document.getElementById("welcome-message").style.display = "none";

    let html = `<div class="user-chat-area">${user.message}${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg"/>` : ""}</div>`;
    prompt.value = null;

    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    scrollToBottom(chatContainer);

    // Show loading animation before generating response
    setTimeout(() => {
        let html = `<div class="ai-chat-area"><dotlottie-player src="https://lottie.host/bcd288fb-0b06-4aae-ae1a-85c6160d5524/K4veyKx3ph.lottie" background="transparent" speed="1" style="width: 50px; height: 50px" loop autoplay class="loading" aria-label="Loading..."></dotlottie-player></div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);

        scrollToBottom(chatContainer);
        generateResponse(aiChatBox);
    }, 600);

    // Clear previous image preview
    imagePreview.innerHTML = "";
}

// Add event listeners for user input and actions
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const message = prompt.value.trim();
        if (message.length > 0 || user.file.data) {
            handleChatResponse(message);
        }
    }
});

submitButton.addEventListener("click", () => {
    const message = prompt.value.trim();
    if (message.length > 0 || user.file.data) {
        handleChatResponse(message);
    }
});

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };

        imagePreview.innerHTML = `<img src="${e.target.result}" alt="preview" style="max-height: 100px; border-radius: 8px;">`;
    };
    reader.readAsDataURL(file);
});

imageButton.addEventListener("click", () => {
    imageInput.click();
});

// Theme toggle (Dark/Light)
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
    }
});

themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Help button functionality
helpBtn.addEventListener("click", () => {
    helpBox.classList.toggle("show");
});




// Platform Detection
function adjustPromptPosition() {
    const promptContainer = document.querySelector(".prompt-container"); // adjust selector as needed

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/iPhone/.test(userAgent) && /Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
        // iPhone Safari
        promptContainer.classList.add("iphone-prompt-fix");
    } else if (/Android/.test(userAgent) && /Chrome/.test(userAgent)) {
        // Android Chrome
        promptContainer.classList.add("android-prompt-fix");
    }
}

window.addEventListener("DOMContentLoaded", adjustPromptPosition);

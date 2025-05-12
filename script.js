let prompt = document.querySelector("#prompt");
let chatContainer = document.querySelector(".chat-container");
let imageButton = document.querySelector("#image");
let imageInput = document.querySelector("#imageInput");
let isGenerating = false;


const ApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCEhcb7ee0JC4UiN47kYTm2NFD9z_PkxTc";

let user = {
    message : null,
    file:{
        mime_type :null,
        data : null
    }
};


//Dynamic-chat-Box
function createChatBox(html,classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);   
    return div;
}

//response-generator
async function generateResponse(aiChatBox) {

    let text = aiChatBox.querySelector(".ai-chat-area");

    let RequestOption = {
        method:"POST", 
        headers:{'Content-Type' : 'application/json'},
        body: JSON.stringify({
            contents: [
                { parts: [{ text: user.message } , (user.file.data?[{"inline_data":user.file}]:[])
                ] }
            ]
        })
    };

    try {
        let response = await fetch(ApiUrl,RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text;
        text.innerHTML = marked.parse(apiResponse);

        let responseText = '';
        let i = 0;
        let typingSpeed = 15;
        
        function typeWriter() {
            if (i < apiResponse.length) {
                responseText += apiResponse.charAt(i);
                text.innerHTML = marked.parse(responseText);
                i++;
                chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
                setTimeout(typeWriter, typingSpeed);
            }
        }

        typeWriter();
    } 

    catch (error) {
        console.log("Error:", error);           
    }

    finally{
        isGenerating = false;
        prompt.disabled = false;
        document.querySelector("#submit").disabled = false;
        imageButton.disabled = false;

        chatContainer.scrollTo({top:chatContainer.scrollHeight, behavior:"smooth"});
            user.file = {
            mime_type: null,
            data: null
        };
    }
}

//chat-handler
function handleChatResponse(message) {

    if (isGenerating) return;

    isGenerating = true;

    prompt.disabled = true;
    document.querySelector("#submit").disabled = true;
    imageButton.disabled = true;

    user.message = message;
    document.getElementById("welcome-message").style.display = "none";

    let html = `<div class="user-chat-area">${user.message}${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg"/>` : ""}</div>`;

    prompt.value = null;

    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `<div class="ai-chat-area"><dotlottie-player src="https://lottie.host/bcd288fb-0b06-4aae-ae1a-85c6160d5524/K4veyKx3ph.lottie" background="transparent" speed="1" style="width: 50px; height: 50px" loop autoplay class="loading"></dotlottie-player></div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);

        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

        generateResponse(aiChatBox);
    }, 600);

    document.querySelector("#imagePreview").innerHTML = "";
}

//text-input-handler
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const message = prompt.value.trim();

        if (message.length > 0 || user.file.data) {
            handleChatResponse(message);
        }
    }
});

//submit-button
document.querySelector("#submit").addEventListener("click", () => {
    const message = prompt.value.trim();

    // Only handle chat if there's text or image
    if (message.length > 0 || user.file.data) {
        handleChatResponse(message);
    }
});

//image-input-handler
imageInput.addEventListener("change" , ()=>{
    const file = imageInput.files[0];
    if (!file) {return};

    let reader = new FileReader();
    reader.onload=(e)=>{
        let base64string = e.target.result.split(",")[1]

        user.file={
        mime_type :file.type,
        data : base64string
        }

        let imagePreview = document.querySelector("#imagePreview");
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="preview" style="max-height: 100px; border-radius: 8px;">`;
    };

    reader.readAsDataURL(file);
})

imageButton.addEventListener("click", () => {
    imageInput.click();
});


const toggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;

// Load theme on page load
window.addEventListener('DOMContentLoaded', () => {
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
}
});

toggleBtn.addEventListener('click', () => {
body.classList.toggle('dark-theme');
const isDark = body.classList.contains('dark-theme');
localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

const helpBtn = document.getElementById("help-btn-id");
const helpBox = document.getElementById("help-info");

helpBtn.addEventListener("click", () => {
  helpBox.classList.toggle("show");
});
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatContainer = document.getElementById('chat-history'); 

function displayMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'gemini-message');
    messageDiv.innerHTML = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
    if (!userInput || !sendButton || !chatContainer) {
        console.error("FATAL: Salah satu elemen HTML (user-input, send-button, atau chat-history) tidak ditemukan.");
        return;
    }

    const message = userInput.value.trim();
    if (message === '') return;

    displayMessage(message, 'user');
    userInput.value = '';

    try {
        const response = await fetch('http://localhost:3000/api/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ reply: 'Gagal parse error dari server.' }));
            throw new Error(`Server Error (${response.status}): ${errorData.reply || 'Server mengembalikan status error.'}`);
        }

        const data = await response.json();
        
        displayMessage(data.reply, 'gemini');

    } catch (error) {
        console.error("Kesalahan Koneksi atau API:", error);
        displayMessage(`Gagal terhubung ke AI. Mohon cek terminal server. Detail: ${error.message}`, 'error');
    }
}

if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
}

if (userInput) {
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            sendMessage();
        }
    });

    userInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
});
}
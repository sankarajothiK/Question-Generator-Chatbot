const form = document.getElementById("upload-form");
const chatBox = document.getElementById("chat-box");
const instruction = document.getElementById("instruction");
const voiceBtn = document.getElementById("voiceBtn");
const langSelect = document.getElementById("lang");

function addMsg(text, sender) {
    const div = document.createElement("div");
    div.className = sender === "bot" ? "bot-msg" : "user-msg";
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    addMsg(instruction.value, "user");
    addMsg("⏳ Generating questions...", "bot");

    const formData = new FormData(form);

    const res = await fetch("/generate", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (data.message) {
        addMsg("✅ Ready! Click below to download.", "bot");

        const btn = document.createElement("a");
        btn.href = `/download/${data.filename}`;
        btn.innerText = "⬇️ Download Question Paper";
        btn.className = "download-btn";
        btn.target = "_blank";

        chatBox.appendChild(btn);
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        addMsg("❌ Error occurred", "bot");
    }
});

/* -------- VOICE INPUT -------- */
voiceBtn.onclick = () => {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice input not supported");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langSelect.value === "ta" ? "ta-IN" : "en-GB";
    recognition.start();

    recognition.onresult = async (event) => {
        const spokenText = event.results[0][0].transcript;

        const res = await fetch("/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: spokenText })
        });

        const data = await res.json();
        instruction.value = data.translated;
    };
};

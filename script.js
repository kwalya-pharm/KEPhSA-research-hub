// Sidebar toggle logic
document.querySelector('.sidebar-toggle-btn').addEventListener('click', () => {
    document.querySelector('.sidebar').style.left = '0';
});

document.querySelector('.close-btn').addEventListener('click', () => {
    document.querySelector('.sidebar').style.left = '-250px';
});

// Curtain animation cleanup
window.addEventListener('load', () => {
    const curtain = document.getElementById('curtain');
    setTimeout(() => {
        curtain.style.display = 'none';
    }, 1500); // matches CSS animation duration
});

// Typing effect for heading
const typingText = document.getElementById("typing-text");
const message = "Empowering Pharmacy Research Across Kenya";
let i = 0;


function typeWriter() {
    if (i < message.length) {
        typingText.innerHTML += message.charAt(i);
        i++;
        setTimeout(typeWriter, 80);
    }
}

window.addEventListener('DOMContentLoaded', typeWriter);

import bot from './assets/bot.svg';
import user from './assets/send.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const inputElement = form.querySelector('textarea'); // Assuming you're using a textarea for input

let loadInterval;

function loader(element) {
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi ? 'ai' : ''}"> 
      <div class="chat">
        <div class="profile">
          <img src="${isAi ? bot : user}" alt="${isAi ? 'Bot' : 'User'}" />
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
  `;
}

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  const prompt = formData.get('prompt');
  
  // Validate prompt
  if (!prompt || prompt.trim() === '') {
    alert('Please enter a message');
    return;
  }
  
  // Clear input after submission
  form.reset();
  
  // Add user message
  chatContainer.innerHTML += chatStripe(false, prompt);
  
  // Add AI thinking placeholder
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  try {
    const response = await fetch('https://lisa-r18m.onrender.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt })
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot ? data.bot.trim() : 'No response from server';
      typeText(messageDiv, parsedData);
    } else {
      const errorText = await response.text();
      console.error('Error Response:', errorText);
      
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
  } catch (error) {
    clearInterval(loadInterval);
    console.error("Detailed Error:", error);
    
    messageDiv.innerHTML = `Sorry, something went wrong: ${error.message}. Please try again.`;
  }
};

// Add event listener for form submission
form.addEventListener('submit', handleSubmit);

// Add event listener for Enter key
inputElement.addEventListener('keydown', (e) => {
  // Check if Enter key is pressed without Shift key
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // Prevent default Enter key behavior
    form.dispatchEvent(new Event('submit')); // Trigger form submission
  }
});
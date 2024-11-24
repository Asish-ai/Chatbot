import bot from './assets/bot.svg'
import user from './assets/send.svg'

let form = document.querySelector('form');
let chatContainer = document.querySelector('#chat_container');

let loadInterval;

//for the loading functionality of the thinking
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(()=>{
    element.textContent += '.';
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

//for the user experience text
function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
    } else {
      clearInterval(interval);
    }
  }, 20)
}

//to generate the random uniqueid for the queries
function generateUniqueId() {
  const timestamp  = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

//to distinguish between chatbot and user
function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class = "wrapper ${isAi && 'ai'}"> 
    <div class = "chat">
      <div class = "profile">
        <img src = "${isAi ? bot : user}"
        alt = "${isAi ? bot : user}">
        </img>
      </div>
      <div class = "message" id = ${uniqueId} > ${value}</div></div>
    </div>
  </div>
    `
  )

}

const handleSubmit = async(e) => {
  e.preventDefault();

  //fetch the data
  const data = new FormData(form);
  //user chatStripe

  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  //chatbot chatStripe

  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  //fetch data from server bot's response
  const response = await fetch('http://localhost:5000',{
    method : 'POST',
    headers :{
      'Content-type': 'application/json'
    },
    body : JSON.stringify({
      prompt : data.get('prompt')
    })
  })
  clearInterval(loadInterval);
  messageDiv.innerHTML= '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML= "Something went wrong"
    alert(err);
  }
}
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

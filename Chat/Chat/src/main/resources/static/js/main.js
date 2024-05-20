'use strict';

var usernamePage : Element = document.querySelector("#username-page");
var chatPage : Element = document.querySelector("#chat-page");
var usernameForm : Element = document.querySelector('#usernameForm');
var messageForm : Element = document.querySelector('#messageForm');
var messageInput : Element = document.querySelector('#message');
var messageArea : Element = document.querySelector('#messageArea');
var connectingElement : Element = document.querySelector('.connecting');

var stompClient : null = null ;
var username : null = null;

var colors : string [] = [
'#FCF3CF' , '#512E5F', '#154360', '#6E2C00'
 '#1B4F72', '#145A32', '#7D6608', '#1B2631'
];



function connect(event){
username = document.querySelector('#name').value.trim();
if(username){
    usernamePage.classList.add('hidden');
    chatPage.classList.remove('hidden');

    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
 }
 event.preventDefault();
}



function onConnected(){
    // subscribe to the public topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // tell username to server
    stompClient.send('/app/chat.addUser',
     {},
     JSON.stringify({sender: username, type : 'JOIN'})
     );
     connectingElement.classList.add('hidden');
}

function onError(){
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color ='red';
};
function onMessageReceived(){
    var message = JSON.parse(payload.body);
    var messageElement = document.createElement('li');

    if(message.type === 'JOIN'){
        messageElement.classList.add('event-message');
        messageContent = message.sender + 'joined!';
    }else if(message.type === 'LEAVE'){
        messageElement.classList.add('event-message');
        message.content = message.sender + 'left!' ;
    }else{
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style ['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}
function sendMessage(event){
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient){
        var chatMessage = {
        sender : username ;
        content : messageContent,
        type : 'CHAT'
        };
        stompClient.send(
        '/app/chat.sendMessage',
        {},
        JSON.stringify(chatMessage)
        );
        messageInput.content = '';
    }
    event.preventDefault();
}

function getAvatarColor(messageSender){
    var hash = 0 ;
    for(var i = 0 i < messageSender.length ; i++){
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}


usernameForm.addEventListener('submit', connect, true );
usernameForm.addEventListener('submit', sendMessage, true );

# Web buddy

A chrome extension

## Usage/Installation

* Clone this repository
* In chrome addres bar (omnibox) go to: [chrome://extensions/](chrome://extensions/)
* On the top left corner click on "Load unpacked"
* Open a new tab like https://www.instagram.com/

## Framework
This chrome extension is divided in three main components

### Popup
The files within the /popup folder manage the top right icon/popup behavior. Those files encapsulates HTML, JS and CSS and do not interact with other components but througth the [messaging API](https://developer.chrome.com/extensions/messaging). Actions performed by 
the user within the popup are listened inside the popup.  

### Content
The top web buddy bar is an <iframe> that encapsulates the bar behavior, is inserted by mainContent.js. Once the <iframe> is inserted (outside the <body> tag) using 

```js 
document.documentElement.appendChild(iframe);
```

the whole page (exept the <iframe> ) is moved through the Y axis the exact <iframe> height using

```js
bodyStyle.transform = 'translateY(' + normalHeight +'px )'
```


* iframe.js and the files within /menu folder do not interact with the page itself but througth the [messaging API](https://developer.chrome.com/extensions/messaging)   
* files within /customSiteScripts do interact directly with the page itself (for instance instagram.com).
* <iframe> content is shared by all tabs, but they do not share the state. That means if a user opens a sub-menu, other tabs do not change, but if a user perform an action like adding a hashtag to follow, other bar tabs change.    
* Actions performed by user inside the <iframe> are listened inside iframe and menu files and are completely encapsulated there.
* Actions performed on the page are listened by originals scripts and content scripts, so content scripts must fight against the original code. Previous is also valid for styles. 
* The more we code in content the more we have to fight against the original code and styles.
* We could do ajax from content or background, but the sender will be the original page. See this [Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)

### Background

/background folder files interact with all components (using the [messaging API](https://developer.chrome.com/extensions/messaging)) and the world outside (using AJAX).


### Messaging between components

#### Send message

* from anywhere to background and popup:

```js
chrome.runtime.sendMessage( JSON_MESSAJE_HERE,(response)=>{
    //do something with response
});
```

* from anywhere to all tabs content, {} means "all tabs"

```js
chrome.tabs.query({}, function (tabs) {
    tabs.forEach((tab, i) => {
      chrome.tabs.sendMessage(tab.id, JSON_MESSAJE_HERE);
    });
  });
```

* from anywhere to active tab content, { active: true, currentWindow: true } means "just the current active tab"

```js
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, JSON_MESSAJE_HERE);
    });
```

* To send messages to specific tab see [tabs queries](https://developer.chrome.com/extensions/tabs#method-query)

#### listen to messages

* Messages are received using events 
* From anywhere to anywhere we use:

```js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//do something with message
//reply using sendResponse(REPLAY HERE)
}
```

#### Messaging Caveats using async requests

The easiest way allowed by the chrome API messaging to make a request and get a reply is using a callback function, but async requests performed by background scripts throw errors when we send a response even if we send a response using "await" or inside a callback. See this example:

##### This do not work properly:

* content script asks some information to background.
* background asks backend that information using ajax.
* background waits for backend's response to send a response to content, using 'await' or a simple ajax callback.
* content script receives the response from background.

##### This works properly:
* content script asks some configuration to background.
* content script is listening some message from background.
* background receives the request and perform an ajax, but no reply.
* when ajax is complete, send a message to content.

## Content flow

* Since listeners like ```chrome.runtime.onMessage``` listen any message from anywhere we follow this structure:

```js
{target: WHO, action: WHAT, value: HOW, data: DETAIL}
```

example:

from some tab send a message to all tabs that they have to hide the bar

```js
{target: 'background', action: 'BAR_VISIVILITY', value: 'HIDE_BAR'}
```

### Iframe bar say "hello!" to backend database

Summary: iframe -> background -> backend

content/menu/subMenu/sellers.js -> background.js -> backend -> background.js -> content/menu/subMenu/sellers.js

#### in sellers.js

```js
//SEND MESSAGE
chrome.runtime.sendMessage({target: 'background', 
                            action: 'SAY_SOMETHING', 
                            value: 'hello!'});
```

```js
//LISTEN TO THE REPLAY OR AN INDEPENDENT MESSAGE
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if(message.target === 'content'){
                switch (message.action) {
            case 'SAY_SOMETHING':     
                    //HERE A BACKGROUND MESSAGE           
                    console.log(message.value);
                break;
            case 'OTHER_ACTION':
                //Other action
                break;
            }
        }
}
```

#### in backgroud.js


```js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if(message.target === 'background'){
                switch (message.action) {
            case 'SAY_SOMETHING':
                
                    fetch(`http://mybackend-example.com?message=${message.value}`)
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(backendGreeting) {
                        //SEND MESSAGE TO OTHER FUNCTION OR
                        // chrome.runtime.sendMessage() HERE.
                        //NOT sendResponse() BECAUSE THE CHANNEL WAS CLOSED
                        someFunction(backendGreeting);
                    });

                break;
            case 'OTHER_ACTION':
                //Other action
                break;
            }
        }
}
```


```js
const someFunction = (textMessage) =>{
    chrome.runtime.sendMessage({target: 'content', 
                                action: 'SAY_SOMETHING', 
                                value: textMessage});
}
```

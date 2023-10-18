# gptify 🤖
*LLMs, LLMs everywhere* 🙌  
A loose collection of stuff related to LLMs and integration with the chatgpt API.  
For now just a script that enables text completion in all input fields.  
The idea is to allow you to plug the openai api in any web app, without having to integrate it yourself.

### gptify.js
Script that enables text completion in all input fields.  
### Usage
Reference this script in your front end project, and call `gptify()` on the input field you want to enable gpt completion on.  
E.g. gptify(document.getElementById('my-input-field')).  
The shortcut for triggering text completion is cmd+period (mac) or ctrl+period (windows).  
The shortcut for accepting the completion is Tab, when the completion is visible (light gray text, as in vscode).  
The chatgpt api key is stored in localStorage.CHATGPT_API_KEY.

### Requirements
* A chatgpt api key, get one [here](https://platform.openai.com) 
* Knowledge of the fetch api

### Todo
* Settings page / config UI, for setting temperature, max tokens, inputting api key etc.
* 
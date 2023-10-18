// gptify.js
// Version: 0.0.1
// Author: @damsleth
// License: WTFPL

/**
  Description: a script that enables chat gpt text completion in all input fields
  Usage: reference this script in your front end project,
  and call gptify() on the input field you want to enable gpt completion on.
  e.g. gptify(document.getElementById('my-input-field')).
  The shortcut for triggering text completion is cmd+period (mac) or ctrl+period (windows).
  The shortcut for accepting the completion is Tab, when the completion is visible (light gray text, as in vscode).
  The chatgpt api key is stored in localStorage.CHATGPT_API_KEY.
 */

  const replaceSelection = (txt) => {
    const anchorNode = window.getSelection()?.anchorNode
    if (anchorNode?.parentNode.tagName === 'TEXTAREA' || anchorNode.parentNode.role === 'textbox') {
      // parent node is textarea or textbox. setting innerText
      anchorNode.innerText = txt
    }
    else {
      // parent node is not textarea or textbox. setting value of anchor node directly
      anchorNode.nodeValue = txt
    }
  }
  
  const gptify_config = {
    temperature: 0.9,
    // max_tokens: 64,
    stream: false,
    model: 'gpt-4',
    messages: [
      {
        "role": "system",
        "content": "You help the user create paragraphs of text by providing suggestions for what to write next"
      }]
  }
  
  const apiKey = () => localStorage.CHATGPT_API_KEY
  
  const state = {
    previousText: '',
    newText: '',
    completion: '',
    prompt: '',
    isSuggesting: false,
  }
  
  function resetState() {
    state.previousText = ''
    state.newText = ''
    state.completion = ''
    state.prompt = ''
    state.isSuggesting = false
  }
  
  async function getCompletion(prompt) {
    const body = {
      ...gptify_config,
      messages: [{ "role": "user", "content": `${prompt}` }]
    }
    console.log('body:', body)
    // add an absolutely positioned div with a spinner to the body, where the cursor is
    // remove the div when the response is received
  
    addSpinner()
    const response = localStorage.gptifydebug === 'true'
      ? await new Promise(r => setTimeout(() => r("DUMMY RESPONSE"), 1000))
      : await getChatGPTResponse(body)
    removeSpinner()
    return response
  }
  
  // add an absolutely positioned div with a spinner to the body, where the cursor is
  function addSpinner() {
    const spinner = document.createElement('div')
    spinner.id = 'gptify-spinner'
    spinner.style.position = 'absolute'
    spinner.style.top = window.getSelection().anchorNode.parentNode.getBoundingClientRect().top + 'px'
    spinner.style.left = window.getSelection().anchorNode.parentNode.getBoundingClientRect().left + 'px'
    spinner.style.width = '32px'
    spinner.style.height = '32px'
    spinner.style.backgroundImage = 'url(https://damsleth.sharepoint.com/_layouts/15/images/loading16.GIF)'
    spinner.style.backgroundSize = 'contain'
    document.body.appendChild(spinner)
  }
  
  function removeSpinner() {
    [].slice.call(document.querySelectorAll('#gptify-spinner')).map(el => el.remove())
  }
  
  async function getChatGPTResponse(body) {
    const start = new Date().getTime()
    const resJson = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey()}`
      },
      body: JSON.stringify(body)
    })
    const response = await resJson.json()
    const elapsed = new Date().getTime() - start
    console.log(`Response took ${elapsed}ms`)
    console.log(response)
    return response?.choices[0]?.message?.content || '...'
  }
  
  
  function insertSuggestion(response) {
    const curPos = window.getSelection()?.anchorOffset
    const txt = window.getSelection()?.anchorNode?.nodeValue || ''
    const tBeforeCur = txt.slice(0, curPos)
    const tAfterCur = txt.slice(curPos)
    const newTxt = tBeforeCur + response + tAfterCur
    state.previousText = txt
    state.newText = newTxt
    replaceSelection(newTxt)
    // set cursor to end of inserted text
    const newCurPos = curPos + response.length
    const range = document.createRange()
    const sel = window.getSelection()
    range.setStart(sel.anchorNode, newCurPos)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
    console.log('new state:', state)
  }
  
  function acceptSuggestion() {
    console.log('acccepting suggesiton')
    resetState()
    console.log('new state:', state)
  }
  
  function rejectSuggestion() {
    console.log(`rejecting suggestion ${state.completion}`)
    replaceSelection(state.previousText)
    resetState()
    console.log('new state:', state)
  }
  
  function addGPTifyListener() {
    document.addEventListener('keydown', (e) => {
      // if e.target is <textarea> or [role='textbox'], then trigger
      if (e?.target?.tagName === 'TEXTAREA' || e.target.getAttribute('role') === 'textbox') {
  
        // is suggesting and tab, enter, or arrowRight
        if (state.isSuggesting && (e.key === 'Tab' || e.key === 'Enter' || e.key === 'ArrowRight')) {
          e.preventDefault()
          acceptSuggestion()
  
          // is not suggesting and cmd+period - get completion
        } else if ((e.metaKey || e.ctrlKey) && e.key === '.') {
          e.preventDefault()
          console.log('getting completion for text:')
          let prompt = window.getSelection()?.anchorNode?.nodeValue || ''
          console.log(`Getting suggestions for prompt: '${prompt}'`)
          getCompletion(prompt).then(res => {
            console.log('got completion:', res)
            state.prompt = prompt
            insertSuggestion(res)
          })
          state.isSuggesting = true
          console.log('isSuggesting:', state.isSuggesting)
  
          // is suggesting and not tab, enter, or arrowRight, and meta and ctrl is not held - remove suggestion
        } else if (state.isSuggesting && (e.key !== 'Tab' && e.key !== 'Enter' && e.key !== 'ArrowRight' && e.metaKey !== true && e.ctrlKey !== true)) {
          e.preventDefault()
          console.log('removing completion')
          rejectSuggestion()
          state.isSuggesting = false
        }
        // meta or ctrl is held, plus z, x, c, v, a, or z
        else if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'x' || e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'z')) {
          console.log('meta or ctrl is held, plus z, x, c, v, a, or z')
          resetState()
        }
      } else {
        console.log('not a textarea or input field')
      }
    })
  }
  
  function gptify() {
    if (!apiKey()) {
      console.error('No api key found. Please set localStorage.CHATGPT_API_KEY to your api key.')
      return
    }
    addGPTifyListener()
  }
  
  gptify()
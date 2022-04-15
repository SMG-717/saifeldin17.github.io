/////////////////////////////////////////////////
/////////  SETUP
/////////////////////////////////////////////////

var logger
var input
var form
var output

// This function starts calling other functions to process the question once the submit button is pressed
handle_question = function () {
    display_answer("Thinking...")
    res = match_question(input.value)
    inject(res.key_words, res.template_index, display_answer)
}

// Setting up global variables
window.onload = function () {
    logger = document.getElementById("logger")
    input = document.getElementById("question-field")
    form = document.getElementById("question-form")
    output = document.getElementById("answer-field")

    // Form listener
    form.addEventListener('submit', e => {
        handle_question()
        e.preventDefault()      // Stops the page from refreshing whenever the submit button is pressed
    })
    
    // Must include this header for interacting with the CORS server
    axios.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest'
}


/////////////////////////////////////////////////
/////////  DEBUG AND TESTING
/////////////////////////////////////////////////

// Simple logger function that displays messages on the page instead of using the console
log = function (message) {
    if (typeof message == "string") {
        logger.innerText += "\n" + message
    } else {
        logger.innerText += "\n" + JSON.stringify(message)
    }
}

// Tests if the matching function recognises every format
test_matching = function () {
    test_list = [
        ["what is this?", "what is that?", "what is with multiple words?"],
        ["how did this happen?", "how did the great extinction happen"],
        ["how does an engine work?", ],
        ["how to tie a tie?", ],
        ["how did person do this?", ],
        ["why is the sky blue?", ],
        ["why did the chicken cross the road?", ],
        ["when did this happen?", ],
        ["when did person do thing?", ],
        ["who did thing to person?", ],
        ["who did thing?", ],
        ["who is person", ],
        ["where is thing", ],
        ["where does person do thing", ]
    ]

    no_mistakes = true
    for (let i = 0; i < test_list.length; i += 1) {
        for (let j = 0; j < test_list[i].length; j += 1) {
            res = match_question(test_list[i][j])
            if (!res.matched || res.template_index != i) {
                no_mistakes = false
            }
        }
    }
    return no_mistakes
}

// Capitalises the first letter of a given string
// Necessary for Wikidata
capitalise = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

// Displays the answer to the input question in the big answer field
display_answer = function (string) {
    output.innerText = string
}
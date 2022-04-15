// List of question formats. Only a few of them have implementations.
var questions = [
    "what is _",
    "how did _ happen",
    "how does _ work",
    "how to _",
    "how did _ do _",
    "why is _",
    "why did _ do _",
    "when did _ happen",
    "when did _ do _",
    "who did _ to _",
    "who did _",
    "who is _",
    "where is _",
    "where does _ do _"
]

// Url and query template for API calls.
const url = "https://www.wikidata.org/w/api.php";
const query_template = {
    action: "wbgetentities",
    sites: "enwiki",
    props: "descriptions",
    languages: "en",
    format: "json",
};

// Turns an object into a list of key value pairs for http queries
// This was borrowed from StackOverflow: https://stackoverflow.com/questions/1714786/query-string-encoding-of-a-javascript-object
stringify = function (obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

gen_link = function (s) {
    query = query_template
    query.titles = s
    return "https://saif-cors.herokuapp.com/" + url + "?" + stringify(query)
}

gen_query = function (query) {
    return "https://saif-cors.herokuapp.com/" + url + "?" + stringify(query)
}

// Uses breadth first search to find a property in an object
search_for_property = function (obj, prop) {
    open_list = Array(obj)
    while (open_list.length != 0) {
        current = open_list.shift()
        keys = Object.keys(current)
        if (keys.length == 0 || typeof current != "object") {
            continue
        } else if (current[prop] != undefined) {
            return current[prop]
        } else {
            for (const k of keys) {
                open_list.push(current[k])
            }
        }
    }
}

// The injection function.
// Given a list of keywords and a question format it will create the corresponding API call
inject = function (key_words, index, callback) {

    // Firstly we find which question we matched the best, then we generate the query accordingly
    switch (questions[index]) {
        case "what is _":
            axios.get(gen_link(capitalise(key_words[0]))).then(
                res => {
                    // Simple question about what an object is
                    // Use the first result from the search query
                    first_result = Object.keys(res.data.entities)[0]
                    if (first_result == -1) {
                        callback("Sorry, I do not know.")
                        return
                    }

                    // Get the description of the object
                    answer = res.data.entities[first_result].descriptions.en.value

                    // Sometimes a word can be repeated across wiki subject titles. In which case we have an ambiguity.
                    if (answer.toLowerCase() == "wikimedia disambiguation page") {
                        callback(`${capitalise(key_words[0])} is ambiguous. Please be more specific.`)
                        return
                    }

                    // If the description starts with a vowel we use 'an' instead of 'a'
                    if (['a', 'e', 'i', 'o', 'u'].includes(answer.charAt(0))) {
                        answer = key_words[0] + " is an " + answer
                    } else {
                        answer = key_words[0] + " is a " + answer
                    }

                    // Return the answer capitalised
                    callback(capitalise(answer))
                }
                )
                break;
                
                
                case "who is _":
                    // We have to capitalise every name first before querying
                    person_name = key_words[0].split(" ").map(e => capitalise(e)).join(" ")
                    axios.get(gen_link(person_name)).then(
                res => {
                    // Choose first result
                    first_result = Object.keys(res.data.entities)[0]
                    if (first_result == -1) {
                        callback("Sorry, I do not know.")
                        return
                    }

                    // Get a description of the person
                    answer = res.data.entities[first_result].descriptions.en.value
                    
                    // Might be some ambiguity with people
                    if (answer.toLowerCase() == "wikimedia disambiguation page") {
                        callback(`${capitalise(key_words[0])} is ambiguous. Please be more specific.`)
                        return
                    }
                    
                    // If the description starts with a vowel we use 'an' instead of 'a'
                    if (['a', 'e', 'i', 'o', 'u'].includes(answer.toLowerCase().charAt(0))) {
                        answer = key_words[0] + " is an " + answer
                    } else {
                        answer = key_words[0] + " is a " + answer
                    }
                    // Return the answer capitalised
                    callback(capitalise(answer))
                }
            )

        case "where is _":
            // We need a custom query for the list of claims instead of descriptions
            query = {
                action: "wbgetentities",
                sites: "enwiki",
                props: "claims",
                languages: "en",
                format: "json",
                titles: key_words[0]
            };

            axios.get(gen_query(query)).then(
                res => {

                    // Choose the first result
                    first_result = Object.keys(res.data.entities)[0]
                    if (first_result == -1) {
                        callback("Sorry, I do not know.")
                        return
                    }

                    // Get the list of claims.
                    // Claims are a list of true statement about an object
                    claims = res.data.entities[first_result].claims

                    // Get the ID of the location
                    item_loc = search_for_property(claims, "P276")
                    loc_id = search_for_property(item_loc, "value")

                    // Get the ID of the country
                    item_cty = search_for_property(claims, "P17")
                    cty_id = search_for_property(item_cty, "value")

                    if (item_loc == undefined) {
                        callback("Sorry, I do not know.")
                        return
                    }
                    
                    // Make another request to get the names of the location and country given their IDs
                    query = {
                        action: "wbgetentities",
                        sites: "enwiki",
                        props: "labels",
                        languages: "en",
                        format: "json",
                        ids: `${loc_id.id}|${cty_id.id}`
                    };
                    axios.get(gen_query(query)).then(res => {
                        city = res.data.entities[loc_id.id].labels.en.value
                        country = res.data.entities[cty_id.id].labels.en.value
                        answer = `${city}, ${country}`
                        callback(answer)
                    })
                }
            )
            break;

        // Default response
        default:
            callback("Unrecognised question format.");

    }
}

// The matcher.
// It finds out what format the question is in by comparing it to each one in the list
match_question = function (q) {
    for (let i = 0; i < questions.length; i += 1) {

        // Split the template and the input question into words
        template_split = questions[i].split(" ")
        q_split = q.replace("?", "").split(" ")

        // Keep track of the blank substitutions places
        blank_space = false
        strings_match = true
        key_words = []
        key_count = 0

        // Go over every word in both strings in parallel
        for (let j = 0, k = 0; j < template_split.length, k < q_split.length;) {

            // The words match if they are equal or if we are in a blank
            let equal = template_split[j] == q_split[k].toLowerCase() || template_split[j] == "_"

            // If the two words match, move on to the next pair of words
            if (equal) {
                blank_space = template_split[j] == "_";
                j += 1;
                k += 1;
                if (blank_space && j == template_split.length) j -= 1;
            } 

            // However, if the words don't match and we are still on the blank space consider it matched
            // and advance the input words forward
            else if (blank_space) {
                k += 1;
            } 
            
            // If we don't match and are not on a blank it means the questions don't match and we stop
            else {
                strings_match = false
                break;
            }

            // If we encountered a blank, we start building up our keywords
            if (blank_space) {
                if (key_count == 0) {
                    key_words.push(q_split[k - 1])
                    key_count = 1
                } else {
                    key_words[key_words.length - 1] += " " + q_split[k - 1]
                    key_count += 1
                }

            } 
            
            // If we have moved on from a blank, reset the counter
            else if (key_count > 0) {
                key_count = 0
            }

            // Keep track of whether the strings are equal or not post-iteration
            strings_match = equal
        }

        // If our strings match, we return the keywords we have extracted
        if (strings_match) {
            return {
                matched: true,
                template_index: i,
                key_words
            }
        };
    }
    return {
        matched: false
    };

}
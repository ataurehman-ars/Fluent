
import {keywords} from './keywords.js'
import {a_opers} from './keywords.js'
import {c_opers} from './keywords.js'
import {r_opers} from './keywords.js'
import {punctuators} from './keywords.js'
import {opers} from './keywords.js'

let token_list = []

function compile(){

    token_list = []

    let lines = document.getElementById("source-code").value.split('\n')

    let word_breaker = /[:!\s.(){}\[\]+-/=%"'><\\/\*]/
    
    let outer = 0, inner = 0

    while(outer < lines.length){

        if (word_breaker.test(lines[outer][inner]) && lines[outer][inner] === `"`){

            token_list.push({[lines[outer][inner]] : lines[outer][inner], "LN" : outer + 1 })

            
            if (lines[outer][inner + 1] === `"`){
            token_list.push({"EMPTY_STRING" : outer + 1 })
            token_list.push({ [lines[outer][inner + 1]] : lines[outer][inner + 1] })
            inner += 1
            }

            else{
            let end_string = validateString(lines[outer].substr(inner + 1, lines[outer].length), outer + 1)
            inner = end_string !== -1 ? inner + end_string + 1 : inner
            }
        }
    
        if (word_breaker.test(lines[outer][inner]) && lines[outer][inner] === `'`){

            token_list.push({[lines[outer][inner]] : lines[outer][inner], "LN" : outer + 1 })

            if (lines[outer][inner + 1] === `'`){
                token_list.push({ "EMPTY_CHAR" : outer + 1})
                token_list.push({[lines[outer][inner + 1]] : lines[outer][inner + 1], "LN" : outer + 1})
                inner += 2
            }

            else {
            let char_end = /'/

            let extract_char = lines[outer].substr(inner + 1, lines[outer].length)

            let find_end = extract_char.search(char_end) === -1 ? extract_char.length : extract_char.search(char_end)

            let end_char = extract_char.substr(0, find_end)

            let validate_char = /^\\[ntr"'\\]$|^[\w\W\d\D\s\S]$/.test(end_char)

            token_list.push({[!validate_char ? "INVALID_CHAR" : "CHAR_CONST"] : end_char , "LN" : outer + 1})
            
            if (extract_char.search(char_end) !== -1)
            token_list.push({[`'`] : `'`})

            inner = find_end !== -1 ? inner + find_end + 2 : inner + find_end

            }

        }
        
        


        if (word_breaker.test(lines[outer][inner]) && lines[outer][inner] !== `"` || 
        !word_breaker.test(lines[outer][inner]) && Object.values(token_list[token_list.length - 1])[0] === `"`
        || Object.values(token_list[token_list.length - 1])[0] === `'`){

            if (word_breaker.test(lines[outer][inner])){
            let make_comp = lines[outer][inner] + lines[outer][inner + 1]

            let is_comp = word_breaker.test(lines[outer][inner]) && /\+\+|--|\+=|-=|\/=|%=|>=|=<|==|\*=|>>/.test(make_comp)
            ? make_comp : lines[outer][inner]

   
            token_list.push({[/^[\+-]$/.test(is_comp) ? "PM" : /^[/\*%]$/.test(is_comp) ? "MDM" : is_comp] : is_comp , 
            "LN" : outer + 1})

            inner = is_comp.length > 1 ? inner + is_comp.length - 1 : inner }

            let start = word_breaker.test(lines[outer][inner]) ? inner + 1 : inner
            let end = lines[outer].substr(start , lines[outer].length).search(word_breaker)
            let temp = lines[outer].substr(start , end)

            if (temp && temp[0].match(/[a-zA-Z_0-9]/))
            inner = validateWord(temp, outer + 1) ? validateWord(temp, start, lines[outer]) - 1 : inner
            
        }

        
        outer = (inner < lines[outer].length - 1 ? inner += 1 : inner = 0) ? outer : outer += 1
    }

}



function validateString(string, lineNo){

    let end = /[^\\]"/

    let terminate_str = string.search(end) === -1 ? string.length : string.search(end) + 1

    let str_type = string.search(end) === -1 ? "INVALID_STRING" : "STRING_CONST"

    token_list.push({ [str_type] : string.substr(0, terminate_str) , "LN" : lineNo})
    
    if (string.search(end) !== -1)
    token_list.push({ [string[string.search(end) + 1]  ] : string[string.search(end) + 1], "LN" : lineNo})
    
    return terminate_str

}



function validateWord(word, lineNo){
    let isKeyword = JSON.stringify(keywords).search(`"${word}"`)

    if (isKeyword !== -1)
    token_list.push({"KEYWORD" : word, "LN" : lineNo})
                                         

    else
    if (/^[0-9]+$/.test(word)){

   

    }


    else{

        let is_valid_id = (/^(_)*[a-zA-Z]+[a-zA-Z0-9_]*$/.test(word))
        let id_type = is_valid_id ? "IDENTIFIER" : "INVALID_IDENTIFIER"
        token_list.push({[id_type] : word, "LN" : lineNo})
    }


}




document.getElementById("compile").onclick = () => {
    compile()
    console.log(token_list)
}




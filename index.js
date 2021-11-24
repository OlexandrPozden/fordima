var pos={
    start:0
}
function getCursorPos(input) {
    if ("selectionStart" in input && document.activeElement == input) {
        return {
            start: input.selectionStart,
            end: input.selectionEnd
        };
    } else if (input.createTextRange) {
        var sel = document.selection.createRange();
        if (sel.parentElement() === input) {
            var rng = input.createTextRange();
            rng.moveToBookmark(sel.getBookmark());
            for (var len = 0; rng.compareEndPoints("EndToStart", rng) > 0; rng.moveEnd("character", -1)) {
                len++;
            }
            rng.setEndPoint("StartToStart", input.createTextRange());
            for (var pos = { start: 0, end: len }; rng.compareEndPoints("EndToStart", rng) > 0; rng.moveEnd("character", -1)) {
                pos.start++;
                pos.end++;
            }
            return pos;

        }
    }
    return -1;
}


$(function() {
    $("#input-text").on("keyup click", function(e) {
        pos = getCursorPos(this);
        console.log(pos.start)
    }).siblings("input").keydown(function(e) {
        if (e.keyCode == 13) {
            $(this).siblings("button").click();
            e.preventDefault();
        }
    });
});

const textField = document.getElementById("input-text");
const radioFromStart = document.getElementById("from-start");
const radioFromPoint = document.getElementById("from-cursor");
const maskField = document.getElementById("mask");
const subwordField = document.getElementById("subword");
const selectedField = document.getElementById("selected");
const replaceSingleField = document.getElementById("replace-single");
const replaceAllField = document.getElementById("replace-all");
var FROM_START = true;

const findMatches = (text,mask, splitter) =>{
    if (mask){
        let re =  new RegExp(mask+"(?=\\s)", "g");
        return text.slice(splitter).match(re);
    }
    else return []
    
}
const findMatchesFromStart = (text,mask) => {return findMatches(text,mask,0)};
const findMatchesFromPoint = (text,mask,splitter) => {return findMatches(text,mask,splitter)};

const replaceWord = (text,wordtoreplace,subword,n)=>{
    let i = -1;
    let re = new RegExp(wordtoreplace+"(?=\\s)",'g')
    return text.replace(re, match => ++i==n?subword:match)
}
const replaceAllWords = (text,wordtoreplace,subword)=>{
    let re = new RegExp(wordtoreplace+"(?=\\s)",'g')
    return text.replace(re,subword)
}
const replaceAllWordsFromCursor = (text,wordtoreplace,subword,splitter)=>{
    let begining = text.slice(0,splitter);
    return begining+replaceAllWords(text.slice(splitter),wordtoreplace,subword)
}
const replaceWordFromCursor = (text,wordtoreplace,subword,n,splitter)=>{
    let begining = text.slice(0,splitter);
    return begining+replaceWord(text.slice(splitter),wordtoreplace,subword,n)
}
const generateOption = (value, id)=>{
    let option = document.createElement("option")
    option.setAttribute('value',id)
    option.innerHTML = value
    return option
}
const insertArrayInSelect = (select,array)=>{
    select.innerHTML="";
    array.map((v,i)=>{
        select.appendChild(generateOption(v,i))
    }) 
}
function normalizeMask(mask) {
    return mask.replace(/\\a/g,'[\+\/\*-]')
}
const insertMatchedWords = () => {
    let text = textField.value;
    let mask = normalizeMask(maskField.value.trim());
    let splitter = FROM_START ? 0: pos.start
    let matchedWords = findMatches(text,mask,splitter);
    insertArrayInSelect(selectedField,matchedWords);
}
const switchFromStart = value => {FROM_START = value=="1"?true : false}
const switchListener = radio => {
    if(radio.checked) switchFromStart(radio.value);
    insertMatchedWords();
}
const replaceWordListener = () => {
    let text = textField.value;
    let wordtoreplace = normalizeMask(maskField.value);
    let subword = subwordField.value;
    let n = selectedField.value;
    let splitter = FROM_START ? 0: pos.start
    if (splitter) {
        console.log(text,wordtoreplace,subword,n,splitter)
        let newtext = replaceWordFromCursor(text,wordtoreplace,subword,n,splitter)
        console.log(newtext);
        textField.value = newtext;
    }
    else {
        console.log(text,wordtoreplace,subword,n,splitter)
        let newtext = replaceWord(text,wordtoreplace,subword,n)
        console.log(newtext);
        textField.value = newtext;
    }
}
const replaceAllWordsListener = () => {
    let text = textField.value;
    let wordtoreplace = normalizeMask(maskField.value);
    let subword = subwordField.value;
    let splitter = FROM_START ? 0: pos.start
    if (splitter) {
        console.log(text,wordtoreplace,subword,splitter)
        let newtext = replaceAllWordsFromCursor(text,wordtoreplace,subword,splitter)
        console.log(newtext);
        textField.value = newtext;
    }
    else{ 
        console.log(text,wordtoreplace,subword,splitter)
        let newtext = replaceAllWords(text,wordtoreplace,subword)
        console.log(newtext);
        textField.value = newtext;
    }
}
radioFromStart.addEventListener('change',(event)=>{switchListener(event.target)})
radioFromPoint.addEventListener('change',(event)=>{switchListener(event.target)})
textField.addEventListener("keyup",(event)=>{
    insertMatchedWords();
})
maskField.addEventListener("input",(event)=>{
    insertMatchedWords();
})
replaceSingleField.addEventListener('click',()=>{
    replaceWordListener();
})
replaceAllField.addEventListener('click',()=>{
    replaceAllWordsListener();
})

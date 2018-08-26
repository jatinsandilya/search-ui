// ============= Submitted Code Starts =============================

// Polyfill for datalist elemeent.

if (window.webshims) {
  webshims.setOptions('forms', {
    customDatalist: true
  });
  webshims.polyfill('forms');
}

const timer = Rx.Observable.timer;
const fromEvent = Rx.Observable.fromEvent;
const from = Rx.Observable.from;


// Restricting the number of suggestions displayed to five.

const MAX_SUGGESTIONS = -5;

// To wait for user input to finish/pause before calling the server.

const DEBOUNCE_INPUT = 1000;

let searchInput = document.getElementById("search-input");

let searchOutput = document.getElementById("search-datalist");

let searchContainer = document.getElementById("search-container");

let searchError = document.getElementById("search-error");

// Observable for calling the backend API.

let searchObservable = fromEvent(searchInput, 'keyup');


// Filtering for empty strings 

let searchText = searchObservable
  .debounce(() => timer(DEBOUNCE_INPUT))
  .filter(e => e.target.value !== '' && e.target.value.trim() !== '' && e.target.value.length >= 3);


// Observable for user selection of a suggestion.

let changeObservable = fromEvent(searchInput, 'input');


// Remove error when user inputs a value after an error occured.

function clearError() {
  searchError.style.display = "none";
}

// Show error when Promise from suggestions API rejects.

function renderError(error) {
  console.log("ERROR from suggestions server.",e)
  searchError.style.display = "block";
}


// Clears the options under #search-datalist

function clearSuggestions() {
  while (searchOutput.hasChildNodes()) {
    searchOutput.removeChild(searchOutput.lastChild);
  }
}

/*

	Renders the suggestions below the search-box 
  using the suggestions array returned from the api.
  The last word used to suggest is displayed along with
  the whole text in ihe search box and is
  appended to it with a space. 
  
*/
function renderSuggestion(inputText, lastWord, suggestions) {


  clearSuggestions();

  suggestions.slice(MAX_SUGGESTIONS).forEach(suggestion => {
    let option = document.createElement('option');
    option.value = inputText + " " + suggestion;
    option.classList.add('allOptions');
    option.innerHTML = "Matches: " + lastWord;
    searchOutput.appendChild(option);
  })

}

/*

	Checks if the input in the text box is the one of 
  the suggestions. 
  
  if yes, appends a space.And clears the datalist.
  if no
  
*/
function onInput(event) {

  event.preventDefault();

  clearError();

  // Ignore backspce

  if (event.inputType !== "deleteContentBackward") {

    let updatedText = event.target.value;
    let options = document.getElementsByClassName("allOptions");

    for (let i in options) {
      let opt = options[i];
      if (opt.value === updatedText) {
        // append space to existing input value.
        searchInput.value = updatedText + " ";
        clearSuggestions();
      }
    }

  }

}


/*

	Subseribing for input changes
  
*/

changeObservable.subscribe(

  event => onInput(event),
  e => console.log("Error in watching input changes"),
  () => {}

);

/*
	
  Resposnible for calling the backend.
  Skips empty strings and only calls the
  backend API with the last typed word as per the
  requirement.
  If the server responds those options are shown.
  Else an error message is shown.
  
*/
searchText.subscribe(

  event => {

    event.preventDefault();

    let inputText = event.target.value.trim();
    let words = inputText.trim().split(" ");
    let lastWord = words[words.length - 1];


    from(getSuggestions(lastWord)).subscribe(
      res => renderSuggestion(inputText, lastWord, res),
      e => renderError(e)
    );

  },
  e => console.log(e),
  () => console.log("works")

);


// =============== Submitted Code Ends here =================




//
// =================== Mock Server Start ====================

var FAILURE_COEFF = 100;
var MAX_SERVER_LATENCY = 200;

function getRandomBool(n) {
  var maxRandomCoeff = 1000;
  if (n > maxRandomCoeff) n = maxRandomCoeff;
  return Math.floor(Math.random() * maxRandomCoeff) % n === 0;
}

function getSuggestions(text) {
  var pre = 'pre';
  var post = 'post';
  var results = [];
  if (getRandomBool(2)) {
    results.push(pre + text);
  }
  if (getRandomBool(2)) {
    results.push(text);
  }
  if (getRandomBool(2)) {
    results.push(text + post);
  }
  if (getRandomBool(2)) {
    results.push(pre + text + post);
  }
  return new Promise((resolve, reject) => {
    var randomTimeout = Math.random() * MAX_SERVER_LATENCY;
    setTimeout(() => {

      // ------- 
      // 
      // Modified :
      // 
      // Uncomment below to test for error message.
      // reject();
      //
      // --------

      if (getRandomBool(FAILURE_COEFF)) {
        reject();
      } else {
        resolve(results);
      }
    }, randomTimeout);
  });
}
// ================= Mock Server End =============================

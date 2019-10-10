//function displayTime() {
//    var elt = document.getElementById("explication"); // Find element with id="clock"
//    var now = new Date();                         // Get current time
//    elt.innerHTML = now.toLocaleTimeString();     // Make elt display it
//    setTimeout(displayTime, 1000);                // Run again in 1 second
//}
//window.onload = displayTime; // Start displaying the time when document loads.

var explications = [
	    "In the pedagogical branch of Music composition known as \
	    Species Counterpoint, counterpoint is divided into progressively \
	    complex classifications known as Species. The Fourth\u2014and penultimate\u2014Species \
	    is characterized by a device called The Suspension.",
	    
	    "\u201CThe file holding the interpreter was labeled FORTH, for 4th (next) " +
	    "generation software - but the operating system restricted file names to " +
	    "5 characters.\u201D \u2014Chuck Moore, creator of Graham's first programming language",
	    
	    "Historically perhaps the most important resource for northern-inhabiting peoples, " +
	    "the wild reindeer is now known to Canadians best from their pocket change: its image " +
	    "has long-defined the tail of their standard quarter. Of course, in North America," +
	    " it is called the Caribou."];


function getExplication() {
	var choice = Math.floor(Math.random() * explications.length);
	return explications[choice];
}
//window.onload = displayExplication;

///* Return the available type of local storage, or a dummy object, if none */
//function getLocalStorage(){
//    if (typeof localStorage == "object"){
//        return localStorage;
//    } else if (typeof globalStorage == "object"){
//        return globalStorage[location.host];
//    } else {
//    	storage = {};
//    }
//}

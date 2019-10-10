//WEIRD BUG: on arrival at this window for the first time, the heights of the elements aren't quite right, epecially when
// using a small window. Resizing immediately fixes it for good, though.

// For testing, adds a new line to the textarea
function print(str) {
	console.log(str);
	
//	var output = $('textarea');
//	var txt = output.html();
//	txt = txt + str + "\n";
//	output.text(txt);
}

var outlined = false;
function outline() {
	if (outlined) {
		$('*').css("border", "1px dotted");
	}
}

function printHeights() {
	$('*').each(function(i, e) {
		print(e.nodeName.toLowerCase() + "." + e.getAttribute("id") + ": " + $(this).height());
	});
	print("********************");
}


// CONSTANTS: ***************************
var $topbar;
var $barTit;
var $barSub;
var $tabs;
var $banTit;
var $banSub;
var $flap;
var $explication;
var $main;

var padding = 10;
var dur = 400; // Time for link animations to happen
var showDur = 800;   // Time for body (#main) to fade in
var homePath = "index.html";
var DOMAIN = "thefourthspecies.com";

var storage;

// VARIABLES: ************************

/* True when the Banner is showing */
var bannered = true;
var subShrink;
var subGrow;



// FUNCTIONS: **************************


function initConstants() {
	$topbar = $('#topbar');
	$barTit = $('#bartit');
	$barSub = $('#barsub');
	$tabs = $('#tabs');
	$banTit = $('#bantit');
	$banSub = $('#bansub');
	$flap = $('#flap');
	$explication = $('#explication');
	$main = $('#main');
}

/* Initialize the positions and heights of the animable elements */
function setHeights() {
	if (bannered) {
		$banSub.oldPos = {top: $banTit.height(), left: 0};
		$banSub.css("top", $banSub.oldPos.top);
	
		$flap.buffer = $banTit.height() + $banSub.height() + padding;
		$flap.height($flap.buffer + $explication.height());
	
		$main.css("top", $flap.height());
	} else {
		$flap.css("top", -$flap.height());
		$flap.height($flap.buffer + $explication.height());
	}
	
}

/* Assigns the appropriate heights and locations to asolute objects */
function initDimensions() {
	setHeights();
	$(window).resize(setHeights);
	
	var minWidth = $barTit.width() + $barSub.width() + $tabs.width() + padding;
	$('.fixie').css("min-width", minWidth);
	
}

/* Unless this is index.html, sets up the banner as small */
function initBanner() {
	if (!isPath(homePath) && !isPath("/")) {
		saveBanner();

		$banTit.css({top: $barTit.position().top, left: $barTit.position().left, "font-size": $barTit.css("font-size")});
		$banSub.css({top: $barSub.position().top, left: $barSub.position().left, "font-size": $barSub.css("font-size")});
		
		$flap.css({top: -	$flap.height()});
		$main.css({top: $topbar.height()});
		
		bannered = false;
	}
}

/*Prepare the path object for subtitle movement */
function saveBanner() {

	subShrink = {
			start: { 
				x: $banSub.position().left, 
				y: $banSub.position().top,
				angle: 20,
			},  
			end: { 
				x: $barSub.position().left,
				y: $barSub.position().top,
				angle: -100, 
			},
	};
	
	subGrow = {
			start: { 
				x: $barSub.position().left,
				y: $barSub.position().top,
				angle: -120,
//				length: .2,
			},  
			end: { 
				x: $banSub.position().left, 
				y: $banSub.position().top,
				angle: -10,
			},
	};
	
	
	$banTit.pos = $banTit.position();
	$banTit.size = $banTit.css("font-size");
	$banSub.size = $banSub.css("font-size");
}



/* Displays banner when it is hidden; hides it when it is showing */
function toggleBanner() {
	if (bannered) {
		hideBanner();
		clearExplication();
	} else {
		showBanner();
		saveExplication();
	}
}

/* Hides the Banner (with animation)*/
function hideBanner() {
	if ($banSub.filter(":animated").length == 0) {
		// Because of that bug that causes the heights to be all wrong at first, this lets us 
		// have nice heights after animating AND moving (otherwise animations would always be bad from small window
		// initial conditions).
		// Want to check that it isn't in the process of animating though when saving the values!
		saveBanner();
	}
	
	$banTit.animate({top: $barTit.position().top, left: $barTit.position().left, "font-size": $barTit.css("font-size")}, 
			{duration: dur});
	$banSub.animate({path: new $.path.bezier(subShrink), "font-size": $barSub.css("font-size")},
			{duration: dur});
	
	$flap.animate({top: $topbar.height() - $flap.height()}, 
			{easing: 'easeInBack', duration: dur});
	$main.animate({top: $topbar.height()}, 
			{easing: 'easeInBack', duration: dur});
	
	bannered = false;
}

/* Shows the Banner (with animation) */
function showBanner() {
	//choose a perhaps-new explication
	displayExplication();
	
	$flap.height($flap.buffer + $explication.height());
	$flap.css("top", $topbar.height() - $flap.height());
		
	$banTit.animate({top: $banTit.pos.top, left: $banTit.pos.left, "font-size": $banTit.size},
			{duration: dur});
	$banSub.animate({path: new $.path.bezier(subGrow), "font-size": $banSub.size}, {duration: dur});
	
	$flap.animate({top: 0}, {easing: "easeOutBack", duration: dur});
	$main.animate({top: $flap.height()}, {easing: "swing", duration: dur});
	
	bannered = true;
}

/* Sets the explication text */
function displayExplication() {
	var text = storage.explication;
	var exp = text || getExplication();
	$('#explication').html(exp);
}

//	var exp = text ? text : getExplication();



/* Follow the link only after completing the appropriate
 * animation. If whenBannered is true, waits til the Banner is large to follow link */
function animateLink(link, whenBannered) {
	function jump() {
		window.location.href = link;
	}
		$main.fadeOut({duration: dur, queue: false});



	if (bannered !== whenBannered) {
		toggleBanner();
		// Hack, because I couldn't make it work with callbacks:
		window.setTimeout(jump, dur); 
	} else {
		jump();
	}
}

/* Stores the current explication in local storage */
function saveExplication() {
	storage.explication = $('#explication').text();
}

/* Clears the local storage explication */
function clearExplication() {
	delete storage.explication;
}


/* Return true if given path is the termination for the current pathname */
function isPath(path) {
	return path === window.location.pathname.slice(-path.length);
}

/*Ensures the tabs link to the appropriate spot, the current one is highlighted, and they
 * animate what they should, when they should. */
function setupTabs() {
	$('.tab').each(function(i) {
		var link = this.getAttribute("href");
		this.removeAttribute("href");

		if (isPath(link)) {
			$(this).css("background-color", "black").css("color", "orange");			
			$(this).click(toggleBanner);
		} else {
			$(this).click(function() {
				animateLink(link, false);
			});
		}
	});
};

/*Allows anything link of class littlelink to only animate on small banner.*/
function setupLinks () {
	$('.littlelink').each(function (i) {
		var link = this.getAttribute("href");
		this.removeAttribute("href");
		// this.setAttribute("cursor", "pointer");

		$(this).click(function() {
			animateLink(link, false);
		});
	});
};

/* Depending on if we are in the home path or not, setups up the Banner! */
function setupBanLink() {
	var a = $(".banner a");
	var link = a.attr("href");
	a.removeAttr("href");
	
	if (isPath(homePath)) {
		a.click(toggleBanner);
	} else {
		a.click(function() {
			animateLink(link, true);
		});
	}
}

function setupAreas() {
	var text = $('#linker').text();
	$('area').each(function() {
		$(this).hover(function() {
			$('#linker').text(this.getAttribute("title") + "?");
		}, function() {
			$('#linker').text(text);
		});
	});
};

/*
 * 
		this.removeAttribute("href");
		$(this).click(function() {
			toggleBanner();
			// Stupid hack to ensure the animation has completed before
			// moving on to the new link. Tried with callbacks, but
			// I guess I did it wrong, since it didn't work.
			window.setTimeout(function() {
				window.location.href = link;
			}, dur);
		});
 */

// READY! *******************

	

function showBody() {
	$main.fadeIn(showDur);
}

$(document).ready(function() {
	storage = getLocalStorage();
	
	displayExplication();


	initConstants();
	initDimensions();
	initBanner();

	setupTabs();
	setupBanLink();
	setupLinks();
	setupAreas();
	showBody();
	

	
	//for tests:
	outline();
});


/* Return the available type of local storage, or a dummy object, if none */
function getLocalStorage(){
  if (typeof localStorage == "object"){
      return localStorage;
  } else if (typeof globalStorage == "object"){
      return globalStorage[location.host];
  } else {
  	storage = {};
  }
}


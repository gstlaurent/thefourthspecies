/* This is a simple snake game in JavaScript/jQuery
 * It requires a div with id "snake" and it will do the rest. 
*/ 


// Constants:
var $snake;

// These size units are in cells (1/2 ems)
var WIDTH = 80;   
var HEIGHT = 60;
var UNIT_NAME = "em";
var CELL_SIZE = .5;  // in UNITs
var BORDER = 2;
var CELL = 1; 

var BACK_COLOUR = "black";
var BORDER_COLOUR = "#993300";  // DARK BROWN
var FONT = "courier";
var TEXT_COLOUR = "tan";
var TEXT_SIZE;

var DEFAULT_SPEED = 20;
var CUTOFF = 40;  // the speed dividing slow and fast snakes

var DIRS = {
		left: [-1, 0],
		right: [1, 0],
		up: [0, -1],
		down: [0, 1],
};

function SnakeCharmer() {
	this.type = "";   // either fast or slow
	
	this.getHead = function(snake) {};
	this.getRate = function() {};      // returns the frame rate
	this.getLength = function() {};
	
	this.grow = function(snake) {};
	this.slide = function(snake) {};
	
	this.init = function(snake) {};		// sets up the rights kind of snake for this speed
	this.switcheroo = function(snake) {};
	this.convert = function(snake) {
		this.switcheroo(snake);
		updateLengths();
	};  // converts from one speed of snake to the other
}

var FAST = new SnakeCharmer();
var SLOW = new SnakeCharmer();

//VARIABLES ********************
/* our hero */
var snake;

/* our hero's food. It's a number! If he eats it, he grows by that amount! */
var $food;

/*The score display */
var $score;

/* The current length to display */
var $length;

/* The longest snake ever acheived */
var $longest;
var longest;

/* The highest score ever*/
var $hiscore;
var hiscore = 0;

/*Where the text is displayed */
var $textBar;

/*Storage for info */
var storage;

/* an animation counter. Whenever something starts moving, it should augment it.
 * Whenever it completes, it should decrement it. */
var animating = 0;

/* Reset game on next cycle, if true */
var gameover = false;

/* Game halts on true */
var paused = true;


/* Holds the methods for the current movements: either slow or fast */
var snakeCharmer = new SnakeCharmer();

/* The current speed */
var speed = 20;   // cells/sec
var $speed;


// Let's Begin:
$(document).ready(init$snake);


// functions: ***************************

/* Initializes AND and starts the snake game */
function init$snake() {
	$snake = $('#snake');
	$snake.empty();
	
	
	if (typeof Number.isNaN != "function") {
		// I really shouldn't be messing with other people's objects.
		print("Being bad and overwriting Number.isNaN");
		Number.isNaN = isNaN;
	}
	
	
	TEXT_SIZE = 2 * CELL;
	gameover = false;
	storage = getLocalStorage();
	loadValues();
		
	makeScreen();
	initTextBar();
	initGame();
	assignKeys();
	initCharmers();
	
	snakeCharmer.init(snake);
	updateLengths();
	updateSpeed();
	updateScores();
	
	playGame();
}

/* Displays the current length */
function updateLengths() {
	longest = Math.max(longest, snake.length);
	
	$length.text(snake.length);
	$longest.text(longest);
}

/* Sets display of speed to current speed */
function updateSpeed() {
	$speed.text(speed);
}

/* Represents a snake, with a body (array of cells), direction (String), and sliding head and tail cells */
function Snake(x, y) {
	this.body = [cell(x, y), cell(x-1, y)];
	this.dir = "right";
	this.nextDir = "right";  
	this.head = cell(x, y);
	this.tail = cell(x-1, y);
	this.growing = 0;
	this.score = 0;
	this.length = 2;
}

function slowToFast(snake) {
	snake.body.push(snake.tail);
	snake.head.remove();
	
	snakeCharmer = FAST;
	print("Charmer type: " + snakeCharmer.type);
}

function fastToSlow(snake) {
	var body = snake.body;

	snake.tail = body.pop();
	snake.head = cell(body[0].x, body[0].y);
	
	snakeCharmer = SLOW;
	print("Charmer type: " + snakeCharmer.type);
}


function initTextBar() {
	var bar = $('<div></div>');
	bar.css({
		width: units(WIDTH),
		height: units(TEXT_SIZE),
		position: "relative",
		"font-color": TEXT_COLOUR,
	});
	$textBar = bar;
	$snake.append(bar);
}



function initCharmers() {
	FAST.type = "fast";
	FAST.grow = fastGrow;
	FAST.slide = fastSlide;
	FAST.getHead = function(snake) {
		return snake.body[0];
	};
	FAST.getRate = function() {
		return 1000/speed;
	};
	FAST.getLength = function(snake) {
		return snake.body.length;
	};
	FAST.init = function(snake) {
		snake.head.remove();
		snake.tail.remove();
	};
	FAST.switcheroo = fastToSlow;
	
	SLOW.type = "slow";
	SLOW.grow = slowGrow;
	SLOW.slide = slowSlide;
	SLOW.getHead = function(snake) {
		return snake.head;
	};
	SLOW.getRate = function() {
		return 1/speed;
	};
	SLOW.getLength = function(snake) {
		return snake.body.length + 1;
	};
	
	SLOW.init = function(snake) {
		snake.body.pop().remove();
	};
	SLOW.switcheroo = slowToFast;
	
	
	snakeCharmer = speed < CUTOFF ? SLOW : FAST;
	
}



///* Chooses a random size from 1-9 and a random location on the screen */
///* Here's what happens on newFood:
// * 	1.	A random period of max WAIT seconds long happens.
// * 	2.	The number appears somewhere.
// * 	3.	After STABLE seconds, it becomes unstable.
// * 	4.	After random period of max UNSTABLE seconds, it starts counting down.
// * 		4.5 (Version 2: counts internally from 10, and only when it equals the food's value does it
// * 				it start making a difference to the food value).
// * 	5.	When the internal count equals the current food size, the food is displayed to start counting
// */
//function newFood() {
//	var food = $food,
//		wait = Math.floor(Math.random() * food.WAIT),
//		unstable = Math.floor(Math.random() * food.UNSTABLE);
//	food.counter = wait + food.STABLE + unstable + food.START;
//	food.value = Math.ceil(Math.random()*10);
//	
//	food.locate();
//	clearInterval(food.interval);
//	print("Cleared interval, now: " + food.interval);
//	food.interval = setInterval(food.tick, 1000); 
//	
//}


/* Chooses a random size from 1-9 and a random location on the screen */
function newFood() {
	var food = $food;
	food.size = Math.ceil(Math.random()*9);
	food.text($food.size);
	
	do {
		
		var x = Math.ceil(Math.random() * (WIDTH-2));
		var y = Math.floor(Math.random()* (HEIGHT - 3 - TEXT_SIZE))
					+ TEXT_SIZE + 1;
//		print("New food?: " + x + " " + y);
//		print("Snake body size: " + snake.body.length);
	
// NOTE: inefficient: checks same x value both times through.
	} while (bodyCollision(snake, x, y+1) || bodyCollision(snake, x, y)); 

	food.place(x, y);
}




/* Creates the food element */
function initFood() {
	$food = $("<div></div>");
	$food.css({
		height: units(TEXT_SIZE),
		width: units(TEXT_SIZE/2),
		color: TEXT_COLOUR,
		"font-size": units(TEXT_SIZE),
		position: "absolute"
	});

	newFood();
	
	$snake.append($food);
	
}
	
///* Creates the food element */
//function initFood() {
//	$food = $("<div></div>");
//	$food.css({
//		height: units(TEXT_SIZE),
//		width: units(TEXT_SIZE/2),
//		color: TEXT_COLOUR,
//		"font-size": units(TEXT_SIZE),
//		position: "absolute"
//	});
//
//	$food.WAIT = 5;
//	$food.UNSTABLE = 10;
//	$food.STABLE = 5;
//	$food.START = 0;
//	$food.counter = 0;
//	$food.value = 0;
//	
//	$food.tick = function() {
//		var food = $food;
//		if (food.value == 0) {
//			food.text("");
//			newFood();
//		} else if (--food.counter == food.value) {
//			food.text(--food.value);
//		}
//		
//		print(food.counter);
//	};
//
//	$food.locate = function() {
//
//		do {
//			var x = Math.ceil(Math.random() * (WIDTH-2)),
//			y = Math.floor(Math.random()* (HEIGHT - 3 - TEXT_SIZE))
//			+ TEXT_SIZE + 1;
////			print("New food?: " + x + " " + y);
////			print("Snake body size: " + snake.body.length);
//			// NOTE: inefficient: checks same x value both times through.
//		} while (bodyCollision(snake, x, y+1) || bodyCollision(snake, x, y)); 
//
//		$food.place(x, y);
//	};
//	newFood();
//	
//	$snake.append($food);
//	
//}




/* Return true if the given x y location in cell coordinates 
 * matches a position of the given snake's body */
function bodyCollision(snake, x, y) {
	for (var i in snake.body) {
		var cell = snake.body[i];
		if (cell.x == x && cell.y == y) {
//			print("body collision at: " + x + " " + y );
			return true;
		}
	}
	return false;
}




/* Handles the pressing of the direction keys */
function assignKeys() {
//	$(document).keydown(function(key) {
	$snake.keydown(function(key) {
		key.preventDefault();
		
		switch(parseInt(key.which, 10)) {
//		case 65:  //A 
//			setDirection(snake, "left");
//			break;
//		case 87: //W
//			setDirection(snake, "up");
//			break;
//		case 68:  //D 
//			setDirection(snake, "right");
//			break;
//		case 83:  //S  
//			setDirection(snake, "down");
//			break;
//		
		case 37:   //left arrow
			key.preventDefault();
			setDirection(snake, "left");
			break;
		case 38: // up arrow
			setDirection(snake, "up");
			break;
		case 39: // right arrow
			setDirection(snake, "right");
			break;
		case 40: //down arrow
			setDirection(snake, "down");
			break;
			
		case 187: //=+
			adjustSpeed(10);
			break;
		case 189: ///-_
			adjustSpeed(-10);
			break;
		case 83: //S
			inputSpeed();
			break;
		case 84: //t  // toggles snake type; sometimes it causes an internal collision so it resets. Best to do it on pause.
			snakeCharmer.convert(snake);
			break;

		case 27:  //Esc		(reset)
			gameover = true;
			break;
		case 32: // space  //80:  //P
			togglePause();
			break;
		default:
			break;
		}
	});
}



/* Pauses game. Unpauses on P */
function togglePause() {
	paused = !paused;
	print("paused: " + paused);
}

/* Returns the opposite direction */
function opposite(dir) {
	switch (dir) {
	case "up":
		return "down";
	case "down":
		return "up";
	case "left":
		return "right";
	case "right":
		return "left";
	}
}

/* Remembers the most recently-pushed direction */
function setDirection(snake, dir) {
	snake.nextDir = dir;
}

/* assigns the current direction to the most recently-input direction
 * (nextDir) only if it isn't in the opposit direction.
 */
function changeDirection(snake) {
	var next = snake.nextDir;
	if (snake.dir !== opposite(next)) {
		snake.dir = next;
	}
}


/* Sets up the game */
function initGame() {
	drawWalls();
	snake = new Snake(WIDTH/2, HEIGHT/2);
//	snake = new Snake(1, 4);
	initFood();
	
	initScores();
	initOtherText();
}


/* Append to the text bar a name, followed by a space of width. Returns
 * the div where the value can be displayed */
function setupText(name, width) {
	var div = makeScore();
	div.text(name);
	div.css("margin-left", units(3));    // trial and error
	$textBar.append(div);
	
	value = makeScore();
	value.css({
		"text-align": "right",
		width: units(width),
	});
	$textBar.append(value);
	
	return value;
}


function initOtherText() {
	
	// SPEED
	$speed = setupText("SPEED", 4);
	$length = setupText("LENGTH", 5);
	$longest = setupText("LONGEST", 5);
}

function makeScore() {
	var div = $("<div class='score'></div>");
	div.css({
		display: "inline-block",
		"text-align": "right",
		"font-size": units(TEXT_SIZE),
	});
	return div;
}

/* Places the score and hiscore divs and resets snake score to zero. */
function initScores() {
	var $scoreText = makeScore();
	$scoreText.text("SCORE");
	snake.score = 0;
	
	$score = makeScore();
	$score.css("width", units(9));
	
	var $hiscoreText = makeScore();
	$hiscoreText.text("HISCORE");
	$hiscoreText.css("float", "right");
	
	
	$hiscore = makeScore();
	$hiscore.css({
		width: units(9),
		float: "right",
	});
	$textBar.append($scoreText, $score, $hiscore, $hiscoreText);
}

//function loadValues(name)

/* Gets the hiscore stored on local storage if available */
function loadValues() {
	var temp;
	temp = parseInt(storage.hiscore);
	hiscore = Number.isNaN(temp) ? 0 : temp;;
	
	temp = parseInt(storage.longest);
	longest = Number.isNaN(temp) ? 2 : temp;
	
	temp = parseInt(storage.speed);
	speed = Number.isNaN(temp) ? DEFAULT_SPEED : temp; 
}


function updateScores() {
	hiscore = Math.max(snake.score, hiscore);	
	
	$score.text(snake.score);
	$hiscore.text(hiscore);
}

function drawWalls() {
	drawWall(0, TEXT_SIZE, WIDTH, "horizontal");
	drawWall(0, TEXT_SIZE, HEIGHT - TEXT_SIZE, "vertical");
	drawWall(0, HEIGHT - 1, WIDTH, "horizontal");
	drawWall(WIDTH-1, TEXT_SIZE, HEIGHT - TEXT_SIZE, "vertical");
}


/* Adds a 1-cell-wide wall to the screen starting at x y, 
 * and of length len cells, and either dir "horizontal" or "vertical" */
function drawWall(x, y, len, dir) {
	var $wall = $("<div></div>");
	if (dir == "horizontal") {
		$wall.width(units(len));
		$wall.height(units(1));
	} else if (dir == "vertical") {
		$wall.width(units(1));
		$wall.height(units(len));
	} else {
		console.log("UNACCEPTABLE DIRECTION FOR WALL: " + dir);
	}
	$wall.css({
		"background-color": TEXT_COLOUR,
		position: "absolute",
		left: units(x),
		top: units(y),
	});
	$snake.append($wall);
	
	return $wall;
}





/* Returns a string of "Xun" where x is the given number and un is the unit (eg "em") */
function units(num) {
	return num*CELL_SIZE + UNIT_NAME;
}

/* Sets up the game screen and its border */
function makeScreen() {
	$snake.width(units(WIDTH));	// since in 1/2em units
	$snake.height(units(HEIGHT)); // since in 1/2em units
	$snake.css(
			{position: "relative",
			 "background-color": BACK_COLOUR,
			 "font-family": FONT,
			 color: TEXT_COLOUR,
			 "word-wrap": "break-word",
			 border: units(BORDER) + " solid " + BORDER_COLOUR,
			 "border-radius": units(BORDER),
			 "outline-style": "none",
		    });
	$snake.attr("tabindex", 0);
}


/*Returns a newly-created text-colored cell-sized rectangle added to the snake screen screen 
 * If given an x and y value, sets its initial position in cell units, to the nearest int */
function cell(x, y) {
	var cell = $("<div></div>");
	cell.css({
		height: units(CELL),
		width: units(CELL),
		"background-color": TEXT_COLOUR,
		position: "absolute",
	});
	cell.place(x, y);
	$snake.append(cell);
	return cell;
}

/*positions a cell at the given x and y cell coordinates, rounding to nearest integer */
function place(cell, x, y) {
	cell.x = Math.round(x*CELL);
	cell.y = Math.round(y*CELL);
	cell.css({
		left: units(cell.x),
		top: units(cell.y),
	});
	return cell;
}


/*positions a cell at the given x and y px coordinates, rounding to nearest integer */
function placepx(cell, x, y) {
	cell.x = x;
	cell.y = y;
	cell.css({
		left: x,
		top: y,
	});
	return cell;
}


/* Allows any object to reposition itself by the given cell coordinates */
function pl(x, y) {
	place(this, x, y);
}
$.prototype.place = pl;

/* Animate a cell's movement from its location by the given dx dy cell units in time dur. When
 * complete, do callback.*/
function move(cell, dx, dy, dur, callback) {
	cell.x += dx;
	cell.y += dy;
	
	animating++;
	cell.animate({
		left: units(cell.x),
		top: units(cell.y),
	}, {
		duration: dur,
		easing: "linear",
		complete: function() {
			if (typeof callback == "function") {
				callback();
			}
			doneAnimation();
		}
	});
	return cell;
}



// Probably won't need these after all.
///* These animate in the x direction and the y direction at the current speed */ 
//function moveX(dx) {
//	return move(this, dx, 0, timeFor(dx));
//}
//function moveY(dy) {
//	return move(this, 0, dy, timeFor(dy));
//}
//$.prototype.moveX = moveX;
//$.prototype.moveY = moveY;

/*Returns the time it should take to travel ds at the current speed (in ms)*/
function timeFor(ds) {
	return 1000 * ds/speed;
}

/* In cell units, slides cells at SPEED, and follows up with a callback on completion.
 * For appropriate speed, only move in one direction at a time*/
function slideCell(cell, dx, dy, callback) {
	move(cell, dx, dy, timeFor(1), callback);
}

/* Animates a cell movement to the given cell coordinates at SPEED 
 * assuming it moved only one cell.*/
function slideTo(cell, x, y, callback) {
	cell.x = x;
	cell.y = y;
	animating++;
	cell.animate(
			{
				left: units(cell.x),
				top: units(cell.y)
			},
			{
				duration: timeFor(1),
				easing: "linear",
				complete: function() {
					if (typeof callback == "function") {
						callback();
					}
					doneAnimation();
				}
			});
}


/* Decrease animation counter by 1 */
function doneAnimation() {
	animating--;
}

/* Moves snake forward one cell in its current direction  WITH NO ANIMATION*/
function fastSlide(snake) {
	var body = snake.body,
		next = nextHead(snake),
		butt = body.pop();
	
	butt.place(next.x, next.y);
	body.unshift(butt);
}

function slowSlide(snake) {
	var next = nextHead(snake),
		head = snakeCharmer.getHead(snake),
		body = snake.body,

		butt = body[body.length-1],
		x = butt.x,
		y = butt.y;

	slideTo(snake.tail, x, y);
	slideTo(head, next.x, next.y, function() {
			eatButt(snake);
		});
}

/* Moves given snake's butt last body cell to the current position of the head, both
 * on the screen, and in the body array */
function eatButt(snake) {
	var head = snakeCharmer.getHead(snake),
		body = snake.body,
		butt = body.pop();
	
	butt.place(head.x, head.y);
	body.unshift(butt);
}

/* moves a snake's head and lenghtens body, but leaves its tail in place */
function slowGrow(snake) {
	var head = snakeCharmer.getHead(snake);
		next = nextHead(snake);
	
	slideTo(head, next.x, next.y, function() {
		var neck = cell(head.x, head.y);
		snake.body.unshift(neck);
	});
	increaseLength(snake);
}

/* Increases snake length property by 1 and updates it and score */
function increaseLength(snake) {
	snake.length++;
	updateLengths();
	increaseScore(snake, 1);
}

/* moves a snake's head and lenghtens body, but leaves its tail in place */
function fastGrow(snake) {
	var next = nextHead(snake),
		head = cell(next.x, next.y);
	snake.body.unshift(head);
	
	increaseLength(snake);
}

/* Returns an object with x any coordinates of head position for given snake */
function nextHead(snake) {
	var dirs = DIRS[snake.dir],
		dx = dirs[0],
		dy = dirs[1],
	
		head = snakeCharmer.getHead(snake);
	
	return {
		x: head.x + dx,
		y: head.y + dy
	};
}


/* Increases the displayed score depending on the given n */
function increaseScore(snake, n) {
	snake.score += n * speed;
	updateScores();
}


/* If the snake's head is on some food, add it to grow and get a new number
 * and location */
function eat(snake) {
	var head = snakeCharmer.getHead(snake),
		x = head.x,
		y = head.y;
	if (x == $food.x && 
			(y == $food.y || y == $food.y + 1)) {
		snake.growing += $food.size;
		newFood();
	}
}


/* Return true if snake has collided with wall or itself */
function checkCollisions() {
	gameover = selfCollision(snake) || wallCollision(snake);
}

/* Return true if the snake's head has collided with the rest of its body */
function selfCollision(snake) {
	var body = snake.body,
		head = snakeCharmer.getHead(snake),
		x = head.x,
		y = head.y;
	
	for (var i = 1, len = body.length; i < len; i++) {
		var bod = body[i];
		if (bod.x == x && bod.y == y) {
			print("Self collision at: " + x + " " + y);
			return true;
		}
	}
	return false;
}

/* Return true if snake's head has collided with a wall */
function wallCollision(snake) {
	var head = snakeCharmer.getHead(snake),
		x = head.x,
		y = head.y;
	return x == 0 || x == WIDTH-1 || y == TEXT_SIZE || y == HEIGHT-1;
}

/* Sets the speed to n, changing the type of SnakeCharmer at 60 */
function setSpeed(newSpeed) {
	var oldSpeed = speed;
	var c = CUTOFF;
	
	if (!(oldSpeed < c && newSpeed < c ) && !(oldSpeed >= c && newSpeed >= c)) {
		snakeCharmer.convert(snake);
	}
	newSpeed = Math.max(newSpeed, 1);
	newSpeed = Math.min(newSpeed, 999);
		
	speed = newSpeed;	
	updateSpeed();
}

/* Chandge speed by n */
function adjustSpeed(n) {
	var oldSpeed = speed,
		newSpeed = oldSpeed + n;
	setSpeed(newSpeed);
}

function inputSpeed() {
	var input = parseInt(prompt("Enter Speed", speed)),
		newSpeed = Number.isNaN(input) ? speed : input;
	
	setSpeed(newSpeed);
}

function reset() {
	$snake.off('keydown');
	init$snake();
}


/* Stores values in local storage */
function saveValues() {
	storage.hiscore = hiscore;
	storage.longest = longest;
	storage.speed = speed;
}

/* Start the Snake game */
function playGame() {
	if (gameover) {
		saveValues();
		reset();
	} else {
		var charmer = snakeCharmer;
		if (!paused) {
			eat(snake);	
			if (!animating) {
				checkCollisions();
				changeDirection(snake);

				if (snake.growing) {
					charmer.grow(snake);
					snake.growing--;
				} else {
					charmer.slide(snake);
				}
			}
		}
		setTimeout(playGame, charmer.getRate());
	}
}


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



//
//
//function Heading(name) {
//	this.heading = document.createElement('div');
//	
//	this.name = document.createElement('div');
//	this.name.innerHTML = name;
//	this.heading.appendChild(this.name);
//	
//	this.value = document.createElement('div');
//	this.heading.appendChild(this.value);
//}

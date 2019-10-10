// /* This is a simple snake game in JavaScript/jQuery
//  * It requires a div with id "snake2" and it will do the rest.
//  * The main gameplay difference from "snake" involves the numbers counting.
// */ 


// Constants:
//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************

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
var TEXT_SIZE = 2*CELL;

var DEFAULT_SPEED = 20;
var CUTOFF = 40;  // the speed dividing slow and fast snakes

var EMPTY_MAX = 5; // the maximum amount of time for waiting for a food to show
var STILL_MAX = 15; // the maximum amount of time that a food doesn't change value

var DIRS = {
		LEFT: {x: -1, y: 0},
		RIGHT: {x: 1, y: 0},
		UP: {x: 0, y: -1},
		DOWN: {x: 0, y: 1},
};

//VARIABLES ********************
//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************


/* our hero */
var snake;

/* The current speed in frames per second */
var speed = 20;

/* our hero's food. It's a number! If he eats it, he grows by that amount! */
var food;

/* A frames timer for use with food */
var timer = 0;
var emptiness = 0;  // The amount of time that no number will be showing

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

/* Game halts on true */
var paused = true;

/* The current speed */
var speed = DEFAULT_SPEED;   // cells/sec
var $speed;


// Types: ********************************
//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************

/* A Snake initially of length 1 at position x y in cell coordinates, moving in given direction 
	The head of a snake is a cell. Its body consists of a list of other cells*/
function Snake(x, y, dir) {
	this.head = new Cell(x, y);
	this.body = [];  // array of Cell
	this.dir = dir;
	this.nextdir = dir;
	this.belly = 0; // the amount of food currently eaten
	this.score = 0;

	// Return length of this snake
	this.len = function() {
		return 1 + this.body.length;
	};

	// Increase snake length by 1 by stretching head in set dir
	this.grow = function() {
		this.body.push(this.head);
		this.head = cell(this.head.getX(), this.head.getY());
	};

	// Removes all the divs of this snake from the game
	this.del = function() {
		this.head.div.remove();
		this.body.forEach(function(cell) {
			cell.div.remove();
		});
	}
}

/* A snake's body cell, consisting of a div and a set of coordinates */
function Cell(x, y) {
	this.div = $("<div></div>");
	this.div.css({
		height: units(CELL),
		width: units(CELL),
		"background-color": TEXT_COLOUR,
		position: "absolute",
	});
	this.x = x;
	this.y = y;
	placeDiv(this.div, x, y);
	$snake.append(this.div);
}

/* A food item, with a current value and timer settings
	The lifecycle of a food is as follows:
		0. Is invisible
		1. Has initial count of value + (0 to 15)
		2. Has visibility point of value + (0 to initial count)
		3. Becomes visible when count reaches visibility 
		4. Starts descending when count reaches value
		5. Disappears when count reaches 0 and a new food is spawned */
function Food(x, y) {
	this.x = x;
	this.y = y;
	this.value = Math.ceil(Math.random()*9);
	this.count = this.value + Math.floor(Math.random()*STILL_MAX);


	this.div = $("<div></div>");
	this.div.css({
		height: units(CELL*2),
		width: units(CELL),
		position: "absolute",
	});
	placeDiv(this.div, x, y);
	this.div.text(this.value);

	$snake.append(this.div);

	// reduces the food to its next value if applicable, making it visible if applicable
	this.tick = function() {
			if (this.count < this.value) {
				this.value--;
				this.div.text(this.value);
			} 
			this.count--;
		}
	
	
}

//**********************************************************************************************************


// Let's Begin:
$(document).ready(init$snake);


// // functions: ***************************
// *********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************

function init$snake() {
	$snake = $('#snake2');
	initValues();
	makeScreen();
	makeSnake();
	makeScores();
	assignKeys(); 
	playGame();
}


//**********************************************************************************************************
//**********************************************************************************************************

function initValues() {
	storage = getLocalStorage();
	loadValues();
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

/* Gets the hiscore stored on local storage if available */
function loadValues() {
	hiscore = parseInt(storage.hiscore2) || 0;
	longest = parseInt(storage.longest2) || 1;
	speed = parseInt(storage.speed2) || DEFAULT_SPEED;
}

/* Stores values in local storage */
function saveValues() {
	storage.hiscore2 = hiscore;
	storage.longest2 = longest;
	storage.speed2 = speed;
}


//**********************************************************************************************************
//**********************************************************************************************************

function makeScreen() {
	$snake.width(units(WIDTH));
	$snake.height(units(HEIGHT));
	$snake.css(
		{
			position: "relative",
			"background-color": BACK_COLOUR,
			"font-family": FONT,
			color: TEXT_COLOUR,
			"word-wrap": "break-word",
			border: units(BORDER) + " solid " + BORDER_COLOUR,
			"border-radius": units(BORDER),
			"outline-style": "none",
		});
 	$snake.attr("tabindex", 0);

 	drawWalls();

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


//**********************************************************************************************************
//**********************************************************************************************************

/* Initializes the given snake */
function makeSnake() {
	snake = new Snake(WIDTH/2, HEIGHT/2, DIRS.LEFT);
}


//**********************************************************************************************************
//**********************************************************************************************************

/* Creates a new food item that doesn't overlap with the snake */
function spawnFood() {
	var x = Math.floor(Math.random()*(WIDTH-3))+1;
	var y =	Math.floor(Math.random()*(HEIGHT-5))+3;
	var f = {x: x, y: y};
	var clear = snake.body.every(
			function(cell) {
				return !isTouchingFood(cell, f);
			}) && !isTouchingFood(snake.head, f);
	if (clear) {
		food = new Food(x, y);
	} else {
		spawnFood();
	}
}


//**********************************************************************************************************
//**********************************************************************************************************

/* Handles the pressing of the direction keys */
function assignKeys() {
	$snake.keydown(function(key) {
		key.preventDefault();
		
		switch(key.which) {

		case 37:   //left arrow
			snake.nextdir = DIRS.LEFT;
			break;
		case 38: // up arrow
			snake.nextdir = DIRS.UP;
			break;
		case 39: // right arrow
			snake.nextdir = DIRS.RIGHT;
			break;
		case 40: //down arrow
			snake.nextdir = DIRS.DOWN;
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
		case 32: // space  //80:  //P
			togglePause();
			break;
		default:
			break;
		}
	});
}

/* Sets the speed to n, changing the type of SnakeCharmer at 60 */
function setSpeed(newSpeed) {
	newSpeed = Math.max(newSpeed, 1);
	newSpeed = Math.min(newSpeed, 999);
		
	speed = newSpeed;	
}

/* Chandge speed by n */
function adjustSpeed(n) {
	setSpeed(speed+n);
}

function inputSpeed() {
	var input = parseInt(prompt("Enter Speed", speed)),
		newSpeed = Number.isNaN(input) ? speed : input;
	
	setSpeed(newSpeed);
}

function togglePause() {
	if (!paused) {
		saveValues();
	}
	paused = !paused;
}


//**********************************************************************************************************
//**********************************************************************************************************

function makeScores() {
	var bar = $('<div></div>');
	bar.css({
		width: units(WIDTH),
		height: units(TEXT_SIZE),
		position: "relative",
		"font-color": TEXT_COLOUR,
	});
	$textBar = bar;
	$snake.append(bar);

	initScores();
	initOtherText();

	updateScores();	
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

function initOtherText() {
	// SPEED
	$speed = setupText("SPEED", 4);
	$length = setupText("LENGTH", 5);
	$longest = setupText("LONGEST", 5);
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

function makeScore() {
	var div = $("<div class='score'></div>");
	div.css({
		display: "inline-block",
		"text-align": "right",
		"font-size": units(TEXT_SIZE),
	});
	return div;
}

function updateScores() {
	hiscore = Math.max(snake.score, hiscore);	
	
	$score.text(snake.score);
	$hiscore.text(hiscore);
	$length.text(snake.len());
	$speed.text(speed);
	$longest.text(longest);
}

//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************


/* Handles the game play */
function playGame() {
	if (isGameover()) {
		gameOver();
	} else {
		if (!paused) {
			tickSnake();
			tickFood();
			tickTimer();
			updateScores();
		}
		setTimeout(playGame, 1000/speed);
	}
}

//**********************************************************************************************************
//**********************************************************************************************************

/* returns true when game is over (collision, for instance) */
function isGameover() {
	var x = snake.head.x,
		y = snake.head.y;
	var bodyCollision = !snake.body.every(
			function(cell) {
				return !(cell.x === x && cell.y === y);
			});
	var wallCollision = x === 0    || 
						x === (WIDTH-1) || 
						y ===  2   || 
						y === (HEIGHT-1);
	return bodyCollision || wallCollision;
}

/* Handles end of game */
function gameOver() {
	saveValues();
	message = $('<div>GAME OVER</div>');
	message.css("position", "absolute");
	$snake.append(message);
	placeDiv(message, (WIDTH/2) - 4, HEIGHT/2);

	$snake.off("keydown");
	$snake.keydown(function(key) {
			key.preventDefault();
			if (key.which == 32) { //spacebar
				message.remove();
				paused = false;
				reset();
			}
		});	
}

/* Replaces snake with new one and zeros score */
function reset() {
	$snake.off("keydown");
	deleteSnake();
	
	makeSnake();
	updateScores();
	assignKeys();
	playGame();
}

function deleteSnake() {
	snake.del();
}

//**********************************************************************************************************
//**********************************************************************************************************

/* Steps the snake one frame */
function tickSnake() {
	setDirection(snake, snake.nextdir);
	if (isEating(snake, food)) {
		eat(snake, food);
	} else {
		move(snake);
	}
	// snake.score++;
}

function setDirection(snake, dir) {
	if (isRelevant(snake.dir, dir)) {
		snake.dir = dir;
	}
}

function isRelevant(dir1, dir2) {
	return ((dir1.x && !dir2.x) || (dir2.x && !dir1.x));
}


/* return true if the given snake's head overlapping the given food */
function isEating(snake, food) {
	return food !== undefined && isTouchingFood(snake.head, food);
}

// return true if cell is touching this food
function isTouchingFood(cell, food) {
	return (cell.x === food.x) &&
		   (cell.y === food.y || cell.y === food.y + 1);
	}


/* grows snake by given amount while removing food, and creates new food to elsewhere on screen */
function eat(snake, food) {
	snake.belly = food.value;
	resetFood();
}

/* makes snake body one cell longer (The front is at the end of the array) */
function grow(snake) {
	var cell = new Cell(snake.head.x, snake.head.y);
	snake.body.push(cell);
	snake.belly--;
	snake.score+=speed;

	longest = Math.max(longest, snake.len());
}

/* moves snake forward one cell in its direction */
function move(snake) {
	var h = snake.head,
		d = snake.dir;

	if (snake.belly) {
		grow(snake);
	} else if (snake.body.length) {
		var back = snake.body.shift();
		snake.body.push(back);
		placeCell(back, h.x, h.y);
	}
	placeCell(snake.head, h.x+d.x, h.y+d.y);

}

//**********************************************************************************************************
//**********************************************************************************************************

/* Moves one step in the food's  lifecycle */
function tickFood() {
	if (timer == 0) {
		if (emptiness) {
			emptiness--;
		} else if (food == undefined) {
			spawnFood();
		} else if (food.value === 0) {
			resetFood();
		} else {
			food.tick();
		}
	}
}

/* Prepares food for next count */
function resetFood() {
	food.div.remove();
	food = undefined;
	emptiness = Math.floor(Math.random() * EMPTY_MAX);
}


//**********************************************************************************************************
//**********************************************************************************************************

/* Move food timer to next number */
function tickTimer() {
	timer = (timer >= speed) ? 0 : timer + 1;
}




//*************UTILIITES
//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************


/*positions a div at the given x and y cell coordinates, rounding to nearest integer */
function placeDiv(div, x, y) {
	// div.x = Math.round(x*CELL);
	// div.y = Math.round(y*CELL);
	div.css({
		left: units(x),
		top: units(y),
	});
	return div;
}

/* positions an object with div, x, and y properties at the given cell coordinates */
function placeCell(cell, x, y) {
	cell.x = x;
	cell.y = y;
	placeDiv(cell.div, x, y);
}


/* Returns a string of "Xun" where x is the given number and un is the unit (eg "em") */
function units(num) {
	return num*CELL_SIZE + UNIT_NAME;
}


function eraseScores() {
	delete storage.hiscore;
	delete storage.longest;
	delete storage.speed;
}
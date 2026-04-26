					
								// SNAKE GAME LOGIC //

// INITIAL SETUP //
// Setting up the reference to the html canvas element and its 2d rendering context;


var canvas = document.getElementById("gameWindow");
var ctx = canvas.getContext("2d");
var bodysize_full = 10;
var bodysize_empty = 4;
var poosize = 3; // increased for visibility
// logical game dimensions (grid based on 10px units)
var logicalWidth = 300;
var logicalHeight = 350;
var width = logicalWidth;
var height = logicalHeight;
var top_boarder = 50;

// track current device pixel ratio scaling so we can redraw correctly
var DPR = window.devicePixelRatio || 1;
var intervalId = null;



var new_segment = null 
var head = {x:50, y: 250};
var body = [{x:40, y:250}];
var poos = [];
var food_position = {x:rand_x(width), y:rand_y(height, top_boarder)};
//var food_position = {x:250, y:250};
var food_state = "uneaten";
var dx = 10;
var dy = 10;
var score = 0;
var level = 1;
var game_paused = false;
var direction = "e";
var speed = 250;
var score_add = false;
var dead = "not";
var food_drawing = "mouse"
var again = false;
var eatPulse = 0; // frames remaining for head/body pulse when eating
var pendingDirection = null; // store one input between ticks to avoid 180° reversals



// FUNCTIONS //

function round10(n){
	return (Math.round((n/10)))*10;
}

function draw_boarder(ctx,width, header_size = 50,thickness = 2, color = "Silver"){
	var center_line = Math.floor((width/2));
	ctx.lineWidth = thickness;
	ctx.strokeStyle=color;
	ctx.beginPath();
	ctx.moveTo(0,header_size);
	ctx.lineTo(width,header_size);
	ctx.moveTo(center_line, 0);
	ctx.lineTo(center_line,header_size);
	ctx.stroke();
	ctx.closePath();
}

function draw_circle(context,x,y,radius = 4, outline = "green",fill = "green"){
	context.beginPath();
	context.arc(x, y, radius, 0, 2*Math.PI);
	context.fillStyle = fill;
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = outline;
	context.stroke();
	context.closePath();
}


function draw_head(context,x,y,direction,radius = 6, outline = "green" ,fill = "green", eyes = "black"){
	// apply eat pulse scaling
	var scale = 1 + (eatPulse > 0 ? 0.18 * (eatPulse/6) : 0);
	context.save();
	context.translate(x, y);
	context.scale(scale, scale);
	context.beginPath();
	context.arc(0, 0, radius, 0, 2*Math.PI);
	context.fillStyle = fill;
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = outline;
	context.stroke();
	context.closePath();
	if (direction == "n" || direction == "s"){
		//right eye
		context.beginPath()
		context.arc(3,0,2,0,2*Math.PI);
		context.fillStyle = eyes;
		context.fill();
		context.closePath();
		//left eye
		context.beginPath();
		context.arc(-3,0,2,0,2*Math.PI);
		context.fill();
		context.closePath();
	} else {
		//upper eye
		context.beginPath()
		context.arc(0,-3,2,0,2*Math.PI);
		context.fillStyle = eyes;
		context.fill();
		context.closePath();
		//lower eye
		context.beginPath();
		context.arc(0,3,2,0,2*Math.PI);
		context.fill();
		context.closePath();
	}
	context.restore();
}

function draw_fullhead(context,x,y,direction="n",radius = 8, outline = "green",fill = "green", eyes= "black"){
	context.beginPath();
	context.arc(x, y, radius, 0, 2*Math.PI);
	context.fillStyle = fill;
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = outline;
	context.stroke();
	context.closePath()
	if (direction == "n" || direction == "s"){
		//right eye
		context.beginPath()
		context.arc(x+5,y,2,0,2*Math.PI);
		context.fillStyle = eyes;
		context.fill();
		context.strokeStyle = "white";
		context.lineWidth = 1;
		context.stroke();
		context.closePath();
		//left eye
		context.beginPath()
		context.arc(x-5,y,2,0,2*Math.PI);
		context.fill();
		context.stroke()
		context.closePath();
	} else {
		//upper eye
		context.beginPath();
		context.arc(x,y-6,3,0,2*Math.PI);
		context.fillStyle = eyes;
		context.fill();
		context.strokeStyle = "white";
		context.lineWidth = 1;
		context.stroke();
		context.closePath();
		//lower eye
		context.beginPath();
		context.arc(x,y+6,3,0,2*Math.PI);
		context.fill();
		context.stroke();
		context.closePath();
	}
}

function mouse(context, x, y){
	context.beginPath();
	context.arc(x, y, 6, 0, 2*Math.PI);
	context.fillStyle = "Silver";
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = "Silver";
	context.stroke();
	context.closePath()
	//right eye
	context.beginPath()
	context.arc(x+3,y+1,1,0,2*Math.PI);
	context.fillStyle = "Black";
	context.fill();
	context.strokeStyle = "Black";
	context.lineWidth = 1;
	context.stroke();
	context.closePath();
	//left eye
	context.beginPath()
	context.arc(x-3,y+1,1,0,2*Math.PI);
	context.fill();
	context.stroke()
	context.closePath();
	//tail
	context.beginPath();
	context.strokeStyle = "Silver";
	context.arc(x-6,y-6,6,60,0.2);
	context.stroke();
	context.closePath()
}

function display_score(context, score, level, width){
	context.font = "20px Courier";
	context.fillStyle = "white";
	context.fillText("Level: "+level, 25 ,27);
	context.fillText("Poos: " +score, Math.floor(width/2)+25 ,27);
}

function display_error(context, error = "error"){
	context.font = "20px Courier";
	context.fillStyle = "white";
	context.fillText(error, 100 ,110);
}

function clear_score(){
	ctx.clearRect(0,0, Math.floor(width/2) - 1, 49);
	ctx.clearRect(Math.floor(width/2)+1,0, Math.floor(width/2) - 1, 49);
}

function clear_screen(){
	ctx.clearRect(0,top_boarder,width, height);
}

function draw_poo(context,poosize, x, y){
	// lighter, higher-contrast poo with clearer highlight
	// shadow
	context.beginPath();
	context.fillStyle = 'rgba(0,0,0,0.18)';
	context.ellipse(x, y+poosize+2, poosize+3, poosize/1.6, 0, 0, 2*Math.PI);
	context.fill();
	context.closePath();

	// main blobs (lighter brown)
	context.beginPath();
	context.fillStyle = '#8B5E2B';
	context.strokeStyle = '#6f4a1f';
	context.lineWidth = 1;
	context.arc(x-2, y+2,poosize , 0, 2*Math.PI);
	context.arc(x, y-2,poosize , 0, 2*Math.PI);
	context.arc(x+2, y+2,poosize , 0, 2*Math.PI);
	context.fill();
	context.stroke();
	context.closePath();

	// small bright highlight for readability
	context.beginPath();
	context.fillStyle = 'rgba(255,255,200,0.35)';
	context.arc(x-1, y-3, Math.max(1, poosize/1.4), 0, Math.PI*2);
	context.fill();
	context.closePath();
}


function draw_food(){
	if (food_drawing == "mouse"){
		mouse(ctx, food_position.x,food_position.y);
	} else if (food_drawing == "full_head"){
		draw_fullhead(ctx, food_position.x, food_position.y, direction);
	} else if (food_drawing == "full_body"){
		draw_circle(ctx, food_position.x, food_position.y, 6)
	}
}


function move_snake(head, body, direction, dx, dy, width, height, top_boarder){
	let new_segment = JSON.parse(JSON.stringify(head));
	body.push(new_segment);
	body.shift();
	if (direction == "w"){
		head.x = head.x - dx;
		if (head.x < 10){
			head.x = width-10 ;
		}
	} else if (direction == "e") {
		head.x = head.x + dx
		if (head.x > width-10){
			head.x = 10;
		}
	} else if (direction == "s") {
		head.y = head.y + dy
		if (head.y > height - 10){
			head.y = top_boarder+10;
		}
	} else if (direction == "n") {
		head.y = head.y - dy
		if (head.y < top_boarder+10){
			head.y = height - 10;
		}
	}
}


function draw_body(ctx, body, clr = "green"){
	for (var i = 0; i < body.length; i++){
		// if eatPulse active, slightly enlarge the head-adjacent body segment for a short time
		if (eatPulse > 0 && i == body.length - 1){
			// draw a slightly larger circle for the newly added segment
			draw_circle(ctx, body[i].x, body[i].y, radius = bodysize_empty + 2, outline = clr, fill = clr)
		} else {
			draw_circle(ctx, body[i].x, body[i].y, radius = bodysize_empty,outline = clr, fill = clr)
		}
	}
}

function rand_y(height, top_boarder){
	var max = height - 10;
	var min = top_boarder + 10;
	return (Math.round((Math.random()*(max - min) + min) /10 )) * 10;	
}

function rand_x(width){
	var min = 10;
	var max = width - 10;
	return (Math.round((Math.random()*(max - min) + min) /10 )) * 10;
}

var key_direction = {37:"w", 38:"n", 39:"e", 40:"s"};

function keydown_yesno(event){
	var key_yn = event.keyCode;
	if (key_yn == 32){
		again = true;
	}
}

function keydown(event){
	var legal = [37,38,39,40];
	var key = event.keyCode;
	if (legal.includes(key)){
		let new_direction = key_direction[key];
		// ignore if trying to reverse 180 degrees
		if ((direction == "n" && new_direction == "s") || (direction == "s" && new_direction == "n") ||
			(direction == "w" && new_direction == "e") || (direction == "e" && new_direction == "w")){
			return;
		}
		// only queue one pending direction per tick
		if (!pendingDirection){
			// disallow changing to a direction on the same axis (e.g. n->s) handled above
			pendingDirection = new_direction;
		}
	}

}



function is_position_same(coord_obj1, coord_obj2){
	if (coord_obj1.x == coord_obj2.x && coord_obj1.y == coord_obj2.y){
		return true;
	} else {
		return false; 
	}
}

function is_coord_in_list(item, list){
	var isin = false
	for (var i = 0; i < list.length; i++){
		if (is_position_same(item, list[i])){
			isin = true; break; 
		}
	}
	return isin;
}


function collision(){
	var headInBody = is_coord_in_list(head, body); 
	var foodInBody = is_coord_in_list(food_position, body);
	var headInPoos = is_coord_in_list(head, poos);
	var headInFood = is_position_same(food_position, head);
	score_add = false; dead = "not";
	if (headInBody) {
		dead = "body"; food_drawing = "mouse"; food_state = "uneaten";
	} else if (headInPoos && !(headInFood)){
		dead = "poo"; food_drawing = "mouse"; food_state = "uneaten";
	} else if (headInFood && food_state == "uneaten"){
		food_state = "digesting"; score_add = true;
		food_drawing = "full_head";
		// trigger a short pulse animation for head/body
		eatPulse = 6; // a few frames of pulse
	} else if (foodInBody == true && food_state == "digesting"){
		food_drawing = "full_body";
	} else if (food_state == "digesting" && foodInBody == false){
		let new_dump = JSON.parse(JSON.stringify(food_position));
		poos.push(new_dump);
		let new_body_segment = JSON.parse(JSON.stringify(food_position));
		body.unshift(new_body_segment)
		food_position = {x:rand_x(width), y:rand_y(height, top_boarder)};
		food_state = "uneaten";
		food_drawing = "mouse";
	} else {
		food_drawing = "mouse"; food_state = "uneaten";
	}
}



function level_up(){
	var lvl_a = "LVL UP LVL UP LVL UP LVL";
	var y_pos = top_boarder + 20;
	game_paused = true;
	var lvlupId = window.setInterval(function lvl_animate(){
		ctx.font = "20px Courier";
		if (level <= 3){
			lvl_a = "NOT BAD LEVEL UP NOT BAD";
			ctx.fillStyle = "green";
		} else if (level > 3 && level <= 6){
			lvl_a = "LVL WHAT DID YOU EAT LVL"
			ctx.fillStyle = "yellow";
		} else if (level > 6 && level <= 9){
			lvl_a = "!! YOU'R IN DEEP SHIT !!"
			ctx.fillStyle = "red";
		} else {
			lvl_a = "LVL ITS A SHIT FEST LVL"
			ctx.fillStyle = "white";
		}
		ctx.fillText(lvl_a, 5 ,y_pos);	
		ctx.clearRect(45,118,220, 52);
		ctx.font = "40px Courier";
		ctx.fillText("LEVEL " + level, 80, 160);
		y_pos = y_pos + 20;
		if (y_pos > height) {
			game_paused = false;
			window.clearInterval(lvlupId);
		}
	}, 70)
}


function draw_all_poos(){
	for (var i = 0; i < poos.length; i++){
		draw_poo(ctx,poosize,poos[i].x, poos[i].y)
	}
}

function death_screen(){
		game_paused=true;
	var death_id = window.setInterval(function print_death(){
		document.addEventListener("keydown", keydown_yesno, {once:true});
		clear_screen();
		ctx.font = "16px Courier";
		draw_head(ctx,head.x,head.y, direction, radius = 6, outline = "gray", fill = "gray");
		draw_body(ctx, body, clr = "gray");
		ctx.fillStyle = "lime";
		if (dead == "poo"){
			ctx.fillText("you took " + score + " dumps!", 10, 70);
			ctx.fillText("Snake ate a poo, then died", 10, 100);
			ctx.fillText("Play again?  [SPACE BAR]", 10, 130);
	
		} else if (dead == "body"){
				ctx.fillText("you made " + score + " poos!", 10, 70);
			ctx.fillText("Snake died from eating itself", 10, 100);
			ctx.fillText("Play again? [SPACE BAR]", 10, 130);
		}
		if (again == true){
			window.clearInterval(death_id)
			reset_game();		
		}
	},50)
}

function main(){
    
	intervalId = window.setTimeout( 
	function game() {
		
		if (!game_paused){
				// apply any queued direction change once per tick
				if (pendingDirection){
					direction = pendingDirection;
					pendingDirection = null;
				}
				move_snake(head, body, direction, dx, dy, width, height,header_size = top_boarder);
			collision();
			document.addEventListener("keydown", keydown, {once:true});
			clear_screen();
			clear_score();
			draw_boarder(ctx, width, top_boarder);
			display_score(ctx, score, level, width);
			draw_head(ctx,head.x,head.y, direction);
			draw_body(ctx, body, clr = "green");
			draw_all_poos();
			draw_food();
		}

		// decrement eat pulse if active
		if (eatPulse > 0) eatPulse = Math.max(0, eatPulse - 1);
		if (score_add){
			score = score + 1;
		}
		if (poos.length > (level * 2)) {  // possibly move this before drawing ..
			poos = [];
			level = level + 1;
			level_up();
			speed = speed * 0.8;
			main();
		} else if (dead == "not"){
			main();
		} else if (dead == "body") {
			death_screen();
		} else if (dead == "poo") {
			death_screen();
		}
	}, speed);
}
//////////////////////////////////////////////////////////////////////////////////////




// MAIN GAME //

function reset_game(){
	new_segment = null 
	head = {x:50, y: 250};
	body = [{x:40, y:250}];
	poos = [];
	food_position = {x:rand_x(width), y:rand_y(height, top_boarder)};
	//food_position = {x:250, y:250};
	food_state = "uneaten";
	dx = 10;
	dy = 10;
	score = 0;
	game_paused = false;
	level = 1;
	direction = "e";
	speed = 250;
	score_add = false;
	dead = "not";
	food_drawing = "mouse"
	again = false;
	main();
}


reset_game();
//main();



// ---------------- Responsive canvas and mobile controls ----------------

function fitCanvasToWindow(){
	// Make the canvas fill the available width (as defined by CSS) while preserving the game's logical aspect ratio.
	// We'll set the canvas CSS width already handled by style; set the internal pixel size for crisp rendering.
	DPR = window.devicePixelRatio || 1;
	// compute CSS width of canvas as laid out (fallback to logicalWidth)
	var cssWidth = canvas.clientWidth || logicalWidth;
	// compute corresponding CSS height using logical aspect ratio
	var aspect = logicalHeight / logicalWidth;
	var cssHeight = Math.round(cssWidth * aspect);

	// set canvas display size in CSS pixels
	canvas.style.width = cssWidth + 'px';
	canvas.style.height = cssHeight + 'px';

	// set actual canvas pixel size for high-DPI
	canvas.width = Math.round(cssWidth * DPR);
	canvas.height = Math.round(cssHeight * DPR);

	// compute scale factor that maps game logical units to canvas internal pixels
	// factor = (cssWidth / logicalWidth) * DPR = canvas.width / logicalWidth
	var scaleFactor = canvas.width / logicalWidth;
	// set transform so that all subsequent drawing uses logical game coordinates
	ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);

	// update game width/height to logical values (we keep original game coordinate system)
	width = logicalWidth;
	height = logicalHeight;

	// redraw once
	clear_screen();
	draw_boarder(ctx, width, top_boarder);
	display_score(ctx, score, level, width);
	draw_head(ctx,head.x,head.y, direction);
	draw_body(ctx, body, clr = "green");
	draw_all_poos();
	draw_food();
}

// touch/click visual feedback: draw a transient translucent circle at the tapped logical position
function showTouchFeedback(clientX, clientY){
	var rect = canvas.getBoundingClientRect();
	var x_css = clientX - rect.left;
	var y_css = clientY - rect.top;
	var cssW = rect.width;
	var cssH = rect.height;
	// map CSS coords to logical game coords
	var lx = (x_css / cssW) * logicalWidth;
	var ly = (y_css / cssH) * logicalHeight;

	// draw feedback circle
	// Save and restore state to avoid interfering with other drawing
	ctx.save();
	ctx.globalAlpha = 0.9;
	ctx.fillStyle = 'rgba(200,200,255,0.6)';
	// radius in logical units (choose ~18 logical px scaled)
	var r = 18;
	ctx.beginPath();
	ctx.arc(lx, ly, r, 0, 2*Math.PI);
	ctx.fill();
	ctx.restore();

	// clear the feedback after a short time by redrawing the full scene
	setTimeout(function(){
		clear_screen();
		draw_boarder(ctx, width, top_boarder);
		display_score(ctx, score, level, width);
		draw_head(ctx,head.x,head.y, direction);
		draw_body(ctx, body, clr = "green");
		draw_all_poos();
		draw_food();
	}, 180);
}

// Map a tap/click point (in client coordinates) to a direction change, following the rule:
// - If current movement is left/right (w/e) then tapping top half -> up (n), bottom half -> down (s)
// - If current movement is up/down (n/s) then tapping left half -> left (w), right half -> right (e)
// Also accept taps that are roughly near the edges to enable quick turns.
function handlePointerForDirection(clientX, clientY){
	var rect = canvas.getBoundingClientRect();
	var x = clientX - rect.left; // css pixels
	var y = clientY - rect.top; // css pixels
	var cssW = rect.width;
	var cssH = rect.height;

	// Decide new direction based on current direction
	var newDir = direction;
	if (direction == "w" || direction == "e"){
		// moving horizontally: tap top/bottom to go vertically
		if (y < cssH/2) newDir = "n";
		else newDir = "s";
	} else if (direction == "n" || direction == "s"){
		// moving vertically: tap left/right to go horizontally
		if (x < cssW/2) newDir = "w";
		else newDir = "e";
	}

	// Prevent 180 degree reversal
	if ((direction == "n" && newDir == "s") || (direction == "s" && newDir == "n") ||
		(direction == "w" && newDir == "e") || (direction == "e" && newDir == "w")){
		return; // ignore
	}
	if (!pendingDirection){
		pendingDirection = newDir;
	}
}

// Pointer event handlers
function onCanvasClick(e){
	// Support both mouse click and touchend events
	var clientX, clientY;
	if (e.changedTouches && e.changedTouches.length > 0){
		clientX = e.changedTouches[0].clientX;
		clientY = e.changedTouches[0].clientY;
	} else {
		clientX = e.clientX;
		clientY = e.clientY;
	}
	// show visual feedback at tap location
	showTouchFeedback(clientX, clientY);
	handlePointerForDirection(clientX, clientY);
}

// Add listeners
canvas.addEventListener('click', onCanvasClick);
canvas.addEventListener('touchend', function(e){ e.preventDefault(); onCanvasClick(e); }, {passive:false});

// Refit canvas on resize or orientation change
window.addEventListener('resize', function(){
	// small debounce
	clearTimeout(window._fitCanvasTimeout);
	window._fitCanvasTimeout = setTimeout(function(){
		fitCanvasToWindow();
	}, 120);
});

// initial fit
fitCanvasToWindow();

// Instructions toggle wiring
window.addEventListener('load', function(){
	var infoBtn = document.getElementById('infoBtn');
	var instr = document.getElementById('instructions');
	if (infoBtn && instr){
		infoBtn.addEventListener('click', function(){
			instr.classList.toggle('hidden');
		});
	}
});



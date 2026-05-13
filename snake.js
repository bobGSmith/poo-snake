					
								// SNAKE GAME LOGIC //

// INITIAL SETUP //
// Setting up the reference to the html canvas element and its 2d rendering context;


var canvas = document.getElementById("gameWindow");
var ctx = canvas.getContext("2d");
var retryButton = document.getElementById("retryBtn");
var shareButton = document.getElementById("shareBtn");
var scoreSubmitPanel = document.getElementById("scoreSubmitPanel");
var deathPlayerName = document.getElementById("deathPlayerName");
var submitScoreButton = document.getElementById("submitScoreBtn");
var deathSubmitStatus = document.getElementById("deathSubmitStatus");
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
var magicChance = 1 / 15;
var magicDuration = 5000;
var magicTypes = {
	yellow: {color: "#ffd83d", glow: "rgba(255, 216, 61, 0.45)", glowRgb: "255, 216, 61"},
	green: {color: "#40ff6a", glow: "rgba(64, 255, 106, 0.45)", glowRgb: "64, 255, 106"},
	white: {color: "#ffffff", glow: "rgba(255, 255, 255, 0.5)", glowRgb: "255, 255, 255"},
	blue: {color: "#35a7ff", glow: "rgba(53, 167, 255, 0.45)", glowRgb: "53, 167, 255"}
};
var magicTypeNames = Object.keys(magicTypes);
var godMode = false;
var poosMadeThisLevel = 0;
var deathIntervalId = null;
var highScoreStorageKey = "poosnakeHighScore";
var petFly = null;
var flySpeed = 275;
var lastFlyMove = 0;
var leaderboardSubmitted = false;
var currentDeathResult = null;
var deathRankText = "rank: loading...";
var magicPopup = null;



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
	if (magicPopup){
		display_magic_message(context, width);
		return;
	}
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

function get_high_score(){
	try {
		var savedScore = parseInt(window.localStorage.getItem(highScoreStorageKey), 10);
		return isNaN(savedScore) ? 0 : savedScore;
	} catch (e) {
		return 0;
	}
}

function save_high_score(newScore){
	try {
		window.localStorage.setItem(highScoreStorageKey, String(newScore));
	} catch (e) {}
}

function update_high_score(currentScore){
	var highScore = get_high_score();
	if (currentScore > highScore){
		save_high_score(currentScore);
		return currentScore;
	}
	return highScore;
}

function get_cause_of_death(){
	if (dead == "poo"){
		return "ate a poo";
	}
	if (dead == "body"){
		return "ate itself";
	}
	return "unknown";
}

function submit_leaderboard_score(finalScore, finalLevel, finalCause){
	if (leaderboardSubmitted || !window.pooSnakeLeaderboard || !window.pooSnakeLeaderboard.submitScore){
		return null;
	}
	leaderboardSubmitted = true;
	return window.pooSnakeLeaderboard.submitScore({
		score: finalScore,
		level: finalLevel,
		cause: finalCause,
		name: deathPlayerName ? deathPlayerName.value : "Player"
	});
}

function request_overall_rank(finalScore){
	deathRankText = "rank: loading...";
	if (!window.pooSnakeLeaderboard || !window.pooSnakeLeaderboard.getRank){
		deathRankText = "rank: unavailable";
		return;
	}
	window.pooSnakeLeaderboard.getRank(finalScore).then(function(rank){
		if (rank){
			deathRankText = "rank: #" + rank;
		} else {
			deathRankText = "rank: unavailable";
		}
	});
}

function clear_score(){
	ctx.clearRect(0,0, Math.floor(width/2) - 1, 49);
	ctx.clearRect(Math.floor(width/2)+1,0, Math.floor(width/2) - 1, 49);
}

function clear_screen(){
	ctx.clearRect(0,top_boarder,width, height);
}

function draw_poo(context,poosize, x, y, magicType){
	var magic = magicType ? magicTypes[magicType] : null;
	if (magic){
		var pulse = (Math.sin(Date.now() / 220) + 1) / 2;
		var glowRadius = poosize + 8 + (pulse * 4);
		var glowAlpha = 0.11 + (pulse * 0.12);
		context.save();
		context.shadowColor = magic.glow;
		context.shadowBlur = 14 + (pulse * 8);
		context.beginPath();
		context.fillStyle = "rgba(" + magic.glowRgb + ", " + glowAlpha + ")";
		context.arc(x, y, glowRadius, 0, 2*Math.PI);
		context.fill();
		context.closePath();
		context.beginPath();
		context.fillStyle = "rgba(" + magic.glowRgb + ", " + (glowAlpha * 0.55) + ")";
		context.arc(x, y, glowRadius + 5, 0, 2*Math.PI);
		context.fill();
		context.closePath();
		context.restore();
	}

	// lighter, higher-contrast poo with clearer highlight
	// shadow
	context.beginPath();
	context.fillStyle = 'rgba(0,0,0,0.18)';
	context.ellipse(x, y+poosize+2, poosize+3, poosize/1.6, 0, 0, 2*Math.PI);
	context.fill();
	context.closePath();

	// main blobs (lighter brown)
	context.beginPath();
	context.fillStyle = magic ? magic.color : '#8B5E2B';
	context.strokeStyle = magic ? '#f7f7f7' : '#6f4a1f';
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

function get_magic_effect_text(type){
	if (type == "yellow"){
		return "speed -10%";
	}
	if (type == "green"){
		return "length halved";
	}
	if (type == "white"){
		return "god mode";
	}
	if (type == "blue"){
		return "pet fly";
	}
	return "magic";
}

function show_magic_popup(type){
	magicPopup = {
		title: "Magic poo!",
		detail: get_magic_effect_text(type),
		expiresAt: Date.now() + 2200
	};
}

function display_magic_message(context, width){
	if (!magicPopup){
		return;
	}
	if (Date.now() > magicPopup.expiresAt){
		magicPopup = null;
		return;
	}
	var remaining = magicPopup.expiresAt - Date.now();
	var alpha = Math.min(1, remaining / 350);
	context.save();
	context.globalAlpha = alpha;
	context.textAlign = "center";
	context.fillStyle = "rgba(0,0,0,0.92)";
	context.fillRect(0, 0, width, top_boarder - 2);
	context.strokeStyle = "rgba(255,255,255,0.45)";
	context.strokeRect(6, 6, width - 12, top_boarder - 14);
	context.fillStyle = "white";
	context.font = "16px Courier";
	context.fillText(magicPopup.title, width / 2, 20);
	context.font = "13px Courier";
	context.fillText(magicPopup.detail, width / 2, 38);
	context.restore();
}

function draw_food(){
	if (food_drawing == "mouse"){
		mouse(ctx, food_position.x,food_position.y);
	} else if (food_drawing == "full_head"){
		draw_fullhead(ctx, food_position.x, food_position.y, direction);
	} else if (food_drawing == "full_body"){
		var snakeColor = get_snake_color();
		draw_circle(ctx, food_position.x, food_position.y, 6, snakeColor, snakeColor)
	}
}

function draw_fly(context, fly){
	if (!fly){
		return;
	}
	var wingPulse = Math.sin(Date.now() / 80) * 1.5;
	context.save();
	context.beginPath();
	context.fillStyle = "rgba(190, 230, 255, 0.75)";
	context.ellipse(fly.x - 4, fly.y - 2, 4 + wingPulse, 2.5, -0.5, 0, 2*Math.PI);
	context.ellipse(fly.x + 4, fly.y - 2, 4 - wingPulse, 2.5, 0.5, 0, 2*Math.PI);
	context.fill();
	context.closePath();

	context.beginPath();
	context.fillStyle = "#111";
	context.arc(fly.x, fly.y, 3.5, 0, 2*Math.PI);
	context.fill();
	context.closePath();

	context.beginPath();
	context.fillStyle = "#e9f7ff";
	context.arc(fly.x - 1.5, fly.y - 1.2, 1, 0, 2*Math.PI);
	context.arc(fly.x + 1.5, fly.y - 1.2, 1, 0, 2*Math.PI);
	context.fill();
	context.closePath();
	context.restore();
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

function get_snake_color(){
	if (godMode){
		return "white";
	}
	return "green";
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

function get_random_safe_position(){
	for (var i = 0; i < 80; i++){
		var position = {x:rand_x(width), y:rand_y(height, top_boarder)};
		if (!is_position_same(position, head) &&
			!is_position_same(position, food_position) &&
			!is_coord_in_list(position, body) &&
			!is_coord_in_list(position, poos)){
			return position;
		}
	}
	return {x:width - 20, y:top_boarder + 20};
}

function get_poo_index_at_position(position){
	for (var i = 0; i < poos.length; i++){
		if (is_position_same(position, poos[i])){
			return i;
		}
	}
	return -1;
}

function maybe_make_magic_poo(poo){
	if (Math.random() < magicChance){
		poo.magicType = magicTypeNames[Math.floor(Math.random() * magicTypeNames.length)];
		poo.magicExpiresAt = Date.now() + magicDuration;
	}
	return poo;
}

function expire_magic_poos(){
	var now = Date.now();
	for (var i = 0; i < poos.length; i++){
		if (poos[i].magicType && poos[i].magicExpiresAt <= now){
			delete poos[i].magicType;
			delete poos[i].magicExpiresAt;
		}
	}
}

function apply_magic_poo(type){
	if (type == "yellow"){
		speed = speed * 1.1;
	} else if (type == "green"){
		body = body.slice(Math.floor(body.length / 2));
	} else if (type == "white"){
		godMode = true;
	} else if (type == "blue"){
		spawn_pet_fly();
	}
	show_magic_popup(type);
}

function spawn_pet_fly(){
	if (!petFly){
		petFly = get_random_safe_position();
	}
	lastFlyMove = Date.now();
}

function get_nearest_poo(position){
	if (poos.length == 0){
		return null;
	}
	var nearest = poos[0];
	var nearestDistance = Math.abs(position.x - nearest.x) + Math.abs(position.y - nearest.y);
	for (var i = 1; i < poos.length; i++){
		var distance = Math.abs(position.x - poos[i].x) + Math.abs(position.y - poos[i].y);
		if (distance < nearestDistance){
			nearest = poos[i];
			nearestDistance = distance;
		}
	}
	return nearest;
}

function move_pet_fly(){
	if (!petFly){
		return;
	}
	var now = Date.now();
	if (now - lastFlyMove < flySpeed){
		return;
	}
	lastFlyMove = now;
	var target = get_nearest_poo(petFly);
	if (!target){
		var wander = Math.floor(Math.random() * 4);
		if (wander == 0) petFly.x = petFly.x + 10;
		else if (wander == 1) petFly.x = petFly.x - 10;
		else if (wander == 2) petFly.y = petFly.y + 10;
		else petFly.y = petFly.y - 10;
	} else if (Math.abs(target.x - petFly.x) >= Math.abs(target.y - petFly.y) && target.x != petFly.x){
		petFly.x = petFly.x + (target.x > petFly.x ? 10 : -10);
	} else if (target.y != petFly.y){
		petFly.y = petFly.y + (target.y > petFly.y ? 10 : -10);
	}

	if (petFly.x < 10) petFly.x = width - 10;
	if (petFly.x > width - 10) petFly.x = 10;
	if (petFly.y < top_boarder + 10) petFly.y = height - 10;
	if (petFly.y > height - 10) petFly.y = top_boarder + 10;

	var eatenPooIndex = get_poo_index_at_position(petFly);
	if (eatenPooIndex >= 0){
		poos.splice(eatenPooIndex, 1);
	}
}


function collision(){
	var headInBody = is_coord_in_list(head, body);
	var foodInBody = is_coord_in_list(food_position, body);
	var pooIndex = get_poo_index_at_position(head);
	var headInPoos = pooIndex >= 0;
	var headInFood = is_position_same(food_position, head);
	score_add = false; dead = "not";
	if (petFly && is_position_same(head, petFly)){
		petFly = null;
		eatPulse = 6;
	} else if (headInPoos && poos[pooIndex].magicType && !(headInFood)){
		apply_magic_poo(poos[pooIndex].magicType);
		poos.splice(pooIndex, 1);
		eatPulse = 6;
	} else if (headInBody && !godMode) {
		dead = "body"; food_drawing = "mouse"; food_state = "uneaten";
	} else if (headInPoos && !(headInFood) && !godMode){
		dead = "poo"; food_drawing = "mouse"; food_state = "uneaten";
	} else if (headInPoos && !(headInFood) && godMode){
		poos.splice(pooIndex, 1);
		eatPulse = 6;
	} else if (headInFood && food_state == "uneaten"){
		food_state = "digesting"; score_add = true;
		food_drawing = "full_head";
		// trigger a short pulse animation for head/body
		eatPulse = 6; // a few frames of pulse
	} else if (foodInBody == true && food_state == "digesting"){
		food_drawing = "full_body";
	} else if (food_state == "digesting" && foodInBody == false){
		let new_dump = JSON.parse(JSON.stringify(food_position));
		poos.push(maybe_make_magic_poo(new_dump));
		poosMadeThisLevel = poosMadeThisLevel + 1;
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
	}, 120)
}


function draw_all_poos(){
	for (var i = 0; i < poos.length; i++){
		draw_poo(ctx, poosize, poos[i].x, poos[i].y, poos[i].magicType)
	}
}

function show_retry_button(){
	if (retryButton){
		retryButton.classList.remove("hidden");
		retryButton.classList.add("is-visible");
		retryButton.style.display = "block";
	}
	if (shareButton){
		shareButton.classList.remove("hidden");
		shareButton.classList.add("is-visible");
		shareButton.style.display = "block";
	}
}

function hide_retry_button(){
	if (retryButton){
		retryButton.classList.remove("is-visible");
		retryButton.classList.add("hidden");
		retryButton.style.display = "none";
	}
	if (shareButton){
		shareButton.classList.remove("is-visible");
		shareButton.classList.add("hidden");
		shareButton.style.display = "none";
	}
}

function show_score_submit(finalScore, finalLevel, finalCause){
	currentDeathResult = {
		score: finalScore,
		level: finalLevel,
		cause: finalCause
	};
	if (scoreSubmitPanel){
		scoreSubmitPanel.classList.remove("hidden");
	}
	if (submitScoreButton){
		submitScoreButton.disabled = false;
		submitScoreButton.textContent = "Submit score";
	}
	if (deathSubmitStatus){
		deathSubmitStatus.textContent = "";
	}
}

function hide_score_submit(){
	currentDeathResult = null;
	if (scoreSubmitPanel){
		scoreSubmitPanel.classList.add("hidden");
	}
	if (deathSubmitStatus){
		deathSubmitStatus.textContent = "";
	}
	if (submitScoreButton){
		submitScoreButton.disabled = false;
		submitScoreButton.textContent = "Submit score";
	}
}

function get_share_text(){
	if (!currentDeathResult){
		return "try to beat my score on poosnake.com";
	}
	return "I did " + currentDeathResult.score + " poos and reached level " + currentDeathResult.level + ". try to beat my score on poosnake.com";
}

function share_score(){
	var shareText = get_share_text();
	var shareUrl = "https://poosnake.com";
	if (navigator.share){
		navigator.share({
			title: "Poo Snake",
			text: shareText,
			url: shareUrl
		}).catch(function(){});
		return;
	}
	if (navigator.clipboard && navigator.clipboard.writeText){
		navigator.clipboard.writeText(shareText + " " + shareUrl);
		if (deathSubmitStatus){
			deathSubmitStatus.textContent = "Share text copied";
		}
	}
}

function death_screen(){
	if (deathIntervalId){
		return;
	}
	game_paused=true;
	show_retry_button();
	var finalScore = score;
	var finalLevel = level;
	var finalCause = get_cause_of_death();
	var highScore = update_high_score(finalScore);
	show_score_submit(finalScore, finalLevel, finalCause);
	request_overall_rank(finalScore);
	deathIntervalId = window.setInterval(function print_death(){
		clear_screen();
		draw_head(ctx,head.x,head.y, direction, radius = 6, outline = "gray", fill = "gray");
		draw_body(ctx, body, clr = "gray");
		ctx.textAlign = "center";
		ctx.fillStyle = "lime";
		ctx.font = "16px Courier";
		ctx.fillText("+----------------------+", width / 2, 72);
		ctx.fillText("|      GAME OVER       |", width / 2, 92);
		ctx.fillText("+----------------------+", width / 2, 112);
		ctx.font = "14px Courier";
		ctx.fillText("poos done: " + finalScore, width / 2, 142);
		ctx.fillText("level: " + finalLevel, width / 2, 164);
		ctx.fillText("cause: " + finalCause, width / 2, 186);
		ctx.fillText("high score: " + highScore, width / 2, 208);
		ctx.fillText(deathRankText, width / 2, 230);
		ctx.textAlign = "left";
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
			expire_magic_poos();
			move_pet_fly();
			move_snake(head, body, direction, dx, dy, width, height,header_size = top_boarder);
			collision();
			document.addEventListener("keydown", keydown, {once:true});
			clear_screen();
			clear_score();
			draw_boarder(ctx, width, top_boarder);
			display_score(ctx, score, level, width);
			var snakeColor = get_snake_color();
			draw_head(ctx,head.x,head.y, direction, radius = 6, outline = snakeColor, fill = snakeColor);
			draw_body(ctx, body, clr = snakeColor);
			draw_all_poos();
			draw_food();
			draw_fly(ctx, petFly);
		}

		// decrement eat pulse if active
		if (eatPulse > 0) eatPulse = Math.max(0, eatPulse - 1);
		if (score_add){
			score = score + 1;
		}
		if (poosMadeThisLevel > (level * 2)) {  // possibly move this before drawing ..
			poos = [];
			poosMadeThisLevel = 0;
			godMode = false;
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
	if (deathIntervalId){
		window.clearInterval(deathIntervalId);
		deathIntervalId = null;
	}
	hide_retry_button();
	hide_score_submit();
	new_segment = null
	head = {x:50, y: 250};
	body = [{x:40, y:250}];
	poos = [];
	poosMadeThisLevel = 0;
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
	eatPulse = 0;
	pendingDirection = null;
	godMode = false;
	petFly = null;
	lastFlyMove = 0;
	leaderboardSubmitted = false;
	deathRankText = "rank: loading...";
	magicPopup = null;
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
	var snakeColor = get_snake_color();
	draw_head(ctx,head.x,head.y, direction, radius = 6, outline = snakeColor, fill = snakeColor);
	draw_body(ctx, body, clr = snakeColor);
	draw_all_poos();
	draw_food();
	draw_fly(ctx, petFly);
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
		var snakeColor = get_snake_color();
		draw_head(ctx,head.x,head.y, direction, radius = 6, outline = snakeColor, fill = snakeColor);
		draw_body(ctx, body, clr = snakeColor);
		draw_all_poos();
		draw_food();
		draw_fly(ctx, petFly);
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
if (retryButton){
	retryButton.addEventListener('click', function(){
		reset_game();
	});
	retryButton.addEventListener('touchend', function(e){
		e.preventDefault();
		reset_game();
	});
}
if (shareButton){
	shareButton.addEventListener('click', share_score);
	shareButton.addEventListener('touchend', function(e){
		e.preventDefault();
		share_score();
	});
}
if (submitScoreButton){
	submitScoreButton.addEventListener('click', function(){
		if (!currentDeathResult){
			return;
		}
		if (!window.pooSnakeLeaderboard || !window.pooSnakeLeaderboard.submitScore){
			if (deathSubmitStatus){
				deathSubmitStatus.textContent = "Leaderboard unavailable";
			}
			return;
		}
		if (leaderboardSubmitted){
			return;
		}
		submitScoreButton.disabled = true;
		submitScoreButton.textContent = "Submitting...";
		var submitPromise = submit_leaderboard_score(currentDeathResult.score, currentDeathResult.level, currentDeathResult.cause);
		if (submitPromise && submitPromise.then){
			submitPromise.then(function(submitted){
				if (submitted){
					submitScoreButton.textContent = "Submitted";
				} else {
					leaderboardSubmitted = false;
					submitScoreButton.disabled = false;
					submitScoreButton.textContent = "Submit score";
				}
			});
		}
	});
}

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

// Menu wiring
window.addEventListener('load', function(){
	var menuBtn = document.getElementById('menuBtn');
	var menuPanel = document.getElementById('menuPanel');
	var infoBtn = document.getElementById('infoBtn');
	var leaderboardBtn = document.getElementById('leaderboardBtn');
	var infoModal = document.getElementById('infoModal');
	var leaderboardModal = document.getElementById('leaderboardModal');

	function close_menu(){
		if (menuBtn && menuPanel){
			menuPanel.classList.add('hidden');
			menuBtn.setAttribute('aria-expanded', 'false');
		}
	}

	function close_modals(){
		if (infoModal){
			infoModal.classList.add('hidden');
		}
		if (leaderboardModal){
			leaderboardModal.classList.add('hidden');
		}
	}

	if (menuBtn && menuPanel){
		menuBtn.addEventListener('click', function(event){
			event.stopPropagation();
			var isOpen = !menuPanel.classList.contains('hidden');
			menuPanel.classList.toggle('hidden');
			menuBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
		});
	}

	if (infoBtn && infoModal){
		infoBtn.addEventListener('click', function(){
			close_modals();
			infoModal.classList.remove('hidden');
			close_menu();
		});
	}

	if (leaderboardBtn && leaderboardModal){
		leaderboardBtn.addEventListener('click', function(){
			close_modals();
			leaderboardModal.classList.remove('hidden');
			if (window.pooSnakeLeaderboard &&
				window.pooSnakeLeaderboard.loadScores){
				window.pooSnakeLeaderboard.loadScores();
			}
			close_menu();
		});
	}

	[infoModal, leaderboardModal].forEach(function(modal){
		if (!modal){
			return;
		}
		modal.addEventListener('click', function(event){
			if (event.target == modal){
				modal.classList.add('hidden');
			}
		});
		var content = modal.querySelector('.modal-content');
		if (content){
			content.addEventListener('click', function(event){
				event.stopPropagation();
			});
		}
	});

	document.addEventListener('click', function(event){
		if (menuPanel && menuBtn && !menuPanel.contains(event.target) && event.target !== menuBtn){
			close_menu();
		}
	});

	document.addEventListener('keydown', function(event){
		if (event.key == 'Escape'){
			close_menu();
			close_modals();
		}
	});
});



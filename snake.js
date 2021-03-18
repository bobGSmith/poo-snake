					
								// SNAKE GAME LOGIC //

// INITIAL SETUP //
// Setting up the reference to the html canvas element and its 2d rendering context;


var canvas = document.getElementById("gameWindow");
var ctx = canvas.getContext("2d");
var bodysize_full = 10;
var bodysize_empty = 4;
var poosize = 2;
var width = 300;
var height = 350;
var top_boarder = 50;

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
	context.beginPath();
	context.arc(x, y, radius, 0, 2*Math.PI);
	context.fillStyle = fill;
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = outline;
	context.stroke();
	context.closePath();
	if (direction == "n" || direction == "s"){
		//right eye
		context.beginPath()
		context.arc(x+3,y,2,0,2*Math.PI);
		context.fillStyle = eyes;
		context.fill();
		context.closePath();
		//left eye
		context.arc(x-3,y,2,0,2*Math.PI);
		context.fill();
		context.closePath();
	} else {
		//upper eye
		context.beginPath()
		context.arc(x,y-3,2,0,2*Math.PI);
		context.fillStyle = eyes;
		context.fill();
		context.closePath();
		//lower eye
		context.arc(x,y+3,2,0,2*Math.PI);
		context.fill();
		context.closePath();
	}
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
	context.beginPath();
	context.arc(x-2, y+2,poosize , 0, 2*Math.PI);
	context.arc(x, y-2,poosize , 0, 2*Math.PI);
	context.arc(x+2, y+2,poosize , 0, 2*Math.PI);
	context.fillStyle = "#663D00";
	context.fill();
	context.strokeStyle = "#663D00";
	context.stroke();
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
		draw_circle(ctx, body[i].x, body[i].y, radius = bodysize_empty,outline = clr, fill = clr)
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
var again = false 

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
		new_direction = key_direction[key];
		if (direction == "s" || direction == "n"){
			if (new_direction == "s" || new_direction == "n"){
				null;
			} else {
				direction = new_direction;
			}
		} else if (direction == "w" || direction == "e") {
			if (new_direction == "w" || new_direction == "e"){
				null;
			} else {
				direction = new_direction;
			}
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
	score_add = false; dead = "not";
	if (is_position_same(food_position, head) && food_state == "uneaten"){
		food_state = "digesting"; score_add = true;
		food_drawing = "full_head";
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
	} else if (headInBody) {
		dead = "body"; food_drawing = "mouse"; food_state = "uneaten";
	} else if (headInPoos){
		dead = "poo"; food_drawing = "mouse"; food_state = "uneaten";
	} else {
		food_drawing = "mouse"; food_state = "uneaten";
	}
}

var game_paused = false;

function level_up(){
	var lvl_a = "LVL UP LVL UP LVL UP LVL";
	var y_pos = top_boarder + 20;
	game_paused = true;
	var lvlupId = window.setInterval(function lvl_animate(){
		ctx.font = "20px Courier";
		ctx.fillStyle = "white";
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

var new_segment = null 
var head = {x:50, y: 250};
var body = [{x:40, y:250}];
var poos = [];
//var food_position = {x:rand_x(width), y:rand_y(height, top_boarder)};
var food_position = {x:250, y:250};
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


// MAIN GAME //

function reset_game(){
	new_segment = null 
	head = {x:50, y: 250};
	body = [{x:40, y:250}];
	poos = [];
	//food_position = {x:rand_x(width), y:rand_y(height, top_boarder)};
	food_position = {x:250, y:250};
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



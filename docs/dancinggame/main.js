title = "";

description = `
`;

characters = [
  `
llllll
ll l l
ll l l
llllll
 l  l
 l  l
  `,//player 
  `
llllll
ll l l
ll l l
llllll
ll  ll
  `,
    
  `
l ll
llllll
  ll l
 llll
 l  l
  l  l
  `, //enemy design 1
  `
  ll l
llllll
l ll 
 llll
 l  l
l   l,
  `
  ,
  
  `
  lll
ll l l
 llll
 l  l
ll  ll
`, //enemy design 2
  `
  lll
ll l l
 llll
  ll
 l  l
 l  l
`,
];

//Type
/**
 * @typedef {{
 * pos: Vector
 * }} Star
 */
 
/**
 * @type { Star [] }
 */
let stars;


const window_size = {
  WIDTH: 150,
  HEIGHT: 90  
};

const P = {
	LAUNCHSPEED: 5,
  LAUNCHDECELRATE: .5
};

options = {
  theme: 'pixel',
  viewSize: {x:window_size.WIDTH, y:window_size.HEIGHT},
  isPlayingBgm: true,
  // isSpeedingUpSound: true,
  isShowingScore: true,
  isReplayEnabled: true,
  seed: 300
};

//*********************** */

/**
 * @typedef {{
 * pos: Vector,
 * launchStage: number,
 * cursorTravel: number,
 * launchDirection: Vector,
 * currLaunchSpeed: number,
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

//*********************** */
let objs = [];
let sprite_offset = 5;
let edge_buffer = 15;
const spawnpoints = [ vec(window_size.WIDTH/2, window_size.HEIGHT - sprite_offset), 
                      vec(window_size.WIDTH/2, 0+sprite_offset),
                      vec(0+sprite_offset, window_size.HEIGHT/2),
                      vec(window_size.WIDTH-sprite_offset, window_size.HEIGHT/2), ];


function update() {
  if (!ticks) {
    // Spawns enemies and players
    spawn_dancers();
    color("black");
    spawn_player();

  //stars
    stars = times(40, () => { //number of stars
                
      const posX = rnd(0, window_size.WIDTH);
      const posY = rnd(0, window_size.HEIGHT);
      
      return {
          
          pos: vec(posX, posY),
          
          //speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
      };
  });

  }

  // Spawns the player sprite
  color('yellow');
  const c = char(
    ticks % 30 > 15 ? "a" : "b",
    player.pos
  )
  //char("a", player.pos);

  // manage spin launch
  manageSpinLaunch()

  // Spawns the dancing sprites
  objs.forEach((o) => {
    color('black')
    char("c", o.pos);
    
  });


  // Ends the game
  //end("Date got lonely");
  
  // Removes objects ]
  //remove(objs, (obst) => {
  //    return true;
  //});

  // spawn disco stars
  stars.forEach((s) => {
    var starcolors= ["red","green","blue"];
    var starcolor = starcolors[Math.floor(Math.random()*starcolors.length)];
     // @ts-ignore
    color(starcolor);          
    box(s.pos, 1);   
  });

}

// Implementation to spawn players
function spawn_player() {
  // Picks a random number 1-4 and picks from the premade spawn locations 
  let rnd_spawn = floor(rnd(0,4));
  player = {
    pos: spawnpoints[rnd_spawn], 
    launchStage: 0, 
    cursorTravel: 0,
    launchDirection: vec(0,0),
    currLaunchSpeed: 0,
  }
}

// Spawns the dancers
function spawn_dancers() {
  let number_of_dancers = 10;
  for(let i = 0; i < number_of_dancers; ++i) {

    // Pick a random x and y location to spawn dancers
    let rnd_x = rnd(edge_buffer, window_size.WIDTH- edge_buffer);
    let rnd_y = rnd(edge_buffer, window_size.HEIGHT- edge_buffer);
    let rnd_reposition = floor(rnd(0,2));

    // If there is a sprite close or at our current X value move our current location
    if(objs.find(element => abs(rnd_x - element.pos.x) <= sprite_offset)) {
      if(rnd_reposition == 0) rnd_x = rnd(rnd_x+sprite_offset, window_size.WIDTH);
      if(rnd_reposition == 1) rnd_x = rnd(0, rnd_x-sprite_offset);
    }

    // If there is a sprite close or at our current Y value move our current location
    if(objs.find(element => abs(rnd_y - element.pos.y) <= sprite_offset)) {
      if(rnd_reposition == 0) rnd_y = rnd(rnd_y+sprite_offset, window_size.HEIGHT);
      if(rnd_reposition == 1) rnd_y = rnd(0, rnd_y+sprite_offset);
    }

    // Adds sprite into the objs array
    let sprite_location = {pos: vec(rnd_x, rnd_y)};
    sprite_location.pos.clamp(edge_buffer, window_size.WIDTH-edge_buffer, edge_buffer, window_size.HEIGHT-edge_buffer);
    objs.push(sprite_location);
  }
}

  // draw spin cursor and launch player
function manageSpinLaunch() {
  // check if setup is needed
  if (input.isJustPressed) {
    player.cursorTravel = rnd(0, 2 * PI);
    player.launchStage = 1;
  }

  // calculate cursor's current position
  player.cursorTravel += .1;
  let cursorX = sin(player.cursorTravel);
  let cursorY = cos(player.cursorTravel);

  if (input.isJustReleased) {
    // set cursor direction as launch direction
    player.launchDirection = vec(cursorX, cursorY);

    // determine current launch speed with deceleration
    player.currLaunchSpeed = P.LAUNCHSPEED;

    // set launch stage
    player.launchStage = 2;
  } else {
    // decide action 
    if (input.isPressed && player.launchStage == 1) {
      // draw cursor
      color('yellow');
      box(player.pos.x + 5 * cursorX + .5, player.pos.y + 5 * cursorY + 1, 1);
    }
  }

  if (player.launchStage == 2) {
    // decel player's current speed
    player.currLaunchSpeed -= P.LAUNCHDECELRATE;

    // move player based on speed
    player.pos.x += player.launchDirection.x * player.currLaunchSpeed;
    player.pos.y += player.launchDirection.y * player.currLaunchSpeed;

    if (player.currLaunchSpeed <= 0) {
      player.currLaunchSpeed = 0;
      player.launchStage = 0;
    }
  }

  player.pos.clamp(0, window_size.WIDTH, 0, window_size.HEIGHT)
}
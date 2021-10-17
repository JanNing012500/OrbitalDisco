title = "Orbital Disco";

description = `
[Click & Hold]
  to move

Find your
dance partner
`;

characters = [
  `
  ll l
llllll
l ll
llllll
l    l
  `,//player 
  `
l ll 
llllll
  ll l
  ll
 l  l
l    l
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
l ll l
llllll
  ll
 llll
 l  l
ll  ll
  `, //target
  `
  ll 
llllll
l ll l
  ll
  ll
 llll
  `
];

//Type
/**
 * @typedef {{
 * pos: Vector
 * speed: number
 * }} Star
 */
 
/**
 * @type { Star [] }
 */
let stars;


const window_size = {
  WIDTH: 150,
  HEIGHT: 90,
  STAR_SPEED_MIN: 0.1,
  STAR_SPEED_MAX: 0.1
};

// special Player constant variables
const P = {
	LAUNCHSPEED: 3,
  LAUNCHDECELRATE: .5,
  CURSORDISTANCE: 7,
  CURSOROFFSETX: 0.0,
  CURSOROFFSETY: 1.0,
  CURSORSTARTSPEED: 0.1,
  CURSORSPEEDADD: .02,
  MAXHOLDTIME: 120,
  MAXLAUNCHADD: 4,
  MAXCURSORADD: 2,
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
 * rotationDirection: string,
 * cursorSpeed: number,
 * holdTime: number,
 * }} Player
 */

/**
 * @type { Player }
 */
let player;
let dance_partner;
let dancer_count = 10;
let level_count = 0;
//*********************** */
let objs = [];
let time = 0;
let sprite_offset = 5;
let edge_buffer = 15;


function update() {
  if (!ticks) {
    // Spawns enemies and players
    spawn_dancers(dancer_count);
    color("black");
    spawn_player();
    level_count = 0;

   //stars
    stars = times(80, () => { //number of stars
                
      const posX = rnd(0, window_size.WIDTH);
      const posY = rnd(0, window_size.HEIGHT);
    // An object of type Star with appropriate properties
      return {
         // Creates a Vector
          pos: vec(posX, posY),
          // More RNG
          speed: rnd(window_size.STAR_SPEED_MIN, window_size.STAR_SPEED_MAX)
      };
  });

  }

  // Spawns the dancing partner
  color('blue');
  char( ticks % 30 > 15 ? "e" : "f",
    dance_partner.pos);

  // Spawns the player sprite
  color('yellow');
  const c = char(
    ticks % 30 > 15 ? "a" : "b",
    player.pos
  ).isColliding
  if(c.char.e||c.char.f) {
    remove(objs, (obst) => {
      return true;
    });
    play("powerUp");
    ++dancer_count;
    ++level_count;
    addScore(100);
    spawn_dancers(dancer_count);
    spawn_player();
  }

  // manage spin launch
  manageSpinLaunch()

  // Spawns the dancing sprites
  objs.forEach((o) => {
    color('black')
    //char("c", o.pos);
    const c = char(
      ticks % 30 > 15 ? "c" : "d",
      o.pos
    ).isColliding
    if(c.char.a || c.char.b){
      remove(objs, (obst) => {
        return true;
      });
      dancer_count = 10;
      play("hit");
      end();
    }
  });

//Star color setup
    /** @type {Color} */
  // @ts-ignore
  const starColor = ["purple", "blue", "green", "red","yellow","black","cyan","white"] [floor(time / 5) % 8];
  color(starColor);
  if(ticks != undefined && ticks >= 0) time = ticks;
  
  

  //Generate stars
  stars.forEach((s) => {
    // Move the star forward
    s.pos.x += s.speed;
    // Bring the star back to top once it's past the bottom of the screen
    if (s.pos.x > window_size.WIDTH) s.pos.x = 0;
    // Choose a color to draw
    char( "", s.pos);
    // Draw the star as a square of size 1
    box(s.pos, 1);
  });


}

// Implementation to spawn players
function spawn_player() {
  // Picks a random number 1-4 and picks from the premade spawn locations 
  const spawnpoints = [ vec(window_size.WIDTH/2, window_size.HEIGHT - sprite_offset), 
                        vec(window_size.WIDTH/2, 0+sprite_offset),
                        vec(0+sprite_offset, window_size.HEIGHT/2),
                        vec(window_size.WIDTH-sprite_offset, window_size.HEIGHT/2), ];

  let rnd_spawn = floor(rnd(0,4));
  player = {
    pos: spawnpoints[rnd_spawn], 
    launchStage: 0, 
    cursorTravel: 0,
    launchDirection: vec(0,0),
    currLaunchSpeed: 0,
    rotationDirection: 'left',
    cursorSpeed: P.CURSORSTARTSPEED,
    holdTime: 0,
  }

  let dance_partner_spawn;
  if(rnd_spawn == 0) { dance_partner_spawn = spawnpoints[1]; }
  else if(rnd_spawn == 1) { dance_partner_spawn = spawnpoints[0]; }
  else if(rnd_spawn == 2) { dance_partner_spawn = spawnpoints[3]; }
  else if(rnd_spawn == 3) { dance_partner_spawn = spawnpoints[2]; }
  dance_partner = {
    pos: dance_partner_spawn
  };
}

// Spawns the dancers
function spawn_dancers(dancer_count) {
  let number_of_dancers = dancer_count;
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
    if (player.rotationDirection == 'left')
      player.rotationDirection = 'right';
    else
      player.rotationDirection = 'left';  
  }

  // calculate cursor's current position
  if (player.rotationDirection == 'left')
    player.cursorTravel += player.cursorSpeed + P.CURSORSPEEDADD * level_count;
  else
    player.cursorTravel -= player.cursorSpeed + P.CURSORSPEEDADD * level_count;  
  let cursorX = sin(player.cursorTravel);
  let cursorY = cos(player.cursorTravel);

  if (input.isJustReleased) {
    // set cursor direction as launch direction
    player.launchDirection = vec(cursorX, cursorY);

    // determine current launch speed based on hold time
    let holdTimeRatio = player.holdTime/P.MAXHOLDTIME;
    player.currLaunchSpeed = P.LAUNCHSPEED + P.MAXLAUNCHADD * holdTimeRatio;
    
    // set launch stage
    player.launchStage = 2;

    // reset holdTime
    player.holdTime = 0;
  } else {
    // decide action 
    if (input.isPressed && player.launchStage == 1) {
      // store hold time
      player.holdTime++;
      player.holdTime = clamp(player.holdTime, 0, P.MAXHOLDTIME);
      let holdTimeRatio = player.holdTime/P.MAXHOLDTIME;
      
      // decide cursor size
      let cursorSize = (P.MAXCURSORADD * holdTimeRatio) + 1;

      // decide cursor color
      if (holdTimeRatio < .40) {
        color('green');
      } else if (holdTimeRatio < .93) {
        color('yellow');
      } else {
        color('red');
      }

      // draw cursor
      box(player.pos.x + P.CURSORDISTANCE * cursorX + P.CURSOROFFSETX, player.pos.y + P.CURSORDISTANCE * cursorY + P.CURSOROFFSETY, cursorSize);
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

  player.pos.clamp(0+3, window_size.WIDTH-3, 3, window_size.HEIGHT-3)
}

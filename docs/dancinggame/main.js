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



options = {
  theme: 'pixel',
  viewSize: {x:window_size.WIDTH, y:window_size.HEIGHT},
  isPlayingBgm: true,
  // isSpeedingUpSound: true,
  isShowingScore: true,
  isReplayEnabled: true,
  seed: 300
};

let player;
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
  char("a", player.pos);

  // Spawns the dancing sprites
  objs.forEach((o) => {
    char("c", o.pos);
  });

  // Ends the game
  end("Date got lonely");
  
  // Removes objects ]
  remove(objs, (obst) => {
      return true;
  });

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
  player = { pos: spawnpoints[rnd_spawn]}
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
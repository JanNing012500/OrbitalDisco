title = "";

description = `
`;

characters = [
  `
  bbbbbb
  bbbbbb
  bbbbbb
  bbbbbb
  bbbbbb
  `,
  `
  yyyyyy
  yyyyyy
  `
];
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

let objs = [];
let sprite_offset = 5;
let edge_buffer = 15;
const spawnpoints = [ vec(window_size.WIDTH/2, window_size.HEIGHT - sprite_offset), 
                      vec(window_size.WIDTH/2, 0+sprite_offset),
                      vec(0+sprite_offset, window_size.HEIGHT/2),
                      vec(window_size.WIDTH-sprite_offset, window_size.HEIGHT/2), ];

let player;

function update() {
  if (!ticks) {
    spawn_enemies();
    spawn_player();
  }

  char("b", player.pos);
  objs.forEach((o) => {
    char("a", o.pos);
  });
}

function spawn_player() {
  let rnd_spawn = floor(rnd(0,4));
  player = { pos: spawnpoints[rnd_spawn]}
}

function spawn_enemies() {
  for(let i = 0; i < 10; ++i) {
    let rnd_x = rnd(edge_buffer, window_size.WIDTH- edge_buffer);
    let rnd_y = rnd(edge_buffer, window_size.HEIGHT- edge_buffer);
    let rnd_reposition = floor(rnd(0,2));

    if(objs.find(element => abs(rnd_x - element.pos.x) <= sprite_offset)) {
      if(rnd_reposition == 0) rnd_x = rnd(rnd_x+sprite_offset, window_size.WIDTH);
      if(rnd_reposition == 1) rnd_x = rnd(0, rnd_x-sprite_offset);
    }

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
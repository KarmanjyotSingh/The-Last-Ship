import "./style.css";
import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Vector3 } from "three";

function randomInRange(minimum, maximum) {
  return Number(
    Math.random() * (Number(maximum) - Number(minimum)) + Number(minimum)
  );
}
// helper function for collision detection
function collisionDetection(obj1, obj2) {
  // obj2 and obj2 boxes
  return obj1.intersectsBox(obj2);
}
// let loader = new GLTFLoader();
async function loadModel(url) {
  return new Promise((resolve, reject) => {
    let loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      resolve(gltf.scene);
    });
  });
}
let fuelModel = null;
// async function createFuel(position) {
//   if (!fuelModel) {
//     fuelModel = await loadModel("assets/models/fuel-coin/scene.gltf");
//     return;
//   }
//   return new Fuel(position, fuelModel.clone());
// }
let enemyModel = null;
async function createEnemy(position) {
  if (!enemyModel) {
    enemyModel = await loadModel("assets/models/enemy/scene.gltf");
    return;
  }
  return new Enemy(position, enemyModel.clone());
}
// store the main game variables here
class Game {
  constructor() {
    // define the current play area
    this.playArea = {
      up: 1000.0,
      down: -1000.0,
      left: -1000.0,
      right: 1000.0,
    };
    // initiate the camera and scene
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      1,
      20000
    );
    // set the initial camera position
    this.camera.position.set(400, 4, 500);
    // setup the scene
    this.scene = new THREE.Scene();
    // setup the loader object
    this.loader = new GLTFLoader();
    // setup the renderer
    this.renderer = new THREE.WebGLRenderer();

    // create the array of enemy
    this.enemies = new Array();
    // create the array of fuel object
    this.fuels = new Array();
    // create the array of chest object
    this.chests = new Array();
    this.fuels = new Array();
    // create the current box center
    this.centerBox = new THREE.Vector3(0, 4, 0);
    // this.enemyGLTF = this.loader.load();
  }
  // setup the game
  rendererSetup() {
    water.material.uniforms["time"].value += 1.0 / 60.0;
    this.renderer.render(this.scene, this.camera);
  }
  moveCamera() {
    if (boat.boat) {
      let boatPos = boat.boat.position;
      if (boat.view == "c") {
        game.camera.position.set(
          boat.boat.position.x - 200,
          boat.boat.position.y,
          boat.boat.position.z
        );
      } else if (boat.view == "b") {
        game.camera.position.set(boatPos.x, boatPos.y + 300, boatPos.z);
        // camera.lookAt(boatPos);
      }
      game.camera.lookAt(boat.boat.position);
    }
  }
}
async function generateEnemies() {
  if (boat.boat) {
    console.log("HEHE");
    let boatPos = boat.boat.position;
    //console.log(boatPos);
    let numEnemies = 5;

    for (let i = 0; i < numEnemies; i++) {
      let x, y, z;
      x = randomInRange(game.playArea.left, game.playArea.right);
      while (Math.abs(x - boatPos.x) < 300) {
        x = randomInRange(
          game.playArea.left - 1000,
          game.playArea.right + 1000
        );
      }
      y = boatPos.y;
      z = randomInRange(game.playArea.down - 500, game.playArea.up + 500);
      while (Math.abs(z - boatPos.z) < 300) {
        z = randomInRange(game.playArea.down - 500, game.playArea.up + 500);
      }
      //console.log({ x, y, z });
      const enemy = new Enemy(new THREE.Vector3(x, y, z), enemyModel.clone());
      game.enemies.push(enemy);
    }
  }
}
async function generateChests() {
  if (boat.boat) {
    let boatPos = boat.boat.position;
    // console.log(boatPos);
    let numChest = 10;

    for (let i = 0; i < numChest; i++) {
      let x, y, z;

      x = randomInRange(game.playArea.left, game.playArea.right);
      while (Math.abs(x - boatPos.x) < 300) {
        x = randomInRange(
          game.playArea.left - 1000,
          game.playArea.right + 1000
        );
      }
      y = boatPos.y;
      z = randomInRange(game.playArea.down - 500, game.playArea.up + 500);
      while (Math.abs(z - boatPos.z) < 300) {
        z = randomInRange(game.playArea.down - 500, game.playArea.up + 500);
      }
      // console.log({ x, y, z });
      let chest = new TreasureChest(new THREE.Vector3(x, y, z));
      game.chests.push(chest);
    }
  }
}
async function generateFuel() {
  if (boat.boat) {
    let boatPos = boat.boat.position;
    // console.log(boatPos);
    let numFuel = 3;

    for (let i = 0; i < numFuel; i++) {
      let x, y, z;

      x = randomInRange(game.playArea.left, game.playArea.right);
      while (Math.abs(x - boatPos.x) < 300) {
        x = randomInRange(
          game.playArea.left - 1000,
          game.playArea.right + 1000
        );
      }
      y = boatPos.y;
      z = randomInRange(game.playArea.down - 500, game.playArea.up + 500);
      while (Math.abs(z - boatPos.z) < 300) {
        z = randomInRange(game.playArea.down - 500, game.playArea.up + 500);
      }
      const fuel = new Fuel(new THREE.Vector3(x, y, z), fuelModel.clone());
      game.fuels.push(fuel);
      console.log("Hi");
      return true;
    }
  }
  return false;
}
// treasure chest object
class TreasureChest {
  constructor(position = new THREE.Vector3(30, 2, 0)) {
    this.chest = new THREE.Group();
    this.color = 0xffffff;
    this.mesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(5, 5, 5),
      new THREE.MeshLambertMaterial({ color: this.color })
    );
    this.mesh.position.set(position.x, position.y, position.z);
    this.chest.add(this.mesh);
    game.scene.add(this.chest);
    this.box = new THREE.Box3().setFromObject(this.chest);
  }
}
const game = new Game();
let sun;
let water;
let controls;
class Bullet {
  constructor() {
    this.geometry = new THREE.SphereGeometry(1, 32, 16);
    this.material = new THREE.MeshBasicMaterial({ color: 0x964b00 });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.box = new THREE.Box3().setFromObject(this.mesh);
  }
}
class Boat {
  constructor() {
    // loader object
    let loader = game.loader;
    loader.load("assets/models/playerShip/scene.gltf", (gltf) => {
      this.boat = gltf.scene;
      // scale here
      gltf.scene.scale.set(4, 4, 4);
      //  set the boat position
      gltf.scene.position.set(0, 4, 0);
      // set the camera position to look at the boat
      game.camera.position.set(
        gltf.scene.position.x - 50,
        4,
        gltf.scene.position.z - 2
      );
      // set the camera to look at boat
      game.camera.lookAt(gltf.scene.position);
      gltf.scene.rotation.y = 1.5;
      // add the boat to the scene
      game.scene.add(gltf.scene);
    });
    // params
    this.health = 100;
    this.fuel = 100;
    this.treasureCount = 0;
    this.score = 0;
    this.view = "c";
    // linear velocity
    this.speed = 0.0;
    // angular velocity
    this.omega = 0.0;
    // create the box object
    this.box = new THREE.Box3();

    // time for bullet to remove from the scene after it is fired
    this.bulletTimeout = 4000;
    // the bullet array for the player
    this.bullets = new Array();
    // bullet shot direction
    this.bulletDirection = new Array();
    // store the time at which the bullet was shot
    this.shotAt = new Array();
    // store the last shown time for the bullet
    this.lastShot = 0;
    // store the ammo
    this.ammo = 5;
    // the cooldown time for the bullet
    this.cooldown = 500;
    // reload time
    this.reloadTime = 1000;
  }
  stop() {
    this.speed = 0;
    this.omega = 0;
  }
  changeBoundaries() {
    game.playArea.up = this.boat.position.z + 1000;
    game.playArea.down = this.boat.position.z - 1000;
    game.playArea.left = this.boat.position.x - 1000;
    game.playArea.right = this.boat.position.x + 1000;
  }
  updateBoundaries() {
    if (this.boat.position.x >= game.playArea.right) {
      this.changeBoundaries();
      generateChests();
      generateEnemies();
      // generateFuel();
    } else if (this.boat.position.x <= game.playArea.left) {
      this.changeBoundaries();
      generateChests();
      generateEnemies();
      // generateFuel();
    } else if (this.boat.position.z >= game.playArea.up) {
      this.changeBoundaries();
      generateChests();
      generateEnemies();
      // generateFuel();
    } else if (this.boat.position.z <= game.playArea.down) {
      this.changeBoundaries();
      generateChests();
      generateEnemies();
      // generateFuel();
    }
  }
  update() {
    if (this.boat) {
      // console.log(this.bullets)
      this.box.setFromObject(this.boat);
      this.updateBoundaries();
      this.boat.rotation.y += this.omega;
      this.boat.translateZ(this.speed);
      this.moveBullet();
      this.removeBullet();
      if (
        new Date().getTime() - this.lastShot > this.reloadTime &&
        this.ammo == 0
      ) {
        // console.log("Reloading")
        this.ammo = 5;
        // return;
      }
    }
  }
  shoot() {
    if (this.ammo === 0) {
      if (new Date().getTime() - this.lastShot <= this.reloadTime) {
        // console.log("Reloading")
        return;
      }
    }
    let currTime = new Date().getTime();
    if (currTime - this.lastShot > this.cooldown) {
      this.ammo -= Number(1);
      this.lastShot = currTime;
      var bullet = new Bullet();
      bullet.mesh.position.set(
        this.boat.position.x,
        this.boat.position.y + 5,
        this.boat.position.z
      );

      bullet.mesh.rotation.x = -Math.PI / 2;
      bullet.mesh.rotation.z = this.boat.rotation.y;
      let shotDirection = new Vector3(
        Math.sin(this.boat.rotation.y),
        0,
        Math.cos(this.boat.rotation.y)
      );
      this.bullets.push(bullet);
      this.bulletDirection.push(shotDirection);
      currTime = new Date().getTime();
      this.shotAt.push(currTime);
      game.scene.add(bullet.mesh);
    }
  }
  moveBullet() {
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].mesh.position.add(this.bulletDirection[i]);
      this.bullets[i].box.setFromObject(this.bullets[i].mesh);
    }
  }
  removeBullet() {
    const currTime = new Date().getTime();
    for (let i = 0; i < this.bullets.length; i++) {
      if (currTime - this.shotAt[i] > this.bulletTimeout) {
        game.scene.remove(this.bullets[i].mesh);
        this.bullets.splice(i, 1);
        this.bulletDirection.splice(i, 1);
        this.shotAt.splice(i, 1);
      }
    }
  }
}
class Enemy {
  constructor(position, obj) {
    obj.scale.set(0.003, 0.003, 0.003); // scale here
    obj.position.set(position.x, position.y, position.z);
    this.enemy = obj;
    this.health = 80;
    // linear velocity
    this.speed = 0.001;
    // angular velocity
    this.omega = 0.0;
    // create the box object
    this.box = new THREE.Box3().setFromObject(this.enemy);
    // add the enemy to the scene
    game.scene.add(obj);
    // the bullet array for the player
    this.bullets = new Array();
    // bullet shot direction
    this.bulletDirection = new Array();
    // store the time at which the bullet was shot
    this.shotAt = new Array();
    this.lastShot = 0;
    // the cooldown time for the bullet
    this.bulletTimeout = 4000;
    this.shotSpeed = 1.5;

    this.cooldown = 5000;
  }
  stop() {
    this.speed.vel = 0;
    this.speed.rot = 0;
  }
  update() {
    if (this.enemy && boat.boat) {
      let boatPos = new THREE.Vector3(
        boat.boat.position.x,
        boat.boat.position.y,
        boat.boat.position.z
      );
      let enemyPos = new THREE.Vector3(
        this.enemy.position.x,
        this.enemy.position.y,
        this.enemy.position.z
      );
      let diff = boatPos.sub(enemyPos);
      diff.multiplyScalar(this.speed);
      this.enemy.position.add(diff);
      const enem = this.enemy.localToWorld(new THREE.Vector3(0.0, 0.0, 1.0));
      enem.normalize();
      diff.normalize();
      const cosine = diff.dot(enem);
      const arccosine = Math.acos(cosine);
      this.enemy.rotation.y = arccosine;
      this.box.setFromObject(this.enemy);
      // console.log(this.box)
      this.fire();
      this.moveBullet();
      this.removeBullet();
    }
  }
  fire() {
    let currTime = new Date().getTime();
    if (currTime - this.lastShot > this.cooldown) {
      this.lastShot = currTime;
      var bullet = new Bullet();
      bullet.mesh.position.set(
        this.enemy.position.x,
        this.enemy.position.y + 5,
        this.enemy.position.z
      );
      // console.log("1");
      bullet.mesh.rotation.x = -Math.PI / 2;
      // console.log("Enemy Shot");
      bullet.mesh.rotation.z = this.enemy.rotation.y;
      let shotDirection = boat.boat.position.clone().sub(this.enemy.position);
      // console.log(shotDirection);
      shotDirection.normalize();
      this.bullets.push(bullet);
      this.bulletDirection.push(shotDirection);

      currTime = new Date().getTime();
      this.shotAt.push(currTime);
      game.scene.add(bullet.mesh);
    }
  }
  moveBullet() {
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].mesh.position.add(
        this.bulletDirection[i].clone().multiplyScalar(this.shotSpeed)
      );
      this.bullets[i].box.setFromObject(this.bullets[i].mesh);
    }
  }
  removeBullet() {
    const currTime = new Date().getTime();
    for (let i = 0; i < this.bullets.length; i++) {
      if (currTime - this.shotAt[i] > this.bulletTimeout) {
        game.scene.remove(this.bullets[i].mesh);
        this.bullets.splice(i, 1);
        this.bulletDirection.splice(i, 1);
        this.shotAt.splice(i, 1);
      }
    }
  }
}
// const xD = createFuel(new Vector3(0, 10, 0));
class Fuel {
  constructor(position, obj) {
    obj.scale.set(12, 12, 10); // scale here
    obj.position.set(position.x, 4, position.z);
    game.scene.add(obj);
    this.fuel = obj;
    this.box = new THREE.Box3().setFromObject(obj);
  }
}
// const enemy = await createEnemy(new THREE.Vector3(100, 4, 500));
// console.log(enemy);
// const chest = new TreasureChest();
function updateEnemies() {
  for (let i = 0; i < game.enemies.length; i++) {
    game.enemies[i].update();
  }
}
function shootEnemy() {
  for (let i = 0; i < boat.bullets.length; i++) {
    // console.log(" Khush");
    if (boat.bullets[i].mesh) {
      // console.log("Enemy Hit");
      console.log(game.enemies.length);
      for (let j = 0; j < game.enemies.length; j++) {
        // console.log("Hi");
        if (game.enemies[j].enemy) {
          // console.log(i, j);
          if (collisionDetection(boat.bullets[i].box, game.enemies[j].box)) {
            console.log("Goli Lggi ");
            // add damage to the enemy
            // remove the bullet
            game.scene.remove(boat.bullets[i].mesh);
            boat.bullets.splice(i, 1);
            boat.shotAt.splice(i, 1);
            boat.bulletDirection.splice(i, 1);
            // 2 bullets to shoot down the enemy
            game.enemies[j].health -= 40;
            boat.score += 50;
            if (game.enemies[j].health <= 0) {
              // remove from the scene
              for (let k = 0; k < game.enemies[j].bullets.length; k++) {
                game.scene.remove(game.enemies[j].bullets[k].mesh);
              }
              game.scene.remove(game.enemies[j].enemy);
              game.enemies.splice(j, 1);
            }
          }
        }
      }
    }
  }
}
// bullet hit player
function shootPlayer() {
  for (let i = 0; i < game.enemies.length; i++) {
    if (game.enemies[i].enemy) {
      for (let j = 0; j < game.enemies[i].bullets.length; j++) {
        if (game.enemies[i].bullets[j].mesh) {
          if (collisionDetection(game.enemies[i].bullets[j].box, boat.box)) {
            game.scene.remove(game.enemies[i].bullets[j].mesh);
            game.enemies[i].bullets.splice(j, 1);
            game.enemies[i].shotAt.splice(j, 1);
            game.enemies[i].bulletDirection.splice(j, 1);
            console.log("enemy Shot Boat");
            boat.health -= 10;
          }
        }
      }
    }
  }
}
// collision between enemy and boat
function enemyBoatCollision() {
  for (let i = 0; i < game.enemies.length; i++) {
    if (boat.boat && game.enemies[i].enemy) {
      if (collisionDetection(boat.box, game.enemies[i].box)) {
        // console.log("Collision");
        // on collision with the boat deal a damage , reduce the health
        console.log(boat.health);
        boat.health -= 20;
        boat.score -= 50;
        // console.log(boat.health);
        // remove the enemy
        game.scene.remove(game.enemies[i].enemy);
        for (let j = 0; j < game.enemies[i].bullets.length; j++) {
          game.scene.remove(game.enemies[i].bullets[j].mesh);
        }
        game.enemies.splice(i, 1);
      }
    }
  }
}
// chest Boat Collision
function chestBoatCollision() {
  for (let i = 0; i < game.chests.length; i++) {
    if (boat.boat && game.chests[i].chest) {
      if (collisionDetection(boat.box, game.chests[i].box)) {
        // console.log("Collision Chest");
        // increase the treasure count
        boat.treasureCount += 1;
        // increase the boat score
        boat.score += 100;
        // remove the chest from the scene
        game.scene.remove(game.chests[i].chest);
        // remove the chest from the array
        game.chests.splice(i, 1);
      }
    }
  }
}
// main game loop
var id;
function main() {
  id = requestAnimationFrame(main);
  game.rendererSetup();
  boat.update();
  updateEnemies();
  game.moveCamera();
  enemyBoatCollision();
  shootEnemy();
  handleHUD();
  chestBoatCollision();
  shootPlayer();
  if (boat.boat && boat.health <= 0) {
    console.log("Game Over");
    game.scene.remove(boat.boat);
    cancelAnimationFrame(id);
    alert("Game Over");
    setTimeout(1000)
    window.location.reload();
    // boat.boat = null;
  }

  // fuelBoat();
}
function init() {
  game.startTime = new Date().getSeconds();

  let renderer = game.renderer;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);
  sun = new THREE.Vector3();
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "assets/images/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: game.scene.fog !== undefined,
  });
  water.rotation.x = -Math.PI / 2;
  game.scene.add(water);
  const sky = new Sky();
  sky.scale.setScalar(10000);
  game.scene.add(sky);
  let ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  game.scene.add(ambientLight);
  const skyUniforms = sky.material.uniforms;
  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;
  const parameters = {
    elevation: 2,
    azimuth: 180,
  };
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  function updateSun() {
    const phi = THREE.MathUtils.degToRad(89 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    sky.material.uniforms["sunPosition"].value.copy(sun);
    water.material.uniforms["sunDirection"].value.copy(sun).normalize();
    game.scene.environment = pmremGenerator.fromScene(sky).texture;
  }

  updateSun();
  controls = new OrbitControls(game.camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  const waterUniforms = water.material.uniforms;
  // wfindow.addEventListener("resize", onWindowResize);
  generateChests();
  // const mm = await createEnemy(new THREE.Vector3(200, 0, 100));
}
function initInput() {
  window.addEventListener("keydown", function (e) {
    if (e.key == "w") {
      boat.speed = 1;
    }
    if (e.key == "s") {
      boat.speed = -1;
    }
    if (e.key == "d") {
      boat.omega = -0.1;
    }
    if (e.key == "a") {
      boat.omega = 0.1;
    }
    if (e.key == " ") {
      boat.shoot();
    }
    if (e.key == "o") {
      boat.view = "o";
      game.camera.position.set(
        boat.boat.position.x + 30,
        4,
        boat.boat.position.z + 50
      );
      game.camera.lookAt(boat.boat.position);
    }
    // set the bird eye view for boat
    if (e.key == "b") {
      boat.view = "b";
      game.camera.position.set(
        boat.boat.position.x,
        boat.boat.position.y + 300,
        boat.boat.position.z
      );
      game.camera.lookAt(boat.boat.position);
    }
    // The Second Camera for the boat
    if (e.key == "c") {
      boat.view = "c";
      game.camera.position.set(
        boat.boat.position.x - 80,
        boat.boat.position.y,
        boat.boat.position.z - 4
      );
      game.camera.lookAt(boat.boat.position);
    }
  });
  window.addEventListener("keyup", function (e) {
    boat.stop();
  });
}
const boat = new Boat();
await createEnemy(new THREE.Vector3(1, 4, 1));
// await createFuel(new THREE.Vector3(1, 4, 1));
// initiate the enemy objects
let numEnemies = 5;
for (let i = 0; i < numEnemies; i++) {
  // console.log(i);
  let x, y, z;
  x = randomInRange(game.playArea.left, game.playArea.right);
  y = 4;
  z = randomInRange(game.playArea.down - 500, game.playArea.up + 500);
  //console.log({ x, y, z });
  const enemy = await createEnemy(new THREE.Vector3(x, y, z), enemyModel);
  // console.log(enemy);
  game.enemies.push(enemy);
}
// console.log(game.enemies);
// initiate the fuel objects
// let numFuel = 3;
// for (let i = 0; i < numFuel; i++) {
//   let x, y, z;

//   x = randomInRange(game.playArea.left, game.playArea.right);
//   y = 4;
//   z = randomInRange(game.playArea.down - 500, game.playArea.up + 500);
//   const fuel = createFuel(new THREE.Vector3(x, y, z));
//   game.fuels.push(fuel);
//   console.log("Hi");
// }
// generate chest objects
let numChest = 10;
for (let i = 0; i < numChest; i++) {
  let x, y, z;
  x = randomInRange(game.playArea.left, game.playArea.right);
  y = 4;
  z = randomInRange(game.playArea.down - 500, game.playArea.up + 500);
  // console.log({ x, y, z });
  let chest = new TreasureChest(new THREE.Vector3(x, y, z));
  game.chests.push(chest);
}
let h = 0;
function handleHUD() {
  document.getElementById("HealthVal").innerHTML = boat.health;
  document.getElementById("ScoreVal").innerHTML = boat.score;
  document.getElementById("AmmoVal").innerHTML = boat.ammo;
  document.getElementById("TreasureVal").innerHTML = boat.treasureCount;
  document.getElementById("TimeVal").innerHTML = Number(h++ / 50).toFixed(0);
}

init();
initInput();
main();

"use strict"

import * as THREE from "https://esm.sh/three"
import WebGL from "https://esm.sh/three/addons/capabilities/WebGL.js"
import * as OIMO from "https://esm.sh/oimo"
import gsap from "https://esm.sh/gsap"
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js"
import { EffectComposer } from "https://esm.sh/three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "https://esm.sh/three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "https://esm.sh/three/examples/jsm/postprocessing/UnrealBloomPass.js"

let width = window.innerWidth
let height = Math.max(window.innerHeight, 480)
let composer, body
let isRotating = false
let dices = []
let diceAmount = 2
let accumulator = 0
let lastTime = 0

const fixedTimeStep = 1 / 120 // 120 Hz
const defaultCameraPosition = new THREE.Vector3(-12, 12, 12)
const resizeObserver = new ResizeObserver(resizeUpdate)
resizeObserver.observe(document.body)
window.addEventListener('resize', () => resizeUpdate())
document.getElementById('roll').addEventListener('click', addDices)
document.getElementById('decrease').addEventListener('click', () => {
  diceAmount = Math.max(--diceAmount, 1)
  document.querySelector('#amount').innerHTML = diceAmount
})
document.getElementById('increase').addEventListener('click', () => {
  diceAmount = Math.min(++diceAmount, 12)
  document.querySelector('#amount').innerHTML = diceAmount
})


// Physics
const world = new OIMO.World({ 
  timestep: 1 / 60, 
  iterations: 8, 
  broadphase: 2, 
  worldscale: .5, 
  random: true, 
  info: false,
  gravity: [0, -9.8 * 3, 0]
})

// Renderer
const renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true
renderer.setSize(width, height)
renderer.setClearColor(0xffffff)
renderer.setPixelRatio(2)
document.body.appendChild(renderer.domElement)

// Environment
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  45,
  width / height,
  0.1,
  1000
)
const orbit = new OrbitControls(camera, renderer.domElement)

camera.position.set(-12, 55, 12)
orbit.minPolarAngle = 0
orbit.maxPolarAngle = (Math.PI / 2) - 0.1
orbit.enableDamping = true
orbit.dampingFactor = 0.05
orbit.rotateSpeed = 0.5
orbit.enablePan = false
orbit.enableZoom = false
//orbit.addEventListener('end', resetCameraPosition)
orbit.update()

// Dice
function createDice(x, y, z) {
  return new Promise((resolve, reject) => {
    const assetLoader = new GLTFLoader()
    assetLoader.load(
      "https://dl.dropboxusercontent.com/scl/fi/n0ogooke4kstdcwo7lryy/dice_highres_red.glb?rlkey=i15sotl674m294bporeumu5d3&st=fss6qosg", 
      (gltf) => {
        const model = gltf.scene
        scene.add(model)
        model.position.set(0, 5, 0)
        model.castShadow = true

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
          }
        })

        body = world.add({
          type: 'box',
          size: [2, 2, 2], 
          pos: [x, y, z],
          rot: [Math.floor(Math.random() * 360), Math.floor(Math.random() * 360), Math.floor(Math.random() * 360)],
          //rot: [0,Math.random() * 360,0],
          move: true,
          density: 2,
          friction: 0.5,
          restitution: 0.75,
          belongsTo: 1,
          collidesWith: 0xffffffff
        })

        resolve({ model, body })
      }, 
      undefined, 
      (err) => {
        console.error(err)
        reject(err)
      }
    )
  })
}

// Plane
const planeGeometry = new THREE.PlaneGeometry(200, 200)
const planeMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xBF171C,
  side: THREE.DoubleSide
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(plane)
plane.rotation.x = -0.5 * Math.PI
plane.receiveShadow = true

// Lighting
const ambientLight = new THREE.AmbientLight(0xfaf9eb, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xfaf9eb, 2.5)
scene.add(directionalLight)

const lightTarget = new THREE.Object3D()
scene.add(lightTarget)
lightTarget.position.set(0, 0, 0)

directionalLight.position.set(-30, 50, -30)
directionalLight.target = lightTarget
directionalLight.castShadow = true

directionalLight.shadow.camera.left = -20
directionalLight.shadow.camera.right = 20
directionalLight.shadow.camera.top = 20
directionalLight.shadow.camera.bottom = -20

directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.bias = -0.0005

// Fog
//scene.fog = new THREE.FogExp2(0xffffff, 0.01)

// function removeDices() {
//   dices.forEach(dice => {
//     scene.remove(dice.model)
//     world.clear()
//   })
//   dices = []
// }

function removeDices() {
  dices.forEach(dice => {
    scene.remove(dice.model)
  })

  world.clear() // ← ONLY ONCE
  dices = []
}

function getRandomPosition() {
  return {
    x: Math.random() * 4 - 2, 
    y: 15,
    z: Math.random() * 4 - 2 
  }
}

function addDices() {
  removeDices()
  // Ground Body
  world.add({
    type: 'box',
    size: [100, 1, 100],
    pos: [0, -0.5, 0],
    rot: [0, 0, 0],
    move: false,
    density: 1
  })

  const diceCount = diceAmount
  const dicePromises = []
  for (let i = 0; i < diceCount; i++) {
    const position = getRandomPosition()
    dicePromises.push(createDice(position.x, position.y, position.z))
  }

  Promise.all(dicePromises).then(newDices => {
    dices = newDices
  })
}

function animate(time) {
  if (lastTime) {
    const deltaTime = (time - lastTime) / 1000
    accumulator += deltaTime
    while (accumulator >= fixedTimeStep) {
      world.step(fixedTimeStep)
      accumulator -= fixedTimeStep
    }
    
    dices.forEach(dice => {
      let position = dice.body.getPosition()
      let quaternion = dice.body.getQuaternion()
      dice.model.position.set(position.x, position.y, position.z)
      dice.model.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
    })
  }
  
  lastTime = time
  
  orbit.update()
  composer.render(scene, camera)
}

function resizeUpdate() {
  width = window.innerWidth
  height = Math.max(window.innerHeight, 500)
  camera.updateProjectionMatrix()
  camera.aspect = width / height
  renderer.setSize(width, height)
}

function resetCameraPosition() {
  if (!isRotating) {
    isRotating = true
    gsap.to(
      camera.position, 
      {
        x: defaultCameraPosition.x,
        y: defaultCameraPosition.y,
        z: defaultCameraPosition.z,
        duration: 0.5,
        ease: "power2.inOut",
        onUpdate: function() {
          camera.lookAt(scene.position)
        },
        onComplete: function() {
          isRotating = false
        }
      }
    )
  }
}

function initPostProcessing() {
  composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    0.2,  // strength
    0.2,  // radius
    0.85  // threshold
  );
  composer.addPass(bloomPass)
}

initPostProcessing()
addDices()

if (WebGL.isWebGL2Available()) {
  renderer.setAnimationLoop(animate)
} else {
  const warning = WebGL.getWebGL2ErrorMessage()
	renderer.domElement.appendChild(warning)
}

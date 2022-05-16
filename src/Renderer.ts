import { scatter_util } from "@tensorflow/tfjs-core";
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import maskModelUrl from "./mask.glb"
import { createAxes } from "./utils/createAxes";

async function loadModel(url: string): Promise<GLTF> {
  const loader = new GLTFLoader()
  return new Promise((resolve, reject) => {
    loader.load(url, (model) => {
      resolve(model)
    },
    undefined,
    (e) => {
      reject(e)
    })
  })
}

const watchX = 0
const watchY = -0.3
const watchZ = -1
const watchRX = 0
const watchRY = 0
const watchRZ = 0

export class Renderer {

  #threeRenderer: WebGLRenderer
  #canvasWidth = 300
  #canvasHeigt = 300
  #camera: PerspectiveCamera
  #scene: Scene

  #maskContainers: Group[] = []
  #mask: Group | null = null

  #axes: Group

  constructor() {
    const renderer = new WebGLRenderer()
    renderer.setClearAlpha(0)

    const scene = new Scene()
    const camera = this.createCamera(this.#canvasWidth, this.#canvasHeigt)
    renderer.setSize(this.#canvasWidth, this.#canvasHeigt)

    for (let i = 0; i < 6; i++) {
      const light = new DirectionalLight()
      light.position.set(
        Math.cos(Math.PI * 2 / 6 * i + Math.PI / 2) * 6,
        0,
        Math.sin(Math.PI * 2 / 6 * i + Math.PI / 2) * 6
      )
      light.intensity = 0.5
      light.lookAt(0, 0, 0)
      scene.add(light)
    }
    const amb = new AmbientLight(0xFFFFFF, 1)
    scene.add(amb)

    /*
    this.#axes = createAxes()
    this.#axes.scale.set(100, 100, 100)
    scene.add(this.#axes)
    */

    for (let i = -10; i < 11; i++) {
      const g = new BoxGeometry(0.1, 0.1, 1)
      const m = new Mesh(g, new MeshStandardMaterial())
      m.position.y = i
      scene.add(m)
    }

    this.#threeRenderer = renderer
    this.#camera = camera
    this.#scene = scene
  }

  async loadMask() {
    const gltf = await loadModel(maskModelUrl)
    const container = new Group()
    const mask = gltf.scene

    mask.position.set(watchX, watchY + 0.5, watchZ + 0.5)
    mask.rotation.set(
      watchRX / 180 * Math.PI,
      watchRY / 180 * Math.PI,
      watchRZ / 180 * Math.PI,
    )
    mask.scale.setX(1.1)
    container.add(mask)
    this.#scene.add(container)

    this.#maskContainers.push(container)
    this.#mask = mask
  }

  private createCamera(width: number, height: number) {
    const aspect = width / height
    const camera = new PerspectiveCamera(90, aspect, 1, 10000)
    camera.position.set(0, 0, height);
    camera.lookAt(0, 0, 0)
    return camera
  }

  setCanvasSize(width: number, height: number) {
    this.#canvasWidth = width
    this.#canvasHeigt = height
    this.#threeRenderer.setSize(width, height)
    this.#camera = this.createCamera(width, height)
  }

  getCanvas() {
    return this.#threeRenderer.domElement
  }

  render(faces: { position: Vector3, q: Quaternion, scale: number }[]) {
    console.log(faces)
    this.#maskContainers.forEach((container, i) => {
      if (faces[i]) {
        const { position, q, scale } = faces[i]
        container.rotation.setFromQuaternion(q)
        container.position.set(position.x * 2 - this.#canvasWidth, this.#canvasHeigt + position.y * 2, 0)
        container.scale.set(scale, scale, scale)
        container.visible = true
      } else {
        container.visible = false
      }
    })
    this.#threeRenderer.render(this.#scene, this.#camera)
  }
}
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

  #maskContainer: Group | null = null
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
    if (this.#maskContainer) {
      throw new Error("Mask is already loaded")
    }
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

    this.#maskContainer = container
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

  render(position: Vector3, q: Quaternion, scale: number) {
    this.#maskContainer.rotation.setFromQuaternion(q)
    this.#maskContainer.position.set(position.x * 2 - this.#canvasWidth, this.#canvasHeigt + position.y * 2, 0)
    this.#maskContainer.scale.set(scale, scale, scale)
    /*
      const root2 = getVec2FromKP(face.keypoints[13])
      const middle2 = getVec2FromKP(face.keypoints[14])
      const ringPos2 = root2.clone().lerp(middle2, 0.8)
      const fingerRoot = ringPos2
      const pos = new Vector3(
        (fingerRoot.x - cameraVideo.videoWidth / 2) * 4 / cameraVideo.videoHeight,
        - (fingerRoot.y - cameraVideo.videoHeight / 2) * 4 / cameraVideo.videoHeight,
        0
      )
      ringContainer.position.lerp(pos, 0.5)

      const ringSize = root2.distanceTo(middle2) / 4
      const ringScale = ringSize / 60
      ringContainer.scale.set(ringScale, ringScale, ringScale)
    */
    this.#threeRenderer.render(this.#scene, this.#camera)
  }
}
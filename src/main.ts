import { Quaternion, Vector3 } from "three";
import CameraManager from "./CameraManager"
import FaceDetector from "./FaceDetector"
import { Renderer } from "./Renderer"
import "sanitize.css/sanitize.css"
import "./global.css"

async function main () {
  const mainCanvas = document.createElement("canvas")
  const mainContext = mainCanvas.getContext("2d")!
  document.body.appendChild(mainCanvas)

  const cameraManager = new CameraManager()
  const detector = new FaceDetector()
  const renderer = new Renderer()

  await detector.init()
  await cameraManager.start()
  await renderer.loadMask()
  await renderer.loadMask()
  await renderer.loadMask()

  const video = cameraManager.getVideo()
  const vw = video.videoWidth
  const vh = video.videoHeight
  renderer.setCanvasSize(vw, vh)
  mainCanvas.width = vw
  mainCanvas.height = vh
  mainCanvas.style.width = "100vw"
  mainCanvas.style.height = "100vh"
  mainCanvas.style.maxWidth = `calc(${vw / vh} * 100vh)`
  mainCanvas.style.maxHeight = `calc(${vh / vw} * 100vw)`

  const loop = async () => {
    const video = cameraManager.getVideo()
    const faces = await detector.estimate(video)
    renderer.render(faces.map(face => ({
      position: face.position,
      q: face.quaternion,
      scale: face.scale,
    })))
    mainContext.drawImage(video, 0, 0, mainCanvas.width, mainCanvas.height)
    mainContext.drawImage(renderer.getCanvas(), 0, 0, mainCanvas.width, mainCanvas.height)
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}
main()
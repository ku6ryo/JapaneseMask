import "@tensorflow/tfjs-backend-webgl"
import { createDetector, FaceLandmarksDetector, SupportedModels } from "@tensorflow-models/face-landmarks-detection"
import * as tf from "@tensorflow/tfjs-core"
import { getAvgVec3FromKPs, getVec3FromKP } from "./utils/getVecFromKeypoint"
import { Quaternion, Vector3 } from "three"

export default class FaceDetector {

  detector: FaceLandmarksDetector | null = null

  async init() {
    await tf.setBackend("webgl")
    this.detector = await createDetector(SupportedModels.MediaPipeFaceMesh, {
      runtime: "mediapipe",
      refineLandmarks: true,
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
    })
  }

  async estimate(input: HTMLVideoElement) {
    if (!this.detector) {
      throw new Error("No detector, please init first")
    }
    const estimations = await this.detector.estimateFaces(
      input,
      {
        flipHorizontal: false,
        staticImageMode: false,
      }
    );
    return estimations.map(face => {
      const { keypoints: kps } = face
      // calculate the average position of the face
      // If we use a single keypoint, noise is large.
      const leftEye = getAvgVec3FromKPs([
        kps[300],
        kps[383],
        kps[372],
        kps[345],
        kps[340],
        kps[365],
        kps[353],
        kps[276],
      ])
      const rightEye = getAvgVec3FromKPs([
        kps[70],
        kps[46],
        kps[124],
        kps[35],
        kps[111],
        kps[116],
        kps[143],
        kps[156],
      ])
      const tin = getAvgVec3FromKPs([
        kps[83],
        kps[18],
        kps[313],
        kps[421],
        kps[428],
        kps[199],
        kps[208],
        kps[201],
      ])
      const forehead = getAvgVec3FromKPs([
        kps[108],
        kps[151],
        kps[337],
        kps[336],
        kps[9],
        kps[107],
      ])
      const nose = getVec3FromKP(face.keypoints[1])

      const faceX = leftEye.clone().sub(rightEye).normalize()
      const faceY = forehead.clone().sub(tin).normalize()

      const modelX = new Vector3(1, 0, 0)
      const modelY = new Vector3(0, 1, 0)

      const ay = modelY.clone().cross(faceY).normalize()
      const qy = new Quaternion().setFromAxisAngle(ay, Math.acos(faceY.dot(modelY)))

      const rotatedX = modelX.clone().applyQuaternion(qy)
      const ax = rotatedX.clone().cross(faceX).normalize()
      const qx = new Quaternion().setFromAxisAngle(ax, Math.acos(faceX.dot(rotatedX)))

      const q = qx.clone().multiply(qy)
      return {
        axes: {
          x: faceX,
          y: faceY,
          z: faceX.clone().cross(faceY).normalize()
        },
        quaternion: q,
        position: nose,
        scale: leftEye.distanceTo(rightEye) * 1.35,
        raw: face
      }
    })
  }
}
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import { Vector2, Vector3 } from "three"

export function getVec3FromKP(keypoint: Keypoint): Vector3 {
  const { x, y, z } = keypoint
  return new Vector3(x, -y, z ? -z : 0)
}

export function getAvgVec3FromKPs(keypoints: Keypoint[]): Vector3 {
  return keypoints.reduce((r, kp) => {
    return r.add(getVec3FromKP(kp))
  }, new Vector3()).divideScalar(keypoints.length)
}

export function getVec2FromKP(keypoint: Keypoint): Vector2 {
  const { x, y } = keypoint
  return new Vector2(x, y)
}

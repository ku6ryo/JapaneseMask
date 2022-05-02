enum FacingMode {
  Front = "front",
  Back = "back"
}

export default class CameraManager {

  #video: HTMLVideoElement

  constructor() {
    this.#video = document.createElement("video")
  }

  /**
   * Gets camera stream from the device and sets it as the video source.
   * This function ensure that the image frames of the camera video is ready to be extracted.
   */
  async start() {
    return new Promise<void>(async (resolve) => {
      const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            // On the mobile device, it means that the front camera is preferred
            facingMode: "user",
            /*
            width: 1280,
            height: 720
            */
          }
      });
      this.#video.srcObject = stream;
      this.#video.onplaying = () => {
        resolve()
      }
      this.#video.play()
    })
  }

  getVideo() {
    return this.#video
  }
}
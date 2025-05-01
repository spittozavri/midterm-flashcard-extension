
import * as handpose from '@tensorflow-models/handpose';

let model: handpose.HandPose | null = null;
let videoStream: MediaStream | null = null;
let animationFrameId: number | null = null;

/**
 * Initializes webcam and returns a video element.
 */
export async function initWebcam(): Promise<HTMLVideoElement> {
    const video = document.getElementById('webcam-preview') as HTMLVideoElement;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    return video;
  }

/**
 * Loads the handpose model.
 */
export async function loadHandposeModel(): Promise<handpose.HandPose> {
  if (!model) {
    model = await handpose.load();
    console.log('[Handpose] Model loaded.');
  }
  return model;
}

/**
 * Starts detection loop and calls callback with predictions.
 */
export function detectHands(videoEl: HTMLVideoElement, onPrediction: (predictions: handpose.AnnotatedPrediction[]) => void): void {
  async function detectLoop() {
    if (!model || videoEl.readyState < 2) {
      animationFrameId = requestAnimationFrame(detectLoop);
      return;
    }

    const predictions = await model.estimateHands(videoEl, true);
    onPrediction(predictions);

    animationFrameId = requestAnimationFrame(detectLoop);
  }

  detectLoop();
}

/**
 * Stops the webcam and cancels detection.
 */
export function stopWebcam(): void {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }

  model = null;
}

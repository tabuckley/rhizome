const onxrloaded = () => {
  XR8.addCameraPipelineModule(LandingPage.pipelineModule())
  LandingPage.configure({
    mediaSrc: './assets/preview.jpg'
  })
  // Used by record-button.ts: 5 second clips with mic audio and no 8th Wall end card
  XR8.MediaRecorder.configure({
    maxDurationMs: 5000,
    enableEndCard: false,
    requestMic: 'auto',
  })
}
window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)


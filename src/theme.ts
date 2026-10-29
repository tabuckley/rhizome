// Colours, type and shared styles for every screen. The fonts are loaded in index.html.
// potato-home.jpg and potato-end.jpg are flattened onto PAPER, so change them too if it changes.
const PAPER = '#f5f3ef'
const INK = '#111'
const MUTED = '#6b6b6b'
const BODY = '#3a3a3a'
const RULE = '#cfcac2'
const CAMERA_STANDIN = '#dcd8d1'

const SERIF = `'Instrument Serif', serif`
const MONO = `'IBM Plex Mono', monospace`

// Keeps screens and bars clear of the notch and the home indicator (needs viewport-fit=cover)
const SAFE_TOP = 'calc(env(safe-area-inset-top) + 24px)'
const SAFE_BOTTOM = 'calc(env(safe-area-inset-bottom) + 24px)'

const LABEL_STYLE = `font: 11px ${MONO}; letter-spacing: 0.02em; color: ${MUTED};`

const BUTTON_STYLE = `
  height: 52px; border: 1px solid ${INK}; border-radius: 0; font: 13px ${MONO};
  letter-spacing: 0.02em; -webkit-tap-highlight-color: transparent;`
const PRIMARY_BUTTON_STYLE = `${BUTTON_STYLE} background: ${INK}; color: ${PAPER};`
const SECONDARY_BUTTON_STYLE = `${BUTTON_STYLE} background: none; color: ${INK};`

// A full-screen page over the camera
const SCREEN_STYLE = `
  position: fixed; inset: 0; z-index: 10000; background: ${PAPER}; color: ${INK};
  display: flex; flex-direction: column; overflow-y: auto; box-sizing: border-box;
  padding: ${SAFE_TOP} 24px ${SAFE_BOTTOM}; font-family: ${MONO};`

const makeButton = (label: string, style: string) => {
  const button = document.createElement('button')
  button.textContent = label
  button.style.cssText = style
  return button
}

export {
  PAPER,
  INK,
  MUTED,
  BODY,
  RULE,
  CAMERA_STANDIN,
  SERIF,
  MONO,
  SAFE_TOP,
  SAFE_BOTTOM,
  LABEL_STYLE,
  PRIMARY_BUTTON_STYLE,
  SECONDARY_BUTTON_STYLE,
  SCREEN_STYLE,
  makeButton,
}

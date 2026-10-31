import qrcode from 'qrcode-generator'
import {trackStep} from './analytics'
import homeImage from './assets/potato-home.jpg'
import {PAPER, INK, BODY, RULE, SERIF, MONO, LABEL_STYLE} from './theme'

// Shown on computers instead of 8th Wall's "open on your phone" page. AR only runs on phones, so
// the scene is never started here; the page just points people to their phone with a QR code.

// The QR code as an SVG drawn in INK, so it matches the page rather than the library's black
const qrSvg = (text: string) => {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  const count = qr.getModuleCount()
  let path = ''
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        path += `M${col},${row}h1v1h-1z`
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${count} ${count}"
    shape-rendering="crispEdges" style="display: block; width: 100%; height: 100%;">
    <path d="${path}" fill="${INK}"/></svg>`
}

const showDesktop = () => {
  // The site's own address, without any query, so the code opens the same page on the phone
  const url = `${window.location.origin}${window.location.pathname}`
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  const page = document.createElement('div')
  page.style.cssText = `
    position: fixed; inset: 0; z-index: 10000; background: ${PAPER}; color: ${INK};
    overflow-y: auto; box-sizing: border-box; padding: 32px 24px; font-family: ${MONO};`

  page.innerHTML = `
    <div style="max-width: 980px; min-height: 100%; margin: 0 auto; display: flex;
      flex-direction: column;">
      <div style="display: flex; justify-content: space-between; gap: 16px; ${LABEL_STYLE}">
        <span>potato patata</span><span>by maria de la o garrido</span>
      </div>
      <div style="height: 1px; background: ${INK}; margin-top: 12px;"></div>

      <div style="flex-grow: 1; display: flex; flex-wrap: wrap; align-items: center;
        justify-content: center; gap: 48px 72px; padding: 48px 0;">
        <img src="${homeImage}" alt="" style="height: min(520px, 62vh); width: auto; display: block;">

        <div style="flex: 0 1 400px; display: flex; flex-direction: column;">
          <h1 style="margin: 0; font: 52px/1.02 ${SERIF}; letter-spacing: -0.01em;">
            put down roots, and form a small rhizome.</h1>
          <p style="margin: 18px 0 0; font-size: 13px; line-height: 1.6; color: ${BODY};">
            place a potato in the world, record ten seconds of its visit and send it back.</p>

          <div style="margin-top: 36px; padding-top: 14px; border-top: 1px solid ${RULE};
            display: flex; gap: 20px; align-items: center;">
            <div style="width: 132px; height: 132px; flex-shrink: 0; padding: 10px;
              border: 1px solid ${INK}; box-sizing: border-box;">${qrSvg(url)}</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <span style="${LABEL_STYLE}">this happens on your phone</span>
              <span style="font: italic 24px/1.1 ${SERIF};">scan with your camera to open it there.</span>
              <span style="${LABEL_STYLE} color: ${INK};">${displayUrl}</span>
            </div>
          </div>
        </div>
      </div>

      <div style="height: 1px; background: ${RULE};"></div>
      <div style="${LABEL_STYLE} padding-top: 12px;">works on iphone and android</div>
    </div>`

  document.body.append(page)
  trackStep('desktop')
}

export {
  showDesktop,
}

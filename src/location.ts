// Approximate location of the person placing the potato, captured once from the intro screen.
// Rounded to 2 decimal places (~1 km) so it shows the town, not the exact address.
type Location = {latitude: number, longitude: number}

const LOCATION_TIMEOUT_MS = 10000

let location: Location | null = null

const round = (value: number) => Math.round(value * 100) / 100

// Resolves once the person has answered the prompt (and a position was found) or it times out.
// Never rejects: without a location the app still works, the upload just has no coordinates.
const requestLocation = () => new Promise<void>((resolve) => {
  if (!navigator.geolocation) {
    resolve()
    return
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      location = {
        latitude: round(position.coords.latitude),
        longitude: round(position.coords.longitude),
      }
      resolve()
    },
    () => resolve(),
    {enableHighAccuracy: false, timeout: LOCATION_TIMEOUT_MS, maximumAge: 10 * 60 * 1000}
  )
})

const getLocation = () => location

export {
  requestLocation,
  getLocation,
}

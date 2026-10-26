// Approximate location of the person sending the video, looked up from their IP address so there
// is no permission prompt. Usually right to the city, but can be off by a region on mobile data.
// Rounded to 2 decimal places (~1 km) so it shows the town, not an exact spot.
type Location = {latitude: number, longitude: number}

// Free, no key needed. Note it sees each sender's IP address.
const LOOKUP_URL = 'https://get.geojs.io/v1/ip/geo.json'
const LOOKUP_TIMEOUT_MS = 5000

const round = (value: number) => Math.round(value * 100) / 100

// Never rejects: without a location the upload still goes through, just without coordinates.
const lookupLocation = async (): Promise<Location | null> => {
  try {
    const response = await fetch(LOOKUP_URL, {signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS)})
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    const latitude = parseFloat(data.latitude)
    const longitude = parseFloat(data.longitude)
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return null
    }
    return {latitude: round(latitude), longitude: round(longitude)}
  } catch (err) {
    return null
  }
}

export {
  lookupLocation,
}

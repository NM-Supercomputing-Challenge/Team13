// ### Math

// const { PI, floor, cos, sin, atan2, log, log2, sqrt } = Math
const { PI } = Math

// Return random int/float in [0,max) or [min,max) or [-r/2,r/2)
export const randomInt = max => Math.floor(Math.random() * max)
export const randomInt2 = (min, max) =>
    min + Math.floor(Math.random() * (max - min))
export const randomFloat = max => Math.random() * max
export const randomFloat2 = (min, max) => min + Math.random() * (max - min)
export const randomCentered = r => randomFloat2(-r / 2, r / 2)

// Return float Gaussian normal with given mean, std deviation.
export function randomNormal(mean = 0.0, sigma = 1.0) {
    // Box-Muller
    const [u1, u2] = [1.0 - Math.random(), Math.random()] // ui in 0,1
    const norm = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * PI * u2)
    return norm * sigma + mean
}

// Two seedable random number generators
export function randomSeedSin(seed = PI / 4) {
    // ~3.4 million b4 repeat.
    // https://stackoverflow.com/a/19303725/1791917
    return () => {
        const x = Math.sin(seed++) * 10000
        return x - Math.floor(x)
    }
}
export function randomSeedParkMiller(seed = 123456) {
    // doesn't repeat b4 JS dies.
    // https://gist.github.com/blixt/f17b47c62508be59987b
    seed = seed % 2147483647
    return () => {
        seed = (seed * 16807) % 2147483647
        return (seed - 1) / 2147483646
    }
}
// Replace Math.random with one of these
export function randomSeed(seed, useParkMiller = true) {
    Math.random = useParkMiller
        ? randomSeedParkMiller(seed)
        : randomSeedSin(seed)
}

export function precision(num, digits = 4) {
    if (Array.isArray(num)) return num.map(val => this.precision(val, digits))
    const mult = 10 ** digits
    return Math.round(num * mult) / mult
}

// export function precision(num, digits = 4) {
//     const mult = 10 ** digits
//     return Math.round(num * mult) / mult
// }

// Return whether num is [Power of Two](http://goo.gl/tCfg5). Very clever!
export const isPowerOf2 = num => (num & (num - 1)) === 0 // twgl library
// Return next greater power of two. There are faster, see:
// [Stack Overflow](https://goo.gl/zvD78e)
export const nextPowerOf2 = num => Math.pow(2, Math.ceil(Math.log2(num)))

// A [modulus](http://mathjs.org/docs/reference/functions/mod.html) function.
// The modulus is defined as: x - y * floor(x / y)
// It is not %, the remainder function.
export const mod = (v, n) => ((v % n) + n) % n // v - n * Math.floor(v / n)
// Wrap v around min, max values if v outside min, max
export const wrap = (v, min, max) => min + mod(v - min, max - min)
// Clamp a number to be between min/max.
// Much faster than Math.max(Math.min(v, max), min)
export function clamp(v, min, max) {
    if (v < min) return min
    if (v > max) return max
    return v
}
// Return true is val in [min, max] enclusive
export const between = (val, min, max) => min <= val && val <= max

// Return a linear interpolation between lo and hi.
// Scale is in [0-1], a percentage, and the result is in [lo,hi]
// If lo>hi, scaling is from hi end of range.
// [Why the name `lerp`?](http://goo.gl/QrzMc)
export const lerp = (lo, hi, scale) =>
    lo <= hi ? lo + (hi - lo) * scale : lo - (lo - hi) * scale
// Calculate the lerp scale given lo/hi pair and a number between them.
// Clamps number to be between lo & hi.
export function lerpScale(number, lo, hi) {
    if (lo === hi) throw Error('lerpScale: lo === hi')
    number = clamp(number, lo, hi)
    return (number - lo) / (hi - lo)
}

// ### Geometry

// Degrees & Radians
// Note: quantity, not coord system xfm
const toDegrees = 180 / PI
const toRadians = PI / 180
export const radians = degrees => mod2pi(degrees * toRadians)
export const degrees = radians => mod360(radians * toDegrees)

// Better names and format for arrays. Change above?
export const degToRad = degrees => mod2pi(degrees * toRadians)
export const degToRadAll = array => array.map(deg => degToRad(deg))

export const radToDeg = radians => mod360(radians * toDegrees)
export const radToDegAll = array => array.map(rad => radToDeg(rad))

// Heading & Angles: coord system
// * Heading is 0-up (y-axis), clockwise angle measured in degrees.
// * Angle is euclidean: 0-right (x-axis), counterclockwise in radians
export function angleToHeading(radians) {
    const deg = radians * toDegrees
    return mod(90 - deg, 360)
}
export function headingToAngle(heading) {
    const deg = mod(90 - heading, 360)
    return deg * toRadians
}
// AltAz: Alt is deg from xy plane, 180 up, -180 down, Az is heading
// We choose Phi radians from xy plane, "math" is often from Z axis
// REMIND: some prefer -90, 90
export function altAzToAnglePhi(alt, az) {
    const angle = headingToAngle(az)
    const phi = modpipi(alt * toRadians)
    return [angle, phi]
}
export function anglePhiToAltAz(angle, phi) {
    const az = angleToHeading(angle)
    const alt = mod180180(phi * toDegrees)
    return [alt, az]
}

export function mod360(degrees) {
    return mod(degrees, 360)
}
export function mod2pi(radians) {
    return mod(radians, 2 * PI)
}
export function mod180180(degrees) {
    return mod360(degrees) - 180
}
export function modpipi(radians) {
    return mod2pi(radians) - PI
}

export function headingsEqual(heading1, heading2) {
    return mod360(heading1) === mod360(heading2)
}
export function anglesEqual(angle1, angle2) {
    return mod2pi(angle1) === mod2pi(angle2)
}

// Return angle (radians) in (-pi,pi] that added to rad0 = rad1
// See NetLogo's [subtract-headings](http://goo.gl/CjoHuV) for explanation
export function subtractRadians(rad1, rad0) {
    // let dr = mod(rad1 - rad0, 2 * PI)
    let dr = mod2pi(rad1 - rad0)
    if (dr > PI) dr = dr - 2 * PI
    return dr
}
// Above using headings (degrees) returning degrees in (-180, 180]
export function subtractHeadings(deg1, deg0) {
    let dAngle = mod360(deg1 - deg0)
    if (dAngle > 180) dAngle = dAngle - 360
    return dAngle
}

// Return angle in [-pi,pi] radians from (x,y) to (x1,y1)
// [See: Math.atan2](http://goo.gl/JS8DF)
export const radiansToward = (x, y, x1, y1) => Math.atan2(y1 - y, x1 - x)
// Above using headings (degrees) returning degrees in [-90, 90]
export function headingToward(x, y, x1, y1) {
    return heading(radiansToward(x, y, x1, y1))
}

// Return distance between (x, y), (x1, y1)
export const sqDistance = (x, y, x1, y1) => (x - x1) ** 2 + (y - y1) ** 2
export const distance = (x, y, x1, y1) => Math.sqrt(sqDistance(x, y, x1, y1))

export const sqDistance3 = (x, y, z, x1, y1, z1) =>
    (x - x1) ** 2 + (y - y1) ** 2 + (z - z1) ** 2
export const distance3 = (x, y, z, x1, y1, z1) =>
    Math.sqrt(sqDistance3(x, y, z, x1, y1, z1))

// Return true if x,y is within cone.
// Cone: origin x0,y0 in direction angle, with coneAngle width in radians.
// All angles in radians
export function inCone(x, y, radius, coneAngle, angle, x0, y0) {
    if (sqDistance(x0, y0, x, y) > radius * radius) return false
    const angle12 = radiansToward(x0, y0, x, y) // angle from 1 to 2
    return coneAngle / 2 >= Math.abs(subtractRadians(angle, angle12))
}

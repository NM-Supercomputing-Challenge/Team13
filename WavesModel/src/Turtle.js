// import Color from './Color.js'
import AgentArray from './AgentArray.js'
import util from './util.js'

// Flyweight object creation, see Patch/Patches.

// Class Turtle instances represent the dynamic, behavioral element of modeling.
// Each turtle knows the patch it is on, and interacts with that and other
// patches, as well as other turtles.

export default class Turtle {
    static defaultVariables() {
        return {
            // Core variables for turtles.
            // turtle's position: x, y, z.
            // Generally z set to constant via turtles.setDefault('z', num)
            // x: 0,
            // y: 0,
            // z: 0,
            // my euclidean direction, radians from x axis, counter-clockwise
            // theta: null, // set to random if default not set by modeler
            // What to do if I wander off world. Can be 'clamp', 'wrap'
            // 'bounce', or a function, see handleEdge() method
            atEdge: 'wrap',
        }
    }
    // Initialize a Turtle given its Turtles AgentSet.
    constructor() {
        Object.assign(this, Turtle.defaultVariables())
    }
    agentConstructor() {
        this.theta = null
        this.x = 0
        this.y = 0
        this.agentSet.setDefault('z', null)
    }

    die() {
        this.agentSet.removeAgent(this) // remove me from my baseSet and breed
        // Remove my links if any exist.
        // Careful: don't promote links
        if (this.hasOwnProperty('links')) {
            while (this.links.length > 0) this.links[0].die()
        }
        // Remove me from patch.turtles cache if patch.turtles array exists
        // if (this.patch.turtles != null) {
        //     util.removeArrayItem(this.patch.turtles, this)
        // }
        if (this.patch && this.patch.turtles)
            util.removeArrayItem(p0.turtles, this)

        // Set id to -1, indicates that I've died.
        // Useful when other JS objects contain turtles. Views for example.
        this.id = -1
    }

    // Factory: create num new turtles at this turtle's location. The optional init
    // proc is called on the new turtle after inserting in its agentSet.
    hatch(num = 1, breed = this.agentSet, init = turtle => {}) {
        return breed.create(num, turtle => {
            // turtle.setxy(this.x, this.y)
            turtle.setxy(this.x, this.y, this.z)
            // hatched turtle inherits parents' ownVariables
            for (const key of breed.ownVariables) {
                if (turtle[key] == null) turtle[key] = this[key]
            }
            init(turtle)
        })
    }
    // Getter for links for this turtle. REMIND: use new AgentSet(0)?
    // Uses lazy evaluation to promote links to instance variables.
    // REMIND: Let links create the array as needed, less "tricky"
    get links() {
        // lazy promote links from getter to instance prop.
        Object.defineProperty(this, 'links', {
            value: new AgentArray(0),
            enumerable: true,
        })
        return this.links
    }
    // Getter for the patch I'm on. Return null if off-world.
    get patch() {
        return this.model.patches.patch(this.x, this.y)
    }

    // Heading vs Euclidean Angles. Direction for clarity when ambiguity.
    // get heading() {
    //     return util.angleToHeading(this.theta)
    // }
    // set heading(heading) {
    //     this.theta = util.headingToAngle(heading)
    // }
    // get direction() {
    //     return this.theta
    // }
    // set direction(theta) {
    //     this.theta = theta
    // }

    // Set x, y position. If z given, override default z.
    // Call handleEdge(x, y) if x, y off-world.
    setxy(x, y, z = undefined) {
        const p0 = this.patch

        this.x = x
        this.y = y
        if (z != null) this.z = z

        this.checkXYZ(p0)
    }
    checkXYZ(p0) {
        this.checkEdge()
        this.checkPatch(p0)
    }
    checkEdge() {
        const { x, y, z } = this
        // if (!(this.model.world.isOnWorld(x, y, z) || this.atEdge === 'OK')) {
        if (!this.model.world.isOnWorld(x, y, z) && this.atEdge !== 'OK') {
            this.handleEdge(x, y, z)
        }
    }
    checkPatch(p0) {
        const p = this.patch

        if (p != p0) {
            if (p0 && p0.turtles) util.removeArrayItem(p0.turtles, this)
            if (p && p.turtles) p.turtles.push(this)
        }
        // if (p && p.turtles != null && p !== p0) {
        //     // util.removeItem(p0.turtles, this)
        //     if (p0) util.removeArrayItem(p0.turtles, this)
        //     p.turtles.push(this)
        // }
    }
    // Handle turtle x,y,z if turtle off-world
    handleEdge(x, y, z = undefined) {
        let atEdge = this.atEdge

        if (util.isString(atEdge)) {
            const {
                minXcor,
                maxXcor,
                minYcor,
                maxYcor,
                minZcor,
                maxZcor,
            } = this.model.world

            if (atEdge === 'wrap') {
                this.x = util.wrap(x, minXcor, maxXcor)
                this.y = util.wrap(y, minYcor, maxYcor)
                if (z != null) this.z = util.wrap(z, minZcor, maxZcor)
            } else if (atEdge === 'clamp' || atEdge === 'bounce') {
                this.x = util.clamp(x, minXcor, maxXcor)
                this.y = util.clamp(y, minYcor, maxYcor)
                if (z != null) this.z = util.clamp(z, minZcor, maxZcor)

                if (atEdge === 'bounce') {
                    if (this.x === minXcor || this.x === maxXcor) {
                        this.theta = Math.PI - this.theta
                    } else if (this.y === minYcor || this.y === maxYcor) {
                        this.theta = -this.theta
                    } else if (this.z === minZcor || this.z === maxZcor) {
                        if (this.pitch) {
                            this.pitch = -this.pitch
                        } else {
                            this.z = util.wrap(z, minZcor, maxZcor)
                        }
                    }
                }
            } else {
                throw Error(`turtle.handleEdge: bad atEdge: ${atEdge}`)
            }
        } else {
            atEdge(this)
        }
    }
    // Place the turtle at the given patch/turtle location
    moveTo(agent) {
        // this.setxy(agent.x, agent.y)
        this.setxy(agent.x, agent.y, agent.z)
    }
    // Move forward (along theta) d units (patch coords),
    forward(d) {
        this.setxy(
            this.x + d * Math.cos(this.theta),
            this.y + d * Math.sin(this.theta)
        )
    }

    // Also used by turtles.create()
    // setTheta(rad) {
    //     this.theta = util.mod(rad, Math.PI * 2)
    // }
    // Change current direction by rad radians which can be + (left) or - (right).
    rotate(rad) {
        // this.theta = util.mod(this.theta + rad, Math.PI * 2)
        this.theta = util.mod2pi(this.theta + rad)
    }
    right(rad) {
        this.rotate(-rad)
    }
    left(rad) {
        this.rotate(rad)
    }

    // Set my direction towards turtle/patch or x,y.
    face(agent) {
        this.theta = this.towards(agent)
    }
    facexy(x, y) {
        this.theta = this.towardsXY(x, y)
    }

    // Return the patch ahead of this turtle by distance (patchSize units).
    // Return undefined if off-world.
    patchAhead(distance) {
        return this.patchAtAngleAndDistance(this.theta, distance)
    }
    // Use patchAhead to determine if this turtle can move forward by distance.
    canMove(distance) {
        return this.patchAhead(distance) != null
    } // null / undefined
    patchLeftAndAhead(angle, distance) {
        return this.patchAtAngleAndDistance(angle + this.theta, distance)
    }
    patchRightAndAhead(angle, distance) {
        return this.patchAtAngleAndDistance(angle - this.theta, distance)
    }

    // 6 methods in both Patch & Turtle modules
    // Distance from me to x, y.
    // 2.5D: use z too if both z & this.z exist.
    // REMIND: No off-world test done
    distanceXY(x, y, z = null) {
        const useZ = z != null && this.z != null
        return useZ
            ? util.distance3(this.x, this.y, this.z, x, y, z)
            : util.distance(this.x, this.y, x, y)
    }
    // Return distance from me to object having an x,y pair (turtle, patch, ...)
    // 2.5D: use z too if both agent.z and this.z exist
    // distance (agent) { this.distanceXY(agent.x, agent.y) }
    distance(agent) {
        const { x, y, z } = agent
        return this.distanceXY(x, y, z)
    }
    // sqDistance(agent) {
    //     return util.sqDistance(this.x, this.y, agent.x, agent.y)
    // }
    get dx() {
        return Math.cos(this.theta)
    }
    get dy() {
        return Math.sin(this.theta)
    }

    // Return angle towards agent/x,y
    // Use util.angleToHeading to convert to heading
    towards(agent) {
        return this.towardsXY(agent.x, agent.y)
    }
    towardsXY(x, y) {
        return util.radiansToward(this.x, this.y, x, y)
    }
    // Return patch w/ given parameters. Return undefined if off-world.
    // Return patch dx, dy from my position.
    patchAt(dx, dy) {
        return this.model.patches.patch(this.x + dx, this.y + dy)
    }
    // Note: angle is absolute, w/o regard to existing angle of turtle.
    // Use Left/Right versions for angle-relative.
    patchAtAngleAndDistance(angle, distance) {
        return this.model.patches.patchAtAngleAndDistance(this, angle, distance)
    }

    // Link methods. Note: this.links returns all links linked to me.
    // See links getter above.

    // Return other end of link from me. Link must include me!
    otherEnd(l) {
        return l.end0 === this ? l.end1 : l.end0
    }
    // Return all turtles linked to me
    linkNeighbors() {
        return this.links.map(l => this.otherEnd(l))
    }

    isLinkNeighbor(t) {
        // const linkNeighbors = this.linkNeighbors()
        return t in this.linkNeighbors()
    }
}

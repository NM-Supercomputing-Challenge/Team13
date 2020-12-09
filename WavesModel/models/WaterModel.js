import World from '../src/World.js'
import Model from '../src/Model.js'
import util from '../src/util.js'

// Derived from Cody's water model.
export default class WaterModel extends Model {
    static defaultOptions() {
        return {
            strength: 20,
            surfaceTension: 56,
            friction: 0.99,
            drip: 50,
            distance: 20,
        }
    }

    // ======================

    constructor(worldDptions = World.defaultOptions(50)) {
        super(worldDptions)
        Object.assign(this, WaterModel.defaultOptions())
    }
    setup() {
        //setup patches
        this.patches.ask(p => {
            p.zpos = 0
            p.deltaZ = 0
        })

        //setup emitter
        this.turtles.create(1, t => {
            t.setxy(0, 0)
        })

        let xcor = util.randomFloat2(-1.0,1.0) * this.distance
        let ycor = Math.sqrt(Math.pow(this.distance,2) - Math.pow(xcor,2))
        //setup receiver
        this.turtles.create(1, t => {
            t.setxy(xcor, ycor)
        })
    }
    

    step() {
    //send initial signal
        if (this.ticks === 0) this.patches.patchRectXY(0, 0, 0, 0).ask(p => {
            p.zpos = this.strength
        })
        
    //check for response and send response signal
        if (this.patches.patchRectXY(10, 10, 3, 3).zpos > 0) this.patches.patchRectXY(10, 10, 3, 3).ask(p => {
            p.zpos = this.strength
        })
        console.log(this.patches.patchRectXY(10, 10, 3, 3).zpos)
        this.patches.ask(p => this.computeDeltaZ(p))
        this.patches.ask(p => this.updateZ(p))
        
    }

    createWave(p) {
        p.zpos = this.strength
    }
    computeDeltaZ(p) {
        const k = 1 - 0.01 * this.surfaceTension
        const n = p.neighbors4
        p.deltaZ = p.deltaZ + k * (n.sum('zpos') - n.length * p.zpos)
    }
    updateZ(p) {
        p.zpos = (p.zpos + p.deltaZ) * this.friction
    }

    // Used by modeler for reporting stats, not needed by model itself
    averageZpos() {
        return this.patches.props('zpos').sum() / this.patches.length
    }
}

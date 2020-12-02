import World from '../src/World.js'
import Model from '../src/Model.js'

// Derived from Cody's water model.
export default class WaterModel extends Model {
    static defaultOptions() {
        return {
            strength: 100,
            surfaceTension: 56,
            friction: 0.99,
            drip: 50,
        }
    }

    // ======================

    constructor(worldDptions = World.defaultOptions(50)) {
        super(worldDptions)
        Object.assign(this, WaterModel.defaultOptions())
    }
    setup() {
        this.patches.ask(p => {
            p.zpos = 0
            p.deltaZ = 0
        })
    }

    step() {
        if (this.ticks === 0) this.createWave(this.patches.patchRectXY(0, 0, 3, 3)) //specific patch?
        this.patches.ask(p => this.computeDeltaZ(p))
        this.patches.ask(p => this.updateZ(p))
        if (this.patches.patchRectXY(200, 200, 3, 3).zpos != 0) this.createWave(this.patches.patchRectXY(200, 200, 3, 3)) //var as some distance awayt

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

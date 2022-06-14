export class Environment extends Entity {
    constructor () {
        super()
        this.addComponent(new Transform({
            position: new Vector3(16,0.02,16)
        }))
        this.addComponent(new GLTFShape("models/Environment.glb"))
        engine.addEntity(this)
    }
}
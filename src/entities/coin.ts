import * as utils from '@dcl/ecs-scene-utils'
import { audioclips } from './audioclips'

export class Coin extends Entity {
    constructor(
        position: Vector3
    ) {
        super()

        const triggerBoxShape = new utils.TriggerBoxShape(
            new Vector3(1.5, 3, 1.5),
            new Vector3(0, 1, 0)
          ) // Trigger shape for coin

        this.addComponent(new GLTFShape("models/Cansy.glb"))
        this.addComponent(new Transform({position:position}))

        this.addComponent(new AudioSource(audioclips.coin))

        engine.addEntity(this)

        // Create trigger for coin
        this.addComponent(
            new utils.TriggerComponent(triggerBoxShape, {
            onCameraEnter: () => {
                // Camera enter
                this.getComponent(Transform).scale.setAll(0)
                this.getComponent(AudioSource).playOnce()
            },
            onCameraExit: () => {
                // Camera exit
                engine.removeEntity(this)
            },
            })
        )
    }

}
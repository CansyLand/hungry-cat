import { Component, components } from "./components"
import { sItem } from "./realmManager"

export class Item extends Entity {
    
    itemID: string
    component: Component
    isGrabbed: boolean = false
    isGrabbable: boolean = true
    
    GROUND_HEIGHT: number = 0.1
    
    
    constructor( 
        itemID: string,
        position: Vector3,
        component: Component,
        isGrabbable: boolean = true,
        rotation?: Quaternion
    ) {
        super()

        this.itemID = itemID
        this.component = component
        this.isGrabbable = isGrabbable

        this.addComponent(this.component.shape)
        this.addComponent(new Transform({
            position: position,
            rotation: rotation? rotation:this.randomRotation()
        }))

        if (this.isGrabbable) {
            this.addComponent(
                new OnPointerDown(
                    () => {
                                     
                    },
                    {
                        hoverText: 'Pick Up',
                        distance: 2
                    }
                )
            )
        }
    }

    public spawn(): void {
        engine.addEntity(this)
    }

    public destroy(): void {
        engine.removeEntity(this)
    }

    public newIdentity(sItem: sItem): void {
        this.itemID = sItem.itemID
        const transform = this.getComponent(Transform)
        transform.position.x = sItem.x
        transform.position.y = sItem.y
        transform.position.z = sItem.z
        transform.rotation = this.randomRotation()
        this.component = components[sItem.componentID]
        this.addComponentOrReplace(components[sItem.componentID].shape)
    }

    private randomRotation(): Quaternion {
        function r() {return Math.random()*360}
        return new Quaternion().setEuler(r(),r(),r())
    }

    public updateGrabDistance(grabDistance:number): void {
        this.addComponentOrReplace( 
            new OnPointerDown(
            () => { },
            {
                hoverText: 'Pick Up',
                distance: grabDistance
            }
        ))
    }

    public correctError() {
        if (this.hasComponent(Transform)) {
            let pos = this.getComponent(Transform).position
            if (pos.x < 0.5 || pos.z < 0.5) {
                pos.x = this.random()
                pos.z = this.random()
            }
                
        }
    }

    private random(): number {
        return Math.random()*15+0.5
    }

    private randomPosition(): Vector3 {
        function r() {
            return Math.random()*15+0.5
         }
        return new Vector3(r(),this.GROUND_HEIGHT,r()) 
    }

    public avatarGrabbing(): void {
        this.isGrabbed = true
        const pos = this.getComponent(Transform).position
        pos.x = 0
        pos.y = -0.85
        pos.z = 0.45
    }

    // private isInsideBounds(transform: Transform): boolean {
    //     if( 0 < transform.position.x 
    //         && 16 > transform.position.x 
    //         && 0 < transform.position.y 
    //         && 16 > transform.position.y  ) {
    //             return true
    //         } else {
    //             return false
    //         }            
    // }

} 
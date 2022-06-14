import { UserData } from "@decentraland/Identity"
import { fireBaseServer } from "./firebase"
import { Item } from "./item"
import { RealmManager } from "./realmManager"
import { audioclips } from './audioclips'

type sPlayer = {
    publicKey: string,
    displayName: string,
    score: number,
    lastLogin: any,
    creation: any
}

export class Player {

    userData: UserData | null
    isGrabbing: boolean = false
    grabbedItem: Item | null | undefined

    audio: Entity

    private Z_OFFSET: number = 0.7
    private Y_OFFSET: number = 0
    private GROUND_HEIGHT: number = 0.1

    constructor(
        userData: UserData | null
    ) {
       
        
        this.userData = userData

        log("publicKey: " + this.userData?.publicKey)
        log("displayName: " + this.userData?.displayName)
        log("hasConnectedWeb3: " + this.userData?.hasConnectedWeb3)


        this.audio = new Entity()
        engine.addEntity(this.audio)
        this.audio.setParent(Attachable.AVATAR)

    }

    public async handshake() {
        if (!this.userData?.hasConnectedWeb3)
            return

        let url = fireBaseServer + "/handshake?"
            url += "pubKey=" + this.userData.publicKey + "&"
            url += "displayName=" + this.userData.displayName 

        try {
            let response = await fetch(url)
            log(response)
            let data = await response.json() as sPlayer
            log('Handshake: ', data.score) 
            return data 

          } catch {
            log('error fetching from server ', url)
          }
    }

    public pickUp(item: Item): void {
        if (!item.isGrabbable)
            return 
      
        this.isGrabbing = true
        this.grabbedItem = item
        this.grabbedItem.isGrabbed = true
        
        // Calculates the item's position relative to the camera
        const transform = item.getComponent(Transform) 
        transform.position = Vector3.Zero()
        transform.rotation = Quaternion.Zero()
        transform.position.z += this.Z_OFFSET
        transform.position.y = this.Y_OFFSET
        //transform.rotation = Quaternion.Zero()

        this.grabbedItem.setParent(Attachable.AVATAR)

        this.pickUpSound()
    }

    public dropItemInto(realmManager: RealmManager): Item | undefined {

        if (this.grabbedItem && !this.grabbedItem.isGrabbed) return
        this.isGrabbing = false
        if(this.grabbedItem) {
     
            const transform = this.grabbedItem.getComponent(Transform) 

            const forwardVector: Vector3 = Vector3.Forward()
                .scale(this.Z_OFFSET)
                .rotate(Camera.instance.rotation)
                       
            transform.position = Camera.instance.position.clone().add(forwardVector)
            transform.lookAt(Camera.instance.position)
            transform.rotation.x = 0
            transform.rotation.z = 0
            transform.position.y = this.GROUND_HEIGHT

            this.dropSound()

            this.grabbedItem.setParent(realmManager)
        
            this.grabbedItem.isGrabbed = false
            return this.grabbedItem
        }
    }
    
    private pickUpSound() {
        this.audio.addComponentOrReplace(new AudioSource(audioclips.pickUp))
        this.audio.getComponent(AudioSource).playing = true
    }

    private dropSound() {
        this.audio.addComponentOrReplace(new AudioSource(audioclips.throw))
        this.audio.getComponent(AudioSource).playing = true
    }

}


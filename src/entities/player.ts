import { UserData } from "@decentraland/Identity"
import { fireBaseServer } from "./firebase"
import { Item } from "./item"
import { RealmManager } from "./realmManager"

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

    private Z_OFFSET: number = 0.7
    private GROUND_HEIGHT: number = 0.1

    constructor(
        userData: UserData | null
    ) {
       
        
        this.userData = userData

        log("publicKey: " + this.userData?.publicKey)
        log("displayName: " + this.userData?.displayName)
        log("hasConnectedWeb3: " + this.userData?.hasConnectedWeb3)

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
        transform.position.y = 0.5
        //transform.rotation = Quaternion.Zero()

        this.grabbedItem.setParent(Attachable.AVATAR)
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

            // hack for bug which causes items to drop at 0,0,0    
            // if (Camera.instance.position.x == 0 ) {
            //     transform.position.x = x
            //     transform.position.z = z
            // }

            this.grabbedItem.setParent(realmManager)
        
            this.grabbedItem.isGrabbed = false
            return this.grabbedItem
        }
                 


    }


}


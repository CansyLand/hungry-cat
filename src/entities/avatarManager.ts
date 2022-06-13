import { audioclips } from "./audioclips"

export class AvatarManager {
    avatarList: Avatar[] = []
    constructor () {

    }

    public addAvatar(playerID:string): Avatar {
        const avatar = new Avatar(playerID)
        this.avatarList.push(avatar)
        return avatar
    }
    
    public getAvatarByID(avatarID:string): Avatar {
        this.avatarList.forEach(avatar => {
            if (avatar.playerID == avatarID)
                return avatar
        })
        return this.addAvatar(avatarID)
    }

    public removeAvatar(avatarID:string): void {
        engine.removeEntity(this.getAvatarByID(avatarID))
        for( var i = 0; i < this.avatarList.length; i++){ 
            if ( this.avatarList[i].playerID === avatarID ) { 
                this.avatarList.splice(i, 1); 
            }
        }
    }
}

export class Avatar extends Entity {
    playerID: string
    constructor(
        playerID: string
    ) {
        super()
        engine.addEntity(this)
        this.playerID = playerID
        this.addComponent(
            new AttachToAvatar({
                avatarId: playerID,
                anchorPointId: AttachToAvatarAnchorPointId.NameTag
            })
        )
    }

    public pickUpSound() {
        this.addComponentOrReplace(new AudioSource(audioclips.pickUp))
        this.getComponent(AudioSource).playing = true
    }

    public dropSound() {
        this.addComponentOrReplace(new AudioSource(audioclips.throw))
        this.getComponent(AudioSource).playing = true
    }
}
import { fireBaseServer } from "./firebase"

const FONT_SIZE = 5

const HEIGHT = 5
const SHIFT_LINE = 0.5
const SHIFT_SCORE = 4

type LeaderboardText = {
    displayName:Entity,
    score:Entity,
}
type serverLeaderbordEntry = {
    displayName:string,
    score:number,
}

export class Leaderboard extends Entity {
    list: LeaderboardText[] = []

    constructor(
        position: Vector3,
        rotation: Quaternion
    ) {
        super()

        this.addComponent(new Transform({
            position: position,
            rotation: rotation
        }))

        // create the leaderboard text-line entities
        for(let i=0; i<6; i++) {
            this.list[i] = this.newLine(i, "Player", 0)
        }

        this.update()

        engine.addEntity(this)

    }
    async update(): Promise<boolean> {

        const url = fireBaseServer + "/leaderboard"
        try {
            let response = await fetch(url)
            let data = await response.json() as serverLeaderbordEntry[]

            let i = 0
            data.forEach(element => {
                this.updateLine(i, element.displayName, element.score)
                i++
            })
            return true
        } catch (err) {
            log(err)
            return false
        }
    }

    private newLine(pos:number, displayName:string, score:number|string): LeaderboardText {
        if (typeof score == "number") 
            score = score.toString()
        
        const shiftLine = SHIFT_LINE * pos
        
        const textName = new Entity()
        textName.addComponent(new Transform({
            position: new Vector3(0,5-shiftLine, 0)
        }))
        textName.addComponent(new TextShape(displayName))
        textName.getComponent(TextShape).fontSize = FONT_SIZE
        textName.getComponent(TextShape).hTextAlign = "left"
        textName.setParent(this)

        const textScore = new Entity()
        textScore.addComponent(new Transform({
            position: new Vector3(SHIFT_SCORE ,HEIGHT-shiftLine, 0)
        }))
        textScore.addComponent(new TextShape(score))
        textScore.getComponent(TextShape).fontSize = FONT_SIZE
        textScore.getComponent(TextShape).hTextAlign = "right"
        textScore.setParent(this)

        return {displayName:textName, score:textScore} 
    }

    public updateLine(pos:number, displayName:string, score:number|string): void {
        if (typeof score == "number") 
            score = score.toString()
        
        displayName = displayName.split("#")[0]

        const item = this.list[pos]
        item.displayName.getComponent(TextShape).value = displayName
        item.score.getComponent(TextShape).value = score
    }

    public updateScore(score:number) {
        const oldScore:number = +this.list[this.list.length-1].score.getComponent(TextShape).value 
        this.list[this.list.length-1].score.getComponent(TextShape).value = (oldScore + score).toString() 
    }
}

export class ScoreTextManager extends Entity {
    
    scoresList: ScoreText[]
    index: number = 0

    constructor (
        count: number
    ) {
        super()
        this.scoresList = this.init(count)

        engine.addSystem(new SimpleMove(this.scoresList))

    }

    private init(count:number): ScoreText[] {
        let list: ScoreText[] = []
        for (let index = 0; index < count; index++) {
            const scoreText = new ScoreText()
            list[index] = scoreText
            scoreText.setParent(this)
        }
        return list
    }

    public spawn(newValue:any) {
        const text = this.scoresList[this.index]
        text.spawn(newValue)
        text.active = true

        this.index ++
        if (this.index > this.scoresList.length)
            this.index = 0
    }
}


class ScoreText extends Entity {
    active: boolean = false
    constructor () {
        super()
        const textShape = new TextShape("000")
        textShape.fontSize = 5
        this.addComponent(textShape)
        this.addComponent(new Transform({
            position: new Vector3(this.r(2),-0.5,this.r(2))
        }))
        this.addComponent(new Billboard(false,true,false))
    }

    private r(n:number) {
        return Math.random() * n*2 -n
    }
    private rq() {
        return Math.random() * 2 -1
    }

    public value(newValue:any) {
        const textShape = this.getComponent(TextShape)
        textShape.color = Color3.White()
        if (typeof newValue === "number") {
            if (newValue < 0) {
                textShape.color = Color3.Red()
                newValue = newValue.toString()
            }  else {
                newValue = "+ " + newValue.toString()
            }
        }
        textShape.value = newValue.toString()
    }

    public spawn(newValue:any) {
        this.value(newValue)
        this.getComponent(Transform).position.y = Math.random()* 2
    }
}


export class SimpleMove implements ISystem {
    scoreList: ScoreText[]
    constructor( scoreList: ScoreText[] ) {
        this.scoreList = scoreList
    }

    update(dt: number) {
        this.scoreList.forEach(element => {
            if (element.active) {
                const transform = element.getComponent(Transform)
                const distance = Vector3.Up().scale(0.05)
                transform.translate(distance)

                if (isOutOfBounds(transform)) {
                    element.active = false
                    transform.position.y = -0.5
                }
            }
        })
    }
}

function isOutOfBounds(transform: Transform) {
        if (
            transform.position.y >  8 // ||
            // transform.position.x >  7 ||
            // transform.position.z >  7 ||
            // transform.position.x < -7 ||
            // transform.position.z < -7
        ) {
            return true
        }
            return false
    }

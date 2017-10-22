export default class Level {
  data: Array<number>
  id: number
  goal: Array<Object>

  constructor(levelId: number = 0) {
    const spec = config.level[levelId]
    
    this.id = spec.id
    this.data = spec.data
    this.goal = spec.goal
  }
}
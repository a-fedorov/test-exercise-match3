export default class Level {
  data: Array<number>
  id: number
  mission: any
  missionCounter: {
    type: number,
    value: number
  }

  constructor(levelId: number = 0) {
    const spec = config.level[levelId]
    
    this.id = spec.id
    this.data = spec.data
    this.mission = spec.mission
    
    this.missionCounter = {
      type: this.mission.type,
      value: 0
    }
  }

  isComplete(): boolean {
    if (this.missionCounter.value === this.mission.amount) {
      return true
    }
    return false
  }
}
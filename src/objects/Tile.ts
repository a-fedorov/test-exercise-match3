import 'phaser'

export default class Tile extends Phaser.Sprite {
  typeId: number
  markedToRemove: boolean
  locked: boolean

  constructor({game, x, y, typeId, atlas, frame}) {
    super(game, x, y, atlas, frame)
    
    // set tile size
    this.width = config.tile.size
    this.height = config.tile.size
    this.typeId = typeId
    this.markedToRemove = false
    this.locked = false
    
    this.inputEnabled = true
    this.init()
  }

  init(callback?) {
  
  }
}

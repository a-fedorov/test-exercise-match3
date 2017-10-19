import 'phaser'

export default class Tile extends Phaser.Sprite {
  constructor({game, x, y, atlas, frame}) {
    super(game, x, y, atlas, frame)
    
    // set tile size
    this.width = config.tile.size
    this.height = config.tile.size
    this.inputEnabled = true
    this.init()
  }

  init(callback?) {
  
  }
}

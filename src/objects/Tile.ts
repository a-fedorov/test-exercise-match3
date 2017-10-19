import 'phaser'

export default class Tile extends Phaser.Sprite {
  id: number

  constructor({game, x, y, atlas, frame}) {
    super(game, x, y, atlas, frame)

    // set tile size
    this.width = config.tile.size
    this.height = config.tile.size
    this.init()
  }

  init() {
    this.inputEnabled = true
    this.events.onInputDown.add(this.onSelect, this)
  }

  onSelect(tile: Tile) {
    let {row, col} = this.toIndex(tile.x, tile.y)
    console.log(
      'row:', row, 
      'col:', col, 
      'x:', tile.x, 
      'y:', tile.y)
  }

  toIndex(x: number, y: number) {
    return {
      row: Math.floor(y / this.width),
      col: Math.floor(x / this.height)
    }
  }
}

import 'phaser'
import Tile from './Tile'

export default class Board extends Phaser.Group {
  rows: number
  cols: number
  tileTypes: number
  tilesSpec: Array<Array<number>>
  tiles: Array<Tile>

  constructor(game) {
    super(game)
    this.rows = config.board.rows
    this.cols = config.board.cols
    this.tileTypes = config.board.tileTypes
    this.tilesSpec = config.board.defaultTiles
    
    this.tiles = []

    this.fill()

  }
  
  fill() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const tileId = this.tilesSpec[i][j]
        if (tileId > 0) {
          const tile = this.createTile(i, j, tileId)
          this.addChild(tile)
        }
      }
    }
  }

  createTile(row: number, col: number, type: number): Tile {
    return new Tile({
      game: this.game, 
      x: col * config.tile.size, 
      y: row * config.tile.size, 
      atlas: 'tiles', 
      frame: `tile-${type}.png`
    })
  }

  getTileId(): number {
    return this.game.rnd.integerInRange(1, this.tileTypes)
  }
}

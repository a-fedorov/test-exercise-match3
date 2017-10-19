import 'phaser'
import * as Swipe from 'phaser-swipe'

import Tile from './Tile'
import Outline from './Outline'

export default class Board extends Phaser.Group {
  rows: number
  cols: number
  tileTypes: number
  tilesSpec: Array<Array<number>>
  tiles: Array<Tile>

  outline: Outline
  isTileSelected: boolean
  
  swipe: Swipe

  constructor(game) {
    super(game)
    this.rows = config.board.rows
    this.cols = config.board.cols
    this.tileTypes = config.board.tileTypes
    this.tilesSpec = config.board.defaultTiles
    this.tiles = []

    this.isTileSelected = false
    this.init()
  }
  
  init() {
    this.fill()
    this.swipe = new Swipe(this.game)
    this.onChildInputDown.add(this.onTileSelect, this)
    this.outline = new Outline(this.game, this)
  }
  
  fill() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const tileId = this.tilesSpec[i][j]
        if (tileId > 0) {
          this.addChild(this.createTile(i, j, tileId))
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

  onTileSelect(tile: Tile) {
    let x = tile.x
    let y = tile.y
    let {row, col} = this.toIndex(x, y)

    if (this.outline.isVisible === false) {
      // First tile selected
      console.log('First tile selected')
      this.outline.show(x, y)
    } else {
      if (x === this.outline.position.x && y === this.outline.position.y) {
        // Same tile selected
        console.log('Same tile selected')
        this.outline.hide()
      } else {
        // Another tile selected
        console.log('Another tile selected')
        const tileData1 = this.toIndex(x, y)
        const tileData2 = this.toIndex(this.outline.position.x, this.outline.position.y)
        const isNeighbors = this.isNeighborTiles(tileData1, tileData2)
        
        console.log('isNeighbors', isNeighbors, tileData1, tileData2)
        
        if (isNeighbors) {
          this.outline.hide()
          this.processNeighborTiles()
        } else {
          this.outline.show(x, y)
        }
      }
    }
  }
  
  // Check if two tiles are neigbors vertically or horizontally
  isNeighborTiles(tileData1, tileData2): boolean {
    const dx = Math.abs(tileData1.row - tileData2.row);
    const dy = Math.abs(tileData1.col - tileData2.col);
    return (dx + dy === 1);
  }

  processNeighborTiles() {
    console.log(this.children);
  }

  toIndex(x: number, y: number) {
    return {
      row: Math.floor(y / config.tile.size),
      col: Math.floor(x / config.tile.size)
    }
  }
  
  update() {
    // let direction = this.swipe.check();
    // if (direction !== null) {
    //   // direction= { x: x, y: y, direction: direction }
    //   switch (direction.direction) {
    //     case this.swipe.DIRECTION_LEFT:
    //     case this.swipe.DIRECTION_RIGHT:
    //     case this.swipe.DIRECTION_UP:
    //     case this.swipe.DIRECTION_DOWN:
    //     case this.swipe.DIRECTION_UP_LEFT:
    //     case this.swipe.DIRECTION_UP_RIGHT:
    //     case this.swipe.DIRECTION_DOWN_LEFT:
    //     case this.swipe.DIRECTION_DOWN_RIGHT:
    //     default: console.log('Ooops, unknown swipe direction')
    //   }
    // }
  }


  // getTileId(): number {
  //   return this.game.rnd.integerInRange(1, this.tileTypes)
  // }
}

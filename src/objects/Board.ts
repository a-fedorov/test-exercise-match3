import 'phaser'
import * as Swipe from 'phaser-swipe'

import Tile from './Tile'
import Outline from './Outline'

export default class Board extends Phaser.Group {
  rows: number
  cols: number
  tileTypes: number
  tilesSpec: Array<Array<number>>
  tiles: Array<Array<Tile>>

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
    // this.swipe = new Swipe(this.game)
    this.onChildInputDown.add(this.onTileSelect, this)
    this.outline = new Outline(this.game, this)
  }
  
  fill() {
    for (let i = 0; i < this.rows; i++) {
      this.tiles[i] = []
      for (let j = 0; j < this.cols; j++) {
        const tileId = this.tilesSpec[i][j]
        if (tileId > 0) {
          const tile = this.createTile(i, j, tileId)
          this.tiles[i][j] = tile
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

  onTileSelect(tile: Tile) {
    let x = tile.x
    let y = tile.y

    if (this.outline.isVisible === false) {
      // First tile selected
      this.outline.show(x, y)
      return
    }

    if (x === this.outline.position.x && y === this.outline.position.y) {
      // Same tile selected
      this.outline.hide()
      return
    } 
    
    // Another tile selected
    const t1 = this.toIndex(x, y)
    const t2 = this.toIndex(this.outline.position.x, this.outline.position.y)
    const isNeighbors = this.isNeighborTiles(t1, t2)
    console.log('isNeighbors', isNeighbors, t1, t2)
    
    if (isNeighbors) {
      this.outline.hide()
      this.processNeighborTiles(t1, t2)
    } else {
      this.outline.show(x, y)
    }
  }
  
  // Check if two tiles are neigbors vertically or horizontally
  isNeighborTiles(t1, t2): boolean {
    const dx = Math.abs(t1.row - t2.row);
    const dy = Math.abs(t1.col - t2.col);
    return (dx + dy === 1);
  }

  processNeighborTiles(t1, t2) {
    const tile1 = this.tiles[t1.row][t1.col]
    const tile2 = this.tiles[t2.row][t2.col]
    const tweenTime = 200

    const tween1 = this.game.add.tween(tile1).to({
      x: tile2.position.x,
      y: tile2.position.y
    }, tweenTime, Phaser.Easing.Sinusoidal.InOut, true);

    const tween2 = this.game.add.tween(tile2).to({
      x: tile1.position.x,
      y: tile1.position.y
    }, tweenTime, Phaser.Easing.Sinusoidal.InOut, true);

    tween2.onComplete.add(() => {
      // Update tiles position when tween will complete
      this.reversItemInList(t1, tile1, t2, tile2)
    })
  }

  reversItemInList(t1, tile1, t2, tile2) {
    // Swap processed tiles
    this.tiles[t2.row][t2.col] = tile1;
    this.tiles[t1.row][t1.col] = tile2;
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

import 'phaser'
import * as Swipe from 'phaser-swipe'

import Tile from './Tile'
import Outline from './Outline'

interface TileData {
  row: number,
  col: number,
  typeId?: number
}

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
        const typeId = this.tilesSpec[i][j]
        if (typeId > 0) {
          const tile = this.createTile(i, j, typeId)
          this.tiles[i][j] = tile
          this.addChild(tile)
        }
      }
    }
  }

  createTile(row: number, col: number, typeId: number): Tile {
    return new Tile({
      game: this.game, 
      x: col * config.tile.size,
      y: row * config.tile.size,
      typeId: typeId,
      atlas: 'tiles', 
      frame: `tile-${typeId}.png`
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
    
    if (isNeighbors) {
      this.outline.hide()
      this.processNeighborTiles(t1, t2)
    } else {
      this.outline.show(x, y)
      return
    }
  }
  
  // Check if two tiles are neigbors vertically or horizontally
  isNeighborTiles(t1, t2): boolean {
    const deltaRow = Math.abs(t1.row - t2.row);
    const deltaCol = Math.abs(t1.col - t2.col);
    return (deltaRow + deltaCol === 1);
  }

  processNeighborTiles(t1, t2) {
    const tweenTime = 300
    const tile1 = this.tiles[t1.row][t1.col]
    const tile2 = this.tiles[t2.row][t2.col]
    const {x: x1, y: y1} = this.fromIndex(t1.row, t1.col)
    const {x: x2, y: y2} = this.fromIndex(t2.row, t2.col)

    let tween1 = this.game.add.tween(tile1).to({x: x2, y: y2}, tweenTime, 'Sine.easeInOut', true)
    let tween2 = this.game.add.tween(tile2).to({x: x1, y: y1}, tweenTime, 'Sine.easeInOut', true)
    let runTileBack = true

    tween2.onComplete.add(() => {
      // Update tiles position when tween will complete
      this.tiles[t1.row][t1.col] = tile2
      this.tiles[t2.row][t2.col] = tile1

      // Match with first tile
      if (this.findMatch(t1.row, t1.col)) {
        runTileBack = false
      } else {
      }

      // Match with second tile
      if (this.findMatch(t2.row, t2.col)) {
        runTileBack = false
      } else {
      }

      // No matches at all. Move tiles to their previous positions
      if (runTileBack) {
        tween1 = this.game.add.tween(tile1).to({x: x1, y: y1}, tweenTime, 'Sine.easeInOut', true)
        tween2 = this.game.add.tween(tile2).to({x: x2, y: y2}, tweenTime, 'Sine.easeInOut', true)

        tween1.onComplete.add(() => {
          // Enable input on tiles
        })
        
        tween2.onComplete.add(() => {
        })

        // Revert
        this.tiles[t1.row][t1.col] = tile1
        this.tiles[t2.row][t2.col] = tile2
      }
    })
  }

  findMatch(row: number, col: number) {
    let matchHor = this.findMatchHorizontally(row, col)
    let matchVert = this.findMatchVertically(row, col)

    if (matchHor.length >= 3) {
      this.markTilesToRemove(matchHor)
    }

    if (matchVert.length >= 3) {
      this.markTilesToRemove(matchVert)
    }

    return (matchHor.length >= 3 || matchVert.length >= 3)

  }

  findMatchHorizontally(row: number, col: number) {
    const typeId = this.tiles[row][col].typeId
    let left = 0
    let right = 0
    let match = [{row, col}]

    // Find similar tiles to the right from current tile
    while (typeId === this.getTileType(row, col + right + 1)) {
      match.push({row, col: col + right + 1})
      right++
    }
    
    // Find similar tiles to the left from current tile
    while (typeId === this.getTileType(row, col - left - 1)) {
      match.push({row, col: col - left - 1})
      left++
    }
    
    return match
  }

  findMatchVertically(row: number, col: number) {
    const typeId = this.tiles[row][col].typeId
    let up = 0
    let down = 0
    let match = [{row, col}]    
    
    // Find similar tiles down from current tile
    while (typeId === this.getTileType(row + down + 1, col)) {
      match.push({row: row + down + 1, col})
      down++
    }

    // Find similar tiles up from current tile
    while (typeId === this.getTileType(row - up - 1, col)) {
      match.push({row: row - up - 1, col})
      up++
    }

    return match
  }

  getTileType(row: number, col: number): number {
    if (row < 0 || row > this.rows - 1 || col < 0 || col > this.cols - 1 || !this.tiles[row][col]) {
      return -1;
    } else {
      return this.tiles[row][col].typeId;
    }
  }

  markTilesToRemove(matchLine: Array<TileData>) {
    matchLine.forEach(t => {
      // this.tiles[t.row][t.col].markedToRemove = true
      this.removeTile(t.row, t.col)
    })
  }

  removeTile(row, col) {
    if (this.tiles[row][col]) {
      this.tiles[row][col].destroy()
      this.tiles[row][col] = null
    }
  }

  toIndex(x: number, y: number) {
    return {
      row: Math.floor(y / config.tile.size),
      col: Math.floor(x / config.tile.size)
    }
  }

  fromIndex(row: number, col: number) {
    return {
      x: Math.floor(col * config.tile.size),
      y: Math.floor(row * config.tile.size),
    }
  }

  addTween(tile, x, y, time, easeType: string = 'Linear') {
    let tween = this.game.add.tween(tile).to({
      x, y
    }, time, easeType, true)
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

import 'phaser'
import * as Swipe from 'phaser-swipe'

import Level from './Level'
import Toolbar from './Toolbar'
import Tile from './Tile'
import Outline from './Outline'

interface TileData {
  row: number,
  col: number
}

export default class Board extends Phaser.Group {
  isGameOver: boolean;
  background: Phaser.Sprite
  rows: number
  cols: number
  tileTypes: number
  tiles: Array<Array<Tile>>

  level: Level
  toolbar: Toolbar

  outline: Outline
  isMoving: boolean
  
  swipe: Swipe

  constructor(game) {
    super(game)
    this.rows = config.board.rows
    this.cols = config.board.cols
    this.tileTypes = config.board.tileTypes
    this.tiles = []
    this.level = new Level(config.board.startLevelId)
    this.toolbar = new Toolbar(this, {
      level: this.level.id,
      mission: this.level.mission
    })

    this.isMoving = false
    this.init()
  }
  
  init() {
    // Only for debug from browser console
    (window as any).board = this;

    this.fill()

    // this.swipe = new Swipe(this.game)
    this.onChildInputDown.add(this.onTileSelect, this)
    this.outline = new Outline(this.game, this)

    this.background = this.game.add.sprite(0, 0, 'tiles', 'board-bg.png')
    this.background.alignIn(this.game.world.bounds, Phaser.CENTER)
    
    // Add crop mask
    const mask = this.game.add.graphics(0, 0)
    mask.beginFill()
    mask.drawRect(this.background.x, this.background.y, this.background.width, this.background.height)
    mask.endFill()
    this.mask = mask
  }
  
  fill() {
    for (let i = 0; i < this.rows; i++) {
      this.tiles[i] = []
      for (let j = 0; j < this.cols; j++) {
        const typeId = this.level.data[i][j]
        if (typeId > 0) {
          this.addTile(i, j, typeId)
        }
      }
    }
  }

  addTile(row: number, col: number, typeId: number) {
    const tile = this.createTile(row, col, typeId)
    this.tiles[row][col] = tile
    this.addChild(tile)
  }

  addBlockedTile(row: number, col: number) {
    this.tiles[row][col] = undefined
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
    if (this.isGameOver) {
      return
    }

    let x = tile.x
    let y = tile.y

    // Wait till all tiles will be on their places
    if (this.isMoving) {
      return
    }

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
    const swapTime = config.time.tween.swap
    const tile1 = this.tiles[t1.row][t1.col]
    const tile2 = this.tiles[t2.row][t2.col]
    const {x: x1, y: y1} = this.fromIndex(t1.row, t1.col)
    const {x: x2, y: y2} = this.fromIndex(t2.row, t2.col)

    let tween1 = this.game.add.tween(tile1).to({x: x2, y: y2}, swapTime, 'Sine.easeInOut', true)
    let tween2 = this.game.add.tween(tile2).to({x: x1, y: y1}, swapTime, 'Sine.easeInOut', true)
    let runTileBack = true

    this.isMoving = true

    tween2.onComplete.add(() => {
      // Update tiles position when tween will complete
      this.tiles[t1.row][t1.col] = tile2
      this.tiles[t2.row][t2.col] = tile1

      // Match with first tile
      if (this.findMatch(t1.row, t1.col)) {
        runTileBack = false
        this.isMoving = false
      } 
      
      // Match with second tile
      if (this.findMatch(t2.row, t2.col)) {
        runTileBack = false
        this.isMoving = false
      }

      // No matches at all. Move tiles to their previous positions
      if (runTileBack) {
        tween1 = this.game.add.tween(tile1).to({x: x1, y: y1}, swapTime, 'Sine.easeInOut', true)
        tween2 = this.game.add.tween(tile2).to({x: x2, y: y2}, swapTime, 'Sine.easeInOut', true)
        this.isMoving = true

        tween1.onComplete.add(() => {
          // Enable input on tiles
          this.isMoving = false
        })
        
        // Reverse swap 
        this.tiles[t1.row][t1.col] = tile1
        this.tiles[t2.row][t2.col] = tile2
      }
    })
  }

  findMatch(row: number, col: number) {
    let matchHor = this.findMatchHorizontally(row, col)
    let matchVert = this.findMatchVertically(row, col)
    
    // process founded line
    if (matchHor.length >= 3) {
      this.removeTilesAll(matchHor, false)
    }

    if (matchVert.length >= 3) {
      this.removeTilesAll(matchVert, true)
    }

    return (matchHor.length >= 3 || matchVert.length >= 3)

  }

  findMatchHorizontally(row: number, col: number): Array<TileData> {
    if (this.tiles[row][col] === null) {
      return []
    }

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

  findMatchVertically(row: number, col: number): Array<TileData> {
    if (this.tiles[row][col] === null) {
      return []
    }

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

  removeTilesAll(matchedTiles, isVerticalMatch: boolean) {
    matchedTiles.forEach(t => {
      this.updateMissionInfo(t)
      this.removeTile(t.row, t.col)
    })

    this.game.time.events.add(config.time.tween.remove + 50, () => {
      this.fallDown()
      this.addNewTiles()
    })
  }

  removeTile(row: number, col: number) {
    if (this.tiles[row][col]) {
      const tween = this.game.add.tween(this.tiles[row][col])
        .to({alpha: 0}, config.time.tween.remove, 'Cubic', true)

      tween.onComplete.add(() => {
        this.removeChild(this.tiles[row][col])
        this.tiles[row][col] = null
      })
    }
  }

  fallDown() {
    this.isMoving = true

    // Find gaps on the board
    for (let col = 0; col < this.cols; col++) {
      let gapsInCol = 0
      for (let row = this.rows - 1; row >= 0; row--) {
        const tile = this.tiles[row][col]
        if (tile === null) {
          gapsInCol++
        } else if (tile && gapsInCol > 0) {
          const pos = this.fromIndex(row + gapsInCol, col)
          const tween = this.addTween(tile, pos.x, pos.y, gapsInCol)
          this.tiles[row + gapsInCol][col] = tile
          this.tiles[row][col] = null
        }
      }
    }
  }
  
  addNewTiles() {
    let gapsInColMax = 0

    for (let col = 0; col < this.cols; col++) {
      let gapsInCol = 0
      for (let row = this.rows - 1; row >= 0; row--) {
        let tile = this.tiles[row][col]

        if (tile === null) {
          gapsInCol++
          const newTile = this.createTile(-gapsInCol, col, this.getRandomTileId())
          const pos = this.fromIndex(row, col)
          this.tiles[row][col] = newTile
          this.addChild(newTile)
          this.addTween(newTile, pos.x, pos.y, row + gapsInCol)
        }
      }

      gapsInColMax = Math.max(gapsInCol, gapsInColMax)
    }

    if (gapsInColMax > 0) {
      this.game.time.events.add(gapsInColMax * config.time.tween.fall, () => { 
        this.checkCascade() 
      })
    }
  }


  checkCascade() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.tiles[row][col]) {
          this.findMatch(row, col)
        }
      }
    }

    this.isMoving = false

    
  }

  swapTiles(row1, col1, row2, col2) {
    const tempTile = this.tiles[row1][col1] 
    this.tiles[row1][col1] = this.tiles[row2][col2] 
    this.tiles[row2][col2] = tempTile
  }

  // moveTile(rowFrom, colFrom, rowTo, colTo, durationMultiplier = 1) {
  //   const tile = this.tiles[rowFrom][colFrom]
  //   const pos = this.fromIndex(rowTo, colTo)
  //   const tween = this.addTween(tile, pos.x, pos.y, durationMultiplier)
      
  //   this.swapTiles(rowFrom, colFrom, rowTo, colTo)
  //   return tween
  // }

  setTilePos(tile, row, col) {
    this.tiles[row][col] = tile
  }

  checkBounds(row, col) {
    if (row < 0 || row > this.rows - 1 || col < 0 || col > this.cols - 1) {
      return false
    }
    return true
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

  addTween(tile, x, y, durationMultiplier = 1, easeType: string = 'Cubic') {
    const time = durationMultiplier * config.time.tween.fall
    return this.game.add.tween(tile).to({ x, y }, time, easeType, true)
  }
  
  update() {
    if (this.isGameOver && this.game.tweens.getAll().length === 0) {
      if (confirm('Game over. Play again ?')) {
        this.game.state.restart()
      }
    }
  }

  getRandomTileId(): number {
    return this.game.rnd.integerInRange(1, this.tileTypes)
  }

  updateMissionInfo(t: TileData) {
    if (this.tiles[t.row][t.col].typeId === this.level.missionCounter.type) {
      this.level.missionCounter.value++
      let leftToComplete = this.level.mission.amount - this.level.missionCounter.value
      
      if (this.level.mission.amount <= this.level.missionCounter.value) {
        leftToComplete = 0
        this.gameOver()
      }
      
      this.toolbar.updateMissionCounter(leftToComplete)
    }
  }
  
  gameOver() {
    this.isGameOver = true
    console.log('GAME OVER');    
  }
}

import 'phaser'
import Board from '../objects/Board'

export default class extends Phaser.State {
  board: Board

  debugColors: Array<string>

  init () {}
  preload () {}

  create () {
    // const bannerText = 'Phaser + TS + Webpack'
    // let banner = this.add.text(this.world.centerX, this.game.height - 15, bannerText)
    // banner.font = 'Bangers'
    // banner.padding.set(10, 16)
    // banner.fontSize = 40
    // banner.fill = 'black'
    // banner.smoothed = false
    // banner.anchor.setTo(0.5)

    this.board = new Board(this.game)
    this.board.alignIn(this.world.bounds, Phaser.CENTER)

    this.debugColors = this.highlightAllTiles()
    // let tile1 = this.game.add.image(100, 100, 'tiles', 'tile-1.png')
  }

  render() {
    // for (let tile in this.board.children) {
    for (let i = 0; i < this.board.children.length; i++) {
      let tile = <Phaser.Sprite>this.board.getAt(i)
      this.game.debug.spriteBounds(tile, this.debugColors[i])
    }
  }

  highlightAllTiles() {
    return this.board.children.map((tile) => this.getRandomColor());
  }

  getRandomColor() {
    return `rgba(
      ${this.game.rnd.integerInRange(0, 255)},
      ${this.game.rnd.integerInRange(0, 255)},
      ${this.game.rnd.integerInRange(0, 255)},
      0.6`
  }
}

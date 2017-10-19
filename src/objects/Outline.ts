import 'phaser'

export default class Outline extends Phaser.Sprite {
  isVisible: boolean

  constructor(game: Phaser.Game, group: Phaser.Group) {
    super(game, 0, 0, 'tiles', 'outline.png')
    this.scale.set(1.35)
    this.tint = 0xffaf00;
    this.alpha = 0;
    this.isVisible = false;
    group.addChild(this)
  }

  create() {
    // this.outline = this.game.add.sprite(0, 0, 'tiles', 'outline.png');
  }
  
  show(x: number, y: number) {    
    this.isVisible = true;    
    this.position.set(x, y)
    this.alpha = 1
    // this.game.add.tween(this.outline).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true)
  }

  hide() {
    this.isVisible = false;
    this.alpha = 0
  }
}
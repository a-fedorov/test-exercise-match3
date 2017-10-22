export default class Toolbar {
  parent: Phaser.Group;
  game: Phaser.Game
  data: any;

  missionIcon: Phaser.Sprite;
  missionGoal: Phaser.Text;
  levelValue: Phaser.Text

  constructor(parent: Phaser.Group, data) {
    this.parent = parent
    this.game = parent.game
    this.data = data

    this.init()
  }

  init() {
    let fontSize = 24
    let labelStyle: Phaser.PhaserTextStyle = {
      font: `${fontSize}px Arial`,
      fill: 'white',
    }

    let group = this.game.add.group()
    group.position.set(50, fontSize)

    let levelLabel = this.game.add.text(0, 0, 'Level', labelStyle, group)
    this.levelValue = this.game.add.text(0, 0, this.data.level, labelStyle, group)
    this.levelValue.alignTo(levelLabel, Phaser.BOTTOM_CENTER, 0, -5)
    
    let missionLabel = this.game.add.text(0, 0, 'Mission', labelStyle, group)
    missionLabel.alignTo(this.levelValue, Phaser.BOTTOM_CENTER, 0, fontSize / 2)
    
    this.missionIcon = this.game.add.sprite(0, 0, 'tiles', `tile-${this.data.mission.type}.png`, group)
    this.missionIcon.scale.set(0.15)
    this.missionIcon.anchor.set(0.5, 0)
    this.missionIcon.alignTo(missionLabel, Phaser.BOTTOM_LEFT, 0, -5)

    this.missionGoal = this.game.add.text(0, 0, this.data.mission.amount, labelStyle, group)
    this.missionGoal.alignTo(this.missionIcon, Phaser.RIGHT_CENTER, 2, 2)    
  }

  updateMissionCounter(value: number) {
    this.missionGoal.setText(value.toString())
  }
}
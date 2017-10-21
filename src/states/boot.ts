import 'phaser';

export default class extends Phaser.State {
  init() {
    this.stage.backgroundColor = '#47C8F5';

    this.scale.pageAlignHorizontally = true
    this.scale.pageAlignVertically = true
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.setMinMax(config.game.minWidth, config.game.minHeight, config.game.width, config.game.height)
  }

  preload() {
    let text = this.add.text(this.world.centerX, this.world.centerY, 'loading...', { font: '16px Arial', fill: '#dddddd', align: 'center' });
    text.anchor.setTo(0.5, 0.5);

    // this.load.image('loaderBg', './assets/images/loader-bg.png');
    // this.load.image('loaderBar', './assets/images/loader-bar.png');
  }

  render() {
    this.state.start('preloader');
  }
}

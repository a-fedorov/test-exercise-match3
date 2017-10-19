import 'phaser';

export default class extends Phaser.State {
  init() {
    this.stage.backgroundColor = '#47C8F5';

    this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
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

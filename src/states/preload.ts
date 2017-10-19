import 'p2';
import 'pixi';
import 'phaser';

import WebpackLoader from 'phaser-webpack-loader';
import AssetManifest from '../AssetManifest';

export default class extends Phaser.State {
  private loaderBg: Phaser.Sprite;
  private loaderBar: Phaser.Sprite;

  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')

    this.load.setPreloadSprite(this.loaderBar)
  }

  create () {
    let assetsLoader: any = this.game.plugins.add(WebpackLoader, AssetManifest)
    assetsLoader.load()
      .then(() => {
        this.state.start('game')
      })
  }
}

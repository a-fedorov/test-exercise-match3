import 'p2';
import 'pixi';
import 'phaser';

// Dirty hack for import json file otherwise TS compiler throw an error
const config = require('./config.json');

import boot from './states/boot';
import preload from './states/preload';
import game from './states/game';

// import * as Utils from './utils/utils';
// import * as Assets from './assets';

class App extends Phaser.Game {
    constructor(gameConfig: Phaser.IGameConfig) {
        super(gameConfig);

        this.state.add('boot', boot);
        this.state.add('preloader', preload);
        this.state.add('game', game);

        this.state.start('boot');
    }
}

function startApp(): void {
    let gameWidth: number = config.game.width;
    let gameHeight: number = config.game.height;

    // There are a few more options you can set if needed, just take a look at Phaser.IGameConfig
    let gameConfig: Phaser.IGameConfig = {
        width: gameWidth,
        height: gameHeight,
        renderer: Phaser.AUTO,
        parent: '',
        resolution: 1
    };

    let app = new App(gameConfig);
}

window.onload = () => {
    startApp();
};
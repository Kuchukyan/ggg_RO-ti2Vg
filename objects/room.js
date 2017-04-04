import {THREE} from 'https://cdn.rodin.io/v0.0.1/vendor/three/THREE.GLOBAL';
import {ModelLoader} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/ModelLoader';
import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager';

const scene = SceneManager.get();

export const room = ModelLoader.load('./models/room/Deck.obj');

room.on('ready', (evt) => {
    scene.add(evt.target.object3D);
    evt.target.object3D.scale.set(.5, .5, .5);
    evt.target.object3D.rotation.y = Math.PI;
});

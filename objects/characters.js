//Created by xgharibyan


import {ModelLoader} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/ModelLoader';
import {THREE} from 'https://cdn.rodin.io/v0.0.1/vendor/three/THREE.GLOBAL';
import {THREEObject} from 'https://cdn.rodin.io/v0.0.1/rodinjs/sculpt/THREEObject';

function createMan(){
    const person = new THREE.Object3D();
    const head = ModelLoader.load('./models/men/head.JD');
    const textureMap = new THREE.TextureLoader().load( "./models/hands/transparent.png" );
    const textureAlpha = new THREE.TextureLoader().load( "./models/hands/composite.png" );
    
    head.on('ready', (evt)=>{
        evt.target.object3D.children[0].material.materials[0].transparent = true;
        evt.target.object3D.children[0].material.materials[0].map = textureMap;
        evt.target.object3D.children[0].material.materials[0].alphaMap = textureAlpha;
        evt.target.object3D.children[0].rotation.y = Math.PI;
        //evt.target.object3D.children[0].material = material;
        
    });
    person.head = head;
    person.hands = {
            left: ModelLoader.load('./models/hands/hand_left.JD'),
            right: ModelLoader.load('./models/hands/hand_right.JD')
        };
    person.hands.left.on(
        'ready', (evt)=>{
        evt.target.object3D.children[0].material.materials[0].transparent = true;
        evt.target.object3D.children[0].material.materials[0].map = textureMap;
        evt.target.object3D.children[0].material.materials[0].alphaMap = textureAlpha;
    });
    person.hands.right.on(
        'ready', (evt)=>{
        evt.target.object3D.children[0].material.materials[0].transparent = true;
        evt.target.object3D.children[0].material.materials[0].map = textureMap;
        evt.target.object3D.children[0].material.materials[0].alphaMap = textureAlpha;
    });
    return person;
}

function dotAngle(a, b) {
   return Math.acos((a.x * b.x + a.y * b.y) / a.length() / b.length());
}
function getAngle(a, b) {
   a = a.sub(b);
   if (a.x >= 0 && a.y >= 0) {
       return dotAngle(a, new THREE.Vector2(1, 0));
   } else if (a.x >= 0 && a.y < 0) {
       return Math.PI * 2.0 - dotAngle(a, new THREE.Vector2(1, 0));
   } else if (a.x < 0 && a.y < 0) {
       return Math.PI * 2.0 - dotAngle(a, new THREE.Vector2(1, 0));
   } else {
       return dotAngle(a, new THREE.Vector2(1, 0));
   }
}

//export {createMan2, createMan, createWoman, getAngle}
export {createMan, getAngle}

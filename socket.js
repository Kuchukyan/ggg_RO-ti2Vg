//Created by xgharibyai
import {SceneManager} from 'https://cdn.rodin.io/v0.0.1/rodinjs/scene/SceneManager';
import {EVENT_NAMES} from 'https://cdn.rodin.io/v0.0.1/rodinjs/constants/constants';
import {screen} from './objects/screen.js';
import * as Characters from './objects/characters.js';
import * as controllers from './controllers.js';
import {initialPositions} from './objects/initialPositions.js';


const activeUsers = {};

const scene = SceneManager.get();
const SS = new RodinSocket();

SS.connect({});

SS.onConnected((data)=> SS.getConnectedUsersList());

SS.onMessage('socketDisconnected', (data)=>scene.scene.remove(activeUsers[data.socketId]));


SS.onMessage('renderPerson', (data)=>{
    if(data.socketId != SS.Socket.id){
        renderMan(initialPositions[data.coordinateIndex], data.socketId);
        
    }

    let interval = setInterval(()=>{
       let cameraDirection = scene.camera.getWorldDirection();
       let angle = Characters.getAngle(new THREE.Vector2(0,0), new THREE.Vector2(cameraDirection.x, cameraDirection.z));
       
       let leftHnadPosition = null;
       let leftHnadRotation = null;
       let rightHandPosition = null;
       let rightHandRotation = null;
       
       let rightHandMatrix = null;
       let leftHandMatrix = null;
       
       let gamePads = [];
       if(navigator.getGamepads)
            gamePads = navigator.getGamepads();
            
       for(let i = 0; i < gamePads.length; i ++) {
           const controller = gamePads[i];
           if(controller && controller.id && controller.id.match(new RegExp('openvr', 'gi')) && controller.hand === 'left') {

               leftHandMatrix = [];
               controllers.vive.left.matrix.toArray(leftHandMatrix);
           }
           if(controller && controller.id && controller.id.match(new RegExp('openvr', 'gi')) && controller.hand === 'right') {

               rightHandMatrix = [];
               controllers.vive.right.matrix.toArray(rightHandMatrix);
           }
       }
       
       SS.broadcastToAll('changeUserCoordinates', {
           rotation: (Math.PI/2)-angle, 
           socketId:SS.Socket.id,
           position: scene.camera.position,
           
           leftHandMatrix: leftHandMatrix,
           rightHandMatrix: rightHandMatrix
       });
    }, 50);
});


SS.onMessage('changeUserCoordinates', (data)=>{

    if(activeUsers[data.socketId] && activeUsers[data.socketId].head && activeUsers[data.socketId].head.object3D) {
        
        activeUsers[data.socketId].head.object3D.rotation.y = data.rotation;
        activeUsers[data.socketId].head.object3D.position.set(data.position.x, data.position.y, data.position.z);
        
        
        const p = new THREE.Vector3(data.position.x, data.position.y, data.position.z);
        if(data.rightHandMatrix && activeUsers[data.socketId].hands.right.object3D) {
            const obj = activeUsers[data.socketId].hands.right.object3D;
            obj.visible = true;
            
            obj.matrixAutoUpdate = false;
            obj.matrix.fromArray(data.rightHandMatrix);
        } else if(activeUsers[data.socketId].hands.right.object3D) {
            activeUsers[data.socketId].hands.right.object3D.visible = false;
        }
        
        if(data.leftHandMatrix && activeUsers[data.socketId].hands.left.object3D) {
            const obj = activeUsers[data.socketId].hands.left.object3D;
            obj.visible = true;
            
            obj.matrixAutoUpdate = false;
            obj.matrix.fromArray(data.leftHandMatrix);
        } else if(activeUsers[data.socketId].hands.left.object3D) {
            activeUsers[data.socketId].hands.left.object3D.visible = false;
        }
    }
});


SS.onMessage('changeMainPicture', (data)=>{
    
    if(data.socketId != SS.Socket.id)
        screen.show(data.imageIndex);
});

SS.onMessage('getConnectedUsersList', (data)=>{
    for (let i = 0; i < data.length; i++){
        if(!isNaN(data[i].positionIndex)){
            const socket = data[i].socketId;
            initialPositions[data[i].positionIndex].id = data[i].socketId;
            renderMan(initialPositions[data[i].positionIndex], socket);
        }
    }
    let firstFreePosition = initialPositions.findIndex((position)=> !position.id);
    let findPresentaionImageState = data.find((user)=> user.imageIndex);
    let findEnteredDarkMode = data.find((user)=> user.darkMode);
    
    
        let a = new THREE.Object3D();
        a.add(scene.camera);
        for(let i = 0; i < SceneManager.controllers.length; i ++) {
            a.add(SceneManager.controllers[i]);
        }
        scene.add(a);
        a.position.x = initialPositions[firstFreePosition].x;
        a.position.y = 0;
        a.position.z = initialPositions[firstFreePosition].z;
    
     if(findPresentaionImageState){
        screen.show(findPresentaionImageState.imageIndex);
        SS.setData({imageIndex:findPresentaionImageState.imageIndex});
    }
        
    SS.setData({positionIndex:firstFreePosition});
    SS.broadcastToAll('renderPerson', {coordinateIndex:firstFreePosition, socketId:SS.Socket.id});
});

screen.on('change', (evt) =>{
    if(SS.Socket){
        SS.setData({imageIndex:evt.target.currentIndex});
        SS.broadcastToAll('changeMainPicture', {imageIndex:evt.target.currentIndex, socketId:SS.Socket.id});
    }
});

function renderMan(position, socketId){
   const man  = Characters.createMan();
   man.position.set(position.x, position.y, position.z);
    activeUsers[socketId] = man;
   
   man.head.on('ready', (evt)=>{
        man.add(evt.target.object3D);
   });
   
   for(let i in man.hands) {
        if(man.hands.hasOwnProperty(i))
            man.hands[i].on('ready', (evt) => {
                man.add(evt.target.object3D);
            });
    }
    scene.add(man);
}

window.onbeforeunload = function(event){
   SS.disconnect();
};
//"use strict";
import { Images } from "./ImgLoader.mjs";                                   //イメージクラス
import { fecthJSON } from "./FetchJSON.mjs";                                //JSONファイルの読み取り関数
//タイルレンダリング
import { showTILESIZE, TileRender } from "./TileRender.mjs";                //タイルレンダークラス
import { TILESIZE } from "./TileRender.mjs";                                //タイルサイズ定数
import { imgRender } from "./ImgRender.mjs";                                //イメージレンダー
//スプライト、NPC
import { NowCanvasContext, sprite } from "./Sprite.mjs";                    //スプライトクラス
import { Enemy } from "./Sprite.mjs";                                       //エネミークラス
import { EnemyManager } from "./Sprite.mjs";                                //エネミーマネジメントクラス
import { Effect } from "./Sprite.mjs";                                      //エフェクトクラス
import { EffectManager } from "./Sprite.mjs";                               //エフェクトマネジメントクラス
import { Boss } from "./Sprite.mjs";                                        //ボスクラス
import { isNowBossAnimation } from "./Sprite.mjs";                          //ボスアニメーションフラグ

//読み込みフラグオン
let loading = 1;

const DebugMode = true;

const TextSize = 28;

//固定値、コンストラクタ取得

const canvas = document.getElementById("GameCanvas");       //実際のキャンバスの取得
const ctx = canvas.getContext("2d");                        //2Dメソッド取得
const initCanvasHeight = canvas.height;                     //初期キャンバスのサイズ高さ
const initCanvasWidth = canvas.width;                       //初期キャンバスのサイズ幅

const canvasDefaultMult = 1;                                //デフォルト拡大値
let canvasMult = canvasDefaultMult;                         //キャンバスの拡大比

const ScreenB = document.createElement("canvas");           //スクリーンバッファ取得
const ScB = ScreenB.getContext("2d");                       //2Dメソッド取得
ScB.font = `${TextSize}px monospace`;
ScB.textBaseline = "middle";
const ScHeight = 360;                                       //バッファ縦サイズ
const ScWidth = 480;                                        //バッファ横サイズ
ScreenB.height = ScHeight;                                  //バッファ縦サイズ初期化
ScreenB.width = ScWidth;                                    //バッファ横サイズ初期化

//スプライトの描画先の設定
NowCanvasContext(ScreenB,ScB);

//ドットくっきり～
ctx.imageSmoothingEnabled = false;

//プレイヤーの基本移動速度

//                  クラス定義

//キー入力を持つためだけの構造体
class key {
    constructor(){
        this.key = {
            "w" : false ,
            "a" : false ,
            "s" : false ,
            "d" : false ,
            "z" : false ,
            "x" : false ,
            "c" : false ,
            "q" : false ,
            " " : false ,
            "ArrowUp" : false ,
            "ArrowDown" : false ,
            "ArrowLeft" : false ,
            "ArrowRight" : false ,
        }
    }
}
class usrKey {
    constructor(){
        this.keyLeft = false;
        this.keyRight = false;
        this.keyUp = false;
        this.keyDown = false;
        this.keyJump = false;
        this.lastkeyA_button = false;
        this.lastkeyB_button = false;
        this.lastkeyC_button = false;
        this.pulsekeyA_button = false;
        this.pulsekeyB_button = false;
        this.pulsekeyC_button = false;
        this.keyA_button = false;
        this.keyB_button = false;
        this.keyC_button = false;
        this.keyQuit = false;
        this.lastkeyPause = false;
        this.pulsekeyPause = false;
        this.keyPause = false;
    }
    pulseSet(){
        if (this.keyA_button && !this.lastkeyA_button){
            this.pulsekeyA_button = true;
        } else {
            this.pulsekeyA_button = false;
        }
        if (this.keyB_button && !this.lastkeyB_button){
            this.pulsekeyB_button = true;
        } else {
            this.pulsekeyB_button = false;
        }
        if (this.keyC_button && !this.lastkeyC_button){
            this.pulsekeyC_button = true;
        } else {
            this.pulsekeyC_button = false;
        }
        if (this.keyPause && !this.lastkeyPause){
            this.pulsekeyPause = true;
        } else {
            this.pulsekeyPause = false;
        }
        this.lastkeyA_button = this.keyA_button;
        this.lastkeyB_button = this.keyB_button;
        this.lastkeyC_button = this.keyC_button;
        this.lastkeyPause = this.keyPause;
    }
}
//カメラ座標を保持する構造体
class camera {
    constructor(){
        this.camX = 0;
        this.camY = 0;
        this.farZ = 1;
        this.offX = 0;
        this.OffY = 0;
    }

}
class stage {
    constructor(ST){
        this.StType = ST;
        this.StageFrameC = {
            "Default" : 0,
            "stopPlayer" : 0
        };
        this.StageFrameCF = {
            "Default" : false,
            "stopPlayer" : false
        };
    }

    setCountEvent(eventName){
        this.StageFrameC[eventName] = 0;
        this.StageFrameCF[eventName] = false;
    }

    countFrame(frame,en = "Default"){
        let cf = this.StageFrameCF[en];
        let c = this.StageFrameC[en];
        if (!cf) {
            cf = true;
            c = frame;
        } else {
            c--;
        }
        if (c == 0) {
            cf = false;
            c = 0;
            this.StageFrameCF[en] = cf;
            this.StageFrameC[en] = c;
            return 1;
        } else {
            this.StageFrameCF[en] = cf;
            this.StageFrameC[en] = c;
            return 0;
        }

    }

    stopPlayerByFrame(frame){
        if (!this.countFrame(frame,"stopPlayer")) {
            player.stop = true;
            return 0;
        } else {
            player.stop = false;
            return 1;
        }
    }
    stopPlayer(flag){
        player.stop = flag;
    }
    /**
     * @param {String} name MapsやMapCollisionsに格納してあるキーの名前。ステージタイプになる
     */
    async changeStage(name){
        await StageSet(name);
        this.StType = name;
    }

}
class status {
    /**
     * @param {number} AP 攻撃力
     * @param {number} MP MP
     * @param {number} DP 防御力
     * @param {number} SPD すばやさ
     * @param {number} STM スタミナ
     * @param {number} MHP HP
     */
    constructor(AP = 0,MP = 0,DP = 0,SPD = 0,STM = 0,MHP = 0){
        //Attack Power
        this.AP = AP;
        //Magic Power
        this.MP = MP;
        //Difence Power
        this.DP = DP;
        //Speed
        this.SPD = SPD;
        //Stamina
        this.STM = STM;
        //Max HP
        this.MHP = MHP;
        
    }

    setStatus(AP,MP,DP,SPD,STM,MHP){
        //Attack Power
        this.AP = AP;
        //Magic Power
        this.MP = MP;
        //Difence Power
        this.DP = DP;
        //Speed
        this.SPD = SPD;
        //Stamina
        this.STM = STM;
        //Max HP
        this.MHP = MHP;
    }

}


//初期化（プロミスオブジェクトだとグローバルにならないため入れれない）

//マップ、コリジョンの辞書
export const Maps = {};
export const MapCollisions = {};
export const MapJSONs = {};


//今ロードされているマップ、コリジョンデータ
let NowMap;
let NowMapCollision;
let NowMapJSON;
let NowBoss;

//不要。デバッグ用
let DebugFrameC = 0;

//キー入力関連
const Keys = {};
const lastKeys = {};

const plSize = 16;

const VecDirList = [
    [0,-1],
    [0.7,-0.7],
    [1,0],
    [0.7,0.7],
    [0,1],
    [-0.7,0.7],
    [-1,0],
    [-0.7,-0.7],
]

export const img = new Images();                                 //イメージインスタンス
export const IR = new imgRender(ScreenB,ScB);                    //イメージレンダークラス
//なにもない（null）に割り当てる画像の読み込み
await img.AddImg("null","./assets/tiles/0.png");

//プレイヤーオブジェクト
export let nowStatus = new status(0,0,0,0,0,0);
export const knightStatus =     new status(24,15,18,18,50,60);
export const archerStatus =     new status(15,20,15,24,38,50);
export const magicianStatus =   new status(12,42,10,20,32,45);
export let player = new sprite(
    0,
    0,
    plSize,
    plSize,
    "player",
    knightStatus.MHP,
    knightStatus.MHP,
    knightStatus.STM,
    knightStatus.STM,
    knightStatus.SPD
);
/*  0...standing
    1...walking
    2...running
    3...jumping
    4...attacking
    5...damaging
*/
//ステータス関連
export const plaAttackAABB = new sprite(player.px,player.py,0,0,"PlaAtAABB");
//export let pla_Anim_
//player.setCollision(1);

export const EnM = new EnemyManager(100);
export const EfM = new EffectManager(200);

//メイン関係のオブジェクト
const TR = new TileRender(ScreenB,ScB);                     //タイルレンダーインスタンス
TR.TILESIZEUpdate(32,16);
export const keyInput = new key();                                 //キー入力の保持
const playerKey = new usrKey();                             //ユーザーのキー保持
export const playerCamera = new camera();                          //プレイヤーカメラ座標の保持
export const renderCamera = new camera();                          //レンダリング座標
let DebugStage = new stage("Debug2");                       //ステージオブジェクト
const mainStage = new stage("Map_1");
//DebugStage.setCountEvent("stopPlayer");
let test = 0;

let jsonData = undefined;

//              時間がかかる初期化

const promise = new Promise( async function(resolve,reject) {

    try {

        //デバッグステージのデータ読み込み（「Debug」として追加）
        MapJSONs["Debug"] = await fecthJSON("./assets/maps/Debug1.json");
        MapJSONs["Debug2"] = await fecthJSON("./assets/maps/Debug2.json");
        MapJSONs["Map_1"] = await fecthJSON("./assets/maps/Map1.json");
        Maps["Debug"] = await TR.newLoadMap(MapJSONs["Debug"],"./assets/maps/Debug1.txt");
        Maps["Debug2"] = await TR.newLoadMap(MapJSONs["Debug2"],"./assets/maps/Debug2.txt");
        Maps["Map_1"] = await TR.newLoadMap(MapJSONs["Map_1"],"./assets/maps/Map1.txt");
        MapCollisions["Debug"] = await TR.newLoadMap(MapJSONs["Debug"],"./assets/maps/Debug1_C.txt");
        MapCollisions["Debug2"] = await TR.newLoadMap(MapJSONs["Debug2"],"./assets/maps/Debug2_C.txt");
        MapCollisions["Map_1"] = await TR.newLoadMap(MapJSONs["Map_1"],"./assets/maps/Map1_C.txt");

        
        //画像データたちを読み込む
        await img.AddImg("MapTip_Debug","./assets/tiles/testTiles1.png");
        await img.AddImg("MapTip_Generic","./assets/tiles/GenericTiles.png");
        await img.AddImg("SwordEffect","./assets/effects/TestEffect.png");
        //タイルチップデータの読み込み
        TR.newLoadImg(img.imgList["MapTip_Generic"]);



        //どちらもKeys[]にキーを収納している。
        //KeyDownイベント時に押されたキーを格納
        document.addEventListener("keydown", (event) => {

            Keys[event.key] = true;

            //スペースキーによるスクロール防止（めちゃ強制的）
            event.preventDefault();

            //console.log("pressed : "+event.key);

        });

        //KeyUpイベント時に話されたキーを格納
        document.addEventListener("keyup", (event) => {

            Keys[event.key] = false;

            //console.log("Unpressed : "+event.key);

        });

        
        //読み込み完了
        loading = 0;

        //resolve（処理成功）を返す
        resolve("initalize done");


    } catch(error) {
        //reject（処理失敗）を返す
        reject(`error ${error}`)
    }
})
//成功時(resolve)の処理
.then((value) => {
    
    //if (window.onload) window.onload();
    console.log(value);
    //初期化を開始し、メインループスタート
    init();

})
//失敗時(reject)の処理
.catch((value) => {
    console.error(value);
})

//                  関数群

//ラジアン変換関数
export function radians(degrees){
    return (Math.PI/180)*degrees
}
//ランダム整数値マシ～ン
export function randInt(start,end){
    return Math.floor(Math.random()*(end-start)+start);
}
export function screenSetOffsetRand(maxX,maxY,minX = -maxX,minY = -maxY){
    renderCamera.offX += randInt(minX,maxX);
    renderCamera.OffY += randInt(minY,maxY);
}
export function screenSetOffset(px = 0,py = 0){
    renderCamera.offX = px;
    renderCamera.OffY = py;
}
//初期化関数
async function init (){

    //デバッグステージの呼び出し
    await mainStage.changeStage("Map_1");
    //player.setPos(9/2*TILESIZE,8/2*TILESIZE);
    //NowBoss.setPos(TR.MapWidth/3*TILESIZE,TR.MapHeight/3*TILESIZE,0)

    //メインループのインターバル設定（40FPS）
    setInterval( function() { main() } , 25);
    console.log("Render Start");
    /*
    EnM.spawnNPC(player.px+TILESIZE*2,player.py,TILESIZE,TILESIZE,0xFF,
            Math.sign(Math.random()-0.5)*8*Math.random(),
            Math.sign(Math.random()-0.5)*8*Math.random(),
            -8-8*Math.random()
    );
    */
    //リサイズイベント設定
    window.addEventListener( "resize" , function(){ ResizeCanvas()});
    
}
//メインループ
function main(){

    
    screenSetOffset(0,0);
    //キー入力
    getkey();

    //プレイヤーの処理
    plyayerAction();
    //エフェクトの処理
    EffectAction();
    //エネミーの処理
    enemyAction();
    //ボスの処理
    bossAction();
    //バッファへ書き込み
    RenderBuffer();
    //バッファの中身描画
    RenderCanvas();

}
function showDebugInfo(Debug = DebugMode){
}
function playerSelect(key){
    let [MHP,MST,SPD] = [0,0,0];
    if (key == "KNIGHT") {
        nowStatus.setStatus(
            knightStatus.AP,
            knightStatus.MP,
            knightStatus.DP,
            knightStatus.SPD,
            knightStatus.STM,
            knightStatus.MHP
        )
    } else if (key == "MAGICIAN") {
        nowStatus.setStatus(
            magicianStatus.AP,
            magicianStatus.MP,
            magicianStatus.DP,
            magicianStatus.SPD,
            magicianStatus.STM,
            magicianStatus.MHP
        )
    } else if (key == "ARCHER") {
        nowStatus.setStatus(
            archerStatus.AP,
            archerStatus.MP,
            archerStatus.DP,
            archerStatus.SPD,
            archerStatus.STM,
            archerStatus.MHP
        )
    }
    player.initalize(
        NowMapJSON["Position"][0]*(TILESIZE/showTILESIZE),
        NowMapJSON["Position"][1]*(TILESIZE/showTILESIZE),
        plSize,
        plSize,
        nowStatus.MHP,
        nowStatus.MHP,
        nowStatus.STM,
        nowStatus.STM,
        nowStatus.SPD
    );
}
/**
 * @param {String} stageName 辞書に格納されているキー
 */
async function StageSet(stageName){

    EnM.Disable();
    NowMap = Maps[stageName];
    NowMapCollision = MapCollisions[stageName];
    NowMapJSON = MapJSONs[stageName];
    TR.setMapData(NowMap,NowMapCollision);
    playerSelect("KNIGHT");
    /*
    player.initalize(
        NowMapJSON["Position"][0]*(TILESIZE/showTILESIZE),
        NowMapJSON["Position"][1]*(TILESIZE/showTILESIZE),
        plSize,
        plSize,
        45);
    */
    player.setAnimFrameClockDiv(2);
    player.setSlowDownV(3);
    player.setGravity(0.7);
    EnM.Enable();
    if (NowMapJSON["isThereBoss"] == true) {
        const temp = await fecthJSON(NowMapJSON["BossPass"]); 
        NowBoss = new Boss(
            temp["Position"][0]*(TILESIZE/showTILESIZE),
            temp["Position"][1]*(TILESIZE/showTILESIZE),
            temp["sizeX"],
            temp["sizeY"],
            temp["Name"],
            temp["status"][5]
        );
    } else {
        NowBoss = 0;
    }
    //player.setPos(TR.MapWidth/2*TILESIZE,TR.MapHeight/2*TILESIZE);
}
//canvasのサイズをウィンドウに合わせて変える関数
function ResizeCanvas(){
    //canvas.width = window.innerWidth
    //canvas.height = window.innerHeight

    if ( window.innerWidth < initCanvasWidth && window.innerWidth < window.innerHeight ) {
        canvasMult = window.innerWidth / initCanvasWidth;
    } else if( window.innerHeight < initCanvasHeight && window.innerHeight < window.innerWidth ) {
        canvasMult = window.innerHeight / initCanvasHeight;
    } else {
        canvasMult = canvasDefaultMult;
    }

    canvas.width = initCanvasWidth * canvasMult;
    canvas.height = initCanvasHeight * canvasMult;
    
    //ドットくっきり～
    ctx.imageSmoothingEnabled = false;

}
function RenderBuffer(){
    //ドットくっきり～
    ScB.imageSmoothingEnabled = false;
    
    //バッファキャンバスのクリア
    //ScB.globalAlpha = 0.5;
    ScB.fillStyle = "rgb(0,0,0)";
    ScB.fillRect(0,0,ScWidth,ScHeight);

    //各自描画処理
    //ステージの描画
    RenderStage();
    //ボスの描画
    RenderBoss();
    //エネミーの描画；
    RenderEnemy();
    //エフェクトの描画
    RenderEffect();
    //プレイヤーの描画
    RenderPlayer();
    
}
//バッファの内容を転送する関数
function RenderCanvas(){

    //モーションブラー定数(0~1)
    ctx.globalAlpha = 1;
    //バッファの内容を実際のcanvasへ転送
    ctx.drawImage(ScreenB,0,0,ScWidth,ScHeight,0,0,canvas.width,canvas.height);


}
function RenderPlayer(){

    player.RenderMyself(renderCamera.camX,renderCamera.camY,"green",DebugMode);
    plaAttackAABB.RenderMyself(renderCamera.camX,renderCamera.camY,"rgb(255,0,0/50%)",DebugMode);
    /*
    ScB.fillStyle = "green";
    ScB.fillRect(
        (player.px-(player.sx/2))+renderCamera.camX,
        (player.py-(player.sy/2))+renderCamera.camY,
        player.sx,
        player.sy
    )
    */
    //console.log([player.px,player.py,player.sx,player.sy]);
}
function RenderEnemy(){
    let AcEn = EnM.spriteList.filter(
        function(npc){
            return npc.active === true;
        })
    for (let i = 0; i < AcEn.length; i++) {
        let npc = AcEn[i];
        
        npc.RenderMyself(renderCamera.camX,renderCamera.camY,"red",DebugMode);
        /*
        ScB.fillStyle = "red";
        ScB.fillRect(
            (npc.px-(npc.sx/2))+renderCamera.camX,
            (npc.py-(npc.sy/2))+renderCamera.camY,
            npc.sx,
            npc.sy
        )
        */
    }
}
function RenderEffect(){
    let AcEf = EfM.spriteList.filter(
        function(npc){
            return npc.active === true;
        })
    for (let i = 0; i < AcEf.length; i++) {
        let npc = AcEf[i];
        
        npc.RenderMyself(renderCamera.camX,renderCamera.camY,"red",DebugMode);
        /*
        ScB.fillStyle = "red";
        ScB.fillRect(
            (npc.px-(npc.sx/2))+renderCamera.camX,
            (npc.py-(npc.sy/2))+renderCamera.camY,
            npc.sx,
            npc.sy
        )
        */
    }
}
function RenderBoss(){
    if (NowBoss != 0) NowBoss.RenderMyself(renderCamera.camX,renderCamera.camY,"olive",DebugMode);
}
function RenderStage() {

    DebugFrameC++;

    if (DebugFrameC >= 360) {
        DebugFrameC = 0;
    }

    //cameraSet(DebugFrameC,0);
    //console.log([player.px,player.py]);
    //if (!keyInput.key["c"]) {
        playerCameraSet(1);
    //}
    RenderCameraSet();
    TR.RenderMap(renderCamera.camX,renderCamera.camY,DebugMode);

    //ScB.drawImage(Image.ImgList.get("tile-0"),0,0)

}
/**
 * フェードイン関数
 * @param {Number} a 変更前の値
 * @param {Number} b 変更したい値
 * @param {Number} speed 変化率（分母の値）
 */
export function fadeIn(a,b,speed){
    if (Math.round(b-a) === 0){
        return 0;
    } else {
        return (b-a)/speed;
    }
}
/**
 * @param {Number} cameraX 基準にしたいカメラの座標Xを入れる
 * @param {Number} cameraY 基準にしたいカメラの座標Yを入れる 
 */
function RenderCameraSet(cameraX = playerCamera.camX , cameraY = playerCamera.camY){
    renderCamera.camX = Math.round(-1*cameraX)+renderCamera.offX;
    renderCamera.camY = Math.round(-1*cameraY)+renderCamera.OffY;
}
function playerCameraSet(smooth = 0){

    if (!smooth) {
        playerCamera.camX = player.px-(ScreenB.width/2);
        playerCamera.camY = player.py-(ScreenB.height/2);
    } else {
        playerCamera.camX += fadeIn(playerCamera.camX,player.px-(ScreenB.width/2),6);
        playerCamera.camY += fadeIn(playerCamera.camY,player.py-(ScreenB.height/2),6);
    }

}
//キー入力を受け取る関数　　keyInputオブジェクトのプロパティをいじる。
function getkey() {
    if ((Keys["w"] | Keys["ArrowUp"]) == true) {
        keyInput.key["w"] = true;
    } else {
        keyInput.key["w"] = false;
    }
    if ((Keys["a"] | Keys["ArrowLeft"]) == true) {
        keyInput.key["a"] = true;
    } else {
        keyInput.key["a"] = false;
    }
    if ((Keys["s"] | Keys["ArrowDown"]) == true) {
        keyInput.key["s"] = true;
    } else {
        keyInput.key["s"] = false;
    }
    if ((Keys["d"] | Keys["ArrowRight"]) == true) {
        keyInput.key["d"] = true;
    } else {
        keyInput.key["d"] = false;
    }
    
    if (Keys["z"] == true) {
        keyInput.key["z"] = true;
    } else {
        keyInput.key["z"] = false;
    }
    if (Keys["x"] == true) {
        keyInput.key["x"] = true;
    } else {
        keyInput.key["x"] = false;
    }
    if (Keys["c"] == true) {
        keyInput.key["c"] = true;
    } else {
        keyInput.key["c"] = false;
    }
    
    if (Keys[" "] == true) {
        keyInput.key[" "] = true;
    } else {
        keyInput.key[" "] = false;
    }
    if (Keys["q"] == true) {
        keyInput.key["q"] = true;
    } else {
        keyInput.key["q"] = false;
    }
    keyConvert();
}
//プレイヤーのキー入力を更新する
function keyConvert(){
    playerKey.keyLeft = keyInput.key["a"];
    playerKey.keyRight = keyInput.key["d"];
    playerKey.keyUp = keyInput.key["w"];
    playerKey.keyDown = keyInput.key["s"];
    playerKey.keyA_button = keyInput.key["z"];
    playerKey.keyB_button = keyInput.key["x"];
    playerKey.keyC_button = keyInput.key["c"];
    playerKey.keyPause = keyInput.key[" "];
    playerKey.pulseSet();
    //console.log(Keys);
}
function plyayerAction(){

    let vx = 0; let vy = 0;

    const nowPlaDir = player.direction;

    const spd = 4;

    const playerBaseAcs = player.Speed/5;

    if (!isNowBossAnimation || true){

        if (playerKey.keyRight && playerKey.keyUp) {
            player.setVector(playerBaseAcs*0.7,playerBaseAcs*-0.7,player.vz,true,spd);
            player.direction = 1;
        } else if (playerKey.keyRight && playerKey.keyDown) {
            player.setVector(playerBaseAcs*0.7,playerBaseAcs*0.7,player.vz,true,spd);
            player.direction = 3;
        } else if (playerKey.keyLeft && playerKey.keyDown) {
            player.setVector(playerBaseAcs*-0.7,playerBaseAcs*0.7,player.vz,true,spd);
            player.direction = 5;
        } else if (playerKey.keyLeft && playerKey.keyUp) {
            player.setVector(playerBaseAcs*-0.7,playerBaseAcs*-0.7,player.vz,true,spd);
            player.direction = 7;
        } else if (playerKey.keyLeft) {
            player.setVector(playerBaseAcs*-1,0,player.vz,true,spd);
            player.direction = 6;
        } else if (playerKey.keyRight) {
            player.setVector(playerBaseAcs,0,player.vz,true,spd);
            player.direction = 2;
        }else if (playerKey.keyUp) {
            player.setVector(0,playerBaseAcs*-1,player.vz,true,spd);
            player.direction = 0;
        } else if (playerKey.keyDown) {
            player.setVector(0,playerBaseAcs,player.vz,true,spd);
            player.direction = 4;
        } else {
            player.slowDown(spd);
        }

        if (playerKey.pulsekeyC_button && player.pz >= -3 && player.stamina >= player.MaxStamina/5) {
            //バックステップ（要修正）
            console.log("executed");
            player.setPos(player.px,player.py,0);
            player.ZAxisJump(-6);
            player.setVector(1.5*playerBaseAcs*VecDirList[player.direction][0],1.5*playerBaseAcs*VecDirList[player.direction][1]);
            player.setStaminaRelative(-player.MaxStamina/5);
            player.VLOCK = true;
        } else {
            if (player.vz >= 0) {
                player.VLOCK = false;
            }
            if (playerKey.pulsekeyB_button && player.pz >= -3) {
                //ジャンプ
                player.setPos(player.px,player.py,0);
                player.ZAxisJump(-6);
            }
        }
        
        if (playerKey.pulsekeyA_button && player.animationState <= 3) {
            EfM.spawnNPC(player.px,player.py,32,24,"Sword");
            player.changeAnimState(4);
        }
        /*  アニメーション処理  */
        //console.log(`animF : ${player.animFrameClock}`);
        if (player.direction != nowPlaDir && player.animationState <= 2){
            player.clearFrame(0);
            player.clearanimFrameSum();
            //1/20秒周期（0.05秒周期）でanimFrameSumByClockが1ずつインクリメントする
            //player.setAnimFrameClockDiv(4);
        }
        plaAttackAABB.setSize(0,0);
        //Walking or Running
        if (player.animationState == 1 || player.animationState == 2) {
            player.setAnimFrameClockDiv(4);
            if (player.animFrameSumByClock >= 1) /* 0.2 sec */{
                if (player.animationFrame >= 4) {
                    player.animationFrame = 0;
                } else {
                    player.animationFrame++;
                }
                player.clearanimFrameSum();
            }
        } else if (player.animationState == 3) /*Jumping*/ {

        } else if (player.animationState == 4) /*attacking*/ {
            plaAttackAABB.setSize(
                24+(Math.abs(10*VecDirList[player.direction][1])),
                24+(Math.abs(8*VecDirList[player.direction][0]))
            );
            player.setAnimFrameClockDiv(2);
            if (player.animFrameSumByClock >= 1) /* 0.2 sec */ {
                if (player.animationFrame >= 5) {
                    player.changeAnimState(6);
                } else {
                    player.animationFrame++;
                }
                player.clearanimFrameSum();
            }
        } else if (player.animationState == 5) /*Damaging*/ {

        } else if (player.animationState == 6) /*Set to 1 or 2*/ {
            player.changeAnimState(2);
        } else {
            player.changeAnimState(6);
        }
        //console.log(`animState : ${player.animationState}`);
        //console.log(`animFrame : ${player.animationFrame}`);
        //console.log(`player's speed : ${((player.vx)**2+(player.vy)**2)**0.5}, vz is ${player.vz}`);
        //console.log(`VLOCK is ${player.VLOCK}`);

    } else {
        player.setVector(0,0,0);
    }
    //console.log(`player's vec: ${[player.vx,player.vy]}`);

    player.move(NowMapCollision,TILESIZE);
    plaAttackAABB.setPos(
        player.px+(VecDirList[player.direction][0]*plaAttackAABB.sx/2),
        player.py+(VecDirList[player.direction][1]*plaAttackAABB.sy/2),
        player.pz);
    

    /*
    //デバッグ用の機能
    let debugScaler = 1+3*(Math.random());
    if (playerKey.keyPause){

        EnM.spawnNPC(player.px,player.py,
            TILESIZE*debugScaler,
            TILESIZE*debugScaler,
            0xFF,
            Math.sign(Math.random()-0.5)*8*Math.random(),
            Math.sign(Math.random()-0.5)*8*Math.random(),
            -8-8*Math.random()
        );
        //StageSet("Debug");

    }
    */

    
    if (player.hp <= 0){
        //StageSet("Debug2");
        
    }
    
    
    //console.log(player.collisionState.toString(2).padStart(8,"0"));

    

}
function bossAction(){
    if (NowBoss != 0) NowBoss.BossAction(NowMapCollision,TILESIZE);
}
function EffectAction(){
    let AcEf = EfM.spriteList.filter(
        function(npc){
            return npc.active == true;
        })
    for (let i = 0; i<AcEf.length; i++){
        let npc = AcEf[i];

        npc.EffectAction();
    }
}
function enemyAction(){

    //アクティブなエネミーのみ抽出
    let AcEn = EnM.spriteList.filter(
        function(npc){
            return npc.active === true;
        })
    //console.log(AcEn.length);
    //抽出したやつらのプログラムを実行
    for (let i = 0; i < AcEn.length; i++) {
        let npc = AcEn[i];
        //本来はdoEnemyAction()が入る。

        npc.EnemyAction(NowMapCollision,TILESIZE);

        /*
        npc.EnMove(NowMapCollision,TILESIZE);

        if (npc.hitCheck(player.px,player.py,player.sx,player.sy)){
            player.damage(1);
        }

        console.log(`${i}'s Position is: ${[npc.px,npc.py,npc.pz]}`)
        if ( (npc.collisionState & 0b10000) === 0b10000 ) {
            npc.Unactivate();
        }
        */

    }

}
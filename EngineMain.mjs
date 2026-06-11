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
const playerBaseAcs = 4;

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
        this.keyA_button = false;
        this.keyB_button = false;
        this.keyC_button = false;
        this.keyQuit = false;
        this.keyPause = false;
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

//プレイヤーオブジェクト
export const player = new sprite(0,0,plSize,plSize,"player",45);
//player.setCollision(1);

export const EM = new EnemyManager(100);

//メイン関係のオブジェクト
export const img = new Images();                                 //イメージインスタンス
export const IR = new imgRender(ScreenB,ScB);                    //イメージレンダークラス
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
        img.AddImg("tile-0","./assets/tiles/0.png");
        img.AddImg("MapTip_Debug","./assets/tiles/testTiles1.png");
        img.AddImg("MapTip_Generic","./assets/tiles/GenericTiles.png");
        img.AddImg("testEffect","./assets/effects/TestEffect.png");
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
    console.log(value);
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
    /*
    EM.spawnNPC(player.px+TILESIZE*2,player.py,TILESIZE,TILESIZE,0xFF,
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
/**
 * @param {String} stageName 辞書に格納されているキー
 */
async function StageSet(stageName){

    EM.Disable();
    NowMap = Maps[stageName];
    NowMapCollision = MapCollisions[stageName];
    NowMapJSON = MapJSONs[stageName];
    TR.setMapData(NowMap,NowMapCollision);
    player.initalize(
        NowMapJSON["Position"][0]*(TILESIZE/showTILESIZE),
        NowMapJSON["Position"][1]*(TILESIZE/showTILESIZE),
        plSize,
        plSize,
        45);
    player.setGravity(0.7);
    EM.Enable();
    if (NowMapJSON["isThereBoss"] == true) {
        const temp = await fecthJSON(NowMapJSON["BossPass"]); 
        NowBoss = new Boss(
            temp["Position"][0]*(TILESIZE/showTILESIZE),
            temp["Position"][1]*(TILESIZE/showTILESIZE),
            temp["sizeX"],
            temp["sizeY"],
            temp["Name"],
            temp["MaxHP"]
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
    ScB.fillStyle = "black";
    ScB.fillRect(0,0,ScWidth,ScHeight);

    //各自描画処理
    //ステージの描画
    RenderStage();
    //ボスの描画
    RenderBoss();
    //エネミーの描画；
    RenderEnemy();
    //プレイヤーの描画
    RenderPlayer();
    
    //イメージレンダーのテスト
    /*
    IR.renderImg(img.imgList["testEffect"],player.px+renderCamera.camX,player.py+renderCamera.camY,DebugFrameC,
        img.imgList["testEffect"].width*(1+Math.cos(DebugFrameC/30)),
        img.imgList["testEffect"].height*(1+Math.sin(DebugFrameC*Math.PI/180))
    );
    */

}
//バッファの内容を転送する関数
function RenderCanvas(){


    //バッファの内容を実際のcanvasへ転送
    ctx.drawImage(ScreenB,0,0,ScWidth,ScHeight,0,0,canvas.width,canvas.height);


}
function RenderPlayer(){

    player.RenderMyself(renderCamera.camX,renderCamera.camY,"green",DebugMode);
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
    let AcEn = EM.spriteList.filter(
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
    if (!keyInput.key["c"]) {
        playerCameraSet(1);
    }
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
function fadeIn(a,b,speed){
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
    //console.log(Keys);
}
function plyayerAction(){

    let vx = 0; let vy = 0;

    if (!isNowBossAnimation){

        if (playerKey.keyRight && playerKey.keyUp) {
            vx = playerBaseAcs*0.7;
            vy = playerBaseAcs*-0.7;
        } else if (playerKey.keyRight && playerKey.keyDown) {
            vx = playerBaseAcs*0.7;
            vy = playerBaseAcs*0.7;
        } else if (playerKey.keyLeft && playerKey.keyDown) {
            vx = playerBaseAcs*-0.7;
            vy = playerBaseAcs*0.7;
        } else if (playerKey.keyLeft && playerKey.keyUp) {
            vx = playerBaseAcs*-0.7;
            vy = playerBaseAcs*-0.7;
        } else if (playerKey.keyLeft) {
            vx = playerBaseAcs*-1;
        } else if (playerKey.keyRight) {
            vx = playerBaseAcs;
        }else if (playerKey.keyUp) {
            vy = playerBaseAcs*-1;
        } else if (playerKey.keyDown) {
            vy = playerBaseAcs;
        }
        if (playerKey.keyA_button && player.pz >= 0) {
            player.ZAxisJump(-6);
        }
    
    } else {
        player.setVector(0,0,0);
    }

    vx = Math.round(vx); vy = Math.round(vy);

    player.move(NowMapCollision,TILESIZE,vx,vy);

    
    let debugScaler = 1+3*(Math.random());

    /*
    //デバッグ用の機能
    if (playerKey.keyPause){

        EM.spawnNPC(player.px,player.py,
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
function enemyAction(){

    //アクティブなエネミーのみ抽出
    let AcEn = EM.spriteList.filter(
        function(npc){
            return npc.active === true;
        })
    console.log(AcEn.length);
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

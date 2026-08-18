//"use strict";
import { Images } from "./ImgLoader.mjs";                                   //イメージクラス
import { fetchJSON } from "./FetchJSON.mjs";                                //JSONファイルの読み取り関数
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
import { hitWallCheck } from "./Sprite.mjs";

import { setContext } from "./UI.mjs";
import { setTextBuffer } from "./UI.mjs";
import { setTextStyle } from "./UI.mjs";
import { setTextSize } from "./UI.mjs";
import { clearTextBuffer } from "./UI.mjs";
import { deleteTextBuffer } from "./UI.mjs";
import { renderUI } from "./UI.mjs";
import { renderText } from "./UI.mjs";
import { rendertxtBuffer } from "./UI.mjs";
import { getStr } from "./UI.mjs";
import { putStr } from "./UI.mjs";
import { textWrite } from "./UI.mjs";

//ポリゴン描画関係（めっちゃ不要）
import { TexRen } from "./TriRender.mjs";
import { setContextForBuf } from "./TriRender.mjs";
import { clearZBuffer } from "./TriRender.mjs";
import { renderZBuffer } from "./TriRender.mjs";

/*
import { audio } from "./audioPlayer.mjs";                                 //オーディオクラス
import { audioCTX } from "./audioPlayer.mjs";                               //オーディオコンテキスト
*/
import { audio } from "./AudioPlay.mjs";                                 //オーディオクラス


//読み込みフラグオン
let loading = 1;

let isJP = true;

let onBGM = false;

export let fps = 0;
export let frameDelta = 16.67;
let lastFrameTime = 0;
export let fpsFrameCount = 0;
let fpsElapsed = 0;
let fpsSampleStart = 0;


export const DebugMode = false;


export let actionStop = false;
export let renderStop = false;

export const TextSize = 28;

//固定値、コンストラクタ取得

const canvas = document.getElementById("GameCanvas");       //実際のキャンバスの取得
const ctx = canvas.getContext("2d");                        //2Dメソッド取得
const initCanvasHeight = canvas.height;                     //初期キャンバスのサイズ高さ
const initCanvasWidth = canvas.width;                       //初期キャンバスのサイズ幅
ctx.fillStyle = "rgb(0,0,0)";
ctx.font = `${TextSize}px monospace`;
ctx.textBaseline = "hanging";
ctx.fillText("Now Loading... Please wait a moment.",0,0);
ctx.textAlign = "left";
ctx.textBaseline = "alphabetic";

const baseTXTBufX = 19;
const baseTXTBufY = 7;

setContext(canvas,ctx);
setTextBuffer(baseTXTBufX,baseTXTBufY,TextSize);
setTextStyle("monospace","start","alphabetic");

export let textRenderRequestList = {};

const canvasDefaultMult = 1;                                //デフォルト拡大値
let canvasMult = canvasDefaultMult;                         //キャンバスの拡大比

const ScreenB = document.createElement("canvas");           //スクリーンバッファ取得
const ScB = ScreenB.getContext("2d");                       //2Dメソッド取得
ScB.font = `${TextSize}px monospace`;
ScB.textBaseline = "middle";
const BufferRatio = 3/4;
const ScWidth = 960;                                       //バッファ横サイズ
const ScHeight = ScWidth*BufferRatio;                       //バッファ縦サイズ
export let BtoCRatioX = canvas.width/ScWidth;
export let BtoCRatioY = canvas.height/ScHeight;
let CtoBRatioX = ScWidth/canvas.width;
let CtoBRatioY = ScHeight/canvas.height;
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
            "KeyW" : false ,
            "KeyA" : false ,
            "KeyS" : false ,
            "KeyD" : false ,
            "KeyZ" : false ,
            "KeyX" : false ,
            "KeyC" : false ,
            "KeyQ" : false ,
            "KeyE" : false ,
            "KeyF" : false ,
            "KeyV" : false ,
            "Space" : false ,
            "ShiftLeft" : false ,
            "ArrowUp" : false ,
            "ArrowDown" : false ,
            "ArrowLeft" : false ,
            "ArrowRight" : false ,
            "Desision" : false
        }
    }
}
//ユーザーのキー情報を更新するクラス
class usrKey {
    constructor(){
        this.lastkeyLeft = false;
        this.lastkeyRight = false;
        this.lastkeyUp = false;
        this.lastkeyDown = false;
        this.pulsekeyLeft = false;
        this.pulsekeyRight = false;
        this.pulsekeyUp = false;
        this.pulsekeyDown = false;

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

        this.lastDesisionKey = false;
        this.pulseDesisionKey = false;
        this.DesisionKey = false;
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

        if (this.DesisionKey && !this.lastDesisionKey){
            this.pulseDesisionKey = true;
        } else {
            this.pulseDesisionKey = false;
        }

        if (this.keyLeft && !this.lastkeyLeft){
            this.pulseKeyLeft = true;
        } else {
            this.pulseKeyLeft = false;
        }
        if (this.keyRight && !this.lastkeyRight){
            this.pulseKeyRight = true;
        } else {
            this.pulseKeyRight = false;
        }
        if (this.keyUp && !this.lastkeyUp){
            this.pulseKeyUp = true;
        } else {
            this.pulseKeyUp = false;
        }
        if (this.keyDown && !this.lastkeyDown){
            this.pulseKeyDown = true;
        } else {
            this.pulseKeyDown = false;
        }

        this.lastkeyLeft = this.keyLeft;
        this.lastkeyRight = this.keyRight;
        this.lastkeyUp = this.keyUp;
        this.lastkeyDown = this.keyDown;

        this.lastkeyA_button = this.keyA_button;
        this.lastkeyB_button = this.keyB_button;
        this.lastkeyC_button = this.keyC_button;
        this.lastkeyPause = this.keyPause;

        this.lastDesisionKey = this.DesisionKey;
    }
}
//カメラ座標を保持する構造体
class camera {
    constructor(){
        //カメラ基本情報
        this.camX = 0;
        this.camY = 0;
        this.farZ = 1;
        //カメラオフセット
        this.offX = 0;
        this.OffY = 0;
        //バイブレートエフェクト関連
        this.vibMX = 0;
        this.vibMY = 0;
        this.vibmX = 0;
        this.vibmY = 0;
        //フレームカウンタ
        this.frameC = 0;
        this.frameN = 0;
        this.frameF = 1;

        //UIテキスト関連
        /**
         * データは[テキスト , パラメータ]の構造で、パラメータはJSON形式である。
         * 使えるパラメータ：
         * @param {Boolean} plaLock プレイヤーをロックするかどうか
         * @param {Boolean} hasUIBox UIボックスを使用するか
         * @param {Number} type エフェクトタイプ
         * @param {Boolean} isFadeIn フェードインして表示するか
         * @param {Boolean} isFadeOut フェードアウトして表示するか
        */
        this.requestList = [];
        /**
         * 表示するテキストがそのままキー名になる
         * @param {Number} state
         * @param {Number} R
         * @param {Number} G
         * @param {Number} B
         * @param {Number} A
         * @param {Number} vR
         * @param {Number} vG
         * @param {Number} vB
         * @param {Number} vA
         */
        this.processingList = {};

        //バッファスクリーンレイヤ関連
        this.scR = 255;
        this.scG = 255;
        this.scB = 255;
        this.scA = 255;
        this.asyncFadeVR = 0;
        this.asyncFadeVG = 0;
        this.asyncFadeVB = 0;
        this.asyncFadeVA = 0;
        this.asyncFadeVZeroclearF = true;

        //オーバーレイカラー
        this.BGRayColor = {
            "R" : 255,
            "G" : 255,
            "B" : 255,
            "A" : 0
        };

        //スクリーンエフェクト関連
        this.effectMode = 0;
        this.e_valX = 0;
        this.e_valY = 0;
        this.e_valZ = 0;
        this.e_valW = 0;
        this.e_valU = 0;
        this.e_valV = 0;
        this.ScHScrBuffer = [];
        this.ScWScrBuffer = [];
        for (let i = 0; i<ScHeight; i++){
            this.ScHScrBuffer.push(0);
        }
        for (let i = 0; i<ScWidth; i++){
            this.ScWScrBuffer.push(0);
        }
    }

    setVibCamera(maxX,maxY,frame,minX = -maxX, minY = -maxY){
        this.vibMX = maxX;
        this.vibMY = maxY;
        this.vibmX = minX;
        this.vibmY = minY;
        this.frameN = frame;
        this.frameC - 0;
        this.frameF = 0;
    }

    VibCamera(){
        if (this.frameF != 0) {
            this.frameC = 0;
            this.vibMX = 0;
            this.vibMY = 0;
            this.vibmX = 0;
            this.vibmY = 0;
        } else {
            this.frameC++;
        }

        if (this.frameC >= this.frameN){
            this.frameF = 1;
        } else {
            screenSetOffsetRand(
                Math.round(this.vibMX*((this.frameN-this.frameC)/this.frameN)),
                Math.round(this.vibMY*((this.frameN-this.frameC)/this.frameN)),
                Math.round(this.vibmX*((this.frameN-this.frameC)/this.frameN)),
                Math.round(this.vibmY*((this.frameN-this.frameC)/this.frameN))
            );
        }
        /*
        console.log(`
                FC : ${this.frameC},
                FN : ${this.frameN},
                FC/FN : ${(this.frameN-this.frameC)/this.frameN},
            `)
        */
    }

    setCameraEffect(mode, x = this.e_valX, y = this.e_valY, z = this.e_valZ, w = this.e_valW, u = this.e_valU, v = this.e_valV){
        this.effectMode = mode;
        this.e_valX = x;
        this.e_valY = y;
        this.e_valZ = z;
        this.e_valW = w;
        this.e_valU = u;
        this.e_valV = v;

    }

    /**
     * バッファスクリーン全体にかかるカラーレイヤ（以下バッファスクリーンレイヤ）の調整。
     * すべてcharサイズ(1 Byte)である。
     * @param {Number} R レッド
     * @param {Number} G グリーン
     * @param {Number} B ブルー
     * @param {Number} A 透明度。高ければ高いほど透過する
     */
    setScreenColor(R,G,B,A){
        /*
            this.scR = mod(R,255);
            this.scG = mod(G,255);
            this.scB = mod(B,255);
            this.scA = mod(A,255);
        */

        this.scR = Math.min(255,Math.max(0,R));
        this.scG = Math.min(255,Math.max(0,G));
        this.scB = Math.min(255,Math.max(0,B));
        this.scA = Math.min(255,Math.max(0,A));

        
    }
    
    setBGRayColor(R,G,B,A){
    
        this.BGRayColor.R = Math.min(255,Math.max(0,R));
        this.BGRayColor.G = Math.min(255,Math.max(0,G));
        this.BGRayColor.B = Math.min(255,Math.max(0,B));
        this.BGRayColor.A = Math.min(255,Math.max(0,A));
        
    }
    
    /**
     * バッファスクリーンカラーの成分の変化を実数値で変化させる
     * @param {Number} vR 変化ベクトルレッド
     * @param {Number} vG 変化ベクトルグリーン
     * @param {Number} vB 変化ベクトルブルー
     * @param {Number} vA 変化ベクトル透明度
     */
    setScreenColorRelative(vR = 0, vG = 0, vB = 0, vA = 0){
        
        this.scR += vR;
        this.scG += vG;
        this.scB += vB;
        this.scA += vA;
        
        /*
            this.scR = mod(this.scR,255);
            this.scG = mod(this.scG,255);
            this.scB = mod(this.scB,255);
            this.scA = mod(this.scA,255);
        */
        
        this.scR = Math.min(255,Math.max(0,this.scR));
        this.scG = Math.min(255,Math.max(0,this.scG));
        this.scB = Math.min(255,Math.max(0,this.scB));
        this.scA = Math.min(255,Math.max(0,this.scA));

    }

    setBGRayColorRelative(vR = 0, vG = 0, vB = 0, vA = 0){
        
        this.BGRayColor.R += vR;
        this.BGRayColor.G += vG;
        this.BGRayColor.B += vB;
        this.BGRayColor.A += vA;
        
        this.BGRayColor.R = Math.min(255,Math.max(0,this.BGRayColor.R));
        this.BGRayColor.G = Math.min(255,Math.max(0,this.BGRayColor.G));
        this.BGRayColor.B = Math.min(255,Math.max(0,this.BGRayColor.B));
        this.BGRayColor.A = Math.min(255,Math.max(0,this.BGRayColor.A));

    }
    
    /**
     * バッファスクリーンカラーの成分の変化を固定実数値で非同期的に変化させる
     * @param {Number} R 変化ベクトルレッド
     * @param {Number} G 変化ベクトルグリーン
     * @param {Number} B 変化ベクトルブルー
     * @param {Number} A 変化ベクトル透明度
     * @param {Boolean} byMaxF いずれかが255か0で変化を終了させるかフラグ。デフォルトはtrue。
     */
    setAsyncFadeScreenColor(R,G,B,A,byMaxF = true){
        
        this.asyncFadeVZeroclearF = byMaxF;

        this.asyncFadeVR = R;
        this.asyncFadeVG = G;
        this.asyncFadeVB = B;
        this.asyncFadeVA = A;
    }

    doCameraEffect(x = this.e_valX, y = this.e_valY, z = this.e_valZ, w = this.e_valW, u = this.e_valU, v = this.e_valV){

        this.e_valX = x;
        this.e_valY = y;
        this.e_valZ = z;
        this.e_valW = w;
        this.e_valU = u;
        this.e_valV = v;

        if (this.effectMode == 1){
            /*
                X ... 周波数
                Y ... 振幅
                Z ... ノイズ強度
                W ... 位相
                U ... 位相速度
            */
            for (let i = 0; i<ScHeight; i++){
                this.ScHScrBuffer[i] = this.e_valY*Math.sin(this.e_valX*radians(i+this.e_valW))+randFloat(-this.e_valZ,this.e_valZ);
            }
            
            this.e_valW += this.e_valU;
            this.e_valW = mod(this.e_valW,360/this.e_valX);
            //console.log(this.e_valW);

        } else if (this.effectMode == 2){
            /*
                X ... 周波数
                Y ... 振幅
                Z ... ノイズ強度
                W ... 位相
                U ... 位相速度
            */
            for (let i = 0; i<ScWidth; i++){
                this.ScWScrBuffer[i] = this.e_valY*Math.sin(this.e_valX*radians(i+this.e_valW))+randFloat(-this.e_valZ,this.e_valZ);
            }
            
            this.e_valW += this.e_valU;
            this.e_valW = mod(this.e_valW,360);

        }

        if (
            this.asyncFadeVZeroclearF && 
            (
                //いずれかの色が最大値(255)か最小値(0)をとったらtrue
                (this.scR >= 255 || this.scR <= 0) || 
                (this.scG >= 255 || this.scG <= 0) || 
                (this.scB >= 255 || this.scB <= 0) || 
                (this.scA >= 255 || this.scA <= 0)
            )
        ){
            this.setAsyncFadeScreenColor(0,0,0,0,true);
        }

        this.setScreenColorRelative(
            this.asyncFadeVR,
            this.asyncFadeVG,
            this.asyncFadeVB,
            this.asyncFadeVA
        )

    }
    
    /**
     * 
     * @param {String} text 
     * @param {Object} option 
     * @param {Boolean} [option.plaLock=false] プレイヤーをロックするかどうか
     * @param {Boolean} [option.hasUIBox=false] UIボックスを使用するか
     * @param {Number} [option.type=0] エフェクトタイプ
     * @param {Boolean} [option.isFadeIn=true] フェードインして表示するか
     * @param {Boolean} [option.isFadeOut=true] フェードアウトして表示するか
     */
    addTextRequest(text, option = {}){
        const {
            plaLock = false,
            hasUIBox = false,
            type = 0,
            isFadeIn = true,
            isFadeOut = true
        } = option;


    }
}
class stage {
    constructor(ST){
        this.StType = ST;
        this.StageFrameC = {
            "Default" : 0,
            "stopPlayer" : 0
        };
        this.StageFrameCountingF = {
            "Default" : false,
            "stopPlayer" : false
        };
    }

    setCountEvent(eventName){
        this.StageFrameC[eventName] = 0;
        this.StageFrameCountingF[eventName] = false;
    }
    /**
     * @param {Number} frame カウントするフレーム数
     * @param {String} en カウントするイベントキー
     * @returns 
     */
    countFrame(frame,en = "Default"){
        let cf = this.StageFrameCountingF[en];
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
            this.StageFrameCountingF[en] = cf;
            this.StageFrameC[en] = c;
            return 1;
        } else {
            this.StageFrameCountingF[en] = cf;
            this.StageFrameC[en] = c;
            return 0;
        }

    }
    deleteCount(en = "Default"){
        delete this.StageFrameC[en];
        delete this.StageFrameCountingF[en];
    }
    /**
     * @param {Number} frame カウントするフレーム数
     * @returns {Number} 1なら動ける
     */
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
        await setStage(name);
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

//ユーザーがアクションを起こしたかどうか
export let isUserGesture = "yet";

//今ロードされているマップ、コリジョンデータ
let NowMap;
let NowMapCollision;
let NowMapJSON;
export let mapDescriptionList = {};
export let NowBoss;

let showHP = true;

//不要。デバッグ用
let frameC = 0;
let frame = 0;

//キー入力関連
const Keys = {};
const lastKeys = {};

export const VecDirList = [
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
await img.AddImg("null","./assets/tiles/nullImage.png");


const TexImg = new Images();
const TrR = new TexRen(TexImg);
setContextForBuf(canvas,ctx);


//export let pla_Anim_
//player.setCollision(1);

export const EnM = new EnemyManager(100);
export const EfM = new EffectManager(200);

//メイン関係のオブジェクト
const TR = new TileRender(ScreenB,ScB);                     //タイルレンダーインスタンス
export const AuM = new audio();                             //オーディオインスタンス
const audioInfo = {};
//拡大率変更
TR.TILESIZEUpdate(64,32);
export let VisualDeltaVector = TILESIZE/showTILESIZE;
export let deltaVector = VisualDeltaVector*(16.6/25);
export let fpsdelta = (16.6/25);
export let mapWidth = 0;
export let mapHeight = 0;
export const keyInput = new key();                                 //キー入力の保持
const playerKey = new usrKey();                             //ユーザーのキー保持

export let keyConfig = 0;
export let mouseClick = false;
export let mouseX = 0;
export let mouseY = 0;

let setting = false;

export const playerCamera = new camera();                          //プレイヤーカメラ座標の保持
export const renderCamera = new camera();                          //レンダリング座標
let DebugStage = new stage("Debug2");                       //ステージオブジェクト
export const mainStage = new stage("Map_1");
let stageChangeRequest = null;

//DebugStage.setCountEvent("stopPlayer");
let test = 0;

let stageClear = 0;
export let enableGoStageList = [1,1,1,1,0];
let jsonData = undefined;

const plSizeX = TILESIZE;
const plSizeY = TILESIZE;
const plSizeZ = TILESIZE*1.5;
export let isPause = false;
export let toFadeStage = false;
let playerBaseAcs = 0;

let pauseCursorItem = 0;

//プレイヤーオブジェクト
export let nowStatus = new status(0,0,0,0,0,0);
//export const knightStatus =     new status(24,15,18,18,50,60);
export const archerStatus =     new status(15,20,15,24,38,50);
export const magicianStatus =   new status(12,42,10,20,32,45);
export const knightStatus =     new status(5,5,18,18,50,8);
export let player = new sprite(
    0,
    0,
    plSizeX,
    plSizeY,
    plSizeZ,
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
export const plaAttackAABB = new sprite(player.px,player.py,0,0,0,"PlaAtAABB");

//              時間がかかる初期化

const promise = new Promise( async function(resolve,reject) {

    try {

        //デバッグステージのデータ読み込み（「Debug」として追加）
        //マップデータはJSONファイルから先に読む（TileRenderクラスのnewLoadMapメソッドがJSONファイルを利用するため）
        MapJSONs["Map_1"] = await fetchJSON("./assets/maps/Map1.json");
        mapDescriptionList["Map_1"] = MapJSONs["Map_1"].Description;
        Maps["Map_1"] = await TR.newLoadMap(MapJSONs["Map_1"],"./assets/maps/Map1.txt");
        MapCollisions["Map_1"] = await TR.newLoadMap(MapJSONs["Map_1"],"./assets/maps/Map1_C.txt");
        
        MapJSONs["Map_2"] = await fetchJSON("./assets/maps/Map2.json");
        mapDescriptionList["Map_2"] = MapJSONs["Map_2"].Description;
        Maps["Map_2"] = await TR.newLoadMap(MapJSONs["Map_2"],"./assets/maps/Map2.txt");
        MapCollisions["Map_2"] = await TR.newLoadMap(MapJSONs["Map_2"],"./assets/maps/Map2_C.txt");

        MapJSONs["Map_3"] = await fetchJSON("./assets/maps/Map3.json");
        mapDescriptionList["Map_3"] = MapJSONs["Map_3"].Description;
        Maps["Map_3"] = await TR.newLoadMap(MapJSONs["Map_3"],"./assets/maps/Map3.txt");
        MapCollisions["Map_3"] = await TR.newLoadMap(MapJSONs["Map_3"],"./assets/maps/Map3_C.txt");
        
        MapJSONs["Map_4"] = await fetchJSON("./assets/maps/Map4.json");
        mapDescriptionList["Map_4"] = MapJSONs["Map_4"].Description;
        Maps["Map_4"] = await TR.newLoadMap(MapJSONs["Map_4"],"./assets/maps/Map4.txt");
        MapCollisions["Map_4"] = await TR.newLoadMap(MapJSONs["Map_4"],"./assets/maps/Map4_C.txt");
        
        MapJSONs["GrandFloor"] = await fetchJSON("./assets/maps/Map5.json");
        Maps["GrandFloor"] = await TR.newLoadMap(MapJSONs["GrandFloor"],"./assets/maps/Map5.txt");
        MapCollisions["GrandFloor"] = await TR.newLoadMap(MapJSONs["GrandFloor"],"./assets/maps/Map5_C.txt");
        
        MapJSONs["water_debug"] = await fetchJSON("./assets/maps/Map7.json");
        mapDescriptionList["water_debug"] = MapJSONs["water_debug"].Description;
        Maps["water_debug"] = await TR.newLoadMap(MapJSONs["water_debug"],"./assets/maps/Map7.txt");
        MapCollisions["water_debug"] = await TR.newLoadMap(MapJSONs["water_debug"],"./assets/maps/Map7_C.txt");
        
        //water_debug

        MapJSONs["Debug"] = await fetchJSON("./assets/maps/Debug1.json");
        Maps["Debug"] = await TR.newLoadMap(MapJSONs["Debug"],"./assets/maps/Debug1.txt");
        MapCollisions["Debug"] = await TR.newLoadMap(MapJSONs["Debug"],"./assets/maps/Debug1_C.txt");
        
        MapJSONs["Debug2"] = await fetchJSON("./assets/maps/Debug2.json");
        Maps["Debug2"] = await TR.newLoadMap(MapJSONs["Debug2"],"./assets/maps/Debug2.txt");
        MapCollisions["Debug2"] = await TR.newLoadMap(MapJSONs["Debug2"],"./assets/maps/Debug2_C.txt");
                
        //画像データたちを読み込む
        await img.AddImg("MapTip_Debug","./assets/tiles/testTiles1.png");
        await img.AddImg("MapTip1","./assets/tiles/GenericTiles.png");
        //await img.AddImg("MapTip2","./assets/tiles/RockTile.png");
        await img.AddImg("MapTip2","./assets/tiles/test1.png");
        await img.AddImg("SwordEffect","./assets/effects/TestEffect.png");

        await TexImg.AddImg("testTex","./assets/tiles/nullImage.png");

        //タイルチップデータの読み込み
        TR.newLoadImg(img.imgList["MapTip2"]);

        /*
        await AuM.importAudio("Map1_Battle",);
        audioInfo["Map1_Battle"] = await fetchJSON("./assets/sounds/BGM/map1_battle_info.json");
        */
        await AuM.AddAudioFromInfo("Map1_Battle","./assets/sounds/BGM/map1_battle_info.json","./assets/sounds/BGM/");
        await AuM.AddAudioFromInfo("Map2_Peace","./assets/sounds/BGM/map2_peace_info.json","./assets/sounds/BGM/");
        await AuM.AddAudioFromInfo("Map2_Battle","./assets/sounds/BGM/map2_battle_info.json","./assets/sounds/BGM/");

        //どちらもKeys[]にキーを収納している。
        //KeyDownイベント時に押されたキーを格納
        document.addEventListener("keydown", (event) => {

            if (isUserGesture == "yet") {
                isUserGesture = "action";
            }

            Keys[event.code] = true;

            //スペースキーによるスクロール防止（めちゃ強制的）
            event.preventDefault();

            console.log("pressed event.key : "+event.key);
            console.log("pressed event.code : "+event.code);

        });
        //KeyUpイベント時に話されたキーを格納
        document.addEventListener("keyup", (event) => {

            Keys[event.code] = false;

            //console.log("Unpressed : "+event.key);

        });
        //VS code's AI
        window.addEventListener("pointerdown", () => {
            if (isUserGesture == "yet") {
                isUserGesture = "action";
            }
        }, { passive: true });

        //VS code's AI
        window.addEventListener("touchstart", () => {
            if (isUserGesture == "yet") {
                isUserGesture = "action";
            }
        }, { passive: true });

        //VS code's AI
        window.addEventListener("mousedown", () => {
            if (isUserGesture == "yet") {
                isUserGesture = "action";
            }

        }, { passive: true });

        canvas.addEventListener("mousedown", (e) => {

            const rectP = canvas.getBoundingClientRect();
            mouseClick = true;
            mouseX = e.clientX - rectP.left;
            mouseY = e.clientY - rectP.top;

        });
        canvas.addEventListener("mouseup", () => {
            mouseClick = false;
        });
        canvas.addEventListener("mouseleave", () => {
            mouseClick = false;
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

export function changeViewMult(mult = 1){
    TR.TILESIZEUpdate(32*mult,32);
    VisualDeltaVector = TILESIZE/showTILESIZE;
    applyDeltaVector();
}
function applyDeltaVector(deltaTime = frameDelta){
    deltaVector = VisualDeltaVector*(Math.round(deltaTime)/25);
}
/**
 * Cの上にTarCを重ねる
 * @param {Array} C RGBAの配列。範囲はすべて0~255
 * @param {Array} TarC RGBAの配列。範囲はすべて0~255
 * @param {Number} div 0~1の割合でCにどのくらいTarCを混ぜるか決める
 */
export function colorMerge(C,TarC,div){
    return [
        C[0] + div*(Tar[0]-C[0]),
        C[1] + div*(Tar[1]-C[1]),
        C[2] + div*(Tar[2]-C[2]),
        C[3] + div*(Tar[3]-C[3])
    ];
}
/**
 * Cの上にTarCを重ねる
 * @param {Array} C RGBAの配列。範囲はすべて0~255
 * @param {Array} TarC RGBAの配列。範囲はすべて0~255
 */
export function colorMergeWithAlpha(C,TarC){
    const CA = C[3]/255;
    const TCA = TarC[3]/255;
    const resA = CA + TCA*(1-CA);

    return [
        Math.floor( (C[0]*CA) + ( (TarC[0]*TCA) * (1 - CA) ) ),
        Math.floor( (C[1]*CA) + ( (TarC[1]*TCA) * (1 - CA) ) ),
        Math.floor( (C[2]*CA) + ( (TarC[2]*TCA) * (1 - CA) ) ),
        Math.floor(resA*255)
    ];

}
//ラジアン変換関数
export function radians(degrees){
    return (Math.PI/180)*degrees;
}
export function degrees(radians){
    return (180/Math.PI)*radians;
}
//ランダム整数値マシ～ン
export function randInt(start,end){
    return Math.floor(Math.random()*(end-start)+start);
}
export function randFloat(start,end){
    return Math.random()*(end-start)+start;
}
//自然数まるめマシ～ン
export function mod(num,div){
    return Math.floor(num - div*Math.floor(num/div));
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

    //ステージの呼び出し
    //await mainStage.changeStage("GrandFloor");
    //await mainStage.changeStage("water_debug");
    await mainStage.changeStage("Map_3");
    //player.setPos(9/2*TILESIZE,8/2*TILESIZE);
    //NowBoss.setPos(TR.MapWidth/3*TILESIZE,TR.MapHeight/3*TILESIZE,0)

    // requestAnimationFrame による描画ループ
    requestAnimationFrame(loop);
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

//written by VS code's AI
function loop(timestamp){
    main(timestamp);
    requestAnimationFrame(loop);
}

//メインループ
async function main(timestamp = performance.now()){

    /* FPS Counting feature was built by VS code's AI */

        if (lastFrameTime === 0) {
            lastFrameTime = timestamp;
            fpsSampleStart = timestamp;
        }

        const elapsed = Math.max(1, timestamp - lastFrameTime);
        lastFrameTime = timestamp;
        frameDelta = elapsed;

        fpsFrameCount += 1;
        fpsElapsed += elapsed;
        if (timestamp - fpsSampleStart >= 500) {
            fps = (fpsFrameCount * 1000) / fpsElapsed;
            fpsFrameCount = 0;
            fpsElapsed = 0;
            fpsSampleStart = timestamp;
        }

        if (isUserGesture == "action") {
        isUserGesture = "done";
        }
        
    /* Until there */

    //changeViewMult();
    //applyDeltaVector();

    screenSetOffset(0,0);
    //キー入力
    getkey();

    if (playerKey.pulsekeyPause && !toFadeStage){
        isPause = !isPause;
    }

    if (!actionStop && !isPause){
        //プレイヤーの処理
        plyayerAction();
        //ボスの処理
        bossAction();
        //エネミーの処理
        enemyAction();
        //エフェクトの処理
        EffectAction();
        //ステージギミック
        StageGimmick();
    }
    //ステージ変更リクエストの処理
    executeSCRequest();
    if (!renderStop){
        //バッファへ書き込み
        RenderBufferCorrect();
        //バッファの中身描画
        RenderCanvas();
    }

    /*
    TrR.renTri(
        [0,0,0,0,0],
        [50,0,0,1,0],
        [0,50,0,0,1],
        "testTex"
    );
    */

    /*

    TrR.setParam(canvas.width/1000,canvas.height/1000);
    //TrR.setRotate(frame%360,frame%360,0);
    TrR.setRotate(0,0,frame%360);

    let v1 = TrR.viewConvertion([5,5,50000,1]);
    let v2 = TrR.viewConvertion([10,5,50000,1]);
    let v3 = TrR.viewConvertion([5,10,50000,1]);

    v1 = TrR.screenProject(v1);
    v1.concat([0,0]);
    v2 = TrR.screenProject(v2);
    v2.concat([1,0]);
    v3 = TrR.screenProject(v3);
    v3.concat([0,1]);


    //console.log(v1);

    TrR.renTri(
        v1,
        v2,
        v3,
        "testTex"
    );

    renderZBuffer();
    clearZBuffer();
    */
}

function StageGimmick(){
    if (mainStage.StType == "Map_3"){
        if ( "Map_3" in mainStage.StageFrameC &&  "Map_3" in mainStage.StageFrameCountingF ){
            if (mainStage.countFrame(20,"Map_3")){
                let [x,y] = [randInt(0,TR.MapWidth*TILESIZE),randInt(0,TR.MapHeight*TILESIZE)];
                while (hitWallCheck(TR.NowCollision,TILESIZE,x,y)){
                    [x,y] = [randInt(0,TR.MapWidth*TILESIZE),randInt(0,TR.MapHeight*TILESIZE)];
                }
                EfM.spawnNPC(
                    x,
                    y,
                    -1000*deltaVector,
                    TILESIZE/2,
                    TILESIZE/2,
                    TILESIZE/2,
                    "particle_leef",
                    randFloat(-3,3),
                    randFloat(-3,3),
                    -12
                );
            }
        } else {
            mainStage.setCountEvent("Map_3");
        }
    }
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
        plSizeX,
        plSizeY,
        plSizeZ,
        nowStatus.MHP,
        nowStatus.MHP,
        nowStatus.STM,
        nowStatus.STM,
        nowStatus.SPD
    );
    playerCameraSet();
    //player.nonDamage = true;
    //player.hp = 1;
    //player.setCollision(false);
    //renderCamera.setCameraEffect(1,4,2,0,0,2);
}
export function sendSCRequest(request){
    if (stageChangeRequest == null){
        stageChangeRequest = request;
    }
}
async function executeSCRequest() {
    if (stageChangeRequest != null) {
        if (typeof(stageChangeRequest) == "string"){
            if (renderCamera.scA >= 255){
                actionStop = false;
                const name = stageChangeRequest;
                stageChangeRequest = null;
                mainStage.changeStage(name);
            } else {
                actionStop = true;
            }
        } else {
            const c = stageChangeRequest[1];
            const vc = stageChangeRequest[2];
            stageChangeRequest = stageChangeRequest[0];
            renderCamera.setScreenColor(c[0],c[1],c[2],c[3]);
            renderCamera.setAsyncFadeScreenColor(vc[0],vc[1],vc[2],vc[3]);
        }
    }
}

/**
 * @param {String} stageName 辞書に格納されているキー
 */
async function setStage(stageName){

    renderCamera.setScreenColor(1,1,1,254);
    renderCamera.setAsyncFadeScreenColor(0,0,6,-6);

    stageClear = 0;

    void AuM.stopAll();

    EnM.Disable();
    EfM.Disable();

    try {
        NowMap = Maps[stageName];
        NowMapCollision = MapCollisions[stageName];
        NowMapJSON = MapJSONs[stageName];
        TR.setMapData(NowMap,NowMapCollision);
        mapWidth = TR.MapWidth;
        mapHeight = TR.MapHeight;
    } catch (error) {
        console.error(`Error : ${error} undefined Map key : ${stageName}`);
    }
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
    EfM.Enable();
    
    renderCamera.setCameraEffect(0,0,0,0,0,0);
    renderCamera.setBGRayColor(0,0,0,0);
    if (stageName == "GrandFloor"){
        const warpHolePoint = [
            [160,256],
            [320,192],
            [672,192],
            [832,256],
        ];

        for (let i = 0; i<warpHolePoint.length; i++){
            EfM.spawnNPC(
                warpHolePoint[i][0]*VisualDeltaVector,
                warpHolePoint[i][1]*VisualDeltaVector,
                0,
                TILESIZE*2,
                TILESIZE*2,
                TILESIZE*2,
                "WarpHole",
                0,
                0,
                0,
                [i+1]
            );
        }
        //ラスボス専用（仮）のワープホール
        EfM.spawnNPC(
                496*VisualDeltaVector,
                176*VisualDeltaVector,
                0,
                TILESIZE*3,
                TILESIZE*3,
                TILESIZE*3,
                "WarpHole",
                0,
                0,
                0,
                [9]
            );
        //[496,160]
    } else if (stageName == "Map_4"){
        renderCamera.setCameraEffect(1,1.5,3,1,0,2.5);
        renderCamera.setBGRayColor(0,127,255,64);
    }

    if (NowMapJSON["isThereBoss"] == true) {
        try {
            const temp = await fetchJSON(NowMapJSON["BossPass"]); 
            NowBoss = new Boss(
                temp["Position"][0]*(TILESIZE/showTILESIZE),
                temp["Position"][1]*(TILESIZE/showTILESIZE),
                plSizeX*temp["sizeX"],
                plSizeY*temp["sizeY"],
                plSizeZ*temp["sizeZ"],
                temp["Name"],
                temp["status"][5]
            );
            if (temp["BGM"] != null) {
                //VS code's AI
                // AudioContext の resume がユーザー入力待ちになる場合でも、
                // その間にボス生成やステージ設定を続けられるように非同期処理を待たない。
                if (onBGM) {
                    void AuM.play(temp["BGM"], {
                        volume : 1,
                        pan : 0.0,
                        loop: true
                    });
                } else {
                    void AuM.stopAll();
                }
            }
        } catch (e) {
            console.error(`Error : ${e} NotFound Pass : ${NowMapJSON["BossPass"]}`);
        }
    } else {
        NowBoss = 0;
        if (onBGM) {
            /*
            void AuM.play(temp["BGM"], {
                volume : 1,
                pan : 0.0,
                loop: true
            });
            */
        } else {
            void AuM.stopAll();
        }
        
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
    
    BtoCRatioX = canvas.width/ScWidth;
    BtoCRatioY = canvas.height/ScHeight;
    CtoBRatioX = ScWidth/canvas.width;
    CtoBRatioY = ScHeight/canvas.height;
    //ドットくっきり～
    ctx.imageSmoothingEnabled = false;

}
//未使用の描画関数
/*
    function RenderBuffer(){
        //ドットくっきり～
        ScB.imageSmoothingEnabled = false;
        
        renderCamera.VibCamera();

        //バッファキャンバスのクリア
        //ScB.globalAlpha = 0.5;
        ScB.fillStyle = "rgb(0,0,0)";
        ScB.fillRect(0,0,ScWidth,ScHeight);

        //各自描画処理
        //ステージの描画
        RenderStage();
        //エネミーの描画；
        RenderEnemy();
        //エフェクトの描画
        RenderEffect();
        if (NowBoss != 0){
            console.log("sort!");
            if (NowBoss.py <= player.py) {
                //ボスの描画
                RenderBoss();
                //プレイヤーの描画
                RenderPlayer();
            } else {
                //プレイヤーの描画
                RenderPlayer();
                //ボスの描画
                RenderBoss();
            }
        } else {
            //プレイヤーの描画
            RenderPlayer();
        }
        
    }
*/
//正しい順番で描くマン
function RenderBufferCorrect(){
    //ドットくっきり～
    ScB.imageSmoothingEnabled = false;
    
    renderCamera.VibCamera();

    //バッファキャンバスのクリア
    //ScB.globalAlpha = 0.5;
    ScB.fillStyle = "rgb(0,0,0)";
    ScB.fillRect(0,0,ScWidth,ScHeight);
    
    //各自描画処理
    //ステージの描画
    RenderStage();

    let order = [
        ["Player",-1,player.py],
        ["PlayerA",-1,plaAttackAABB.py]
    ];
    //各データは [ タイプ , インデックス , Y座標値 ] で格納される
    //インデックスの関係ないものは-1をインデックス値にもつ

    const AcEn = EnM.spriteList.filter(
        function(npc){
            return npc.active === true;
        });
    if (AcEn.length > 0) {
        for (let i = 0; i<AcEn.length; i++){
            order.push(["Enemy",i,AcEn[i].py]);
        }
    }
    const AcEf = EfM.spriteList.filter(
        function(npc){
            return npc.active === true;
        });
    if (AcEf.length > 0) {
        for (let i = 0; i<AcEf.length; i++){
            order.push(["Effect",i,AcEf[i].py]);
        }
    }
    if (NowBoss != 0) {
        order.push(["Boss",-1,NowBoss.py]);
    }
    if (Array.isArray(order)){
        order.sort((a,b) => a[2] - b[2]);

        for (let i = 0; i<order.length; i++){
            let column = order[i];
            if (column[0] == "Player"){
                player.RenderMyself(renderCamera.camX,renderCamera.camY,"green",showHP);
            } else if (column[0] == "PlayerA"){
                plaAttackAABB.RenderMyself(renderCamera.camX,renderCamera.camY,"rgb(0,255,255)",false,false,true);
            } else if (column[0] == "Enemy"){
                const npc = AcEn[column[1]];
                npc.RenderMyself(renderCamera.camX,renderCamera.camY,"red",showHP);
            } else if (column[0] == "Effect"){
                const npc = AcEf[column[1]];
                npc.RenderMyself(renderCamera.camX,renderCamera.camY,"blue",false,false);
            } else if (column[0] == "Boss"){
                if (NowBoss.nonDamage) {
                    NowBoss.RenderMyself(renderCamera.camX,renderCamera.camY,"green",showHP,true);
                } else {
                    NowBoss.RenderMyself(renderCamera.camX,renderCamera.camY,"yellow",showHP,true);
                }
            } else {
                console.error(`Error! : unknown Rendering Type! ${colmun[0]} at ${i}`);
            }
        }


    } else {
        console.error("Error! : order.length is not enough!");
    }
    
}
//バッファの内容を転送する関数
function RenderCanvas(){

    //モーションブラー定数(0~1)
    ctx.globalAlpha = 0.75;
    //バッファの内容を実際のcanvasへ転送

    if (renderCamera.effectMode == 1){
        for (let ri = 0; ri<ScHeight; ri++){
            //console.log(`line : ${ri}, val : ${Math.round(renderCamera.ScHScrBuffer[ri])}`);
            ctx.drawImage(
                ScreenB,
                Math.round(renderCamera.ScHScrBuffer[ri]),ri,ScWidth,1,
                0,BtoCRatioY*ri,canvas.width,BtoCRatioY
            );
        }
    } else if (renderCamera.effectMode == 2){
        for (let ri = 0; ri<ScWidth; ri++){
            //console.log(`line : ${ri}, val : ${Math.round(renderCamera.ScHScrBuffer[ri])}`);
            ctx.drawImage(
                ScreenB,
                ri,Math.round(renderCamera.ScWScrBuffer[ri]),1,ScHeight,
                BtoCRatioX*ri,0,BtoCRatioX,canvas.height
            );
        }
    } else {
        ctx.drawImage(ScreenB,0,0,ScWidth,ScHeight,0,0,canvas.width,canvas.height);
    }

    if (!isPause) renderCamera.doCameraEffect();

    
    //スクリーンカラーレイヤとオーバーカラーのブレンドと貼り付け
    //現在のスタイルを退避
    const restore = ctx.fillStyle;
    let {R=255,G=255,B=255,A=0} = renderCamera.BGRayColor;

    ctx.save();

    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(${R},${G},${B},${A/255})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = `rgba(${renderCamera.scR},${renderCamera.scG},${renderCamera.scB},${(renderCamera.scA)/255})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    //復元
    ctx.fillStyle = restore;

    //BGM関連のメッセージ
    ctx.font = "20px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`This is debug. keyCFG : ${keyConfig}`, canvas.width / 2, canvas.height - 56);
    //ctx.fillText(`This is debug. asyncFadeVRGBA : ${[renderCamera.asyncFadeVR, renderCamera.asyncFadeVG, renderCamera.asyncFadeVB, renderCamera.asyncFadeVA]}`, canvas.width / 2, canvas.height - 84);
    ctx.fillText(`This is debug. BGRay : ${[renderCamera.BGRayColor.R, renderCamera.BGRayColor.G, renderCamera.BGRayColor.B, renderCamera.BGRayColor.A]}`, canvas.width / 2, canvas.height - 84);
    ctx.fillText(`This is debug. RGBA : ${[renderCamera.scR, renderCamera.scG, renderCamera.scB, renderCamera.scA]}`, canvas.width / 2, canvas.height - 110);
    if (onBGM) {
        if (isUserGesture == "yet" || isUserGesture == "action"){
            ctx.fillText("Please click screen or Press any key...", canvas.width / 2, canvas.height - 28);
        } else {
            ctx.fillText("The BGM Program is Enabled.", canvas.width / 2, canvas.height - 28);
        }
    } else {
        ctx.fillText("The BGM Program is Disabled.", canvas.width / 2, canvas.height - 28);
    }

    //ポーズ画面の描画
    executeTextRenRecuest();
    if (isPause || toFadeStage){
        //Unit size of quad of Canvas
        const UCX = canvas.width/4;
        const UCY = canvas.height/4;
        const tsx = 3*UCX/(baseTXTBufX);
        const tsy = 2*UCY/(baseTXTBufY);
        setTextSize(Math.min(tsx,tsy)); 
        
        clearTextBuffer();
        renderUI(
            UCX/2,
            UCY,
            UCX*3,
            UCY*2,
            [0,0,0,192],
            true,
            TextSize/4,
            [255,255,255,255]
        );

        if (setting == 0){
            if (isPause){
                //カーソル移動
                if (playerKey.pulseKeyDown || playerKey.pulseKeyLeft){
                    pauseCursorItem++;
                } else if (playerKey.pulseKeyUp || playerKey.pulseKeyRight){
                    pauseCursorItem--;
                }
            }
            if (mainStage.StType != "GrandFloor"){
                if (isPause) {
                    const startX = Math.floor(baseTXTBufX/6);
                    const startY = 1;
                    textWrite(startX,startY,"メインホールへもどりますか？");
                    textWrite(startX,startY+1,"もどる");
                    textWrite(startX,startY+2,"たたかう");
                    textWrite(startX,startY+4,"Fキーで決定");

                    if (mod(pauseCursorItem,4) < 2) textWrite(startX-1,startY+1+mod(pauseCursorItem,2),"▶");

                    if (playerKey.pulseDesisionKey){
                        if (mod(pauseCursorItem,4) == 0){
                            
                            actionStop = true;
                            isPause = false;
                            toFadeStage = true;
                            
                            renderCamera.setScreenColor(1,1,254,1);
                            renderCamera.setAsyncFadeScreenColor(0,0,-3,3);
                            
                            //mainStage.changeStage("GrandFloor");
                        } else if (mod(pauseCursorItem,4) == 1) {
                            isPause = false;
                        }
                    }
                } else if (toFadeStage){
                    if (renderCamera.scA >= 255){
                        actionStop = false;
                        toFadeStage = false;
                        mainStage.changeStage("GrandFloor");
                    }
                }

            } else {
                if (isPause) {
                    const startX = Math.floor(baseTXTBufX/3);
                    const startY = 3;
                    if (mod(pauseCursorItem,4) == 1) pauseCursorItem = 3;
                    if (mod(pauseCursorItem,4) == 0) pauseCursorItem = 2;
                    textWrite(startX,startY,"ポーズ中……");
                }
            }

            if (isPause){
                
                textWrite(2,6,"キーコンフィグ");
                textWrite(12,6,"サウンド");

                if (mod(pauseCursorItem,4)-2 == 0) {
                    textWrite(1,6,"▶");
                    if (playerKey.pulseDesisionKey){
                        setting = 1;
                    }
                } else if (mod(pauseCursorItem,4)-2 == 1){
                    textWrite(11,6,"▶");
                    /*
                    if (playerKey.pulseDesisionKey){
                        setting = 2;
                    }
                    */
                    textWrite(8,3,"現在、無効です。");
                }

            }
        } else if (setting == 1) {
            //カーソル移動
            if (playerKey.pulseKeyDown || playerKey.pulseKeyLeft){
                pauseCursorItem++;
            } else if (playerKey.pulseKeyUp || playerKey.pulseKeyRight){
                pauseCursorItem--;
            }
            pauseCursorItem = mod(pauseCursorItem,3);
            textWrite(2,1,"FPSモード");
            textWrite(2,3,"ORGモード");
            textWrite(2,5,"もどる");
            textWrite(1,6,"Fキーで決定");
            
            if (keyConfig == 0){
                textWrite(10,6,"現在：ORG");
            } else {
                textWrite(10,6,"現在：FPS");
            }
            if (pauseCursorItem == 0){
                textWrite(1,1,"▶");
                
                textWrite(9,0,"移動………WASD");
                textWrite(9,1,"攻撃………マウス");
                //textWrite(9,2,"　　マウスクリック");
                textWrite(9,3,"ジャンプ…スペース");
                textWrite(9,4,"ステップ…");
                textWrite(9,5,"　シフト＋スペース");
                textWrite(9,6,"ポーズ……P,R");

                if (playerKey.pulseDesisionKey){
                    keyConfig = 1;
                }
            } else if (pauseCursorItem == 1){
                textWrite(1,3,"▶");
                
                textWrite(9,0,"移動………WASD,");
                textWrite(9,1,"　　　矢印キー");
                textWrite(9,2,"攻撃………Z");
                textWrite(9,3,"ジャンプ…X");
                textWrite(9,4,"ステップ…C");
                textWrite(9,5,"ポーズ……スペース");
                
                if (playerKey.pulseDesisionKey){
                    keyConfig = 0;
                }
            } else if (pauseCursorItem == 2){
                textWrite(1,5,"▶");
                if (playerKey.pulseDesisionKey){
                    setting = 0;
                }
            }
        } else if (setting == 2) {
            //カーソル移動
            if (playerKey.pulseKeyDown || playerKey.pulseKeyLeft){
                pauseCursorItem++;
            } else if (playerKey.pulseKeyUp || playerKey.pulseKeyRight){
                pauseCursorItem--;
            }
            pauseCursorItem = mod(pauseCursorItem,3);
            textWrite(6,1,"オン");
            textWrite(6,3,"オフ");
            textWrite(6,5,"もどる");
            textWrite(1,6,"Fキーで決定");
            
            if (onBGM){
                textWrite(10,6,"現在：オン");
            } else {
                textWrite(10,6,"現在：オフ");
            }
            if (pauseCursorItem == 0){
                textWrite(1,1,"▶");
                
                if (playerKey.pulseDesisionKey){
                    onBGM = true;
                }
            } else if (pauseCursorItem == 1){
                textWrite(1,3,"▶");

                if (playerKey.pulseDesisionKey){
                    onBGM = false;
                }
            } else if (pauseCursorItem == 2){
                textWrite(1,5,"▶");
                if (playerKey.pulseDesisionKey){
                    setting = 0;
                }
            }
        }
        
        rendertxtBuffer(tsx/4+(UCX/2),tsy/2+UCY,tsx,tsy);

    }

    if (DebugMode){
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,TextSize*7,TextSize*3);
        ctx.font = `${TextSize}px monospace`;
        ctx.textBaseline = "top";
        ctx.textAlign = "start";
        ctx.fillStyle = "rgb(0, 160, 0)";
        ctx.fillText(`FPS:${Math.round(fps*10)/10}`,0,0);
        ctx.fillText(`Delta:${Math.round(frameDelta*10)/10}`,0,TextSize);
        ctx.fillText(`Delta:${fpsFrameCount}`,0,TextSize*2);
    }
    ctx.restore();
}
function executeTextRenRecuest(){
    for (const k in textRenderRequestList){
        //データ構造は[テキスト,X座標,Y座標,カラー]
        const req = textRenderRequestList[k];
        renderText(req[0],BtoCRatioX*(req[1]+renderCamera.camX),BtoCRatioY*(req[2]+renderCamera.camY),req[3]);
    }
    textRenderRequestList = {};
}
/*
function RenderPlayer(){

    player.RenderMyself(renderCamera.camX,renderCamera.camY,"green",DebugMode);
    plaAttackAABB.RenderMyself(renderCamera.camX,renderCamera.camY,"rgb(0,255,255)",DebugMode,false,true);
    
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
        
    }
}
function RenderBoss(){
    if (NowBoss != 0) {
        if (NowBoss.nonDamage) {
            NowBoss.RenderMyself(renderCamera.camX,renderCamera.camY,"green",DebugMode,true);
        } else {
            NowBoss.RenderMyself(renderCamera.camX,renderCamera.camY,"yellow",DebugMode,true);
        }
    }
}
*/
function RenderStage() {

    frameC++;

    if (frameC >= 120) {
        frameC = 0;
    }

    frame++;

    if (!isPause){
        //cameraSet(frameC,0);
        //console.log([player.px,player.py]);
        //if (!keyInput.key["KeyC"]) {
        playerCameraSet(1);
        //}
        RenderCameraSet();
    }
    TR.RenderMap(renderCamera.camX,renderCamera.camY,DebugMode,Math.floor(frameC/30));

    //ScB.drawImage(Image.ImgList.get("tile-0"),0,0)

}
/**
 * フェードイン関数
 * @param {Number} a 変更前の値
 * @param {Number} b 変更したい値
 * @param {Number} speed 変化率（分母の値）
 */
export function fadeIn(a,b,speed){
    if (Math.round(b-a) == 0){
        return 0;
    } else {
        return (b-a)/(speed/(frameDelta/25));
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

    //renderCamera.offX += fadeIn(renderCamera.offX,(-TILESIZE*player.vx*2/3),4);
    //renderCamera.OffY += fadeIn(renderCamera.OffY,(-TILESIZE*player.vy*2/3),4);

    const TarX = player.px-(ScreenB.width/2);
    const TarY = player.py-(ScreenB.height/2);

    if (!smooth) {
        playerCamera.camX = TarX;
        playerCamera.camY = TarY;
    } else {
        playerCamera.camX += fadeIn(playerCamera.camX,TarX,8);
        playerCamera.camY += fadeIn(playerCamera.camY,TarY,8);
    }
    
}
//キー入力を受け取る関数　　keyInputオブジェクトのプロパティをいじる。
function getkey() {

    keyInput.key["Desision"] = Keys["KeyF"];

    if (keyConfig == 0){
        if ((Keys["KeyW"] | Keys["ArrowUp"]) == true) {
            keyInput.key["KeyW"] = true;
        } else {
            keyInput.key["KeyW"] = false;
        }
        if ((Keys["KeyA"] | Keys["ArrowLeft"]) == true) {
            keyInput.key["KeyA"] = true;
        } else {
            keyInput.key["KeyA"] = false;
        }
        if ((Keys["KeyS"] | Keys["ArrowDown"]) == true) {
            keyInput.key["KeyS"] = true;
        } else {
            keyInput.key["KeyS"] = false;
        }
        if ((Keys["KeyD"] | Keys["ArrowRight"]) == true) {
            keyInput.key["KeyD"] = true;
        } else {
            keyInput.key["KeyD"] = false;
        }

        if (Keys["KeyZ"] == true) {
            keyInput.key["KeyZ"] = true;
        } else {
            keyInput.key["KeyZ"] = false;
        }
        if (Keys["KeyX"] == true) {
            keyInput.key["KeyX"] = true;
        } else {
            keyInput.key["KeyX"] = false;
        }
        if (Keys["KeyC"] == true) {
            keyInput.key["KeyC"] = true;
        } else {
            keyInput.key["KeyC"] = false;
        }

        if (Keys["Space"] == true) {
            keyInput.key["Space"] = true;
        } else {
            keyInput.key["Space"] = false;
        }
        if (Keys["KeyQ"] == true) {
            keyInput.key["KeyQ"] = true;
        } else {
            keyInput.key["KeyQ"] = false;
        }
    } else {
        if (Keys["KeyW"] == true) {
            keyInput.key["KeyW"] = true;
        } else {
            keyInput.key["KeyW"] = false;
        }
        if (Keys["KeyA"] == true) {
            keyInput.key["KeyA"] = true;
        } else {
            keyInput.key["KeyA"] = false;
        }
        if (Keys["KeyS"] == true) {
            keyInput.key["KeyS"] = true;
        } else {
            keyInput.key["KeyS"] = false;
        }
        if (Keys["KeyD"] == true) {
            keyInput.key["KeyD"] = true;
        } else {
            keyInput.key["KeyD"] = false;
        }

        if ((mouseClick/* | Keys["KeyV"] | Keys["KeyF"]*/) == true) {
            keyInput.key["KeyZ"] = true;
        } else {
            keyInput.key["KeyZ"] = false;
        }
        if (Keys["Space"] == true) {
            keyInput.key["KeyX"] = true;
        } else {
            keyInput.key["KeyX"] = false;
        }
        if ((Keys["ShiftLeft"] & Keys["Space"]) == true) {
            keyInput.key["KeyC"] = true;
        } else {
            keyInput.key["KeyC"] = false;
        }

        if ((Keys["KeyP"] | Keys["KeyR"])== true) {
            keyInput.key["Space"] = true;
        } else {
            keyInput.key["Space"] = false;
        }
        /*
        if (Keys["KeyQ"] == true) {
            keyInput.key["KeyQ"] = true;
        } else {
            keyInput.key["KeyQ"] = false;
        }
        */
    }
    keyConvert();
}
//プレイヤーのキー入力を更新する
function keyConvert(){
    playerKey.keyLeft = keyInput.key["KeyA"];
    playerKey.keyRight = keyInput.key["KeyD"];
    playerKey.keyUp = keyInput.key["KeyW"];
    playerKey.keyDown = keyInput.key["KeyS"];
    playerKey.keyA_button = keyInput.key["KeyZ"];
    playerKey.keyB_button = keyInput.key["KeyX"];
    playerKey.keyC_button = keyInput.key["KeyC"];
    playerKey.keyPause = keyInput.key["Space"];
    playerKey.DesisionKey = keyInput.key["Desision"];
    playerKey.pulseSet();
    //console.log(Keys);
}
function plyayerAction(){

    let vx = 0; let vy = 0;

    const nowPlaDir = player.direction;

    let spd = 4;
    let staminaDecreaseMult = 0.2;
    playerBaseAcs = player.Speed/5;

    if (mainStage.StType == "Map_2"){
        spd = 14;
    } else if (mainStage.StType == "Map_4"){
        spd = 15;
        player.inWater = true;
        playerBaseAcs = playerBaseAcs*2;
        staminaDecreaseMult = 0.25;
    }


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
            if (Math.abs(player.vy) < 0.5) player.vy = 0;
            player.direction = 6;
        } else if (playerKey.keyRight) {
            player.setVector(playerBaseAcs,0,player.vz,true,spd);
            if (Math.abs(player.vy) < 0.5) player.vy = 0;
            player.direction = 2;
        }else if (playerKey.keyUp) {
            player.setVector(0,playerBaseAcs*-1,player.vz,true,spd);
            if (Math.abs(player.vx) < 0.5) player.vx = 0;
            player.direction = 0;
        } else if (playerKey.keyDown) {
            player.setVector(0,playerBaseAcs,player.vz,true,spd);
            if (Math.abs(player.vx) < 0.5) player.vx = 0;
            player.direction = 4;
        } else {
            player.slowDown(spd);
        }

        if (playerKey.pulsekeyC_button && player.pz >= -3 && player.stamina >= player.MaxStamina*staminaDecreaseMult) {
            //バックステップ（要修正）
            //console.log("executed");
            player.setPos(player.px,player.py,0);
            player.ZAxisJump(-6);
            player.setVector(1.5*playerBaseAcs*VecDirList[player.direction][0],1.5*playerBaseAcs*VecDirList[player.direction][1]);
            player.setStaminaRelative(-player.MaxStamina*staminaDecreaseMult);
            player.VLOCK = true;
        } else {
            if (player.vz >= 0) {
                player.VLOCK = false;
            }
            if (player.pz >= 0) {
                player.VLOCK = false;
                //player.OVLOCK = false;
            }
            if (playerKey.pulsekeyB_button && player.pz >= -3) {
                //ジャンプ
                player.setPos(player.px,player.py,0);
                player.ZAxisJump(-6);
            }
        }
        
        //攻撃モーション
        if (playerKey.pulsekeyA_button && player.animationState <= 3) {
            EfM.spawnNPC(
                player.px+(VecDirList[player.direction][0]*player.sx/2),
                player.py+(VecDirList[player.direction][1]*player.sy/2),
                player.pz,
                player.sx*2,player.sx*3/2,player.sz,"sword");
            player.changeAnimState(4);
        }
        /*  アニメーション処理  */

        //グラフィック実装時に書き換え必須！！！

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
            //攻撃判定の設定
            
            plaAttackAABB.setSize(
                TILESIZE*2+(TILESIZE/4)*(Math.abs(VecDirList[player.direction][1])),//+10*(Math.abs(VecDirList[player.direction][1])),
                TILESIZE*2+(TILESIZE/4)*(Math.abs(VecDirList[player.direction][1])),//+10*(Math.abs(VecDirList[player.direction][0])),
                TILESIZE*2
            );
            
            //1/20周期
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

    //HPがなくても空中で投げられてたら動けはする
    if (player.hp > 0 || player.pz < 0){
        //setStage("Debug2");

        

        player.move(NowMapCollision,TILESIZE);
        
        if (player.animationState == 4) {
            plaAttackAABB.setPos(
                player.px+(VecDirList[player.direction][0]*plaAttackAABB.sx/2),
                player.py+(VecDirList[player.direction][1]*plaAttackAABB.sy/2),
                player.pz);
            plaAttackAABB.direction = player.direction;
        } else {
            plaAttackAABB.setPos(65536*deltaVector,65536*deltaVector,65536*deltaVector);
        }
        
    } else {
        renderCamera.setScreenColorRelative(-3,0,0,2);
        if (renderCamera.scA >= 255){
            mainStage.changeStage("GrandFloor");
        } else {
            renderCamera.setCameraEffect(1,
                1.5+(renderCamera.scA/128),
                renderCamera.scA/10,
                1,
                renderCamera.e_valW,
                2+(renderCamera.scA/255)
            );
        }
    }
    if (player.hp <= 0) {
        if (!player.OVLOCK){
            renderCamera.setScreenColor(254,1,1,0);
        }
        player.OVLOCK = true;

        if (!player.invisilbe) {
            player.invisibleTime = player.maxInvisibleTime;
            player.invisilbe = true;
            console.log(`executed! iT : ${player.invisibleTime}`);
        }

    }

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
            //setStage("Debug");

        }
    */

    //console.log(player.collisionState.toString(2).padStart(8,"0"));

    

}
function bossAction(){
    if (NowBoss != 0) {
        NowBoss.BossAction(NowMapCollision,TILESIZE);
        if (!NowBoss.allive) {
            NowBoss = 0;
            stageClear = 1;
            console.log("Boss Died! YaY!!");
        }
    }
}
function EffectAction(){
    let AcEf = EfM.spriteList.filter(
        function(npc){
            return npc.active == true;
        })
    for (let i = 0; i<AcEf.length; i++){
        let npc = AcEf[i];

        npc.EffectAction(NowMapCollision,TILESIZE,i);
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
        if (NowBoss != 0 && NowBoss.BossState == "died") {
            npc.Unactivate();
        } else {
            npc.EnemyAction(NowMapCollision,TILESIZE,i);
        }

    }

}

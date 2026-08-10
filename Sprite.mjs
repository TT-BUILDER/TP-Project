import { EfM, randInt, TextSize, toFadeStage } from "./EngineMain.mjs";
import { randFloat } from "./EngineMain.mjs";
import { radians } from "./EngineMain.mjs";
import { degrees } from "./EngineMain.mjs";
import { fadeIn } from "./EngineMain.mjs";
import { playerCamera } from "./EngineMain.mjs";
import { renderCamera } from "./EngineMain.mjs";
import { screenSetOffsetRand } from "./EngineMain.mjs";
import { screenSetOffset } from "./EngineMain.mjs";
import { player } from "./EngineMain.mjs";
import { plaAttackAABB } from "./EngineMain.mjs";
import { nowStatus } from "./EngineMain.mjs";
import { EnM } from "./EngineMain.mjs";
import { img } from "./EngineMain.mjs";
import { IR } from "./EngineMain.mjs";
import { VecDirList } from "./EngineMain.mjs";
import { mapWidth } from "./EngineMain.mjs";
import { mapHeight } from "./EngineMain.mjs";
import { NowBoss } from "./EngineMain.mjs";
import { deltaVector } from "./EngineMain.mjs";
import { DebugMode } from "./EngineMain.mjs";
import { isPause } from "./EngineMain.mjs";
import { textRenderRequestList } from "./EngineMain.mjs";
import { BtoCRatioX } from "./EngineMain.mjs";
import { BtoCRatioY } from "./EngineMain.mjs";
import { enableGoStageList } from "./EngineMain.mjs";
import { mapDescriptionList } from "./EngineMain.mjs";
import { sendSCRequest } from "./EngineMain.mjs";
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

import { TILESIZE } from "./TileRender.mjs";
import { showTILESIZE } from "./TileRender.mjs";

let NowCanvas;
let NowCTX;
export let isNowBossAnimation = false;
const maxFallSpeed = 16

export function NowCanvasContext(canvas,context){
    NowCanvas = canvas;
    NowCTX = context;
}
export function dotProduct(Pos1,Pos2){
    return (Pos1[0]*Pos2[0]+Pos1[1]*Pos2[1]);
}
/**
     * @param {Array} ColMap コリジョンマップ
     * @param {Number} TILESIZE 1タイル当たりのピクセル数
     * @param {Number} px ポジションX
     * @param {Number} py ポジションY
     * @param {Number} sx サイズX
     * @param {Number} sy サイズY
     * @returns {Boolean} 当たったかどうかをブール値で返す
     */
export function hitWallCheck(ColMap,TILESIZE,px,py,sx,sy){
    const ltx = Math.floor((px-(sx/2))/TILESIZE);
    const rtx = Math.floor((px+(sx/2)-1)/TILESIZE);
    const uty = Math.floor((py-(sy/2))/TILESIZE);
    const dty = Math.floor((py+(sy/2)-1)/TILESIZE);

    for (let iy = uty; iy <= dty; iy++){

        //undefine回避
        if (ColMap.length <= iy || iy < 0) return 1;

        for (let ix = ltx; ix <= rtx; ix++){

            //undefine回避
            if (ColMap[iy].length <= ix || ix < 0) return 1;

            if (ColMap[iy][ix] > 0) {
                return 1;
            }
        } 
    }
    return 0;

}
export class imgData {
    /**
     * 画像データの保持をする構造体
     * @param {Image} imgD 画像本体
     * @param {Number} trimSX トリミング開始位置X
     * @param {Number} trimSY トリミング開始位置Y
     * @param {Number} trimEX トリミング終了位置X
     * @param {Number} trimEY トリミング終了位置Y
     * @param {Number} sizeX 描画サイズX
     * @param {Number} sizeY 描画サイズY
     * @param {Number} rad 回転角度
     */
    constructor(imgD,trimSX = 0,trimSY = 0,trimEX = imgD.width,trimEY = imgD.height,sizeX = imgD.width,sizeY = imgD.height,rad = 0){
        this.imageData = imgD;
        this.trimStX = trimSX;
        this.trimStY = trimSY;
        this.trimEnX = trimEX;
        this.trimEnY = trimEY;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.roll = rad;
    }
    setAnimIndex(csX,csY){
        this.charSizeX = csX;
        this.charSizeY = csY;
        this.charIndexX = Math.floor(this.imageData.width/csX);
        this.charIndexY = Math.floor(this.imageData.height/csY);
        return [this.charIndexX,this.charIndexY];

    }
    /**
     * 描画サイズの設定
     * @param {Number} sx 描画サイズX
     * @param {Number} sy 描画サイズY
     */
    setSize(sx,sy){
        this.sizeX = sx;
        this.sizeY = sy;
    }
    /**
     * トリミング設定
     * @param {Number} trimSX トリミング開始位置X
     * @param {Number} trimSY トリミング開始位置Y
     * @param {Number} sizeX トリミングサイズX
     * @param {Number} sizeY トリミングサイズY
     */
    setTrim(trimSX,trimSY,sizeX,sizeY){
        this.trimStX = trimSX;
        this.trimStY = trimSY;
        this.trimEnX = trimSX + sizeX;
        this.trimEnY = trimSY + sizeY;
    }
    /**
     * 画像描画
     * @param {Number} px 描画位置X
     * @param {Number} py 描画位置Y
     */
    render(px,py){
        IR.renderImg(
            this.imageData,
            px,
            py,
            this.roll,
            this.sizeX,
            this.sizeY,
            this.trimStX,
            this.trimStY,
            this.trimEnX,
            this.trimEnY
        )
    }
    /**
     * レンダリングする画像の設定（トリミング位置は自動で全体へと決定）
     * @param {Image} imgData 画像本体
     */
    setImage(imgData){
        this.imageData = imgData;
        this.setSize(this.imageData.width,this.imageData.height);
        this.setTrim(0,0,this.imageData.width,this.imageData.height);
    }
}

export class EnemyManager {
    constructor(Max = 100){
        this.spriteList = [];
        this.EnFlag = true;

        for (let i = 0; i < Max; i++){
            this.spriteList.push(new Enemy(0,0,0,0,0,"Enemy"));
        }

        //this.spriteNameList = [];
    }
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} pz ポジションｚ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {Number} sz サイズｚ
     * @param {String} type タイプ
     * @param {Number} vx ベクトルX
     * @param {Number} vy ベクトルY
     * @param {Number} vz ベクトルZ
     * @param {Number} MemLength そのエネミーが保持できる固有メモリ。中身を直接記述もできる。
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    spawnNPC(px,py,pz,sx,sy,sz,type,vx = 0,vy = 0,vz = 0,MemLength = [],MHP = 1,HP = MHP){
        if (this.EnFlag){
            const availableNPC = this.spriteList.find(npc => !npc.active);

            if (availableNPC) {
                availableNPC.activate(px,py,pz,sx,sy,sz,type,vx,vy,vz,MemLength,HP);
            } else {
                console.warn("Full of Enemy!");
            }
        }
    }
    Disable(){
        this.EnFlag = false;
        let Unactivate = this.spriteList.filter(
            function(npc){
                return npc.active == true;
        });
        for (let i = 0; i < Unactivate.length; i++){
            Unactivate[i].Unactivate();
        }
    }
    Enable(){
        this.EnFlag = true;
    }


}

export class EffectManager {
    constructor(Max = 100){
        this.spriteList = [];
        this.EfFlag = true;

        for (let i = 0; i < Max; i++){
            this.spriteList.push(new Effect(0,0,0,0,0,"effect"));
        }

        //this.spriteNameList = [];
    }
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} pz ポジションｚ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {Number} sz サイズｚ
     * @param {String} type タイプ
     * @param {Number} vx ベクトルX
     * @param {Number} vy ベクトルY
     * @param {Number} vz ベクトルZ
     * @param {Number} MemLength そのエネミーが保持できる固有メモリ。中身を直接記述もできる。
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    spawnNPC(px,py,pz,sx,sy,sz,type,vx = 0,vy = 0,vz = 0,MemLength = [],MHP = 1,HP = MHP){
        if (this.EfFlag){
            const availableEffect = this.spriteList.find(npc => !npc.active);

            if (availableEffect) {
                availableEffect.activate(px,py,pz,sx,sy,sz,type,vx,vy,vz,MemLength,HP);
            } else {
                console.warn("Full of Effect!");
            }
        }
    }
    Disable(){
        this.EfFlag = false;
        let Unactivate = this.spriteList.filter(
            function(npc){
                return npc.active == true;
        });
        for (let i = 0; i < Unactivate.length; i++){
            Unactivate[i].Unactivate();
        }
    }
    Enable(){
        this.EfFlag = true;
    }


}

//Debug End
export class sprite {
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {Number} sz サイズｚ
     * @param {String} type タイプ
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHPHP）
     */
    constructor(px,py,sx,sy,sz,type,MHP = 1,HP = MHP,MST = 1,ST = MST,SPD = 4){
        this.px = px;
        this.py = py;
        this.pz = 0;
        this.visualPX = 0;
        this.visualPY = 0;
        this.gravity = 1.5;
        this.slowDownV = 2;
        this.minus = 0;
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
        this.dafaultSX = this.sx;
        this.dafaultSY = this.sy;
        this.defaultSZ = this.sz;
        this.type = type;
        this.MaxHp = MHP;
        this.hp = HP;
        this.MaxStamina = MST;
        this.stamina = ST;
        this.Speed = SPD;
        this.animationFrame = 0;
        this.animationState = 0;
        this.state = 0;
        this.collisionFlag = 1;
        //U D L R
        this.collisionState = 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.inWater = false;
        this.waterRegist = 1;
        this.nonDamage = false;
        this.VLOCK = false;
        this.OVLOCK = false;
        this.EVLOCK = false;
        //ダメージ関係
        this.invisilbe = false;
        //フレーム単位
        this.invisibleTime = 0;
        this.maxInvisibleTime = 25;
        this.stop = false;
        this.showflag = true;
        this.direction = 0;
        this.myImg = new imgData(img.imgList["null"]);
        this.animFrameClockDiv = 1;
        this.animFrameClock = 0;
        this.animFrameSumByClock = 0;
    }
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {Number} sz サイズｚ
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHPHP）
     */
    initalize(px,py,sx,sy,sz,MHP = 1,HP = MHP,MST = 1,ST = MST,SPD = 4){
        this.px = px;
        this.py = py;
        this.pz = 0;
        this.visualPX = 0;
        this.visualPY = 0;
        this.gravity = 1.5;
        this.slowDownV = 2;
        this.minus = 0;
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
        this.dafaultSX = this.sx;
        this.dafaultSY = this.sy;
        this.defaultSZ = this.sz;
        this.MaxHp = MHP;
        this.hp = HP;
        this.MaxStamina = MST;
        this.stamina = ST;
        this.Speed = SPD;
        this.animationFrame = 0;
        this.animationState = 0;
        this.state = 0;
        this.collisionFlag = 1;
        //U D L R
        this.collisionState = 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.inWater = false;
        this.waterRegist = 1;
        this.nonDamage = false;
        this.VLOCK = false;
        this.OVLOCK = false;
        this.EVLOCK = false;
        //ダメージ関係
        this.invisilbe = false;
        //フレーム単位
        this.invisibleTime = 0;
        this.maxInvisibleTime = 32;
        this.direction = 0;
        this.myImg = new imgData(img.imgList["null"]);
        this.animFrameClockDiv = 1;
        this.animFrameClock = 0;
        this.animFrameSumByClock = 0;
        
    }

    setVisulaPos(px = 0, py = 0){
        this.visualPX = px;
        this.visualPY = py;
    }

    /**
     * animationFrameのクリア
     * @param {Number} num セットしたいanimationFrameの値
     */
    clearFrame(num = 0){
        this.animationFrame = num;
    }
    /**
     * animFrameSumByClockのクリア
     */
    clearanimFrameSum(){
        this.animFrameSumByClock = 0;
    }
    /**
     * animFrameClockDiv（何フレームでanimationFrameのインクリメントを行うか）にセットしたい値
     * @param {Number} div animFrameClockDivにセットしたい値
     */
    setAnimFrameClockDiv(div){
        this.animFrameClockDiv = div;
    }
    /**
     * 指定したフレーム分待機してから指定ステートへ移行する。
     * @param {Number} frame 移行にかけるフレーム数
     * @param {Number} state 移行したいステート番号
     */
    incrementAnimFrame(frame,state){
        this.animationFrame++;
        if (frame <= this.animationFrame){
            this.changeAnimState(state);
        }
    }
    changeAnimState(state){
        this.animationFrame = 0;
        this.clearanimFrameSum();
        this.animationState = state;
    }
    updateAnimSumByClock(){
        this.animFrameClock++;
        if (this.animFrameClock >= this.animFrameClockDiv) {
            this.animFrameClock = 0;
            this.animFrameSumByClock++;
        }
    }

    /**
     * 
     * @param {Number} CamX どのカメラを基準に描くかX
     * @param {Number} CamY どのカメラを基準に描くかY
     * @param {String} style カラースタイル。
     * @param {boolean} ShowHP HPを表示するかどうか（デバッグ）
     * @param {boolean} ShowShadow 影を表示するかどうか
     * @param {Number} imgStX 画像の切り取り開始点X
     * @param {Number} imgStY 画像の切り取り開始点Y
     * @param {Number} imgSX 画像の切り取りサイズX
     * @param {Number} imgSY 画像の切り取りサイズY
     */
    RenderMyself(CamX,CamY,style,ShowHP = false,ShowShadow = true,showImg = true,imgStX = 0,imgStY = 0,imgSX = this.myImg.imageData.width, imgSY = this.myImg.imageData.height){
        if (this.invisilbe){
            this.invisibleTime--;
            if (this.invisibleTime <= 0) this.invisilbe = false;
        }
        const RenSprX = this.px + CamX + this.visualPX;
        const RenSprY = this.py + CamY + this.pz + this.visualPY;
        NowCTX.beginPath();
        //影
        if (ShowShadow) {
            let Alpha = 25;//+this.pz*0.2;
            if (Alpha < 0) Alpha = 0;
            let cx = (this.sx*0.7);//-(this.pz*-0.01);
            let cy = (this.sy/3);//-(this.pz*-0.01);
            if (cx < 0) cx = 0; if (cy < 0) cy = 0;
            NowCTX.fillStyle = `rgb( 0 0 0 / ${Alpha}%)`;
            NowCTX.ellipse(
                this.px+CamX,
                this.py+CamY+this.sy/2,
                cx,
                cy,
                0,
                0,
                Math.PI*2);
            NowCTX.fill();
        }
        //本体を描くかどうか
        if (this.showflag && this.invisibleTime % 4 <= 1) {
            if(showImg){
                this.myImg.setTrim(imgStX,imgStY,imgSX,imgSY);
                //this.myImg.setSize(this.sx,Math.max(this.sz,this.sy));
                this.myImg.setSize(this.sx,this.sz);
                this.myImg.render(RenSprX,RenSprY-(this.sz/2)+(this.sy/2));
            }
            //NowCTX.arc(32,32,32,0,Math.PI*2,false);
            if (this.invisibleTime % 4 <= 1) {
                let RestoreAplha = NowCTX.globalAlpha;
                NowCTX.globalAlpha = 0.5;
                NowCTX.fillStyle = style;
                NowCTX.fillRect(
                    (RenSprX-(this.sx/2)),
                    (RenSprY-(this.sy/2)),
                    this.sx,
                    this.sy
                );
                NowCTX.globalAlpha = RestoreAplha;
            }
        }
        
        //HP
        if (ShowHP) {
            //NowCTX.fillStyle = "white";
            
            NowCTX.fillStyle = "red";
            if (DebugMode){
                NowCTX.textAlign = "center";
                NowCTX.textBaseline = "middle";
                NowCTX.font = `${14*deltaVector}px monospace`;
                NowCTX.fillText(`HP:${this.hp},Dir:${this.direction}`,RenSprX,RenSprY+this.sy+(10*deltaVector));
                NowCTX.fillText(`vx:${this.vx.toFixed(2)},vy:${this.vy.toFixed(2)},vz:${this.vz.toFixed(2)}`,RenSprX,RenSprY+this.sy+(25*deltaVector));
                NowCTX.fillText(`px:${this.px.toFixed(2)},py:${this.py.toFixed(2)},pz:${this.pz.toFixed(2)}`,RenSprX,RenSprY+this.sy+(40*deltaVector));
            }
            
            NowCTX.fillRect(
                RenSprX-(this.sx*0.6),
                RenSprY-this.sy*0.6-12*deltaVector,
                this.sx*1.2,
                6*deltaVector
            );
            NowCTX.fillStyle = "rgb(0, 255, 0)";
            NowCTX.fillRect(
                RenSprX-(this.sx*0.6),
                RenSprY-this.sy*0.6-12*deltaVector,
                (this.sx*1.2)*(this.hp/this.MaxHp),
                6*deltaVector
            );
            NowCTX.fillStyle = "red";
            NowCTX.fillRect(
                RenSprX-(this.sx*0.6),
                RenSprY-this.sy*0.6-21*deltaVector,
                this.sx*1.2,
                6*deltaVector
            );
            NowCTX.fillStyle = "rgb(0, 128, 255)";
            NowCTX.fillRect(
                RenSprX-(this.sx*0.6),
                RenSprY-this.sy*0.6-21*deltaVector,
                (this.sx*1.2)*(this.stamina/this.MaxStamina),
                6*deltaVector
            );
            
        }
            
        
    }

    setGravity(gravity){
        this.gravity = gravity;
    }
    /**
     * 上方向（Z軸）へジャンプする
     * @param {Number} jump ジャンプの強さ
     */
    ZAxisJump(jump){
        this.vz = jump;
    }
    ZAxisFall(){
        if ( this.pz+this.vz < 0) {
            this.pz += (this.vz*deltaVector*this.waterRegist);
            this.vz += this.gravity*this.waterRegist;
        } else {
            this.collisionState = this.collisionState | 0b10000;
            this.pz = 0; this.vz = 0;
        }
        if (this.vz > maxFallSpeed) this.vz = maxFallSpeed;
    }

    //外部からの呼び出しは想定されていない
    /**
     * @param {Array} ColMap コリジョンマップ
     * @param {Number} TILESIZE 1タイル当たりのピクセル数
     * @param {Number} px ポジションX
     * @param {Number} py ポジションY
     * @returns {Boolean} 当たったかどうかをブール値で返す
     */
    doCollision(ColMap,TILESIZE,px,py,minus){

        const ltx = Math.floor((px-(this.sx/2)+minus)/TILESIZE);
        const rtx = Math.floor((px+(this.sx/2)-1-minus)/TILESIZE);
        const uty = Math.floor((py-(this.sy/2)+minus)/TILESIZE);
        const dty = Math.floor((py+(this.sy/2)-1-minus)/TILESIZE);

        for (let iy = uty; iy <= dty; iy++){

            //undefine回避
            if (ColMap.length <= iy || iy < 0) return 1;

            for (let ix = ltx; ix <= rtx; ix++){

                //undefine回避
                if (ColMap[iy].length <= ix || ix < 0) return 1;

                if (ColMap[iy][ix] > 0) {
                    return 1;
                }
            } 
        }
        return 0;
    }

    /**
     * @param {Array} ColMap コリジョンマップ
     * @param {Number} TILESIZE 1タイル当たりのピクセル数
     * @param {Vector} vx 移動ベクトルX
     * @param {Vector} vy 移動ベクトルY
     */
    move(ColMap,TILESIZE,vx = this.vx,vy = this.vy,fallOK = true){
        
        if (!this.stop) {

            //当たり判定ステートの初期化
            //Floor, Top, Left, Right, Bottom
            //F + UDLR
            this.collisionState = 0;


            let [advx,advy] = [vx*deltaVector,vy*deltaVector];
            if (this.inWater){
                [advx,advy] = [vx*deltaVector*this.waterRegist,vy*deltaVector*this.waterRegist];
                this.waterRegist = 0.25;
            } else {
            this.waterRegist = 1;

            }
            //this.minus = TILESIZE/4*(this.type == "player" && this.direction%2 == 1);

            //ベクトルX分動かす
            this.px = this.px + advx;
            //コリジョンXチェック
            if (this.collisionFlag) {
                if (this.doCollision(ColMap,TILESIZE,this.px,this.py,this.minus)) {
                    if (vx < 0) {
                        const ltx = Math.floor((this.px-(this.sx/2))/TILESIZE);
                        this.px = (ltx+1)*TILESIZE+(this.sx/2)-this.minus;
                        this.collisionState = this.collisionState | 0b00010;
                        this.vx = 0;
                    } else if (vx > 0) {
                        const rtx = Math.ceil((this.px+(this.sx/2))/TILESIZE);
                        this.px = (rtx-1)*TILESIZE-(this.sx/2)+this.minus;
                        this.collisionState = this.collisionState | 0b00001;
                        this.vx = 0;
                    }
                }
            }

            //ベクトルY分動かす
            this.py = this.py + advy;
            //コリジョンYチェック
            if (this.collisionFlag){
                if (this.doCollision(ColMap,TILESIZE,this.px,this.py,this.minus)) {
                    if (vy < 0) {
                        const uty = Math.floor((this.py-(this.sy/2))/TILESIZE);
                        this.py = (uty+1)*TILESIZE+(this.sy/2)-this.minus;
                        this.collisionState = this.collisionState | 0b01000;
                        this.vy = 0;
                    } else if (vy > 0) {
                        const dty = Math.ceil((this.py+(this.sy/2))/TILESIZE);
                        this.py = (dty-1)*TILESIZE-(this.sy/2)+this.minus;
                        this.collisionState = this.collisionState | 0b00100;
                        this.vy = 0;
                    }
                }
            }

            if (fallOK) this.ZAxisFall();

            this.setStaminaRelative(0.2);
            this.updateAnimSumByClock();

        }

    }

    /**
     * @param {Number} rvx 加算するベクターX
     * @param {Number} rvy 加算するベクターY
     * @param {Number} rvz 加算するベクターZ
     */
    addVector(rvx,rvy,rvz = 0){
        this.vx += rvx;
        this.vy += rvy;
        this.vz += rvz;
    }
    setSlowDownV(vec){
        this.slowDownV = vec;
    }

    setVectorNoLimit(vx,vy,vz = this.vz,smooth = false,smoothSpeed = 2){
        if (!smooth){
            this.vx = vx;
            this.vy = vy;
            this.vz = vz;
        } else {
            this.vx += fadeIn(this.vx,vx,smoothSpeed);
            this.vy += fadeIn(this.vy,vy,smoothSpeed);
            //this.vz += fadeIn(this.vz,vz,smoothSpeed);
            this.vz = vz;
        }
        if (Math.round(this.vx*10) == 0) this.vx = 0;
        if (Math.round(this.vy*10) == 0) this.vy = 0;
        if (Math.round(this.vz*10) == 0) this.vz = 0;
    }
    /**
     * @param {Number} vx セットするベクターX
     * @param {Number} vy セットするベクターY
     * @param {Number} vz セットするベクターZ
     * @param {Boolean} smooth スムージングフラグ
     * @param {Number} smoothSpeed スムージング係数(fadein関数の引数)
     */
    setVector(vx,vy,vz = this.vz,smooth = false,smoothSpeed = 2){
        if (!this.VLOCK && !this.EVLOCK) {
            this.setVectorNoLimit(vx,vy,vz,smooth,smoothSpeed);
        }
    }
    
    slowDown(slowDownSpeed = this.slowDownV){
        if (!this.VLOCK && !this.EVLOCK) {
            this.vx += fadeIn(this.vx,0,slowDownSpeed);
            this.vy += fadeIn(this.vy,0,slowDownSpeed);
            if (Math.round(this.vx) == 0) this.vx = 0;
            if (Math.round(this.vy) == 0) this.vy = 0;
            /*
            if (Math.round(this.vx) > 0){
                this.vx -= this.slowDownV;
            } else if (Math.round(this.vx) < 0) {
                this.vx += this.slowDownV;
            } else {
                this.vx = 0;
            }
            if (Math.round(this.vy) > 0){
                this.vy -= this.slowDownV;
            } else if (Math.round(this.vy) < 0) {
                this.vy += this.slowDownV;
            } else {
                this.vy = 0;
            }
            */
        }
    }
    /**
     * @param {Number} px ポジションX
     * @param {Number} py ポジションY
     * @param {Number} pz ポジションZ
     */
    setPos(px = this.px,py = this.py,pz = this.pz){
        this.px = px;
        this.py = py;
        this.pz = pz;
    }
    setSize(sx,sy,sz = this.sz){
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
    }


    setCollision(CF){
        this.collisionFlag = CF;
    }

    /**
     * @param {Number} tpx 相手のポジションX
     * @param {Number} tpy 相手のポジションY
     * @param {Number} tpz 相手のポジションZ
     * @param {Number} tsx 相手のサイズX
     * @param {Number} tsy 相手のサイズY
     * @param {Number} tsz 相手のサイズZ
     * @param {Number} px 自身のポジションX
     * @param {Number} py 自身のポジションY
     * @param {Number} pz 自身のポジションZ
     * @param {Number} sx 自身のサイズX
     * @param {Number} sy 自身のサイズY
     * @param {Number} sz 自身のサイズZ
     * @returns boolean
     */
    hitCheck(tpx,tpy,tpz,tsx,tsy,tsz,px = this.px,py = this.py,pz = this.pz,sx = this.sx,sy = this.sy,sz = this.sz){
        if (
            Math.abs(tpx-px) < (sx+tsx)/2 && 
            Math.abs(tpy-py) < (sy+tsy)/2 && 
            Math.abs(tpz-pz) < (sz+tsz)/2
        ){
            return 1
        } else { 
            return 0
        }
    }

    /**
     * @param {Number} di 与えるダメージ。負の数だと回復する。
     * @param {boolean} slip スリップダメージかどうか
     * @param {boolean} nkockback ノックバックフラグ
     * @param {number} tvx ノックバックベクトルX
     * @param {number} tvy ノックバックベクトルY
     */
    damage(di = 1,slip = false,nkockback = true,tvx = 0,tvy = 0){
        if ((!this.invisilbe && !this.nonDamage) || slip){
            this.hp = this.hp - di
            if (this.hp <= 0) this.hp = 0;
            this.invisibleTime = this.maxInvisibleTime;
            this.invisilbe = true;
            if (!slip && nkockback) {
                this.setVectorNoLimit(
                    -1*this.vx+tvx,
                    -1*this.vy+tvy
                );
                this.ZAxisJump(-4);
                this.VLOCK = true;
            }
        }
    
    }

    SetStamina(st,mst = this.MaxStamina){
        this.MaxStamina = mst;
        this.stamina = st;
    }
    setStaminaRelative(add){
        this.stamina += add;
        this.stamina = Math.min(this.MaxStamina,Math.max(0,this.stamina));
    }


}

export class Enemy extends sprite {
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {Number} sz サイズｚ
     * @param {String} type タイプ
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    constructor(px,py,sx,sy,sz,type,MHP = 1,HP = MHP,active = false){
        super(px,py,sx,sy,sz,type,MHP,HP);
        this.active = active;
    }
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} pz ポジションｚ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {Number} sz サイズｚ
     * @param {String} type タイプ
     * @param {Number} vx ベクトルX
     * @param {Number} vy ベクトルY
     * @param {Number} vz ベクトルZ
     * @param {Number} Memory そのエネミーが保持できる固有メモリ。中身を直接記述もできる。
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    activate(px,py,pz,sx,sy,sz,type,vx = 0,vy = 0,vz = 0,Memory = [],MHP = 1,HP = MHP,MST = 1,ST = MST,SPD = 4){
        this.px = px;
        this.py = py;
        this.pz = pz;
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
        this.type = type;
        this.MaxHp = MHP;
        this.hp = HP;
        this.MaxStamina = MST;
        this.stamina = ST;
        this.Speed = SPD;
        this.active = true;
        this.animationFrame = 0;
        this.animationState = 0;
        this.state = 0;
        this.collisionFlag = 1;
        //U D L R
        this.collisionState = 0;
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.nonDamage = false;
        //固有の配列を取得
        this.memory = Memory;
        //console.log([this.vx,this.vy]);

    }
    Unactivate(){
        this.active = false;
        //配列をサヨナラ
        this.memory = [];
    }
    /**
     * @param {Array} ColMap コリジョンマップ
     * @param {Number} TILESIZE 1タイル当たりのピクセル数
     */
    EnMove(ColMap,TILESIZE,fallOK = true){
        this.move(ColMap,TILESIZE,this.vx,this.vy,fallOK);
        //console.log([this.vx,this.vy]);
    }
    /**
     * @param {Array} ColMap コリジョンマップ
     * @param {Number} TILESIZE 1タイル当たりのピクセル数
     */
    EnemyAction(ColMap,TILESIZE,idx = null){
        switch (this.type) {
            //rocks - 小さい岩。飛ぶ向きはspawn関数の引数に持たせよう
            case "rocks":
                this.EnMove(ColMap,TILESIZE);

                if (this.hitCheck(player.px,player.py,player.pz,player.sx,player.sy,player.sz)){
                    player.damage(1);
                }

                if ( (this.collisionState & 0b10000) === 0b10000 ) {
                    this.Unactivate();
                }
                break;
            //stone - 地を滑る岩。
            case "stone":
                this.EnMove(ColMap,TILESIZE);

                if (this.collisionState & 0b10000 == 0b10000) {
                    this.ZAxisJump(-4*Math.random());
                }

                if (this.memory.length < 1){
                    console.error("Enemy.rock : Vector memory is not exist.");
                    //0~1をroundで丸めて符号生成、それに0~1に4をかけてベクトルの大きさを決める。
                    this.memory.unshift(Math.round(-Math.random())*Math.random()*5);
                    this.memory.unshift(Math.round(-Math.random())*Math.random()*5);
                }

                this.setVector(this.memory[1],this.memory[2]);

                if (this.memory.length < 2){
                    console.error("Enemy.rock : collision counter is not exist.");
                    this.memory.unshift(0); 
                }

                if ((this.collisionState & 0b1100) > 0) /* Up or Down */ {
                    this.setVector(this.vx,-1*this.vy);
                    this.memory[0]++;
                }
                if ((this.collisionState & 0b0011) > 0) /* Left or Right */ {
                    this.setVector(-1*this.vx,this.vy);
                    this.memory[0]++;
                }
                
                if (this.hitCheck(player.px,player.py,player.pz,player.sx,player.sy,player.sz)){
                    player.damage(1);
                }

                [this.memory[1],this.memory[2]] = [this.vx,this.vy];

                if (this.memory[0] >= 7){
                    this.Unactivate();
                }

                break;
            //落ちてくる岩
            case "fallRock":
                if (this.memory[0]){
                    this.setPos(this.px,this.py,-360);
                    this.memory[0] = 0;
                }
                this.EnMove(ColMap,TILESIZE);
                
                if (this.hitCheck(player.px,player.py,player.pz,player.sx,player.sy,player.sz)){
                    player.damage(1);
                }

                if ( this.collisionState  > 0 ) {
                    for (let i = 0; i<4; i++){
                        EnM.spawnNPC(
                            this.px,
                            this.py,
                            0,
                            TILESIZE/2,
                            TILESIZE/2,
                            TILESIZE/2,
                            "rocks",
                            randFloat(-4,4)+Math.sign(this.vx)*Math.random()*Math.abs(this.vx),
                            randFloat(-4,4)+Math.sign(this.vy)*Math.random()*Math.abs(this.vy),
                            -4-Math.random()*2
                        )
                    }
                    this.Unactivate();
                }

                break;
            //投げられた雪玉
            case "throwSnow":
                this.EnMove(ColMap,TILESIZE);

                this.setGravity(0.2);

                if (this.hitCheck(player.px,player.py,player.pz,player.sx,player.sy,player.sz)){
                    player.damage(1);
                }

                if ( this.collisionState > 0 ) {
                    for (let i = 0; i<4; i++){
                        EfM.spawnNPC(
                            this.px,
                            this.py,
                            0,
                            TILESIZE/3,
                            TILESIZE/3,
                            TILESIZE,
                            "particle_snow",
                            randFloat(-4,4)+Math.sign(this.vx)*Math.random()*Math.abs(this.vx),
                            randFloat(-4,4)+Math.sign(this.vy)*Math.random()*Math.abs(this.vy),
                            -4-Math.random()*2
                        )
                    }
                    this.Unactivate();
                }
                break;
            //落ちてくるツララ
            case "icicle":
                if (this.memory[0]){
                    this.setPos(this.px,this.py,-360);
                    this.memory[0] = 0;
                }
                this.EnMove(ColMap,TILESIZE);
                
                if (this.hitCheck(player.px,player.py,player.pz,player.sx,player.sy,player.sz)){
                    player.damage(1);
                }

                if ( this.collisionState  > 0 ) {
                    for (let i = 0; i<4; i++){
                        EfM.spawnNPC(
                            this.px,
                            this.py,
                            0,
                            TILESIZE/2,
                            TILESIZE/2,
                            TILESIZE,
                            "particle_ice",
                            randFloat(-4,4)+Math.sign(this.vx)*Math.random()*Math.abs(this.vx),
                            randFloat(-4,4)+Math.sign(this.vy)*Math.random()*Math.abs(this.vy),
                            -4-Math.random()*2
                        )
                    }
                    this.Unactivate();
                }
                break;
            //敵にあてれる氷
            case "friendly_ice":
                if (this.memory.length < 1){
                    this.memory.unshift(0);
                    this.memory.unshift(0);
                    this.memory.unshift(0);
                    this.memory.unshift(0);
                    this.memory.unshift(0);
                }
                this.EnMove(ColMap,TILESIZE);
                const distX = Math.abs(this.px - player.px);
                const distY = Math.abs(this.py - player.py);    
                const nowDist = (distX**2+distY**2)**0.5
                const lastDist = (this.memory[3]**2+this.memory[4]**2)**0.5;

                if (this.hitCheck(
                    player.px,
                    player.py,
                    player.pz,
                    player.sx,
                    player.sy,
                    player.sz
                ) && nowDist < lastDist){

                    this.setVector(
                        player.vx*2,
                        player.vy*2
                    );
                
                }
                this.memory[3] = distX;
                this.memory[4] = distY;

                this.setGravity(0.5)

                //斬撃に当たったかチェック
                if (this.hitCheck(
                        plaAttackAABB.px,
                        plaAttackAABB.py,
                        plaAttackAABB.pz,
                        plaAttackAABB.sx,
                        plaAttackAABB.sy,
                        plaAttackAABB.sz
                    ) && this.pz >= 0){
                        let dist = ((this.px-player.px)**2+(this.py-player.py)**2)**0.5
                    this.setVector(
                        (this.px-player.px)/dist*6*(1.5*this.sx/TILESIZE),
                        (this.py-player.py)/dist*6*(1.5*this.sy/TILESIZE)
                    );
                    this.memory[1] = this.vx;
                    this.memory[2] = this.vy;
                    this.ZAxisJump(-4);
                    this.memory[0] = plaAttackAABB.direction;
                    
                    if (this.sx >= TILESIZE/2){
                        EfM.spawnNPC(
                                this.px,
                                this.py,
                                0,
                                TILESIZE/2,
                                TILESIZE/2,
                                TILESIZE,
                                "particle_ice",
                                randFloat(-4,4)+Math.sign(this.vx)*Math.random()*Math.abs(this.vx),
                                randFloat(-4,4)+Math.sign(this.vy)*Math.random()*Math.abs(this.vy),
                                -4-Math.random()*2
                            )
                        this.setSize(
                                this.sx-(this.sx*0.1),
                                this.sy-(this.sy*0.1),
                                this.sz-(this.sz*0.1),
                            )
                    } else {
                        for (let i = 0; i<4; i++){
                            EfM.spawnNPC(
                                this.px,
                                this.py,
                                0,
                                TILESIZE/2,
                                TILESIZE/2,
                                TILESIZE,
                                "particle_ice",
                                randFloat(-4,4)+Math.sign(this.vx)*Math.random()*Math.abs(this.vx),
                                randFloat(-4,4)+Math.sign(this.vy)*Math.random()*Math.abs(this.vy),
                                -4-Math.random()*2
                            )
                        }
                        this.Unactivate();
                    }
                }
                this.slowDown(12);
                /*
                if(Math.abs(this.vx) < 0.5) this.vx = 0;
                if(Math.abs(this.vy) < 0.5) this.vy = 0;
                */
                
                if (this.pz < 0){
                    this.setVector(
                        this.memory[1],
                        this.memory[2]
                    );
                }

                if ((this.collisionState & 0b1100) > 0) /* Up or Down */ {
                    this.setVector(this.vx,-1*this.vy);
                    
                }
                if ((this.collisionState & 0b0011) > 0) /* Left or Right */ {
                    this.setVector(-1*this.vx,this.vy);
                    
                }

                this.memory[1] = this.vx;
                this.memory[2] = this.vy;

                //ボスにダメージを与える
                if (typeof(NowBoss) == "object"){
                    if (this.hitCheck(
                            NowBoss.px,
                            NowBoss.py,
                            NowBoss.pz,
                            NowBoss.sx,
                            NowBoss.sy,
                            NowBoss.sz
                        )){
                        if (!NowBoss.nonDamage) {
                            NowBoss.damage(nowStatus.AP,false,false);
                            NowBoss.lastBossState = NowBoss.BossState;
                            NowBoss.BossState = "damage";
                            for (let i = 0; i<4; i++){
                                EfM.spawnNPC(
                                    this.px,
                                    this.py,
                                    0,
                                    TILESIZE/2,
                                    TILESIZE/2,
                                    TILESIZE,
                                    "particle_ice",
                                    randFloat(-4,4)+Math.sign(this.vx)*Math.random()*Math.abs(this.vx),
                                    randFloat(-4,4)+Math.sign(this.vy)*Math.random()*Math.abs(this.vy),
                                    -4-Math.random()*2
                                )
                            }
                            this.Unactivate();
                        } else {
                            this.setVector(
                                Math.sign(this.px-NowBoss.px)*Math.abs(this.vx),
                                Math.sign(this.py-NowBoss.py)*Math.abs(this.vy)
                            );
                            this.memory[1] = this.vx;
                            this.memory[2] = this.vy;
                        }
                    }
                }
                break;
            //地面から生える根っこ
            case "root_spear":

                const dist = ((this.px-player.px)**2+(this.py-player.py)**2)**0.5;
                /*
                    idx 0 ... 伸び具合
                    idx 1 ... 縮みフラグ
                */
                if (this.memory.length < 1){
                    this.maxInvisibleTime = 30;
                    this.MaxHp = 5;
                    this.hp = this.MaxHp;
                    this.memory.unshift(this.sy);
                    this.memory.unshift(-1);
                    this.memory.unshift(1);
                } else {
                
                    if (this.memory[1] == -1 || (dist < TILESIZE*4/* && this.memory[1] == 0*/)) {
                        if (this.memory[0] < 12) {
                            if(this.memory[0] == 0){
                                for (let i = 0; i<4; i++){
                                    EfM.spawnNPC(
                                        this.px,
                                        this.py,
                                        this.pz,
                                        this.sx/2,
                                        this.sx/2,
                                        this.sx/2,
                                        "particle_leef",
                                        randFloat(-3,3),
                                        randFloat(-3,3),
                                        -12
                                    )
                                }
                            }
                            this.memory[0]++;
                        } else {
                            this.memory[1] = 0;
                        }
                    } else {
                        //this.memory[1] = 1;
                        if (this.memory[0] > 0) {
                            this.memory[0]--;
                        } else {
                            //this.Unactivate();
                        }
                    }
                }

                this.setSize(this.sx,this.sy,TILESIZE/4*this.memory[0]);
                this.setSize(this.sx,Math.min(this.memory[2],this.sz));

                this.EnMove(ColMap,TILESIZE);
                if (this.hitCheck(player.px,player.py,player.pz,player.sx,player.sy,player.sz)){
                    player.damage(1);
                    if (!player.EVLOCK) {
                        player.setVectorNoLimit(
                            Math.sign(player.px-this.px)*Math.abs(player.vx)*2/3,
                            Math.sign(player.py-this.py)*Math.abs(player.vy)*2/3
                        );
                        if(player.pz >= 0) {
                            player.ZAxisJump(-4);
                            player.setPos(player.px,player.py,-1);
                        }
                    }
                    player.EVLOCK = true;
                }
                if (player.EVLOCK && player.pz >= 0) {
                    player.EVLOCK = false;
                }
                if (this.hitCheck(
                    plaAttackAABB.px,
                    plaAttackAABB.py,
                    plaAttackAABB.pz,
                    plaAttackAABB.sx,
                    plaAttackAABB.sy,
                    plaAttackAABB.sz,
                )) {
                    this.damage(1);
                    if (this.hp <= 0){

                        this.Unactivate();
                    }
                }

                break;
            default:
                this.Unactivate();
                console.error(`Error : Undefined Enemy's property "type": "${this.type}"`)
        }


    }

}

export class Effect extends sprite {
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {Number} sz サイズｚ
     * @param {String} type タイプ
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    constructor(px,py,sx,sy,sz,type,MHP = 1,HP = MHP,active = false){
        super(px,py,sx,sy,sz,type,MHP,HP);
        this.active = active;
    }
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} pz ポジションｚ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {Number} sz サイズｚ
     * @param {String} type タイプ
     * @param {Number} vx ベクトルX
     * @param {Number} vy ベクトルY
     * @param {Number} vz ベクトルZ
     * @param {Number} Memory そのエネミーが保持できる固有メモリ。中身を直接記述もできる。
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    activate(px,py,pz,sx,sy,sz,type,vx = 0,vy = 0,vz = 0,Memory = [],MHP = 1,HP = MHP,MST = 1,ST = MST,SPD = 4){
        this.px = px;
        this.py = py;
        this.pz = pz;
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
        this.type = type;
        this.MaxHp = MHP;
        this.hp = HP;
        this.MaxStamina = MST;
        this.stamina = ST;
        this.Speed = SPD;
        this.active = true;
        this.animationFrame = 0;
        this.animationState = 0;
        this.state = 0;
        this.collisionFlag = 1;
        //U D L R
        this.collisionState = 0;
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.nonDamage = false;
        //固有の配列を取得
        this.memory = Memory;
        //console.log([this.vx,this.vy]);

    }
    Unactivate(){
        this.active = false;
        //配列をサヨナラ
        this.memory = [];
    }
    /**
     * @param {Array} ColMap コリジョンマップ
     * @param {Number} TILESIZE 1タイル当たりのピクセル数
     */
    EfMove(ColMap,TILESIZE,fallOK = true){
        this.move(ColMap,TILESIZE,this.vx,this.vy,fallOK);
        //console.log([this.vx,this.vy]);
    }
    /**
     * @param {Array} ColMap コリジョンマップ
     * @param {Number} TILESIZE 1タイル当たりのピクセル数
     */
    EffectAction(ColMap,TILESIZE,idx = null){
        switch (this.type) {
            case "sword":
                    if (this.state <= 0) {
                        this.myImg.setImage(img.imgList["SwordEffect"]);
                        this.myImg.roll = 0;
                        this.state = 1;
                        //console.log("State 0 is done");
                    } else if (this.state == 1) {
                            this.setSlowDownV(8);
                            this.setCollision(0);
                            this.state = 2;
                            this.direction = player.direction;
                            this.setVector(VecDirList[this.direction][0]*12,VecDirList[this.direction][1]*12);
                            this.myImg.roll = 45*this.direction;
                            /*
                        switch (player.direction) {
                            case 0:
                                this.myImg.roll = 0;
                                this.setVector(0,-12);
                                break;
                            case 1:
                                this.myImg.roll = 45;
                                this.setVector(8.4,-8.4);
                                break;
                            case 2:
                                this.myImg.roll = 90;
                                this.setVector(12,0);
                                break;
                            case 3:
                                this.myImg.roll = 135;
                                this.setVector(8.4,8.4);
                                break;
                            case 4:
                                this.myImg.roll = 180;
                                this.setVector(0,12);
                                break;
                            case 5:
                                this.myImg.roll = 225;
                                this.setVector(-8.4,8.4);
                                break;
                            case 6:
                                this.myImg.roll = 270;
                                this.setVector(-12,0);
                                break;
                            case 7:
                                this.myImg.roll = 315;
                                this.setVector(-8.4,-8.4);
                                break;
                            default:
                            this.state = 0;
                        }
                        */
                        //console.log("State 1 is done");
                    } else if (this.state == 2) {
                        //消滅するときの速度
                        const breakSpeed = 5;
                        this.EfMove(ColMap,TILESIZE);
                        this.slowDown();
                        if ((Math.abs(this.vx)**2+Math.abs(this.vy)**2) <= breakSpeed**2 ) this.state = 3;
                        //console.log(`Effect Vec ${[this.vx,this.vy]}`);
                    } else {
                        this.Unactivate()
                        //console.log("State 2 is done. I die.");
                        
                    }
                break;
            case "particle_rock":
                this.setGravity(1);
                this.EfMove(ColMap,TILESIZE);

                if ( (this.collisionState & 0b10000) === 0b10000 ) {
                    this.Unactivate();
                }
                break;
            case "particle_snow":
                this.EfMove(ColMap,TILESIZE);

                if (this.collisionState & 0b10000){
                    this.Unactivate();
                }

                break;
            case "particle_ice":
                this.EfMove(ColMap,TILESIZE);

                if (this.collisionState & 0b10000){
                    this.Unactivate();
                }

                break;
            case "particle_leef":
                this.slowDown(6);
                this.vx += randFloat(-1,1);
                this.vy += randFloat(-1,1);
                this.EfMove(ColMap,TILESIZE);
                if (this.pz >= 0){
                    this.Unactivate();
                }
                if (this.vz >= 0.5) this.vz = 1;
                break;
            case "boss_wood_leef":
                this.fallOK = false;
                //this.pz = NowBoss.pz+showTILESIZE*8;
                break;
            case "WarpHole":
                if (this.memory[0] < 10){
                    console.log(`generate success : ${this.memory[0]}`);
                    this.memory[0] = this.memory[0]*10;
                } else {
                    const myStage = this.memory/10;
                    const dist = -this.sx + ((player.px-this.px)**2+(player.py-this.py)**2)**0.5;
                    const alpha = Math.ceil( 255 / Math.max(1, Math.min(255,2*(dist / (this.sx)) ) ) );
                    if (myStage != 9){
                        const canGo = enableGoStageList[myStage-1];
                        textRenderRequestList[`Ef:${this.type},${idx},1`] = [`${myStage}ステージ入口`, this.px-TextSize*4.5, this.py+this.sy, [255,255,255,alpha]];
                        textRenderRequestList[`Ef:${this.type},${idx},2`] = [mapDescriptionList[`Map_${myStage}`], this.px-TextSize*(mapDescriptionList[`Map_${myStage}`].length*0.6), this.py+this.sy+TextSize, [255,0,0,alpha]];
                        if (canGo == 1 && this.hitCheck(
                            player.px,
                            player.py,
                            player.pz,
                            player.sx/2,
                            player.sy/2,
                            player.sz/2
                        )){
                            //stageChangeRequest = [`Map_${myStage}`,[1,1,1,254],[0,0,6,-6]];
                            sendSCRequest([`Map_${myStage}`,[1,1,254,1],[0,0,-3,3]]);
                        }
                    } else {
                        const canGo = enableGoStageList[4];
                        textRenderRequestList[`Ef:${this.type},${idx},1`] = [`ラスボスステージ入口`, this.px-TextSize*7, this.py+this.sy, [255,255,255,alpha]];
                        if (canGo != 1){
                            textRenderRequestList[`Ef:${this.type},${idx},2`] = [`未完成`, this.px-TextSize*1.5, this.py+this.sy+TextSize, [255,0,0,alpha]];
                        }
                    }
                    //renderText(`${this.memory/10}ステージ`,this.px-TextSize*4,this.py-this.sy);
                }
                break;
            default:
                this.Unactivate();
                console.error(`Error : Undefined Enemy's property "type": "${this.type}"`)
        }


    }

}

export class Boss extends Enemy {
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {Number} sz サイズｚ
     * @param {String} type ボスのタイプ
     * @param {Number} MHP マックスＨＰ（デフォルトは１００）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    constructor(px,py,sx,sy,sz,type,MHP = 100,HP = MHP){
        super(px,py,sx,sy,sz,type,MHP,HP,true);
        this.dafaultSX = this.sx;
        this.dafaultSY = this.sy;
        this.defaultSZ = this.sz;
        this.allive = true;
        this.fallOK = true;
        //waitメソッド用の変数
        this.waitFrameC = 0;
        this.waitFinished = true;
        this.BossState = 0;
        this.lastBossState = 0;
        this.BossMemory = {};
        //forループ的な使い方を想定
        this.forList = {
            "i" : 0,
            "j" : 0,
            "ix" : 0,
            "iy" : 0
        };
        this.BossAnimation = false;
    }

    clearForList(){
        this.forList = {
            "i" : 0,
            "j" : 0,
            "ix" : 0,
            "iy" : 0
        };
    }
    clearMemory(){
        this.BossMemory = {};
    }
    /**
     * 現在のフレームカウント値を0にする
     */
    waitFrameReset(){
        this.waitFrameC = 0;
        this.waitFinished = false;
    }
    /**
     * Frameで設定した分が経過したら1を返す。
     * @param {Number} Frame 測定したいフレーム数
     * @returns {Boolean} 設定したフレームが経過したかどうか
     */
    waitFrame(Frame = 0){
        //もしフレームのリセットをかけていなかったらリセットする。
        if (this.waitFinished) this.waitFrameReset();
        if (this.waitFrameC <= Frame) {
            this.waitFrameC++;
            this.waitFinished = false;
            return 0;
        } else {
            this.waitFinished = true;
            return 1;
        }
    }
    /**
     * ブリモーション。ただずらすだけ
     * @param {Number} UY 上方向
     * @param {Number} DY 下方向
     */
    vibrate(UY,DY = UY){
        //ブリモーション
        this.fallOK = false;
        if (this.pz > 0){
            this.pz = UY*deltaVector;
        } else {
            this.pz = DY*deltaVector;
        }
    }
    BossInit(){
        this.clearForList();
        this.clearMemory();
        this.hp = this.MaxHp;
        isNowBossAnimation = true;
        //this.BossState++;
    }
    /**
     * @param {Array} ColMap コリジョンマップ
     * @param {Number} TILESIZE 1タイル当たりのピクセル数
     */
    BossAction(ColMap,TILESIZE){
        let moveOK = true;
        this.fallOK = false;
        if (this.type == "Rock"){
            this.nonDamage = true;
            switch (this.BossState) {
                //初期化
                case 0:
                    this.setPos(this.px,this.py,-360);
                    this.BossInit();
                    this.BossState++;
                    break;
                //落下
                case 1:
                    this.fallOK = true;
                    if (this.collisionState && 0b10000 == 0b10000) {
                        this.BossState++;
                    }
                    break;
                //落下衝撃
                case 2:
                    //forループの代替案
                    if ( this.forList["i"]<20 ) {
                        screenSetOffsetRand(6,6);
                    } else if (this.forList["i"]<40) {
                        screenSetOffsetRand(2,2);
                    } else {
                        screenSetOffset(0,0)
                    }
                    if (this.forList["i"]>80) {
                        this.BossState++;
                    }
                    this.forList["i"]++;
                    break;
                //アニメーション終了
                case 3:
                    isNowBossAnimation = false;
                    this.waitFrameReset();
                    this.BossState++;
                    break;
                //謎待機＆いろいろ初期化
                case 4:
                    if (this.waitFrame(40)){
                        this.BossState++;
                        //攻撃する回数
                        this.BossMemory["attackNum"] = 4+Math.round(Math.random()*2);
                        //ぶつかった回数メモリ
                        this.forList["j"] = 0;
                        //汎用メモリ
                        this.forList["i"] = 0;
                        //ダメージ回数
                        this.BossMemory["damageCount"] = 0;
                        this.BossMemory["wallDist"] = 0;
                        this.BossMemory["lastWallDist"] = 0;
                    }
                    break;
                //ブリつけ中＆突進方向の決定
                case 5:
                    if (this.forList["i"] < 80){
                        this.vibrate(-1,2);
                        this.forList["i"]++;
                    } else {
                        let distance = ((player.px - this.px)**2+(player.py - this.py)**2)**0.5;
                        if (distance <= 0) {
                            this.BossMemory["tarX"] = Math.random();
                            this.BossMemory["tarY"] = Math.random();
                        }/* else if ((this.BossMemory["wallDist"] - this.BossMemory["lastWallDist"]) <= 5) {
                            this.BossMemory["tarX"] = -1*(player.px - this.px)/distance;
                            this.BossMemory["tarY"] = -1*(player.py - this.py)/distance;
                        } */else {
                            this.BossMemory["tarX"] = (player.px - this.px)/distance;
                            this.BossMemory["tarY"] = (player.py - this.py)/distance;
                        }
                        //突進スピード
                        this.BossState++;
                        this.BossMemory["MultSpeed"] = 4;
                        this.BossMemory["lastWallDist"] = this.BossMemory["wallDist"];
                        //console.log([this.BossMemory["tarX"],this.BossMemory["tarY"]]);
                    }
                    break;
                //突進じゃぁ
                case 6:
                    if ((this.collisionState & 0b01111) < 1){
                        this.setVector(
                            this.BossMemory["tarX"]*this.BossMemory["MultSpeed"],
                            this.BossMemory["tarY"]*this.BossMemory["MultSpeed"]
                        );
                        this.BossMemory["wallDist"]++;
                    } else {
                        for (let i = 0; i<6+Math.round(Math.random()*8); i++){
                            let npcVX = 0;
                            let npcVY = 0;
                            let spX = this.px;
                            let spY = this.py;
                            if ((this.collisionState & 0b01100) == 0b1000) {
                                spY -= this.sy/2+2
                                npcVY = 1;
                            } else if ((this.collisionState & 0b01100) == 0b0100) {
                                spY += this.sy/2-2
                                npcVY = -1;
                            } else {
                                npcVY = Math.sign(Math.random()-0.5);
                            }
                            if ((this.collisionState & 0b00011) == 0b0010) {
                                spX -= this.sx/2+2
                                npcVX = 1;
                            } else if ((this.collisionState & 0b00011) == 0b0001) {
                                spX += this.sx/2-2
                                npcVX = -1;
                            } else {
                                npcVX = Math.sign(Math.random()-0.5);
                            }
                            let StspX = this.px + npcVX*(TILESIZE/2) , StspY = this.py + npcVY*(TILESIZE/2);
                            npcVX *= Math.ceil((randFloat(3,4.5)));
                            npcVY *= Math.ceil((randFloat(3,4.5)));
                            //console.log([npcVX,npcVY]);
                            EnM.spawnNPC(
                                spX,
                                spY,
                                0,
                                2+(Math.random()*2),
                                2+(Math.random()*2),
                                2+(Math.random()*2),
                                "rocks",
                                npcVX,
                                npcVY,
                                -8+(Math.random()*-7)
                            );
                            if (i % 3 == 0) {
                                EnM.spawnNPC(
                                    StspX,
                                    StspY,
                                    0,
                                    TILESIZE/2,
                                    TILESIZE/2,
                                    TILESIZE/2,
                                    "stone",
                                    npcVX/(2-Math.random()),
                                    npcVY/(2-Math.random()),
                                    -8+(Math.random()*-7),[0,npcVX/(2-Math.random()),npcVY/(2-Math.random())]
                                );
                            }
                        }
                        //ぶつかった回数のインクリメント
                        this.forList["j"]++;
                        this.forList["i"] = 0;
                        this.BossState++;
                    }
                    break;
                //壁にゲキトツ
                case 7:
                    this.setVector(0,0,0);
                    if (this.forList["i"] < 20){
                        screenSetOffsetRand(5,5);
                        this.vibrate(-1,2);
                    } else {
                        screenSetOffsetRand(2,2);
                    }
                    if (this.forList["i"] > 39){
                        if (this.forList["j"] < this.BossMemory["attackNum"]){
                            this.BossState = 5;
                        } else {
                            if (randInt(0,1) > 0){
                                console.log("Body Press!");
                                //飛び上がり
                                this.BossState = 8;
                                this.forList["i"] = 0;
                                break;
                            } else {
                                console.log("roll Attack!");
                                //高速回転
                                if (
                                    //左の空きチェック
                                    hitWallCheck(
                                        ColMap,
                                        TILESIZE,
                                        this.px-(this.sx/2),
                                        this.py,
                                        this.sx,
                                        this.sy
                                    ) && 
                                    //右の空きチェック
                                    hitWallCheck(
                                        ColMap,
                                        TILESIZE,
                                        this.px+(this.sx/2),
                                        this.py,
                                        this.sx,
                                        this.sy
                                    ) && 
                                    //下の空きチェック
                                    hitWallCheck(
                                        ColMap,
                                        TILESIZE,
                                        this.px,
                                        this.py+(this.sy/2),
                                        this.sx,
                                        this.sy
                                    ) && 
                                    //上の空きチェック
                                    hitWallCheck(
                                        ColMap,
                                        TILESIZE,
                                        this.px,
                                        this.py-(this.sy/2),
                                        this.sx,
                                        this.sy
                                    )
                                ) {
                                    this.BossState = 11;
                                } else {
                                    this.BossState = 8;
                                }
                                this.forList["i"] = 0;
                                break;
                            }
                            
                        }
                    }
                    this.forList["i"]++;
                    break;
                //上方へと飛び上がる（case 8 ～ case 10）
                case 8:
                    if (this.forList["i"] < 20) {
                        this.vibrate(-1,2);
                    } else {
                        if (this.pz < -1024){
                            this.showflag = false;
                            this.BossState++;
                            this.forList["i"] = 0;
                        } else {
                            this.pz -= 24
                        }

                    }
                    this.forList["i"]++;
                    break;
                //落下～振動
                case 9:
                    if (this.pz < 0) {
                        if (this.pz > -600) {
                            this.showflag = true;
                            this.setPos(this.px,this.py,this.pz+10);
                        } else {
                            this.setPos(player.px,player.py,this.pz+5);
                        }
                    } else {
                        this.pz = 0;
                        let [tpx,tpy] = [0,0];
                        if (this.forList["i"] < 3+((this.hp <= this.MaxHp/2)*2)) {
                            [tpx,tpy] = [
                                    randFloat(player.px-(TILESIZE*8),player.px+(TILESIZE*8)),
                                    randFloat(player.py-(TILESIZE*8),player.py+(TILESIZE*8))
                                ]
                            while (
                                    hitWallCheck(ColMap,TILESIZE,tpx,tpy,TILESIZE*1.5,TILESIZE*1.5) || 
                                    (
                                        Math.abs(this.px+this.sx)*2 < Math.abs(tpx-this.px) && 
                                        Math.abs(this.py+this.sy)*2 < Math.abs(tpy-this.py)
                                    )
                                ){
                                [tpx,tpy] = [
                                        randFloat(player.px-(TILESIZE*8),player.px+(TILESIZE*8)),
                                        randFloat(player.py-(TILESIZE*8),player.py+(TILESIZE*8))
                                    ]
                            }
                            EnM.spawnNPC(
                                tpx,
                                tpy,
                                -600,
                                TILESIZE*2,
                                TILESIZE,
                                TILESIZE*2,
                                "fallRock"
                            );
                        } else
                        if (this.forList["i"] < 15){
                            screenSetOffsetRand(8,8);
                        } else
                        if (this.forList["i"] < 30){
                            screenSetOffsetRand(6,6);
                        } else
                        if (this.forList["i"] < 50){
                            screenSetOffsetRand(3,3);
                        } else {
                            if (hitWallCheck(ColMap,TILESIZE,this.px,this.py,this.sx,this.sy)){
                                //飛び上がり
                                this.BossState = 8;
                                this.forList["i"] = 0;
                            } else {
                                this.BossState++;
                            }
                            this.forList["i"] = 0;
                        }
                        this.forList["i"]++;
                    }
                    break;
                //スタン、case4（いろいろ初期化）へ
                case 10:
                    this.nonDamage = false;
                    this.setVector(0,0,0);
                    if (this.forList["i"]<240){
                        if (this.forList["i"]<200){
                            if ((this.forList["i"]%20) >= 10){
                                this.pz = 3;
                            } else {
                                this.pz = 0;
                            }
                        }
                    } else {
                        this.BossState = 4;
                    }
                    this.forList["i"]++;
                    break;
                //高速回転（case 11 ～ case 13 ）ブリをかける
                case 11:
                    if (this.forList["i"] > 20) {
                        this.vibrate(-1,2);
                        if (this.forList["i"] > 40) {

                            //高速回転アニメーション

                            if (this.forList["i"] > 60) {
                                let distance = ((player.px - this.px)**2+(player.py - this.py)**2)**0.5;
                                if (distance <= 0) {
                                    this.vx = Math.random();
                                    this.vy = Math.random();
                                } else {
                                    this.vx = (player.px - this.px)/distance;
                                    this.vy = (player.py - this.py)/distance;
                                }
                                this.vx *= 4
                                this.vy *= 4
                                this.BossState++;
                                this.forList["i"] = 0;
                            }
                        }
                    }
                    this.forList["i"]++;
                    break;
                //じんわり追いかける
                case 12:
                    if ((this.collisionState & 0b01111) < 1){
                        
                        //右を向いている度合い
                        let Rightness = 0;
                        //正面を向いている度合い
                        let Frontness = 0;
                        //ボスからプレイヤーへのびるベクトル[=>PB]
                        let VecPB = [player.px-this.px,player.py-this.py];
                        //90度右へ回転させた移動ベクトル
                        let RightVec = [this.vy,-1*this.vx];
                        //
                        let degree = 2;
                        let sin = Math.sin(radians(degree));
                        let cos = Math.cos(radians(degree));

                        //ベクトル[=>PB]と自身の移動ベクトルの内積
                        Frontness = dotProduct(VecPB,[this.vx,this.vy]);
                        //ベクトル[=>PB]と自身の移動ベクトルを右へ垂直に回転させたものの内積
                        Rightness = dotProduct(VecPB,RightVec);

                        //自身の移動ベクトルに回転行列をかける
                        if (Rightness >= 0) {
                            //回転行列そのまま
                            let tempVX = this.vx;
                            this.vx = this.vy*sin+this.vx*cos;
                            this.vy = this.vy*cos+tempVX*-1*sin;
                        } else {
                            //回転行列をちょっとかえる
                            let tempVX = this.vx;
                            this.vx = this.vy*-1*sin+this.vx*cos;
                            this.vy = this.vy*cos+tempVX*sin;
                        }

                    } else {
                        this.setVector(0,0,0);
                        //ゲキトツ処理
                        for (let i = 0; i<6+Math.round(Math.random()*8); i++){
                            let npcVX = 0;
                            let npcVY = 0;
                            let spX = this.px;
                            let spY = this.py;
                            if ((this.collisionState & 0b01100) == 0b1000) {
                                spY -= this.sy/2+2
                                npcVY = 1;
                            } else if ((this.collisionState & 0b01100) == 0b0100) {
                                spY += this.sy/2-2
                                npcVY = -1;
                            } else {
                                npcVY = Math.sign(Math.random()-0.5);
                            }
                            if ((this.collisionState & 0b00011) == 0b0010) {
                                spX -= this.sx/2+2
                                npcVX = 1;
                            } else if ((this.collisionState & 0b00011) == 0b0001) {
                                spX += this.sx/2-2
                                npcVX = -1;
                            } else {
                                npcVX = Math.sign(Math.random()-0.5);
                            }
                            npcVX *= Math.ceil((randFloat(3,4.5)));
                            npcVY *= Math.ceil((randFloat(3,4.5)));
                            console.log([npcVX,npcVY]);
                            EnM.spawnNPC(
                                spX,
                                spY,
                                0,
                                2+(Math.random()*2),
                                2+(Math.random()*2),
                                2+(Math.random()*2),
                                "rocks",
                                npcVX,
                                npcVY,
                                -8+(Math.random()*-7)
                            );
                        }
                        //ぶつかった回数のインクリメント
                        this.forList["j"]++;
                        this.forList["i"] = 0;
                        this.setVector(-this.vx,-this.vy);
                        this.BossState++;
                    }
                    break;
                //ゲキトツモーション
                case 13:
                    this.setVector(0,0,0,true,8);
                    this.nonDamage = false;
                    if (this.forList["i"]<240){
                        this.pz = 0;
                        if (this.forList["i"] < 15){
                            screenSetOffsetRand(8,8);
                        } else if (this.forList["i"] < 30){
                            screenSetOffsetRand(6,6);
                        } else if (this.forList["i"] < 50){
                            screenSetOffsetRand(3,3);
                        } else if (this.forList["i"] < 250){
                            if ((this.forList["i"]%20) >= 10){
                                this.pz = 3;
                            } else {
                                this.pz = 0;
                            }
                        }
                    } else {
                        this.BossState = 4;
                    }
                    this.forList["i"]++;
                    break;
                //ダメージ（ノーモーション）
                case "damage":
                    this.BossMemory["damageCount"]++;
                    console.log(this.BossMemory["damageCount"]);
                    if (
                        this.BossMemory["damageCount"]%
                        (3 - (this.hp < this.MaxHp/2)) == 0)
                        {
                            console.log("go attack");
                            this.BossState = 4;
                    } else {
                        console.log("go last");
                        this.BossState = this.lastBossState;
                    }
                    break;
                //死モーション
                case "died":
                    this.vibrate(-1,2);
                    if (this.waitFrame(280)){
                        renderCamera.setVibCamera(-8,8,80);
                        this.allive = false;
                        for (let i = 0; i<8; i++){
                            EfM.spawnNPC(
                                this.px,
                                this.py,
                                0,
                                TILESIZE,
                                TILESIZE,
                                TILESIZE,
                                "particle_rock",
                                randFloat(-6,6),
                                randFloat(-6,6),
                                randFloat(-3,-8)*2
                            )
                        }
                    }
                    if (this.waitFrameC > 40) {
                        if (this.waitFrameC%4 == 0){
                            EfM.spawnNPC(
                                this.px,
                                this.py,
                                0,
                                TILESIZE,
                                TILESIZE,
                                TILESIZE,
                                "particle_rock",
                                randFloat(-3,3)*3,
                                randFloat(-3,3)*3,
                                randFloat(-2,-4)*3
                            )
                        }
                    }
                    break;
                //異常終了
                default:
                    console.error(`Error BossSate is : ${this.BossState} Unkown State `);
                    this.BossState = 0;
                    this.clearForList();
                    this.clearMemory();
                    this.setVector(0,0,0);
                    break;
            }
        } else if (this.type == "Snow"){
            this.nonDamage = true;
            switch (this.BossState) {
                //初期化
                case 0:
                    this.BossInit();
                    this.BossState++;
                    console.log("Snow Boss Init end");
                    
                    break;
                //登場アニメーション
                case 1:
                    console.log("Snow Boss Animation");
                    this.BossState = 4;
                    break;
                //アニメーション終了
                case 2:
                    console.log("Snow Boss Animation end");
                    this.BossState++;
                    this.waitFrameReset();
                    this.animationFrame = 0;
                    this.BossMemory["throwCounter"] = 20 - ((this.hp <= this.MaxHp/2)*5);
                    break;
                //通常モーション
                case 3:
                    this.nonDamage = false;
                    /*
                    //氷でのダメージ
                    const tNPC = EnM.spriteList.find(npc => npc.type == "friendly_ice");
                    if (typeof(tNPC) == "object") {
                        if (this.hitCheck(
                                tNPC.px,
                                tNPC.py,
                                tNPC.pz,
                                tNPC.sx,
                                tNPC.sy,
                                tNPC.sz
                                ) && !this.nonDamage) {
                                this.damage(nowStatus.AP,false,false);
                                this.lastBossState = this.BossState;
                                this.BossState = "damage";
                                
                            }
                    } else {
                        for (let i = 0; i<tNPC.length; i++){
                            if (this.hitCheck(
                                tNPC[i].px,
                                tNPC[i].py,
                                tNPC[i].pz,
                                tNPC[i].sx,
                                tNPC[i].sy,
                                tNPC[i].sz
                                ) && !this.nonDamage) {
                                this.damage(nowStatus.AP,false,false);
                                this.lastBossState = this.BossState;
                                this.BossState = "damage";
                                break;
                            }
                        }
                    }
                    console.log(`friendly_ice found : ${typeof(tNPC)}`);
                    console.log(tNPC);
                    */
                    this.waitFrame(80);
                    let cycle = Math.floor(40-((this.hp <= this.MaxHp/2)*10));
                    let dist = ((this.px-player.px)**2+(this.py-player.py)**2)**0.5;
                    if (this.waitFrameC%(cycle/4) == 0){
                        if (this.animationFrame < 4){
                            this.animationFrame++;
                        } else {
                            this.animationFrame = 0;
                        }
                        console.log(`now animationFrame : ${this.animationFrame}`);
                        
                        if (this.animationFrame == 4){
                            EnM.spawnNPC(
                                this.px,
                                this.py,
                                0,
                                TILESIZE,
                                TILESIZE,
                                TILESIZE,
                                "throwSnow",
                                (player.px-this.px+randFloat(-1,1)*4)/dist*6,
                                (player.py-this.py+randFloat(-1,1)*4)/dist*6,
                                -randFloat(0.5,1.5)*dist/(TILESIZE*3)
                            );
                            console.log("throw!");
                            this.BossMemory["throwCounter"]--;
                        }
                    }

                    if (
                            this.BossMemory["throwCounter"] <= 0 ||
                            randInt(0,(this.hp < this.MaxHp/2)) > 0 ||
                            ((player.px-this.px)**2+(player.py-this.py)**2)**0.5 < this.sx*1.3
                        ){
                        this.BossState = 4;
                        this.waitFrameReset();
                    }
                    //console.log([this.waitFrameC,this.waitFinished]);
                    //this.BossState++;
                    break;
                //地団駄ふむぜ
                case 4:
                    if (this.waitFrame(80)) {
                        this.waitFrameReset();
                        this.BossState++;
                        this.setGravity(0.5);
                        this.ZAxisJump(-8);
                    }
                    if (this.waitFrameC >= 40){
                        this.vibrate(-1,2);
                    }
                    
                    break;
                //ジャンプ！
                case 5:
                    this.fallOK = true;
                    this.waitFrameReset();
                    if (this.collisionState & 0b10000){
                        this.BossState++;
                    }
                    break;
                //ツララシャワー
                case 6:
                    if(this.waitFrame(50)){
                        if(randInt((this.hp <= this.MaxHp/2)*2,5) == 5){
                            this.waitFrameReset();
                            this.BossState = 7;
                        } else {
                            this.waitFrameReset();
                            this.BossState = 2;
                        }
                    }
                    if (this.waitFrameC < 20){
                        let [tpx,tpy] = [0,0];
                        if (this.waitFrameC%(5-((this.hp <= this.MaxHp/2)*2)) == 0){
                            [tpx,tpy] = [
                                    randFloat(player.px-(TILESIZE*6),player.px+(TILESIZE*6)),
                                    randFloat(player.py-(TILESIZE*6),player.py+(TILESIZE*6))
                                ]
                            while (hitWallCheck(ColMap,TILESIZE,tpx,tpy,TILESIZE*1.5,TILESIZE*1.5)){
                                [tpx,tpy] = [
                                        randFloat(player.px-(TILESIZE*6),player.px+(TILESIZE*6)),
                                        randFloat(player.py-(TILESIZE*6),player.py+(TILESIZE*6))
                                    ]
                            }
                            EnM.spawnNPC(
                                tpx,
                                tpy,
                                0,
                                TILESIZE,
                                TILESIZE,
                                TILESIZE*4,
                                "icicle",
                                0,
                                0,
                                0,
                                [1]
                            );
                        }
                        if (this.waitFrameC == 19){
                            EnM.spawnNPC(
                                player.px,
                                player.py,
                                0,
                                TILESIZE,
                                TILESIZE,
                                TILESIZE*4,
                                "icicle",
                                0,
                                0,
                                0,
                                [1]
                            );
                            while (
                                hitWallCheck(ColMap,TILESIZE,tpx,tpy,TILESIZE*1.5,TILESIZE*1.5) ||
                                this.hitCheck(tpx,tpy,0,TILESIZE*2,TILESIZE*2,TILESIZE*2)
                            ){
                                [tpx,tpy] = [
                                        randInt(0,mapWidth*TILESIZE),
                                        randInt(0,mapHeight*TILESIZE)
                                    ]
                            }
                            EnM.spawnNPC(
                                tpx,
                                tpy,
                                -360,
                                TILESIZE,
                                TILESIZE,
                                TILESIZE,
                                "friendly_ice"
                            );
                        }
                        screenSetOffsetRand(-4,4);
                    } else if(this.waitFrameC < 40){
                        screenSetOffsetRand(-2,2);
                    }
                    break;
                //雪玉爆裂
                case 7:
                    if (this.waitFrame(80)){
                        
                        this.waitFrameReset();
                        this.BossState = 2;
                    }
                    if (this.waitFrameC < 60){
                        this.vibrate(-1,2);
                    } else if (this.waitFrameC == 60) {
                        let dist = ((this.px-player.px)**2+(this.py-player.py)**2)**0.5;
                        //let deg = degrees(Math.asin((player.py-this.py)/dist));
                        //console.log(deg);
                        for (let i = 0; i<12; i++){
                            /*
                            EnM.spawnNPC(
                                this.px,
                                this.py,
                                0,
                                TILESIZE*2/3,
                                TILESIZE*2/3,
                                TILESIZE*2/3,
                                "throwSnow",
                                Math.cos(radians(30*i+15))*dist/TILESIZE,
                                Math.sin(radians(30*i+15))*dist/TILESIZE,
                                -randFloat(0.5,1)*dist/(TILESIZE*3)
                            )
                            EnM.spawnNPC(
                                this.px,
                                this.py,
                                0,
                                TILESIZE*2/3,
                                TILESIZE*2/3,
                                TILESIZE*2/3,
                                "throwSnow",
                                Math.cos(radians(30*i+15))*dist/TILESIZE,
                                Math.sin(radians(30*i+15))*dist/TILESIZE,
                                -randFloat(1,1.5)*dist/(TILESIZE*3)
                            )
                            */
                            EnM.spawnNPC(
                                this.px,
                                this.py,
                                0,
                                TILESIZE*2/3,
                                TILESIZE*2/3,
                                TILESIZE*2/3,
                                "throwSnow",
                                randFloat(-0.5,0,5)+Math.cos(radians(30*i))*dist/TILESIZE,
                                randFloat(-0.5,0,5)+Math.sin(radians(30*i))*dist/TILESIZE,
                                -randFloat(0.75,1.25)*dist/(TILESIZE*3)
                            )
                        }
                    }
                    break;
                case "damage":
                    this.BossState = 4;
                    this.waitFrameReset();
                    break;
                case "died":;
                    const constantDieC = 200;
                    const mult = (constantDieC-this.forList["i"])/constantDieC;
                    this.vibrate(-3*mult,3*mult);
                    if (this.forList["i"] % 5 == 0){
                        EfM.spawnNPC(
                            this.px,
                            this.py,
                            this.pz,
                            TILESIZE*4/5*mult,
                            TILESIZE*4/5*mult,
                            TILESIZE*4/5*mult,
                            "particle_snow",
                            randFloat(-TILESIZE/3,TILESIZE/3)*(1+mult)/2,
                            randFloat(-TILESIZE/3,TILESIZE/3)*(1+mult)/2,
                            randFloat(-TILESIZE/2,0)*(1+mult)/2
                        );
                    }
                    this.setSize(this.dafaultSX*mult,this.dafaultSY*mult,this.defaultSZ*mult);

                    this.forList["i"]++;
                    if (this.forList["i"] > constantDieC){
                        this.allive = false;
                    }
                    break;
                //異常終了
                default:
                    console.error(`Error BossSate is : "${this.BossState}" Unkown State `);
                    this.BossState = 0;
                    this.clearForList();
                    this.clearMemory();
                    this.setVector(0,0,0);
                    break;
            }
        } else if (this.type == "Wood"){
            this.nonDamage = true;
            switch (this.BossState) {
                //初期化
                case 0:
                    this.BossInit();
                    //console.log("wood Boss Init end");
                    EfM.spawnNPC(
                        this.px,
                        this.py,
                        -this.sz,
                        this.sx*4,
                        this.sy,
                        this.sz/3,
                        "boss_wood_leef"
                    );
                    this.BossState++;
                    break;
                //登場アニメーション
                case 1:
                    const startDeg = -15;
                    const endDeg = 195;
                    this.BossMemory["rootC"] = 8;
                    for (let i = 0; i<this.BossMemory["rootC"]+1; i++){
                        let rad = radians(startDeg+((endDeg-startDeg)/this.BossMemory["rootC"]*i));
                        EnM.spawnNPC(
                            this.px+((this.sx+TILESIZE)*Math.cos(rad)),
                            this.py+((this.sy+TILESIZE)*Math.sin(rad)),
                            0,
                            TILESIZE,
                            TILESIZE,
                            TILESIZE/4,
                            "root_spear"
                        );
                    }
                    //console.log("wood Boss Animation");
                    this.BossState++;
                    break;
                case 2:
                    EnM.spawnNPC(
                        this.px,
                        this.py+TILESIZE*14,
                        0,
                        TILESIZE,
                        TILESIZE,
                        TILESIZE/4,
                        "root_spear"
                    );

                    this.BossState++;
                    break;
                case 3:

                    break;
                default:
                    console.error(`Error BossSate is : "${this.BossState}" Unkown State `);
                    this.BossState = 0;
                    this.clearForList();
                    this.clearMemory();
                    this.setVector(0,0,0);
                    break;
            }
        } else if (this.type == "Water"){
            this.nonDamage = true;
            switch (this.BossState) {
                //初期化
                case 0:
                    this.BossInit();
                    this.BossState++;
                    console.log("Water Boss Init end");
                    
                    break;
                default:
                    console.error(`Error BossSate is : "${this.BossState}" Unkown State `);
                    this.BossState = 0;
                    this.clearForList();
                    this.clearMemory();
                    this.setVector(0,0,0);
                    break;
            }     
        }
        //console.log(this.BossState);

        if (moveOK){
            this.EnMove(ColMap,TILESIZE,this.fallOK);
        }
        let hitFlag = this.hitCheck(
            plaAttackAABB.px,
            plaAttackAABB.py,
            plaAttackAABB.pz,
            plaAttackAABB.sx,
            plaAttackAABB.sy,
            plaAttackAABB.sz
        );
        if (hitFlag == 1 && !this.nonDamage && !this.invisilbe) {
            this.damage(nowStatus.AP,false,false);
            this.lastBossState = this.BossState;
            this.BossState = "damage";
        }
        hitFlag = this.hitCheck(
            player.px,
            player.py,
            player.pz,
            player.sx,
            player.sy,
            player.sz
        );
        if (this.hp <= 0){
            this.BossState = "died";
        } else if (hitFlag){
            player.damage(1);
            if (!player.EVLOCK) {
                player.setVectorNoLimit(
                    Math.sign(player.px-this.px)*Math.abs(player.vx)*2/3,
                    Math.sign(player.py-this.py)*Math.abs(player.vy)*2/3
                );
                if(player.pz >= 0) {
                    player.ZAxisJump(-4);
                    player.setPos(player.px,player.py,-1);
                }
            }
            player.EVLOCK = true;
        }
        if (player.EVLOCK && player.pz >= 0) {
            player.EVLOCK = false;
        }
        
    }

}
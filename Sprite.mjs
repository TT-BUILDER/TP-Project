import { randInt } from "./EngineMain.mjs";
import { radians } from "./EngineMain.mjs";
import { fadeIn } from "./EngineMain.mjs";
import { playerCamera } from "./EngineMain.mjs";
import { screenSetOffsetRand } from "./EngineMain.mjs";
import { screenSetOffset } from "./EngineMain.mjs";
import { player } from "./EngineMain.mjs";
import { plaAttackAABB } from "./EngineMain.mjs";
import { nowStatus } from "./EngineMain.mjs";
import { EnM } from "./EngineMain.mjs";
import { img } from "./EngineMain.mjs";
import { IR } from "./EngineMain.mjs";
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
            this.spriteList.push(new Enemy(0,0,0,0,"Enemy"));
        }

        //this.spriteNameList = [];
    }
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {String} type タイプ
     * @param {Number} vx ベクトルX
     * @param {Number} vy ベクトルY
     * @param {Number} vz ベクトルZ
     * @param {Number} MemLength そのエネミーが保持できる固有メモリ。中身を直接記述もできる。
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    spawnNPC(px,py,sx,sy,type,vx = 0,vy = 0,vz = 0,MemLength = [],MHP = 1,HP = MHP){
        if (this.EnFlag){
            const availableNPC = this.spriteList.find(npc => !npc.active);

            if (availableNPC) {
                availableNPC.activate(px,py,sx,sy,type,vx,vy,vz,MemLength,HP);
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
            this.spriteList.push(new Effect(0,0,0,0,"effect"));
        }

        //this.spriteNameList = [];
    }
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {String} type タイプ
     * @param {Number} vx ベクトルX
     * @param {Number} vy ベクトルY
     * @param {Number} vz ベクトルZ
     * @param {Number} MemLength そのエネミーが保持できる固有メモリ。中身を直接記述もできる。
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    spawnNPC(px,py,sx,sy,type,vx = 0,vy = 0,vz = 0,MemLength = [],MHP = 1,HP = MHP){
        if (this.EfFlag){
            const availableEffect = this.spriteList.find(npc => !npc.active);

            if (availableEffect) {
                availableEffect.activate(px,py,sx,sy,type,vx,vy,vz,MemLength,HP);
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
     * @param {String} type タイプ
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHPHP）
     */
    constructor(px,py,sx,sy,type,MHP = 1,HP = MHP,MST = 1,ST = MST,SPD = 4){
        this.px = px;
        this.py = py;
        this.pz = 0;
        this.gravity = 1.5;
        this.slowDownV = 2;
        this.sx = sx;
        this.sy = sy;
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
        this.VLOCK = false;
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
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHPHP）
     */
    initalize(px,py,sx,sy,MHP = 1,HP = MHP,MST = 1,ST = MST,SPD = 4){
        this.px = px;
        this.py = py;
        this.pz = 0;
        this.gravity = 1.5;
        this.slowDownV = 2;
        this.sx = sx;
        this.sy = sy;
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
    clearFrame(num = 0){
        this.animationFrame = num;
    }
    clearanimFrameSum(){
        this.animFrameSumByClock = 0;
    }
    setAnimFrameClockDiv(div){
        this.animFrameClockDiv = div;
    }
    changeAnimState(state){
        this.animationFrame = 0;
        this.clearanimFrameSum();
        this.animationState = state;
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
    RenderMyself(CamX,CamY,style,ShowHP = false,ShowShadow = true,imgStX = 0,imgStY = 0,imgSX = this.myImg.imageData.width, imgSY = this.myImg.imageData.height){
        if (this.invisilbe){
            this.invisibleTime--;
            if (this.invisibleTime <= 0) this.invisilbe = false;
        }
        const RenSprX = this.px + CamX;
        const RenSprY = this.py + CamY + this.pz;        
        NowCTX.beginPath();
        if (ShowShadow) {
            let Alpha = 25;//+this.pz*0.2;
            if (Alpha < 0) Alpha = 0;
            let cx = (this.sx*0.7)-(this.pz*-0.01);
            let cy = (this.sy/3)-(this.pz*-0.01);
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
        if (this.showflag) {
            //NowCTX.arc(32,32,32,0,Math.PI*2,false);
            if (this.invisibleTime % 4 <= 1) {
                let RestoreAplha = NowCTX.globalAlpha;
                NowCTX.globalAlpha = 0.3;
                NowCTX.fillStyle = style;
                NowCTX.fillRect(
                    (RenSprX-(this.sx/2)),
                    (RenSprY-(this.sy/2)),
                    this.sx,
                    this.sy
                );
                NowCTX.globalAlpha = RestoreAplha;
            }
            if (ShowHP) {
                //NowCTX.fillStyle = "white";
                NowCTX.font = "14px monospace";
                NowCTX.fillText(`HP:${this.hp},Dir:${this.direction}`,RenSprX-this.sx*2,RenSprY+this.sy+10);
                NowCTX.fillStyle = "red";
                NowCTX.fillRect(
                    RenSprX-(this.sx*0.6),
                    RenSprY-this.sy*0.6-12,
                    this.sx*1.2,
                    6
                );
                NowCTX.fillStyle = "rgb(0, 255, 0)";
                NowCTX.fillRect(
                    RenSprX-(this.sx*0.6),
                    RenSprY-this.sy*0.6-12,
                    (this.sx*1.2)*(this.hp/this.MaxHp),
                    6
                );
                NowCTX.fillStyle = "red";
                NowCTX.fillRect(
                    RenSprX-(this.sx*0.6),
                    RenSprY-this.sy*0.6-21,
                    this.sx*1.2,
                    6
                );
                NowCTX.fillStyle = "rgb(0, 128, 255)";
                NowCTX.fillRect(
                    RenSprX-(this.sx*0.6),
                    RenSprY-this.sy*0.6-21,
                    (this.sx*1.2)*(this.stamina/this.MaxStamina),
                    6
                );
                
            }
            this.myImg.setTrim(imgStX,imgStY,imgSX,imgSY);
            this.myImg.setSize(this.sx,this.sy);
            this.myImg.render(RenSprX,RenSprY);
            
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
            this.pz += this.vz;
            this.vz += this.gravity;
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
    doCollision(ColMap,TILESIZE,px,py){
        const ltx = Math.floor((px-(this.sx/2))/TILESIZE);
        const rtx = Math.floor((px+(this.sx/2)-1)/TILESIZE);
        const uty = Math.floor((py-(this.sy/2))/TILESIZE);
        const dty = Math.floor((py+(this.sy/2)-1)/TILESIZE);

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
            this.collisionState = 0;

            //ベクトルX分動かす
            this.px = this.px + vx;
            //コリジョンXチェック
            if (this.collisionFlag) {
                if (this.doCollision(ColMap,TILESIZE,this.px,this.py)) {
                    if (vx < 0) {
                        const ltx = Math.floor((this.px-(this.sx/2))/TILESIZE);
                        this.px = (ltx+1)*TILESIZE+(this.sx/2);
                        this.collisionState = this.collisionState | 0b00010;
                        this.vx = 0;
                    } else if (vx > 0) {
                        const rtx = Math.ceil((this.px+(this.sx/2))/TILESIZE);
                        this.px = (rtx-1)*TILESIZE-(this.sx/2);
                        this.collisionState = this.collisionState | 0b00001;
                        this.vx = 0;
                    }
                }
            }

            //ベクトルY分動かす
            this.py = this.py + vy;
            //コリジョンYチェック
            if (this.collisionFlag){
                if (this.doCollision(ColMap,TILESIZE,this.px,this.py)) {
                    if (vy < 0) {
                        const uty = Math.floor((this.py-(this.sy/2))/TILESIZE);
                        this.py = (uty+1)*TILESIZE+(this.sy/2);
                        this.collisionState = this.collisionState | 0b01000;
                        this.vy = 0;
                    } else if (vy > 0) {
                        const dty = Math.ceil((this.py+(this.sy/2))/TILESIZE);
                        this.py = (dty-1)*TILESIZE-(this.sy/2);
                        this.collisionState = this.collisionState | 0b00100;
                        this.vy = 0;
                    }
                }
            }

            if (fallOK) this.ZAxisFall();

            this.setStaminaRelative(0.2);
            this.animFrameClock++;
            if (this.animFrameClock >= this.animFrameClockDiv) {
                this.animFrameClock = 0;
                this.animFrameSumByClock++;
            }

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
    /**
     * @param {Number} vx セットするベクターX
     * @param {Number} vy セットするベクターY
     * @param {Number} vz セットするベクターZ
     */
    setVector(vx,vy,vz = this.vz,smooth = false,smoothSpeed = 2){
        if (!this.VLOCK) {
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
            if (Math.round(this.vx) == 0) this.vx = 0;
            if (Math.round(this.vy) == 0) this.vy = 0;
            if (Math.round(this.vz) == 0) this.vz = 0;
        }
    }
    
    slowDown(slowDownSpeed = this.slowDownV){
        if (!this.VLOCK) {
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
    setSize(sx,sy){
        this.sx = sx;
        this.sy = sy;
    }

    setCollision(CF){
        this.collisionFlag = CF;
    }

    /**
     * @param {Number} px 自身のポジションX
     * @param {Number} py 自身のポジションY
     * @param {Number} sx 自身のサイズX
     * @param {Number} sy 自身のサイズY
     * @param {Number} tpx 相手のポジションX
     * @param {Number} tpy 相手のポジションY
     * @param {Number} tsx 相手のサイズX
     * @param {Number} tsy 相手のサイズY
     * @returns boolean
     */
    hitCheck(tpx,tpy,tsx,tsy,px = this.px,py = this.py,sx = this.sx,sy = this.sy){
        if ( Math.abs(tpx-px) < (sx+tsx)/2 && Math.abs(tpy-py) < (sy+tsy)/2 ){
            return 1
        } else { 
            return 0
        }
    }

    /**
     * @param {Number} di 与えるダメージ。負の数だと回復する。
     * @param {boolean} slip スリップダメージかどうか
     */
    damage(di,slip = false){
        if (!this.invisilbe || slip){
            this.hp = this.hp - di
            if (this.hp <= 0) this.hp = 0;
            this.invisibleTime = this.maxInvisibleTime;
            this.invisilbe = true;
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
     * @param {String} type タイプ
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    constructor(px,py,sx,sy,type,MHP = 1,HP = MHP,active = false){
        super(px,py,sx,sy,type,MHP,HP);
        this.active = active;
    }
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {String} type タイプ
     * @param {Number} vx ベクトルX
     * @param {Number} vy ベクトルY
     * @param {Number} vz ベクトルZ
     * @param {Number} Memory そのエネミーが保持できる固有メモリ。中身を直接記述もできる。
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    activate(px,py,sx,sy,type,vx = 0,vy = 0,vz = 0,Memory = [],MHP = 1,HP = MHP,MST = 1,ST = MST,SPD = 4){
        this.px = px;
        this.py = py;
        this.sx = sx;
        this.sy = sy;
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
    EnemyAction(ColMap,TILESIZE){
        switch (this.type) {
            case "rocks":
                this.EnMove(ColMap,TILESIZE);

                if (this.hitCheck(player.px,player.py,player.sx,player.sy)){
                    player.damage(1);
                }

                if ( (this.collisionState & 0b10000) === 0b10000 ) {
                    this.Unactivate();
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
     * @param {String} type タイプ
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    constructor(px,py,sx,sy,type,MHP = 1,HP = MHP,active = false){
        super(px,py,sx,sy,type,MHP,HP);
        this.active = active;
    }
    /**
     * @param {Number} px ポジションｘ
     * @param {Number} py ポジションｙ　
     * @param {Number} sx サイズｘ
     * @param {Number} sy サイズｙ
     * @param {String} type タイプ
     * @param {Number} vx ベクトルX
     * @param {Number} vy ベクトルY
     * @param {Number} vz ベクトルZ
     * @param {Number} Memory そのエネミーが保持できる固有メモリ。中身を直接記述もできる。
     * @param {Number} MHP マックスＨＰ（デフォルトは１）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    activate(px,py,sx,sy,type,vx = 0,vy = 0,vz = 0,Memory = [],MHP = 1,HP = MHP,MST = 1,ST = MST,SPD = 4){
        this.px = px;
        this.py = py;
        this.sx = sx;
        this.sy = sy;
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
    EffectAction(ColMap,TILESIZE){
        switch (this.type) {
            case "Sword":
                    if (this.state <= 0) {
                        this.myImg.setImage(img.imgList["SwordEffect"]);
                        this.myImg.roll = 0;
                        this.state = 1;
                        //console.log("State 0 is done");
                    } else if (this.state == 1) {
                                this.setSlowDownV(8);
                                this.setCollision(0);
                                this.state = 2;
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
     * @param {String} type ボスのタイプ
     * @param {Number} MHP マックスＨＰ（デフォルトは１００）
     * @param {Number} HP 名の通りＨＰ（デフォルトはMHP）
     */
    constructor(px,py,sx,sy,type,MHP = 100,HP = MHP){
        super(px,py,sx,sy,type,MHP,HP,true);
        this.allive = true;
        this.fallOK = true;
        //waitメソッド用の変数
        this.waitFrameC = 0;
        this.waitFinished = true;
        this.BossState = 0;
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
        if (this.waitFrameC < Frame) {
            this.waitFrameC++;
            this.waitFinished = false;
            return 0;
        } else {
            this.waitFinished = true;
            return 1;
        }
    }
    /**
     * ブリモーション
     * @param {Number} UY 上方向
     * @param {Number} DY 下方向
     */
    vibrate(UY,DY = UY){
        //ブリモーション
        this.fallOK = false;
        if (this.pz > 0){
            this.pz = UY;
        } else {
            this.pz = DY;
        }
    }
    /**
     * @param {Array} ColMap コリジョンマップ
     * @param {Number} TILESIZE 1タイル当たりのピクセル数
     */
    BossAction(ColMap,TILESIZE){
        if (this.type == "Rock"){
           let moveOK = true;
           this.fallOK = true;
           switch (this.BossState) {
            //初期化
            case 0:
                this.clearForList();
                this.clearMemory();
                this.hp = this.MaxHp;
                isNowBossAnimation = true;
                this.setPos(this.px,this.py,-360);
                this.BossState++;
                break;
            //落下
            case 1:
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
                    } else {
                        this.BossMemory["tarX"] = (player.px - this.px)/distance;
                        this.BossMemory["tarY"] = (player.py - this.py)/distance;
                    }
                    //突進スピード
                    this.BossState++;
                    this.BossMemory["MultSpeed"] = 4;
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
                        npcVX *= Math.ceil((Math.random()+1)*3);
                        npcVY *= Math.ceil((Math.random()+1)*3);
                        //console.log([npcVX,npcVY]);
                        EnM.spawnNPC(
                            spX,
                            spY,
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
                        if (Math.round(Math.random()) > 0){
                            //飛び上がり
                            this.BossState = 8;
                            this.forList["i"] = 0;
                            break;
                        } else {
                            //高速回転
                            this.BossState = 11;
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
                    this.fallOK = false;
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
                    this.fallOK = false;
                    if (this.pz > -600) {
                        this.showflag = true;
                        this.setPos(this.px,this.py,this.pz+10);
                    } else {
                        this.setPos(player.px,player.py,this.pz+5);
                    }
                } else {
                    this.pz = 0;
                    if (this.forList["i"] < 15){
                        screenSetOffsetRand(8,8);
                    } else
                    if (this.forList["i"] < 30){
                        screenSetOffsetRand(6,6);
                    } else
                    if (this.forList["i"] < 50){
                        screenSetOffsetRand(3,3);
                    } else {
                        this.BossState++;
                        this.forList["i"] = 0;
                    }
                    this.forList["i"]++;
                }
                break;
            //スタン、case4（いろいろ初期化）へ
            case 10:
                this.fallOK = false;
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
            //高速回転（case 11 ～ case ）ブリをかける
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
                        npcVX *= Math.ceil((Math.random()+1)*3);
                        npcVY *= Math.ceil((Math.random()+1)*3);
                        console.log([npcVX,npcVY]);
                        EnM.spawnNPC(
                            spX,
                            spY,
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
                this.fallOK = false;
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
            //異常終了
            default:
                console.error(`Error BossSate is : "${this.BossState}" Unkown State `);
                this.BossState = 0;
                this.clearForList();
                this.clearMemory();
                this.setVector(0,0,0);
                break;
           }

           if (moveOK){
                this.EnMove(ColMap,TILESIZE,this.fallOK);
           }
            let hitFlag = this.hitCheck(
                plaAttackAABB.px,
                plaAttackAABB.py,
                plaAttackAABB.sx,
                plaAttackAABB.sy
            );
            if (hitFlag == 1) {
                this.damage(nowStatus.AP);
            }
            if (this.hp <= 0){
                this.BossState = 14;
            }

        }
    }

}
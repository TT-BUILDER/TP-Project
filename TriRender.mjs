const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const width = 480;
const height = 360;
//キャンバスの大きさの設定
canvas.width = width;
canvas.height = height;

let uCAN = null;
let uCTX = null;

const far = 65536;
const near = 0.1;

let image = null;
let cBuf = null;
let zBuf = null;
/*      written by VS code's AI    */
let _offscreenCanvas = null;
let _offscreenCtx = null;

const promise = new Promise((resolve, reject) => {
    try {
        image = ctx.createImageData(canvas.width, canvas.height);
        //バッファの作成
        cBuf = image.data;
        zBuf = new Float32Array(canvas.width * canvas.height);
        resolve("Image data created successfully");
    } catch (e) {
        reject(`Failed to create image data: ${e}`);
    }
}).then((m) => {
    console.log(m);
}).catch((e) => {
    console.error(e);
});

export function setContextForBuf(ca,ctx){
    uCAN = ca;
    uCTX = ctx;
}

//バッファの描画関数
export function renderZBuffer(){
    if (!uCAN || !uCTX){
        console.error("Canvas or Context is not exist!");
        return;
    }
    

        const found = zBuf.find( d => d < 1);

        console.log(found);
    /*      written by VS code's AI    */

        // オフスクリーンキャンバスを初期化（再利用）
        if (!_offscreenCanvas) {
            _offscreenCanvas = document.createElement('canvas');
            _offscreenCtx = _offscreenCanvas.getContext('2d');
        }
        _offscreenCanvas.width = image.width;
        _offscreenCanvas.height = image.height;

        // ImageData をオフスクリーンに配置してから drawImage で合成
        _offscreenCtx.putImageData(image, 0, 0);

        // 合成モードを明示的に source-over にして既存の描画の上に重ねる
        const prevComp = uCTX.globalCompositeOperation;
        const prevAlpha = uCTX.globalAlpha;
        uCTX.globalCompositeOperation = 'source-over';
        uCTX.globalAlpha = 1;
        uCTX.drawImage(_offscreenCanvas, 0, 0, _offscreenCanvas.width, _offscreenCanvas.height, 0, 0, uCAN.width, uCAN.height);
        uCTX.globalCompositeOperation = prevComp;
        uCTX.globalAlpha = prevAlpha;

    
}

//バッファの初期化
export function clearZBuffer() {

    /*      written by VS code's AI    */

        // ピクセル数でループ（cBuf はバイト配列なので注意）
        const pxCount = width * height;
        for (let i = 0; i < pxCount; i++) {
            const base = i * 4;
            // 色は 0 にしてアルファを 0 にすることで透明に初期化
            cBuf[base] = 0;
            cBuf[base + 1] = 0;
            cBuf[base + 2] = 0;
            cBuf[base + 3] = 0; // 0 = fully transparent
            // 深度バッファは最大値（遠い）で初期化
            zBuf[i] = 1;
        }
}
function putPixelToBuffer(scx,scy,depth,pixCol){
    const index = scy*width+scx
    if (depth < zBuf[index]){
        zBuf[index] = depth;
        cBuf[index*4] = pixCol[0];
        cBuf[index*4+1] = pixCol[1];
        cBuf[index*4+2] = pixCol[2];
        cBuf[index*4+3] = 255;
    }
}


//ラジアン変換関数
export function radians(degrees){
    return (Math.PI/180)*degrees;
}
export function degrees(radians){
    return (180/Math.PI)*radians;
}

/*      written by VS code's AI    */
// テクスチャ付き三角形レンダラー (TexRen)
export class TexRen {
    /**
     * @param {Object} imgInstance Imageクラスのインスタンス
     */
    constructor(imgInstance){
        // imgInstance は TP Tankyuu/ImgLoader.mjs の Images クラスのインスタンスを想定
        this.imgInstance = imgInstance;
        this.texCache = {}; // { key: {data, w, h} }

        this.rx = 0;
        this.ry = 0;
        this.rz = 0;
        this.rst = [0,0,0];
        this.rct = [0,0,0];
        
        this.FOV = 60;
        this.cot = 1/Math.tan(radians(this.FOV/2));
        this.near = 0.1;
        this.far = 65536;
        // h / w
        this.ratio = 3/4;
        this.scx = 480;
        this.scy = 360;
    }

    /** imgList から画像を取り出し ImageData をキャッシュする
     * @param {String} pass 画像につけたキー
     */
    _getTexture(pass){
        //インスタンスがない、またはインスタンス内の画像リストが空っぽのとき、nullを返す
        if (!this.imgInstance || !this.imgInstance.imgList) return null;

        //画像リストから画像を引っ張ってくる
        const img = this.imgInstance.imgList[pass];
        //画像がなかっらたnullを返す
        if (!img) return null;

        //すでにキャッシュ済みならキャッシュのデータを返す
        if (this.texCache[pass]) return this.texCache[pass];

        //画像取り込み
        //キャンバス作成
        const off = document.createElement('canvas');
        off.width = img.width;
        off.height = img.height;
        //コンテキストげっちゅ
        const octx = off.getContext('2d');
        //画僧をかきかき
        octx.drawImage(img, 0, 0);
        //さっき描いた画像をデータでげっちゅ
        const id = octx.getImageData(0, 0, off.width, off.height);
        //キャッシュへ保存
        this.texCache[pass] = {data: id.data, w: off.width, h: off.height};
        //読み込んだキャッシュを返す
        return this.texCache[pass];
    }

    /**
     * u,vは正規化（0 ~ 1の実数）すること。zはテキトーでもいいかも…？
     * @param {Vec5} v1 [x,y,z,u,v]の五次ベクトル１
     * @param {Vec5} v2 [x,y,z,u,v]の五次ベクトル２
     * @param {Vec5} v3 [x,y,z,u,v]の五次ベクトル３
     * @param {String} pass 画像のキー
     */
    renTri(v1, v2, v3, pass){
        const tex = this._getTexture(pass);
        if (!tex) {
            console.error("Texture is missing!");
            return;
        }

        // 三角形のバウンディングボックス（画面座標）
        const minX = Math.max(0, Math.floor(Math.min(v1[0], v2[0], v3[0])));
        const maxX = Math.min(width - 1, Math.ceil(Math.max(v1[0], v2[0], v3[0])));
        const minY = Math.max(0, Math.floor(Math.min(v1[1], v2[1], v3[1])));
        const maxY = Math.min(height - 1, Math.ceil(Math.max(v1[1], v2[1], v3[1])));

        // バリセンター計算に使う補助
        const x0 = v1[0], y0 = v1[1];
        const x1 = v2[0], y1 = v2[1];
        const x2 = v3[0], y2 = v3[1];

        const denom = (y1 - y2)*(x0 - x2) + (x2 - x1)*(y0 - y2);
        if (denom === 0) return; // 面積ゼロ

        // テクスチャ座標が 0..1 の正規化値かピクセルか判定
        const isNormalizedU = Math.max(v1[3], v2[3], v3[3]) <= 1;
        const isNormalizedV = Math.max(v1[4], v2[4], v3[4]) <= 1;

        for (let y = minY; y <= maxY; y++){
            for (let x = minX; x <= maxX; x++){
                // バリセンター係数
                const w0 = ((y1 - y2)*(x - x2) + (x2 - x1)*(y - y2)) / denom;
                const w1 = ((y2 - y0)*(x - x2) + (x0 - x2)*(y - y2)) / denom;
                const w2 = 1 - w0 - w1;

                if (w0 < 0 || w1 < 0 || w2 < 0) continue; // 三角形外

                // 補間された深度
                const z = w0 * v1[2] + w1 * v2[2] + w2 * v3[2];
                const idx = y * width + x;
                if (z >= zBuf[idx]) continue; // 深度テスト

                // 補間されたテクスチャ座標
                let u = w0 * v1[3] + w1 * v2[3] + w2 * v3[3];
                let v = w0 * v1[4] + w1 * v2[4] + w2 * v3[4];

                // 正規化されている場合はテクスチャ解像度へ変換
                if (isNormalizedU) u = u * (tex.w - 1);
                if (isNormalizedV) v = v * (tex.h - 1);

                const tx = Math.max(0, Math.min(tex.w - 1, Math.floor(u)));
                const ty = Math.max(0, Math.min(tex.h - 1, Math.floor(v)));
                const tIdx = (ty * tex.w + tx) * 4;
                const r = tex.data[tIdx];
                const g = tex.data[tIdx + 1];
                const b = tex.data[tIdx + 2];

                putPixelToBuffer(x, y, z, [r, g, b]);
            }
        }
    }

    setParam(scx,scy,fov = this.FOV,n = this.near, f = this.far){
        this.scx = scx;
        this.scy = scy;
        this.ratio = scy/scx;
        this.FOV = fov;
        this.near = n;
        this.far = f;
        this.cot = 1/Math.tan(radians(this.FOV/2));

    }
    screenProject(vec4){
        return [
            vec4[0]*this.scx,
            vec4[1]*this.scy,
            vec4[2]
        ];
    }
    /**
     * ビュー変換：ワールド（またはカメラ）座標の四次ベクトルをスクリーン座標へ変換する
     * @param {Vec4} vec4 [x,y,z,w]
     * @returns {Array} [sx, sy, depth, w]
     */
    viewConvertion(vec4){
        // 回転を適用（ローカル回転がある場合は事前に setRotate で角度を設定）
        let v = this.rollx(vec4);
        v = this.rolly(v);
        v = this.rollz(v);

        const x = v[0];
        const y = v[1];
        const z = v[2];
        const w = v[3] ?? 1;

        // 透視投影係数 f = cot(FOV/2)
        const f = this.cot;
        // アスペクト比: width/height。this.ratio は h/w (コメントあり) のため逆数をとる
        const aspect = (this.ratio && this.ratio !== 0) ? (1 / this.ratio) : (width / height);

        // クリップ空間へ投影（z が 0 に近い場合はクリップを避ける）
        const eps = 1e-6;
        const vz = (Math.abs(z) < eps) ? eps : z;

        const x_ndc = (x * f) / (aspect * vz);
        const y_ndc = (y * f) / vz;

        // NDC (-inf..inf) を画面ピクセルへ変換（NDCを -1..1 と想定）
        const sx = (x_ndc + 1) * 0.5 * width;
        const sy = (1 - (y_ndc + 1) * 0.5) * height;

        // 深度は near..far を 0..1 に正規化（近いほど小さい値）
        let depth = (z - this.near) / (this.far - this.near);
        if (!isFinite(depth)) depth = 1;
        depth = Math.max(0, Math.min(1, depth));

        return [sx, sy, depth, w];
    }
    setRotate(rx,ry,rz){
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
        this.setRotateTemp();
    }

    setRptateRelative(vrx,vry,vrz){
        this.rx += vrx;
        this.ry += vry;
        this.rz += vrz;
        this.setRotateTemp();
    }

    setRotateTemp(){
        this.rst = [Math.sin(radians(this.rx)), Math.sin(radians(this.ry)), Math.sin(radians(this.rz))];
        this.rct = [Math.cos(radians(this.rx)), Math.cos(radians(this.ry)), Math.cos(radians(this.rz))];
    }

    /**
     * @param {Vec4} vec4 [x,y,z,w]の四次ベクトル
     */
    rollx(vec4){
        const [x,y,z,w] = vec4;
        return [
            x,
            this.rct[0]*y-this.rst[0]*z,
            this.rst[0]*y+this.rct[0]*z,
            w
        ];
    }
    /**
     * @param {Vec4} vec4 [x,y,z,w]の四次ベクトル
     */
    rolly(vec4){
        const [x,y,z,w] = vec4;
        return [
            this.rct[1]*x+this.rst[1]*z,
            y,
            -this.rst[1]*x+this.rct[1]*z,
            w
        ];
    }
    /**
     * @param {Vec4} vec4 [x,y,z,w]の四次ベクトル
     */
    rollz(vec4){
        const [x,y,z,w] = vec4;
        return [
            this.rct[2]*x-this.rst[2]*y,
            this.rst[2]*x+this.rct[2]*y,
            z,
            w
        ];
    }

}

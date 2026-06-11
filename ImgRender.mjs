export class imgRender {
    constructor(canvas,ctext){
        //回転専用バッファ(Roll-Canvas)の作成
        this.rollCanvas = document.createElement("canvas");
        this.rctx = this.rollCanvas.getContext("2d");
        this.ca = canvas;
        this.ctx = ctext;
    }
    /**
     * 出力先のコンテキスト設定
     * @param {object} canvas 描画先のキャンバスまるごと 
     * @param {Context} ctext 描画先のキャンバスのコンテキスト
     */
    setContext(canvas,ctext){
        this.ca = canvas;
        this.ctx = ctext;
    }

    /**
     * 回転させた画像の描画
     * @param {Image} img 画像
     * @param {Number} px 出力先の中心X
     * @param {Number} py 出力先の中心Y
     * @param {Number} roll 角度(度数法)
     * @param {Number} sx 出力サイズX（X軸拡大率）
     * @param {Number} sy 出力サイズY（Y軸拡大率）
     * @param {Number} tstx 元画像のトリミング開始位置X
     * @param {Number} tsty 元画像のトリミング開始位置Y
     * @param {Number} tsix 元画像のトリミングサイズX
     * @param {Number} tsiy 元画像のトリミングサイズY
     */
    renderImg(
            img,
            px,
            py,
            roll,
            sx = img.width,
            sy = img.height,
            tstx = 0,
            tsty = 0,
            tsix = img.width,
            tsiy = img.height
        ){
        //参考：https://misc.laboradian.com/html5/rotate-image-canvas-sample/001/
        let radians = roll * (Math.PI/180);
        //現在の状態を保存
        this.ctx.save();
        //原点移動
        this.ctx.translate(px,py);
        //回転
        this.ctx.rotate(radians);
        //描画
        
        this.ctx.drawImage(
            img,
            tstx,
            tsty,
            tsix,
            tsiy,
            -sx/2,
            -sy/2,
            sx,
            sy
        );
        /*
        this.ctx.drawImage(
            img,
            -img.width/2,
            -img.height/2
        )
        */
        //もとへ戻す
        this.ctx.restore();

    }


}
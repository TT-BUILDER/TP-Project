let C = null;
let CTX = null;
let txtSize = 0;
let txtBuffer = null;
let txtBufSX = 0;
let txtBufSY = 0;
let txtFont = "monospace";
let txtAlign = "start";
let txtBase = "alphabetic";

/**
 * 
 * @param {Object} can キャンバスをまるごと
 * @param {Object} ctx キャンバスのコンテキストをまるごと
 */
export function setContext(can,ctx){
    C = can;
    CTX = ctx;
    console.log("Success applying canvas and context.");
}
export function setTextSize(size){
    txtSize = size;
}
export function setTextStyle(font,align,base){
    txtFont = font;
    txtAlign = align;
    txtBase = base;
}
/**
 * @param {Number} sx バッファ横サイズ
 * @param {Number} sy バッファ縦サイズ
 * @param {Number} size テキストサイズ
 */
export function setTextBuffer(sx,sy,size){
    if (C != null && CTX != null){
        if (sx > 0 && sy > 0){
            txtBufSX = sx;
            txtBufSY = sy;
            txtBuffer = null;
            txtBuffer = new Uint16Array(sx*sy);
            for (let i = 0; i<sx*sy; i++){
                txtBuffer[i] = " ".charCodeAt(0);
            }
            txtSize = size;
            console.log(`Success creating buffer. width ${sx} * height ${sy}`);
            console.log(txtBuffer);
        } else {
            console.error("TextBufferSize is too small!");
        }
    } else {
        console.error("Canvas or Context is not exist!");
    }
}
export function clearTextBuffer(){
    for (let i = 0; i<txtBufSX*txtBufSY; i++){
        txtBuffer[i] = " ".charCodeAt(0);
    }
}
export function deleteTextBuffer(){
    txtBuffer = null;
}
/**
 * 
 * @param {Number} px 右上の座標X
 * @param {Number} py 左上の座標Y
 * @param {Number} sx 横幅
 * @param {Number} sy 立幅
 * @param {Array} C RGBAカラー
 * @param {Boolean} hasEdge 枠を持つかどうか
 * @param {Number} es 枠の太さ
 * @param {Array} [EC=[0,0,0,0]] 枠のRGBAカラー
 */
export function renderUI(px,py,sx,sy,C,hasEdge = false,es = 0,EC = [0,0,0,0]){
    CTX.save();
    CTX.fillStyle = `rgba(${C[0]},${C[1]},${C[2]},${C[3]/255})`;
    CTX.fillRect(px,py,sx,sy);
    if (hasEdge){
        CTX.fillStyle = `rgba(${EC[0]},${EC[1]},${EC[2]},${EC[3]/255})`;
        //上下
        CTX.fillRect(px,py-es,sx,es);
        CTX.fillRect(px,py+sy,sx,es);
        //左右
        CTX.fillRect(px+sx,py-es,es,es+sy+es);
        CTX.fillRect(px-es,py-es,es,es+sy+es);
    }
    CTX.restore();

}
/**
 * 
 * @param {String} text 
 * @param {String} font コンテキストのプロパティ"font"に突っ込むフォント名
 * @param {Number} px 座標X
 * @param {Number} py 座標Y
 * @param {string} [Align=txtAlign] コンテキストのプロパティ"textAlign"にそのまま突っ込む文字列
 * @param {string} [Base=txtBase] コンテキストのプロパティ"textBaseLine"にそのまま突っ込む文字列
 */
export function renderText(text,px,py,C = [255,255,255,255],font = txtFont,Align = txtAlign,Base = txtBase){

    CTX.save();
    //console.log(`rgba(${C[0]},${C[1]},${C[2]},${C[3]/255})`);
    CTX.fillStyle = `rgba(${C[0]},${C[1]},${C[2]},${C[3]/255})`;
    CTX.font = `${txtSize}px ${font}`;
    CTX.textAlign = Align;
    CTX.textBaseLine = Base;
    CTX.fillText(text,px,py);
    CTX.restore();

}
/**
 * 
 * @param {Number} px 表示座標X
 * @param {Number} py 表示座標Y
 * @param {Number} sx 表示ピクセル数X
 * @param {Number} sy 表示ピクセル数Y
 */
export function rendertxtBuffer(px,py,sx,sy,C = [255,255,255,255]){
    for (let iy = 0; iy<txtBufSY; iy++){
        for (let ix = 0; ix<txtBufSX; ix++) {
            renderText(getStr(ix,iy),px+(ix*sx),py+(iy*sy),C);
        }
    }
}
/**
 * @param {Number} idx 先頭インデックスX
 * @param {Number} idy 先頭インデックスY
 */
export function getStr(idx,idy){
    if (txtBuffer != null){
        if (idx >= 0 && idx < txtBufSX && idy >= 0 && idy < txtBufSY){
            const str = String.fromCharCode(txtBuffer[idy*txtBufSX + idx]);
            return str;
        } else {
            console.error("index is out of Range");
            return null;
        }
    } else {
        console.error("Text Buffer is not initalized.");
        return null;
    }
}
/**
 * @param {Number} idx 先頭インデックスX
 * @param {Number} idy 先頭インデックスY
 * @param {String} str 文字
 * @returns {Boolean} 成功したか
 */
export function putStr(idx,idy,str){
    if (txtBuffer != null){
        if (idx >= 0 && idx < txtBufSX && idy >= 0 && idy < txtBufSY){
            txtBuffer[idy*txtBufSX + idx] = str.charCodeAt(0);
            return 1;
        } else {
            console.error("index is out of Range");
            return 0;
        }
    } else {
        console.error("Text Buffer is not initalized.");
        return 0;
    }
}
/**
 * @param {Number} idx 先頭インデックスX
 * @param {Number} idy 先頭インデックスY
 * @param {String} text 文字列
 * @returns {Boolean} 成功したか
 */
export function textWrite(idx,idy,text){
    if (txtBuffer != null){
        if (idx >= 0 && idx < txtBufSX && idy >= 0 && idy < txtBufSY){
            
            const str = Array.from(text);

            for (let i = 0; i<str.length; i++){
                const id = idy*txtBufSX + (idx + i);
                if ((idx + i) > txtBufSX){
                    console.error("Ilegal Buffer Access!")
                    return 0;
                } else {
                    txtBuffer[id] = str[i].charCodeAt(0);
                }

            }

            return 1;
        } else {
            console.error("index is out of Range");
            return 0;
        }
    } else {
        console.error("Text Buffer is not initalized.");
        return 0;
    }

}
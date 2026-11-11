//import { cryptos, decryptos } from "./seacret_folder/ImgEncoder_N.mjs";

export class Images {
    
    //Debug Done
    constructor(){
        this.imgList = {};    //Mapオブジェクトを作成。Pythonでいう辞書
        this.imgSrcList = {};
        this.arrayBuffers = {};
        this.RAWIMG = {};

    }

    /**
     * 
     * @param {String} Name 画像につけるキー
     * @param {String} ImgPass 画像への相対パス
     * @param {boolean} option 暗号テスト用
     */
    //Debug Done
    async AddImg(Name,ImgPass,option = false){
        const img = new Image();
        /*
        img.onload = () => {
            console.log("Success : "+ImgPass+' as "'+Name+'"');
        };
        img.onerror = () => {
            console.error("Unsuccess:", ImgPass);
        };
        this.imgSrcList[Name] = ImgPass;
        this.imgList[Name] = img;
        */
        img.src = ImgPass;
        img.id = Name;
        try {
            await img.decode()
        
            console.log("Success : "+ImgPass+' as "'+Name+'"');
            this.imgSrcList[Name] = ImgPass;
            this.imgList[Name] = img;
            if (option) {
                const can = document.createElement("canvas");
                can.width = img.width;
                can.height = img.height;
                const ctx = can.getContext("2d");

                if (ctx){

                    ctx.drawImage(img,0,0);
                    const imgData = ctx.getImageData(0,0,can.width,can.height);
                    this.arrayBuffers[Name] = new Uint8Array(imgData.data.buffer);
                    console.log("arrayBuffer");
                    console.log(this.arrayBuffers[Name]);

                    this.RAWIMG[Name] = null;//await cryptos(this.arrayBuffers[Name],"testEnc",0,0);
                    
                    const decode = null;//decryptos(this.RAWIMG[Name],0,0);
                    console.log("decode");
                    console.log(decode);

                    if (this.arrayBuffers[Name].length == decode.length){
                        for (let i = 0; i<this.arrayBuffers[Name].length; i++){
                            if (decode[i] != this.arrayBuffers[Name][i]){
                                console.error("cryptos ot decryptos function is something wrong...");
                                break;
                            }
                        }
                    }

                } else {
                    console.error(`failed getting pixel data. key:${Name}`);
                    this.arrayBuffers[Name] = null;
                }
            }

        } catch (error) {
            console.error(`imgLoad Unsuccess: ${error}`);
        }
        
    }


}
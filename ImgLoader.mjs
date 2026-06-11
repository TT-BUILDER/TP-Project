export class Images {
    
    //Debug Done
    constructor(){
        this.imgList = {};    //Mapオブジェクトを作成。Pythonでいう辞書
        this.imgSrcList = {};

    }

    /**
     * 
     * @param {String} Name 画像につけるキー
     * @param {String} ImgPass 画像への相対パス
     */
    //Debug Done
    AddImg(Name,ImgPass){
        const img = new Image();
        img.onload = () => {
            console.log("Success : "+ImgPass+' as "'+Name+'"');
        };
        img.onerror = () => {
            console.error("Unsuccess:", ImgPass);
        };
        img.src = ImgPass;
        img.id = Name;
        this.imgSrcList[Name] = ImgPass;
        this.imgList[Name] = img;
    }


}
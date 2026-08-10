/*
    使用しないこと









*/
import { fetchJSON } from "./FetchJSON.mjs";
export const audioCTX = new (window.AudioContext || window.webkitAudioContext)();

export class audio {
    constructor() {
        this.audioAssets = {};
        this.audioIntroAssets = {};
        this.audioAssetsInfo = {};
        this.nowBGM = null;
        this.nowBGMKey = null;
        this.introF = false;
    }

    /**
     * @param {String} name 割り当てるキー
     * @param {String} infoPath オーディオファイルの設定が書かれたファイルパス
     */
    async importAudio(name,infoPath){
        try {

            //読み込み
            const audioInfo = await fetchJSON(infoPath);

            let responce = null;
            let responceIntro = null;
            if (audioInfo.type == "BGM") {
                responce = await fetch(`./assets/sounds/BGM/${audioInfo.file}`);
                if (audioInfo.intro) {
                    responceIntro = await fetch(audioInfo.fileIntro);
                }
            } else if (audioInfo.type == "SE") {
                responce = await fetch(`./assets/sounds/SE/${audioInfo.file}`);
            }
            const arrayBuffer = await responce.arrayBuffer();

            //デコードしたデータをaudioAssetsに格納
            this.audioAssets[name] = await audioCTX.decodeAudioData(arrayBuffer);
            this.audioAssetsInfo[name] = audioInfo;

            console.log(`success to import Audio : ${name}, type : ${audioInfo.type}`);

        } catch (error) {
            console.error(`Audio import error: ${error}`);
        }
    }

    /**
     * @param {String} name キー
     * @param {Boolean} intro イントロのあるなし
     */
    setToPlayBGM(name, intro = true){
        //今再生しているキーの保存
        this.nowBGMKey = name;
        this.nowBGM = audioCTX.createBufferSource();
        if (this.audioAssetsInfo[name].intro && intro) {
            this.nowBGM.buffer = this.audioAssets[this.audioAssetsInfo[name].fileIntro];
            this.nowBGM.loop = false;
            this.introF = true;
        } else {
            this.nowBGM.buffer = this.audioAssets[this.audioAssetsInfo[name].file];
            this.nowBGM.loop = this.audioAssetsInfo[name].loop;
            this.introF = false;
        }

    }

    async playBGM(){
        if (this.nowBGM == null) {
            console.error("BGM is not ready to play. Please set BGM.");
        } else {
            try {
                //スピーカーに接続
                this.nowBGM.connect(audioCTX.destination);
                
                //なんかこうしないとwebでは鳴らないよう義務付けられているらしい
                if (audioCTX.state === 'suspended') {
                    await audioCTX.resume();
                }

                this.nowBGM.start(0);

                if (this.introF) {
                    console.log(`start intro key: ${this.nowBGMKey}`);
                    this.nowBGM.onended = () => {
                        //ボディを鳴らせ！
                        this.setToPlayBGM(this.nowBGMKey, false);
                        this.playBGM();
                    };
                } else {
                    console.log(`start bgm key: ${this.nowBGMKey}`);
                }
            } catch (error) {
                console.error(`BGM play error: ${error}`);
            }
        }
    }

}
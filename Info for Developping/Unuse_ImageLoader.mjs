export default class ImageLoader {

    // Gererated by Gemini

    constructor() {
        this._promises = [];
        this._assets = new Map();
    }

    /**
     * 単一の画像を読み込みリストに追加する（内部・外部両用）
     * @param {string} name - 取得時に使用する名前
     * @param {string} url - 画像のURLまたはパス
     */
    AddImg(name, url) {
        const img = new Image();
        
        const promise = new Promise((resolve, reject) => {
            img.addEventListener('load', () => {
                this._assets.set(name, img);
                resolve(img);
            });
            img.addEventListener('error', () => {
                reject(new Error(`画像の読み込みに失敗しました: ${url}`));
            });
            // キャッシュ対策・安全性のためにリスナー登録後にsrcを代入
            img.src = url;
        });

        this._promises.push(promise);
    }

    /**
     * 指定したフォルダ内の連番画像をまとめて読み込みリストに追加する
     * @param {string} folderPath - フォルダへのパス (例: 'assets/images' や './enemy')
     * @param {string} folderName - フォルダの名前。登録名（フォルダ名-番号）のベースになる
     * @param {number} count - フォルダ内にある画像の枚数
     * @param {string} [ext='png'] - 画像の拡張子（デフォルトは 'png'）
     */
    GetFolderImg(folderPath, folderName, count, ext = 'png') {
        // パスの末尾にスラッシュがない場合は自動で補完
        const basePath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;

        for (let i = 0; i < count; i++) {
            // 要件通りの登録名を作成 (例: "player-0", "player-1")
            const name = `${folderName}-${i}`;
            // フォルダ内の連番ファイルへのパス (例: "assets/images/player/0.png")
            const url = `${basePath}${i}.${ext}`;

            this.AddImg(name, url);
        }
    }

    /**
     * 登録されたすべての画像の読み込みを実行し、完了を待つ
     * @returns {Promise<Map>}
     */
    LoadAll() {
        return Promise.all(this._promises).then(() => this._assets);
    }

    /**
     * 名前を指定して読み込み済みの画像を取得する
     * @param {string} name - 登録した名前
     * @returns {HTMLImageElement|undefined}
     */
    GetImg(name) {
        return this._assets.get(name);
    }
}


/*
// 1. 画像の登録（単一ファイル）
loader.AddImg('background', './images/bg.jpg');

//example.comは存在しないリンク
loader.AddImg('logo', 'https://example.com/logo.png'); // 外部URLもOK

// 2. フォルダ内画像の登録（連番ファイル）
// 例として './assets/hero/' フォルダの中に 「0.png」「1.png」「2.png」の3枚がある場合
loader.GetFolderImg('./assets/hero', 'player', 3, 'png');


// 3. 一括読み込みの開始
loader.LoadAll()
    .then(() => {
        console.log('All success');
        
        // 4. GetImg メソッドで取り出し
        const bgImg = loader.GetImg('background');
        const player0 = loader.GetImg('player-0');
        const player1 = loader.GetImg('player-1');
        const player2 = loader.GetImg('player-2');

        // 画面に表示するテスト
        document.body.appendChild(player0);
    })
    .catch((error) => {
        console.error('Eroor :', error);
    });

*/

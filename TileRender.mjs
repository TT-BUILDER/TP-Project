//import { MapJSONs } from "./EngineMain.mjs";
export let TILESIZE = 32;
export let showTILESIZE = 32;

export class TileRender {

	/**
	 * @param {Contxt} canvas キャンバスのエレメント
	 * @param {Contxt} canvasContext キャンバスのコンテキストデータ
	 * @param {Number} TILESIZE 1タイル当たりのピクセル数
	 */
	constructor(canvas,canvasContext,ts = 32){
		this.tileImg;
		this.T_width;
		this.T_height;
		TILESIZE = ts;
		this.mapData = [];
		this.NowCanvas = canvas;
		this.NowCTX = canvasContext;
		this.NowMap;
		this.NowCollision;
		this.MapWidth;
		this.MapHeight;
	}
	/**
	 * @param {Contxt} canvas キャンバスのエレメント
	 * @param {Contxt} canvasContext キャンバスのコンテキストデータ
	 */
	ctxUpdate(canvas,canvasContext){
		this.NowCanvas = canvas;
		this.NowCTX = canvasContext;
	}

	/**
	 * @param {Array} Map マップデータ
	 * @param {Array} ColMap コリジョンデータ
	 */
	setMapData(Map,ColMap){
		this.NowMap = Map;
		this.NowCollision = ColMap;

		this.MapWidth = this.NowMap[0].length;
		this.MapHeight = this.NowMap.length;

		console.log(`MapSize is ${[this.MapWidth,this.MapHeight]}`);
	}

	/**
	 * @param {Number} constV1 セットするコンスト値（TILESIZE）
	 * @param {Number} constV2 セットするコンスト値（showTILESIZE）
	 */
	TILESIZEUpdate(constV1,constV2 = constV1){
		TILESIZE = constV1;
		showTILESIZE = constV2;
	}
	
	/**
	 * @param {String} Img 画像へのパス
	 * @param {Number} width タイルデータの幅
	 * @param {Number} height タイルデータの高さ
	 * @param {Number} size タイル一枚のサイズ
	 */
	loadImg(ImgPass,width,height,size = TILESIZE) {
        
		const img = new Image();
        img.onload = () => {
            console.log("loadImg Success : "+ImgPass);
        };
        img.onerror = () => {
            console.error("loadImg Unsuccess:", ImgPass);
        };
        img.src = ImgPass;

		this.tileImg = img;
		this.T_width = width;
		this.T_height = height;
		TILESIZE = size;
	}
	/**
	 * 
	 */
	newLoadImg(img) {
		this.tileImg = img;
		this.T_width = img.width/showTILESIZE;
		this.T_height = img.height/showTILESIZE;
	}
	/**
	 * @param {String} MapPass マップデータへのパス
	 */
	async loadMap(MapPass){
		try {

			const Text = await fetch(MapPass);
			
			if (!Text.ok) {
				throw new Error(`An Error! : ${Text.status}`);
			}

			const MapText = await Text.text();
			
			const map2DArray = MapText
    		.trim()                  // 全体の前後の余計な空白・改行を削除
    		.split(/\r?\n/)          // 行ごとに分割（Windowsの改行コードにも対応）
    		.map(row => {
    		    return row
    		    .split(',')          // カンマで分割
    		    .map(item => item.trim()) // 各数字の周りの空白を削除
    		    .filter(item => item !== '') // 行末のカンマによる「空の要素」を除外
    		    .map(Number);        // 文字列から「数値（Number）」に変換
    			});
			return map2DArray;
		} catch (error) {
			console.error("An Error!",error);
			return 0
		}

	}

	/**
	 * @param {JSON} jsons そのマップのJSONファイル
	 * @param {String} MapPass マップデータへのパス
	 */
	async newLoadMap(jsons,MapPass){
		try {

			const response = await fetch(MapPass);
			
			if (!response.ok) {
				throw new Error(`An Error! : ${response.status}`);
			}

			const mapText = await response.text();
			
			// 1. カンマや改行、スペースで分割し、すべて数値の「1次元配列」にする
			const mapData = mapText
				.trim()
				.split(/[\s,]+/)             // カンマや改行、スペースで分割
				.filter(item => item !== '') // 空の要素を除外
				.map(Number);                // 数値に変換

			// 2. すでに読み込み済みの変数（M_Width, M_Height）を使用
			// ※もしクラスのプロパティなら this.M_Width などに適宜書き換えてください
			const width = jsons["MapSize"][0];
			const height = jsons["MapSize"][1];

			// 3. 指定された「幅」ごとにデータを切り分けて、2次元配列を構築
			const map2DArray = [];
			for (let i = 0; i < height; i++) {
				const start = i * width;
				const end = start + width;
				const row = mapData.slice(start, end);
				map2DArray.push(row);
			}

			return map2DArray;
		} catch (error) {
			console.error("An Error!", error);
			return 0;
		}

	}

	/**
	 * @param {Number} CamX カメラ座標X
	 * @param {Number} CamY カメラ座標Y
	 */
	RenderMap(CamX,CamY,ShowCollision = false) {
		const ca = this.NowCanvas;
		const ctx = this.NowCTX;
		const img = this.tileImg;
		const size = TILESIZE;
		const showSize = showTILESIZE;
		const cx = CamX;
		const cy = CamY;
		const Map = this.NowMap;
		const ColMap = this.NowCollision;

		for (let iy = 0; iy < Map.length; iy++) {
			const MapRow = Map[iy];
			const ColMapRow = ColMap[iy];
			//console.log(MapRow);
			for (let ix = 0; ix < MapRow.length; ix++) {
				let NowTile = MapRow[ix];
				let NowCol = ColMapRow[ix];
				//console.log(NowTile);
				ctx.drawImage(
					img,
					(NowTile % this.T_width)*showSize,
					(Math.floor(NowTile / this.T_width))*showSize,
					showSize,
					showSize,
					cx+(ix*size),
					cy+(iy*size),
					size,
					size);
				if (NowCol >0 && ShowCollision) {
					ctx.fillStyle = "rgb(255 0 0 / 25%)";
					ctx.fillRect(
					cx+(ix*size),
					cy+(iy*size),
					size,
					size
					);
				}

			}
			
		}
	}

}
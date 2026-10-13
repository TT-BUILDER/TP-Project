
export const worldSeed = 999;
// プレイヤーの訪問履歴を保存するマップ（※無限に広がるため、遠くの古い履歴は適宜間引くロジックを入れると安全です）
export const visitedCells = new Map();

const visitedCellsTime = new Map();

//ただの#define
const DIR_UP = 8;
const DIR_DOWN = 4;
const DIR_LEFT = 2;
const DIR_RIGHT = 1;

//1024回訪れたら一応もとには戻る
const MAX_VISITED = 1024;

function getPseudoRandom(x, y, seed, distortion = 0) {
    // distortion（歪み度）をハッシュに混ぜることで、時間の経過や移動によって世界が変化する
    let h = seed + x * 374761393 + y * 668265263 + distortion * 1481085;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

/**
 * バックルーム風のセルパターンを生成する
 * @param {number} gx グローバルX座標
 * @param {number} gy グローバルY座標
 * @param {number} seed ワールドシード
 * @param {Map} visitedCells プレイヤーが過去に通過したセルの記録 (key: "x,y", value: 歪みLv)
 */
export function getBackroomsCellPattern(gx, gy, seed, visitedCells) {
    const key = `${gx},${gy}`;
    
    // プレイヤーがすでに一度その場所を踏んでいる場合、空間が「歪む（戻れなくなる）」
    let cellDistortion = 0;
    if (visitedCells.has(key)) {
        cellDistortion = visitedCells.get(key);
    }

    // 基本の通路確率（バックルームらしく、少し閉塞感を持たせるため確率を低めに）
    const threshold = 0.55; 

    // 非対称性を生むため、隣接セルとの強制的な同期（対称性）をあえて緩める、
    // または通過済みの場所は壁を増やす（閉ざされる演出）
    let rightOpen = getPseudoRandom(gx, gy, seed, 0) > threshold;
    let downOpen  = getPseudoRandom(gx, gy, seed + 1000, 0) > threshold;
    let leftOpen  = getPseudoRandom(gx - 1, gy, seed, 0) > threshold;
    let upOpen    = getPseudoRandom(gx, gy - 1, seed + 1000, 0) > threshold;

    // もし一度プレイヤーが通過した場所であれば、後ろの通路が塞がる（あるいは異世界化する）演出
    if (cellDistortion > 0) {
        // 例：一度通った場所は、戻る方向の通路が確率で消失する
        if (cellDistortion >= 1) {
            // 通路が壁に変わるなどの非ユークリッド的変化
            rightOpen = false;
            downOpen = false;
        }
    }

    let pattern = 0;
    if (upOpen)    pattern |= DIR_UP;
    if (downOpen)  pattern |= DIR_DOWN;
    if (leftOpen)  pattern |= DIR_LEFT;
    if (rightOpen) pattern |= DIR_RIGHT;

    return pattern;
}

/**
 * プレイヤーがセルに足を踏み入れたときの処理（状態更新）
 */
export function onPlayerStepOnCell(gx, gy, visitedCells) {
    const key = `${gx},${gy}`;
    const currentDistortion = visitedCells.get(key) || 0;
    const currentVisitedTime = visitedCellsTime.get(key) || 0;
    
    if (currentVisitedTime >= MAX_VISITED){
        visitedCells.delete(key);
        visitedCellsTime.delete(key);
    } else {
        // 踏むたびに歪みレベルが上がっていく
        visitedCells.set(key, currentDistortion + 1);
        visitedCellsTime.set(key, currentVisitedTime + 1);
    }
}


/*
// --- 使用例 ---

// 1. プレイヤーが最初に座標 (5, 5) に入ったとする
onPlayerStepOnCell(5, 5, visitedCells);

// 2. そのセルのパターンを取得（1回目の訪問時）
const patternFirst = getBackroomsCellPattern(5, 5, worldSeed, visitedCells);
console.log("1回目のパターン:", patternFirst);

// 3. 一度別の場所へ行き、再び同じ座標 (5, 5) に戻ってきたとする
// （ハッシュに歪みが加算されるため、先ほどとは繋がりの違う、あるいは出口が塞がった別の部屋に変貌する）
const patternSecond = getBackroomsCellPattern(5, 5, worldSeed, visitedCells);
console.log("2回目に訪れたときのパターン（空間が変異）:", patternSecond);

*/
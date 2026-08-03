export async function fetchJSON(filePass) {
    // data.jsonを読み込む場合
    /*
    fetch('data.json')
    .then(response => response.json())
    .then(data => {
        console.log(data); // ここでJSONデータを使えます
    })
    .catch(error => console.error('エラー:', error));
    */
    try {
        const res = await fetch(filePass);

        const data = await res.json();

        console.log(`success to import JSON : ${filePass}`);
        console.log(data);
        return data;
    } catch (error) {
        console.error(`JSON import error:${error}`);
        return 0;
    }
}
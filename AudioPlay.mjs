/*
    VS code's AI code. It's very good!
    wrote in 2026/08/03
*/

export class audio {
    constructor() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCTX = AudioContextClass ? new AudioContextClass() : null;

        this.audioList = {};
        this.audioSrcList = {};
        this.audioInfoList = {};
        this.playingList = [];
        this.nextAudioId = 0;
        this.nowBGMKey = null;
        this._resumeWaitPromise = null;
    }

    /**
     * 音声ファイルをロードしてキー付きで保持する
     * ImgLoader.mjs の imgList / imgSrcList と同じ考え方で管理する
     * @param {String} name キー名
     * @param {String} audioPath 音声ファイルのURL
     * @returns {AudioBuffer}
     */
    async AddAudio(name, audioPath) {
        if (!this.audioCTX) {
            throw new Error("この環境では Web Audio API が使えません。");
        }

        try {
            const response = await fetch(audioPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch audio: ${audioPath}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioCTX.decodeAudioData(arrayBuffer.slice(0));

            this.audioSrcList[name] = audioPath;
            this.audioList[name] = audioBuffer;

            console.log(`Success : ${audioPath} as "${name}"`);
            return audioBuffer;
        } catch (error) {
            console.error(`Audio load failed: ${name}, ${audioPath}`);
            console.error(error);
            return null;
        }
    }

    /**
     * AddAudio の別名。既存の importAudio 風の呼び出しにも対応する
     * @param {String} name キー名
     * @param {String} audioPath 音声ファイルのURL
     * @returns {AudioBuffer}
     */
    async importAudio(name, audioPath) {
        return this.AddAudio(name, audioPath);
    }

    /**
     * JSON のメタデータを読み込んで、intro の有無を判定しながら音声を登録する
     * 例: map1_battle_info.json
     * {
     *   "intro": true,
     *   "loop": true,
     *   "type": "BGM",
     *   "file": "map1_battle.wav",
     *   "fileIntro": "map1_battle_intro.wav"
     * }
     *
     * @param {String} name キー名
     * @param {String} infoPath JSONファイルのURL
     * @param {String} basePath 音声ファイルのベースパス（例: "./assets/sounds/BGM/"）
     * @returns {Object|null} メタデータ
     */
    async AddAudioFromInfo(name, infoPath, basePath = "") {
        try {
            const response = await fetch(infoPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch info: ${infoPath}`);
            }

            const info = await response.json();
            this.audioInfoList[name] = info;

            if (info.file) {
                const mainPath = `${basePath}${info.file}`;
                await this.AddAudio(name, mainPath, info);
            }

            if (info.intro && info.fileIntro) {
                const introKey = `${name}_intro`;
                const introPath = `${basePath}${info.fileIntro}`;
                const introInfo = {
                    ...info,
                    _intro: true,
                };
                await this.AddAudio(introKey, introPath, introInfo);
                this.audioInfoList[introKey] = introInfo;
            }

            return info;
        } catch (error) {
            console.error(`Audio info load failed: ${name}, ${infoPath}`);
            console.error(error);
            return null;
        }
    }

    /**
     * キーから音声データを取得
     * @param {String} name キー名
     * @returns {AudioBuffer|null}
     */
    GetAudio(name) {
        return this.audioList[name] ?? null;
    }

    /**
     * JSON 読み込み済みのメタ情報を取得する
     * @param {String} name キー名
     * @returns {Object|null}
     */
    GetAudioInfo(name) {
        return this.audioInfoList[name] ?? null;
    }

    /**
     * ユーザー入力を待ってから AudioContext を resume する
     * ブラウザはユーザー操作がないと AudioContext の再開ができないため
     */
    async _waitForUserInputToResume() {
        if (!this.audioCTX) {
            throw new Error("AudioContext が作成されていません。");
        }

        if (this.audioCTX.state !== "suspended") {
            return;
        }

        if (this._resumeWaitPromise) {
            await this._resumeWaitPromise;
            return;
        }

        this._resumeWaitPromise = new Promise((resolve) => {
            const events = ["pointerdown", "pointerup", "keydown", "mousedown", "touchstart", "click"]; 
            const onUserInput = async () => {
                for (const eventName of events) {
                    window.removeEventListener(eventName, onUserInput);
                }

                if (this.audioCTX.state === "suspended") {
                    await this.audioCTX.resume();
                }
                resolve();
            };

            for (const eventName of events) {
                window.addEventListener(eventName, onUserInput, { passive: true, once: true });
            }
        });

        await this._resumeWaitPromise;
    }

    /**
     * AudioContext を再開して、ユーザー操作後にも再生できるようにする
     */
    async _ensureAudioContext() {
        if (!this.audioCTX) {
            throw new Error("AudioContext が作成されていません。");
        }

        if (this.audioCTX.state === "suspended") {
            await this._waitForUserInputToResume();
        }
    }

    /**
     * 指定キーの音声を再生する
     * @param {String} name キー名
     * @param {Object} options 再生設定
     * @param {Number} [options.volume=1] 音量 (0.0 ～ 1.0)
     * @param {Number} [options.pan=0] パン (-1.0 ～ 1.0)
     * @param {Boolean} [options.loop=false] ループ再生
     * @param {Number} [options.offset=0] 再生開始位置（秒）
     * @param {Number} [options.duration] 再生時間（秒）
     * @returns {Object|null} 再生ハンドル
     */
    async play(name, options = {}) {
        const info = this.GetAudioInfo(name);
        const useIntro = options.useIntro ?? (info?.intro ?? false);

        if (useIntro && info?.intro && info.fileIntro) {
            const introKey = `${name}_intro`;
            const introInfo = this.GetAudioInfo(introKey);

            if (introInfo && this.GetAudio(introKey)) {
                const introOptions = {
                    ...options,
                    useIntro: false,
                    loop: false,
                };

                const introHandle = await this._playBuffer(introKey, introOptions);
                if (!introHandle) {
                    return null;
                }

                introHandle.source.onended = () => {
                    this.playingList = this.playingList.filter((item) => item.id !== introHandle.id);

                    const mainOptions = {
                        ...options,
                        useIntro: false,
                        loop: info.loop ?? options.loop ?? false,
                    };

                    this.play(name, mainOptions).catch((error) => {
                        console.error(`Intro-to-main transition failed: ${name}`);
                        console.error(error);
                    });
                };

                return introHandle;
            }
        }

        return this._playBuffer(name, options);
    }

    /**
     * 実際の AudioBuffer を再生する
     * @param {String} name キー名
     * @param {Object} options
     * @returns {Object|null}
     */
    async _playBuffer(name, options = {}) {
        const audioBuffer = this.GetAudio(name);
        if (!audioBuffer) {
            console.error(`Audio not found: ${name}`);
            return null;
        }

        await this._ensureAudioContext();

        const source = this.audioCTX.createBufferSource();
        const gainNode = this.audioCTX.createGain();
        const pannerNode = this.audioCTX.createStereoPanner();

        source.buffer = audioBuffer;
        source.loop = options.loop ?? false;

        const volume = Math.min(1, Math.max(0, options.volume ?? 1));
        const pan = Math.min(1, Math.max(-1, options.pan ?? 0));

        gainNode.gain.value = volume;
        pannerNode.pan.value = pan;

        source.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(this.audioCTX.destination);

        const id = ++this.nextAudioId;
        const playback = {
            id,
            name,
            source,
            gainNode,
            pannerNode,
            volume,
            pan,
            loop: source.loop,
        };

        this.playingList.push(playback);

        try {
            source.start(0, options.offset ?? 0, options.duration);
        } catch (error) {
            console.error(`Audio play error: ${name}`);
            console.error(error);
            this.stop(playback.id);
            return null;
        }

        source.onended = () => {
            this.playingList = this.playingList.filter((item) => item.id !== id);
        };

        return playback;
    }

    /**
     * 指定した音声の再生を停止する
     * @param {String|Number|Object|null} target キー名 / 再生ID / 再生ハンドル / 未指定で全停止
     */
    stop(target = null) {
        if (target === null) {
            for (const playback of [...this.playingList]) {
                this.stop(playback.id);
            }
            return;
        }

        const targetList = this.playingList.filter((playback) => {
            if (typeof target === "string") {
                return playback.name === target;
            }
            if (typeof target === "number") {
                return playback.id === target;
            }
            if (target && typeof target === "object") {
                return playback.id === target.id;
            }
            return false;
        });

        for (const playback of targetList) {
            try {
                playback.source.stop();
            } catch (error) {
                // 既に終了している場合は失敗しても問題ない
            }
            this.playingList = this.playingList.filter((item) => item.id !== playback.id);
        }
    }

    /**
     * 再生中の音声をすべて停止
     */
    stopAll() {
        this.stop();
    }

    /**
     * 指定した再生ハンドル、もしくはキーに紐づく再生中の音量を変更する
     * @param {String|Number|Object} target キー名 / 再生ID / ハンドル
     * @param {Number} volume 音量 (0.0 ～ 1.0)
     */
    setVolume(target, volume) {
        const normalized = Math.min(1, Math.max(0, volume));
        const targetList = this._getPlaybackTargets(target);

        for (const playback of targetList) {
            playback.volume = normalized;
            playback.gainNode.gain.value = normalized;
        }
    }

    /**
     * 指定した再生ハンドル、もしくはキーに紐づく再生中のパンを変更する
     * @param {String|Number|Object} target キー名 / 再生ID / ハンドル
     * @param {Number} pan パン (-1.0 ～ 1.0)
     */
    setPan(target, pan) {
        const normalized = Math.min(1, Math.max(-1, pan));
        const targetList = this._getPlaybackTargets(target);

        for (const playback of targetList) {
            playback.pan = normalized;
            playback.pannerNode.pan.value = normalized;
        }
    }

    /**
     * ループ再生の切り替え
     * @param {String|Number|Object} target キー名 / 再生ID / ハンドル
     * @param {Boolean} isLoop
     */
    setLoop(target, isLoop) {
        const targetList = this._getPlaybackTargets(target);
        for (const playback of targetList) {
            playback.loop = isLoop;
            playback.source.loop = isLoop;
        }
    }

    /**
     * 再生中音声の一覧を取得
     * @returns {Array<Object>}
     */
    getPlayingList() {
        return [...this.playingList];
    }

    _getPlaybackTargets(target) {
        if (target === null || target === undefined) {
            return [...this.playingList];
        }

        return this.playingList.filter((playback) => {
            if (typeof target === "string") {
                return playback.name === target;
            }
            if (typeof target === "number") {
                return playback.id === target;
            }
            if (target && typeof target === "object") {
                return playback.id === target.id;
            }
            return false;
        });
    }
}

/*
使用例:

const BGM = new audio();
await BGM.AddAudio("Map1", "./assets/sounds/BGM/map1_battle.mp3");

const bgmHandle = await BGM.play("Map1", {
    volume: 0.6,
    pan: 0.2,
    loop: true,
});

BGM.setVolume(bgmHandle, 0.8);
BGM.setPan(bgmHandle, -0.7);
BGM.stop(bgmHandle);
*/

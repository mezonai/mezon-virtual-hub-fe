import { _decorator, AudioClip, AudioSource, CCFloat, Component, Enum, Node, sys } from 'cc';
import { EVENT_NAME } from '../network/APIConstant';

const { ccclass, property } = _decorator;

export enum AudioType {
    SlotMachine = 0,
    ReceiveReward = 1,
    NoReward = 2,
    Button = 3,
    Notice = 4,
    CountDown = 5,
    Lose = 6,
    Toggle = 7
}

export enum BGMType {
    Game = 0,
    Combat = 1,
}

@ccclass('BGMSound')
export class BGMSound {
    @property({ type: Enum(BGMType) })
    bgmType: BGMType = BGMType.Game;

    @property({ type: [AudioClip] })
    audioClips: AudioClip[] = [];
}

@ccclass('SoundManager')
export class SoundManager extends Component {
    private static _instance: SoundManager = null;
    public static get instance(): SoundManager {
        return this._instance;
    }

    @property({ type: [AudioClip] }) audioClips: AudioClip[] = [];
    @property({ type: AudioSource }) bgmSource: AudioSource = null;

    @property({ type: CCFloat }) originBgmVolume: number = 0.5;
    @property({ type: CCFloat }) originSfxVolume: number = 0.5;

    @property({ type: [BGMSound] }) bgmSound: BGMSound[] = [];

    @property({ type: [AudioSource] }) sfxSources: AudioSource[] = [];
    private sfxIndex: number = 0;

    public currentSoundVolume = 0.5;
    private currentMusicVolume = 0.5;
    private readonly SOUND_VOLUME = "sound_volume";
    private readonly MUSIC_VOLUME = "music_volume";

    // BGM Loop State
    private currentBgmType: BGMType = null;
    private currentBgmList: AudioClip[] = [];
    private isBgmLooping: boolean = false;

    onLoad() {
        if (SoundManager._instance == null) {
            SoundManager._instance = this;
        }

        this.currentSoundVolume = this.getSoundVolume();
        this.currentMusicVolume = this.getMusicVolume();

        this.updateVolume();
        this.playBgm(BGMType.Game); // auto start game music
    }

    update() {
        // Kiểm tra nếu nhạc đã kết thúc, tự play bài khác
        if (this.isBgmLooping && !this.bgmSource.playing && this.bgmSource.clip) {
            this.playNextBgm();
        }
    }

    protected onDestroy(): void {
        SoundManager._instance = null;
    }

    private updateVolume() {
        this.bgmSource.volume = this.currentMusicVolume;
        for (let source of this.sfxSources) {
            source.volume = this.currentSoundVolume;
        }
    }

    public playSound(audioType: AudioType, holdForSecond: number = -1) {
        let clip: AudioClip = this.audioClips[audioType];
        if (!clip || this.sfxSources.length === 0) return;
        const volume = this.currentSoundVolume;
        const source = this.sfxSources[this.sfxIndex];
        source.volume = volume;
        if (!source || !clip) return;

        if (holdForSecond > 0) {
            source.clip = clip;
            source.loop = true;
            source.play();

            setTimeout(() => {
                if (source) {
                    source.stop();
                }
            }, holdForSecond * 1000);
        } else {
            source.loop = false;
            source.playOneShot(clip);
        }
        this.sfxIndex = (this.sfxIndex + 1) % this.sfxSources.length;
    }

    public stopSound(audioType: AudioType) {
        let clip: AudioClip = this.audioClips[audioType];
        for (const source of this.sfxSources) {
            if (source.clip?.name === clip?.name) {
                source.stop();
                break;
            }
        }
    }

    public playBgm(type: BGMType) {
        const bgmEntry = this.bgmSound.find(entry => entry.bgmType === type);

        if (!bgmEntry || bgmEntry.audioClips.length === 0) return;

        this.currentBgmType = type;
        this.currentBgmList = bgmEntry.audioClips;
        this.isBgmLooping = true;

        this.playNextBgm();
    }

    private playNextBgm() {
        if (!this.isBgmLooping || this.currentBgmList.length === 0) return;

        const randomIndex = Math.floor(Math.random() * this.currentBgmList.length);
        const selectedClip = this.currentBgmList[randomIndex];
        this.playClip(selectedClip);
    }

    private playClip(clip: AudioClip) {
        if (!clip) return;

        this.bgmSource.stop();
        this.bgmSource.clip = clip;
        this.bgmSource.loop = false;
        this.bgmSource.volume = this.currentMusicVolume;
        this.bgmSource.play();
    }


    public stopBgmLoop() {
        this.isBgmLooping = false;
        this.bgmSource.stop();
    }

    public setBgmVolume(volume: number) {
        this.currentMusicVolume = volume;
        this.bgmSource.volume = volume;
        sys.localStorage.setItem(this.MUSIC_VOLUME, volume.toString());
    }

    public setSfxVolume(volume: number) {
        this.currentSoundVolume = volume;
        this.updateVolume();
        sys.localStorage.setItem(this.SOUND_VOLUME, volume.toString());
        this.node.emit(EVENT_NAME.ON_SFX_VOLUMN_CHANGE, volume);
    }

    public getSoundVolume(): number {
        const saved = sys.localStorage.getItem(this.SOUND_VOLUME);
        return saved ? parseFloat(saved) : this.originSfxVolume;
    }

    public getMusicVolume(): number {
        const saved = sys.localStorage.getItem(this.MUSIC_VOLUME);
        return saved ? parseFloat(saved) : this.originBgmVolume;
    }
}

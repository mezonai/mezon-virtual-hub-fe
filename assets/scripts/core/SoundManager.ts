import { _decorator, AudioClip, AudioSource, CCFloat, Component, Node, randomRangeInt } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager extends Component {
    private static _instance: SoundManager = null;
    public static get instance(): SoundManager {
        return this._instance
    }

    public assetDictionary: { [key: string]: AudioClip } = {};
    @property({ type: AudioSource }) bgmSource: AudioSource = null;
    @property({ type: AudioSource }) soundSource: AudioSource = null;

    @property({ type: Node }) sfxSoundSourceParent: Node = null;

    private sfxSources: AudioSource[] = [];
    @property({ type: [AudioClip] }) bulletClips: AudioClip[] = [];

    @property({ type: CCFloat }) originBgmVolume: number = 0.3;
    @property({ type: CCFloat }) originSfxVolume: number = 0.3;
    private isSoundEnable: boolean = false;


    private bgmVolume: number = 0.3;
    private sfxVolume: number = 0.3;

    onLoad() {
        if (SoundManager._instance == null) {
            SoundManager._instance = this;
        }
    }

    protected onEnable(): void {
        this.sfxSources = this.sfxSoundSourceParent.getComponents(AudioSource);
        // GameManager.instance.settingManager.node.on("toggle_sound", (value) => this.onToggleSound(value), this);
        // GameManager.instance.settingManager.node.on("toggle_music", (value) => this.onToggleMusic(value), this);
    }

    private onToggleSound(value) {
        this.isSoundEnable = value == 1;
        this.sfxVolume = value == 1 ? this.originSfxVolume : 0;
        this.soundSource.volume = this.sfxVolume;
    }

    private onToggleMusic(value) {
        this.bgmVolume = value == 1 ? this.originBgmVolume : 0;
        this.bgmSource.volume = this.bgmVolume;
        this.playNormalBGM();
    }

    protected onDestroy(): void {
        SoundManager._instance = null;
    }

    public playBulletSound() {
        this.playSfx(this.bulletClips[randomRangeInt(0, this.bulletClips.length)]);
    }

    public playSound(clipName) {
        if (this.assetDictionary[clipName] == null)
            return;

        this.playSfx(this.assetDictionary[clipName]);
    }

    public setAudioClip(assetDictionary) {
        this.assetDictionary = assetDictionary;
        this.playNormalBGM();
    }

    public playNormalBGM() {
        this.bgmSource.clip = this.assetDictionary["bgm_1"];
        if (this.isSoundEnable && this.bgmSource.clip != null) {
            this.bgmSource.stop();
            this.bgmSource.play();
        }
    }

    private getSfxSourceFree() {
        for (const source of this.sfxSources) {
            if (!source.playing)
                return source;
        }

        return null;
    }

    public playSfx(clip: AudioClip) {
        this.getSfxSourceFree()?.playOneShot(clip, this.sfxVolume);
    }
}



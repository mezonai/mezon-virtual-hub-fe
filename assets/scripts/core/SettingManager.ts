import { _decorator, Button, Component, Label, sp, sys, Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SettingManager')
export class SettingManager extends Component {
    @property({ type: Toggle }) musicToggle: Toggle = null;
    @property({ type: Toggle }) soundToggle: Toggle = null;
    @property({ type: sp.Skeleton }) avatar: sp.Skeleton = null;
    @property({ type: Label }) skinName: Label = null;
    private gameManager = null;

    public init(gameManager) {
        this.gameManager = gameManager;

        this.soundToggle.isChecked = this.getSoundVolume() == 1;
        this.soundToggle.node.on('toggle', this.onSoundToggleChanged, this);
        this.node.emit("toggle_sound", this.getSoundVolume());

        this.musicToggle.isChecked = this.getMusicVolumn() == 1;
        this.musicToggle.node.on('toggle', this.onMusicToggleChanged, this);
        this.node.emit("toggle_music", this.getMusicVolumn());
    }

    protected onEnable(): void {
        //this.setSkin(this.gameManager.shopManager.skinManager.getSkinByRank());
    }
    
    private onSoundToggleChanged(toggle: Toggle) {
        sys.localStorage.setItem('sound_volume', toggle.isChecked ? "1" : "0");
        this.node.emit("toggle_sound", this.getSoundVolume());
    }

    private onMusicToggleChanged(toggle: Toggle) {
        sys.localStorage.setItem('music_volume', toggle.isChecked ? "1" : "0");
        this.node.emit("toggle_music", this.getMusicVolumn());
    }

    public getSoundVolume() {
        return parseInt(sys.localStorage.getItem('sound_volume') || '1');
    }

    public getMusicVolumn() {
        return parseInt(sys.localStorage.getItem('music_volume') || '1');
    }
}

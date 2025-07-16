import { _decorator, Component, Slider, Label, Button, SpriteFrame, Sprite, Node } from 'cc';
import { SoundManager } from './SoundManager';
import { CustomSlider } from '../ui/CustomSlider';
import { BasePopup } from '../PopUp/BasePopup';
import { PopupManager } from '../PopUp/PopupManager';
import { UIHelp } from '../ui/UIHelp';
import { UIAbout } from '../ui/UIAbout';

const { ccclass, property } = _decorator;

@ccclass('SettingManager')
export class SettingManager extends BasePopup {
    @property(Slider)
    soundSlider: Slider = null;

    @property(Label)
    soundVolumeLabel: Label = null;

    @property(Slider)
    musicSlider: Slider = null;

    @property(Label)
    musicVolumeLabel: Label = null;

    @property(Button)
    musicButton: Button = null;

    @property(Button)
    soundButton: Button = null;

    @property({ type: [SpriteFrame] }) iconValue: SpriteFrame[] = []; // 0:sound on 1:sound off 2:music on 3:music off
    @property({ type: [Sprite] }) iconBtnSprite: Sprite[] = []; // 0: sound 1: music

    private isMutedSound = false;
    private isMutedMusic = false;

    private savedSoundVolume = 0.5;
    private savedMusicVolume = 0.5;

    private currentSoundVolume = 0.5;
    private currentMusicVolume = 0.5;

    @property(CustomSlider)
    soundCustomSlider: CustomSlider = null;

    @property(CustomSlider)
    musicCustomSlider: CustomSlider = null;

    private settingsoundmusic: Record<string, SpriteFrame>;

    @property(Button) helpButton: Button = null;
    @property(Button) aboutButton: Button = null;
    @property(Button) closeButton: Button = null;

    onLoad() {
        this.settingsoundmusic = {
            soundOn: this.iconValue[0],
            soundOff: this.iconValue[1],
            musicOn: this.iconValue[2],
            musicOff: this.iconValue[3],
        };
        this.init();
    }

    public init() {
        this.currentSoundVolume = SoundManager.instance.getSoundVolume();
        this.currentMusicVolume = SoundManager.instance.getMusicVolume();

        this.isMutedSound = this.currentSoundVolume === 0;
        this.isMutedMusic = this.currentMusicVolume === 0;

        this.savedSoundVolume = this.isMutedSound ? 0.5 : this.currentSoundVolume;
        this.savedMusicVolume = this.isMutedMusic ? 0.5 : this.currentMusicVolume;

        this.soundSlider.progress = this.currentSoundVolume;
        this.musicSlider.progress = this.currentMusicVolume;

        this.updateVolumeLabel(this.soundVolumeLabel, this.currentSoundVolume);
        this.updateVolumeLabel(this.musicVolumeLabel, this.currentMusicVolume);

        this.soundSlider.node.on('slide', this.onSoundSliderChanged, this);
        this.musicSlider.node.on('slide', this.onMusicSliderChanged, this);

        this.soundButton.node.on('click', this.onSoundButtonToggle, this);
        this.musicButton.node.on('click', this.onMusicButtonToggle, this);

        this.helpButton.node.on('click', this.onShowHelp, this);
        this.aboutButton.node.on('click', this.onShowAbout, this);
        this.closeButton.node.on('click', this.onClosePopup, this);

        this.updateSoundButtonIcon();
        this.updateMusicButtonIcon();
    }

    private onClosePopup(){
        PopupManager.getInstance().closePopup(this.node.uuid);
    }

    private onShowHelp(){
        PopupManager.getInstance().openPopup('UI_Help', UIHelp);
    }

    private onShowAbout(){
        PopupManager.getInstance().openPopup('UI_AboutUs', UIAbout);
    }

    private onSoundSliderChanged(slider: Slider) {
        this.currentSoundVolume = slider.progress;
        this.isMutedSound = this.currentSoundVolume === 0;

        if (!this.isMutedSound) {
            this.savedSoundVolume = this.currentSoundVolume;
        }

        SoundManager.instance.setSfxVolume(this.currentSoundVolume);
        this.updateVolumeLabel(this.soundVolumeLabel, this.currentSoundVolume);
        this.updateSoundButtonIcon();
    }

    private onMusicSliderChanged(slider: Slider) {
        this.currentMusicVolume = slider.progress;
        this.isMutedMusic = this.currentMusicVolume === 0;

        if (!this.isMutedMusic) {
            this.savedMusicVolume = this.currentMusicVolume;
        }

        SoundManager.instance.setBgmVolume(this.currentMusicVolume);
        this.updateVolumeLabel(this.musicVolumeLabel, this.currentMusicVolume);
        this.updateMusicButtonIcon();
    }

    private onSoundButtonToggle() {
        this.isMutedSound = !this.isMutedSound;

        if (this.isMutedSound) {
            this.currentSoundVolume = 0;
        }
        this.soundSlider.progress = this.currentSoundVolume;
        this.soundCustomSlider.updateSliderHandleAndFill(this.currentSoundVolume);
        SoundManager.instance.setSfxVolume(this.currentSoundVolume);
        this.updateVolumeLabel(this.soundVolumeLabel, this.currentSoundVolume);
        this.updateSoundButtonIcon();
    }

    private onMusicButtonToggle() {
        this.isMutedMusic = !this.isMutedMusic;

        if (this.isMutedMusic) {
            this.currentMusicVolume = 0;
        } 
        this.musicSlider.progress = this.currentMusicVolume;
        this.musicCustomSlider.updateSliderHandleAndFill(this.currentMusicVolume);
        SoundManager.instance.setBgmVolume(this.currentMusicVolume);
        this.updateVolumeLabel(this.musicVolumeLabel, this.currentMusicVolume);
        this.updateMusicButtonIcon();
    }

    private updateVolumeLabel(label: Label, value: number) {
        label.string = `${Math.round(value * 100)}%`;
    }

    private updateSoundButtonIcon() {
        this.iconBtnSprite[0].spriteFrame = this.isMutedSound
            ? this.settingsoundmusic.soundOff
            : this.settingsoundmusic.soundOn;
    }

    private updateMusicButtonIcon() {
        this.iconBtnSprite[1].spriteFrame = this.isMutedMusic
            ? this.settingsoundmusic.musicOff
            : this.settingsoundmusic.musicOn;
    }
}

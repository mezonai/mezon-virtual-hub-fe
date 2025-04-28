import { _decorator, Component, Slider, Label, sys, Button, CCFloat } from 'cc';
import { SoundManager } from './SoundManager'; // Đảm bảo SoundManager được nhập khẩu

const { ccclass, property } = _decorator;

@ccclass('SettingManager')
export class SettingManager extends Component {
    @property(Slider)
    soundSlider: Slider = null;

    @property(Label)
    soundVolumeLabel: Label = null;

    @property(Slider)
    musicSlider: Slider = null;

    @property(Label)
    musicVolumeLabel: Label = null;

    @property(Button)
    updateButton: Button = null;

    private currentSoundVolume = 0.5;
    private currentMusicVolume = 0.5;

    onLoad() {
        this.init();
    }

    public init() {
        this.currentSoundVolume = SoundManager.instance.getSoundVolume();
        this.currentMusicVolume = SoundManager.instance.getMusicVolume();

        this.soundSlider.progress = this.currentSoundVolume;
        this.musicSlider.progress = this.currentMusicVolume;

        this.updateVolumeLabel(this.soundVolumeLabel, this.currentSoundVolume);
        this.updateVolumeLabel(this.musicVolumeLabel, this.currentMusicVolume);

        this.soundSlider.node.on('slide', this.onSoundSliderChanged, this);
        this.musicSlider.node.on('slide', this.onMusicSliderChanged, this);
    }

    private onSoundSliderChanged(slider: Slider) {
        this.currentSoundVolume = slider.progress;
        this.updateVolumeLabel(this.soundVolumeLabel, this.currentSoundVolume);
    
        SoundManager.instance.setSfxVolume(this.currentSoundVolume);
    }
    
    
    private onMusicSliderChanged(slider: Slider) {
        this.currentMusicVolume = slider.progress;
        this.updateVolumeLabel(this.musicVolumeLabel, this.currentMusicVolume);
    
        SoundManager.instance.setBgmVolume(this.currentMusicVolume);
    }
    
    private updateVolumeLabel(label: Label, value: number) {
        const percent = `${Math.round(value * 100)}%`;
        label.string = percent;
    }
}

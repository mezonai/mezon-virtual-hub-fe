import { _decorator, Button, Component, director, EditBox, Label, Sprite, SpriteFrame } from 'cc';
import { BaseProfileManager } from './BaseProfileManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { UserMeManager } from '../core/UserMeManager';
import { EVENT_NAME } from '../network/APIConstant';
import { UserProfileDTO } from '../Interface/DataMapAPI';
import { PopupManager } from '../PopUp/PopupManager';
import { Constants } from '../utilities/Constants';

const { ccclass, property } = _decorator;

@ccclass('MyProfileManager')
export class MyProfileManager extends BaseProfileManager {
    @property(Label) private fullName_txt: Label = null!;
    @property(Label) private gender_txt: Label = null!;
    @property(Label) private branch_txt: Label = null!;

    // @property(Sprite) private genderIcon: Sprite = null!;
    @property(SpriteFrame) private maleSprite: SpriteFrame = null!;
    @property(SpriteFrame) private femaleSprite: SpriteFrame = null!;

    @property(EditBox) private fullName_EBox: EditBox = null!;
    @property(Label) private gender_txt_Choose: Label = null!;
    @property(Sprite) private genderChoose: Sprite = null!;

    @property(Button) private btn_update_info: Button = null!;
    @property(Button) private btn_gender_left: Button = null!;
    @property(Button) private btn_gender_right: Button = null!;
    @property(Label) private title_Button: Label = null!;
    @property(Button) closeButton: Button = null;

    private isEditing: boolean = false;
    private genderOptions = ["nam", "nữ"];
    private statusButton = ["Lưu", "Cập Nhật"];
    @property([SpriteFrame])
    genderSprites: SpriteFrame[] = [];
    private selectedGenderIndex = 0;

    public init() {
        super.init();
        if (!UserMeManager.Get) {
            return;
        }
        this.btn_update_info.node.on("click", this.onUpdateButtonClick, this);
        this.btn_gender_left.node.on("click", this.onGenderLeft, this);
        this.btn_gender_right.node.on("click", this.onGenderRight, this);
        this.btn_gender_right.node.on("click", this.onGenderRight, this);
        this.clearInputFields();
        this.setEditingState(false);
        this.loadProfileUI();
        this.closeButton.addAsyncListener(async () => {
           await PopupManager.getInstance().closePopup(this.node.uuid);
        });
    }

    protected loadProfileUI() {
        const userData = UserMeManager.Get?.user;
        if (!userData) return;

        this.UserProfileData = UserMeManager.Get;

        this.loadAvatar(userData.avatar_url);
        this.updateUserTextFields(userData);
        this.updateGenderSelection(userData.gender);
    }

    private updateUserTextFields(userData: any) {
        let fullName = userData.display_name || userData.username
        this.fullName_txt.string = fullName;
        this.branch_txt.string = this.UserProfileData.clan?.name || "";
        this.fullName_EBox.string = fullName;
    }

    private updateGenderSelection(gender: string) {
        this.gender_txt.string = gender == "male" ? "nam" : "nữ";
        // let _gender = gender || this.genderOptions[0];
        // this.selectedGenderIndex = this.genderOptions.indexOf(_gender);
        // this.gender_txt.string = _gender;
        // this.gender_txt_Choose.string = this.genderOptions[this.selectedGenderIndex];
        // this.updateGenderIcon(gender);
    }

    // private updateGenderIcon(gender: string) {
    //     if (!this.genderIcon) return;
    //     this.genderIcon.node.active = true;
    //     if (gender.toLowerCase() === this.genderOptions[0]) {
    //         this.genderIcon.spriteFrame = this.maleSprite;
    //     } else if (gender.toLowerCase() ===  this.genderOptions[1]) {
    //         this.genderIcon.spriteFrame = this.femaleSprite;
    //     } else {
    //         this.genderIcon.node.active = false;
    //     }
    // }

    private onUpdateButtonClick() {
        this.isEditing ? this.updateProfile() : this.UpdateEditingState(true);
    }

    protected updateProfile() {
        const name = this.fullName_EBox.string;
        const validationMessage = this.getValidationMessage(name);
        if (validationMessage) {
            Constants.showConfirm(validationMessage,  "Chú ý");
            this.cancelEditingWithResetName();
            return;
        }
        
        const data = {
            display_name: this.fullName_EBox.string
            //gender: this.gender_txt_Choose.string.toLowerCase() == "nam" ? "male" : "male"
        };

        WebRequestManager.instance.updateProfile(
            data,
            (response) => this.onUpdateInfo(response),
            (error) => this.onError(error)
        );

        this.btn_update_info.interactable = false;
        this.setEditingState(false);
    }

    private getValidationMessage(name: string): string | null {
        if (!this.validateUsernameInput(name)) {
            return "Tên không hợp lệ. Tên không thể chứa ký tự đặc biệt và khoảng trắng";
        }
        if (name.length < 5) {
            return "Độ dài của tên phải lớn hơn 5";
        }
        return null;
    }

    private cancelEditingWithResetName() {
        this.setEditingState(false);
        this.fullName_EBox.string = UserMeManager.Get.user.display_name;
    }

    private UpdateEditingState(state: boolean) {
        this.setEditingState(state);
    }

    convertToUserDTO(response: any): UserProfileDTO {
        return {
            clanId: response.clanId || "",
            positionX: null,
            positionY: null,
            displayName: response.display_name || "",
            gender: response.gender || "",
            skinSet: null
        };
    }

    private onUpdateInfo(respone) {
        const userDTO = this.convertToUserDTO(respone);

        UserMeManager.Get.user.display_name = this.fullName_EBox.string;
        // UserMeManager.Get.user.gender = this.gender_txt_Choose.string;
        this.fullName_txt.string = this.fullName_EBox.string;
        // this.gender_txt.string = this.gender_txt_Choose.string;
        this.btn_update_info.interactable = true;
        if (!this.node || !this.node.isValid) return;
        director.emit(EVENT_NAME.UPDATE_INFO_PROFILE, { fullname: this.fullName_EBox.string });
    }

    private onError(error: any) {
        this.btn_update_info.interactable = true;
        Constants.showConfirm("Cập nhật tên không thành công");
    }

    private onGenderLeft() {
        this.selectedGenderIndex = this.selectedGenderIndex === 0 ? 1 : 0;
        this.updateGenderUI();
    }

    private onGenderRight() {
        this.selectedGenderIndex = this.selectedGenderIndex === 0 ? 1 : 0;
        this.updateGenderUI();
    }

    private updateGenderUI() {
        this.gender_txt_Choose.string = this.genderOptions[this.selectedGenderIndex];
        // this.genderIcon.spriteFrame = this.genderSprites[this.selectedGenderIndex];
    }

    private setEditingState(isEditing: boolean) {
        this.isEditing = isEditing;
        this.title_Button.string = isEditing ? this.statusButton[0] : this.statusButton[1];

        [this.fullName_txt].forEach(el => el.node.active = !isEditing);
        [this.fullName_EBox]
            .forEach(el => el.node.active = isEditing);

        if (isEditing) {
            this.updateGenderUI();
            this.fullName_EBox.string = this.UserProfileData.user.display_name || this.UserProfileData.user.username;
        }
    }

    private clearInputFields() {
        this.fullName_EBox.string = "";
        this.gender_txt_Choose.string = this.genderOptions[this.selectedGenderIndex];
    }

    validateUsernameInput(value: string): boolean {
        return /^[a-zA-Z0-9]+$/.test(value);
    }

    onDestroy() {
        director.off(EVENT_NAME.UPDATE_INFO_PROFILE);
    }

}
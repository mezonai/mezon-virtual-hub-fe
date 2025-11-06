import { _decorator, Collider2D, Component, Enum, IPhysics2DContact, Node } from 'cc';
import { Interactable } from './Interactable';
import { InteracterLabel } from '../../PopUp/InteracterLabel';
import { PopupManager } from '../../PopUp/PopupManager';
import { SceneManagerController } from '../../utilities/SceneManagerController';
import { SceneName } from '../../utilities/SceneName';
import { UserManager } from '../../core/UserManager';
import { OfficeSenenParameter } from '../../GameMap/OfficeScene/OfficeSenenParameter';
import { Constants } from '../../utilities/Constants';
import { RoomType } from '../../GameMap/RoomType';
import { OfficePosition } from '../../GameMap/OfficePosition';
import { UserMeManager } from '../../core/UserMeManager';
import { WebRequestManager } from '../../network/WebRequestManager';
const { ccclass, property } = _decorator;

@ccclass('InteractTeleport')
export class InteractTeleport extends Interactable {
    @property({ type: Enum(RoomType) })
    currentRoomType: RoomType = RoomType.NONE;// gameObject được gán hiện tại là loại room gì
    @property({ type: Enum(OfficePosition) })
    officeChange: OfficePosition = OfficePosition.NONE;// Office sẽ đến. None = không thay đổi Office
    @property({ type: Enum(RoomType) })
    roomTypeTeleport: RoomType = RoomType.NONE;// Room sẽ được dịch chuyển đến
    currentOffice: OfficeSenenParameter;
    protected async interact(playerSessionId: string) {
        if (!this.isPlayerNearby) return;
        await this.moveTeleport();
    }
    protected override async handleBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.noticePopup = await PopupManager.getInstance().openPopup('InteracterLabel', InteracterLabel, {
            keyBoard: String.fromCharCode(this.interactKey),
            action: this.getRoomNameTeleport(this.roomTypeTeleport),
        });
    }

    getRoomNameTeleport(roomType: RoomType): string {
        if (this.officeChange == OfficePosition.OFFICEGENERAL) {
            return "Để Trở Về Chọn Bản Đồ";
        }
        switch (roomType) {
            case RoomType.OFFICE:
                return `Để Dịch Chuyển Đến Văn Phòng ${Constants.convertNameOffice(this.currentOffice.currentOffice)}`;;
            case RoomType.COMPLEXNCC:
                return "Để Dịch Chuyển Đến Khu Phức Hợp";
            case RoomType.SHOP1:
            case RoomType.SHOP2:
                return "Để Dịch Chuyển Đến Cửa hàng";
            case RoomType.FARM:
                return "Để Dịch Chuyển Đến Nông Trại";
            case RoomType.NONE:
                return "";
            default:
                return "Không thể Dịch Chuyển";
        }
    }

    moveTeleport() {
        if (!UserManager.instance.GetMyClientPlayer) return;
        if (!this.currentOffice) {
            this.currentOffice = UserMeManager.CurrentOffice;
        }
        UserMeManager.CurrentOffice = this.currentOffice;
        UserMeManager.CurrentRoomType = this.currentRoomType;
        UserManager.instance.GetMyClientPlayer.leaveRoom(() => {
            this.teleport();
        });
    }

    teleport() {
        if (this.officeChange == OfficePosition.OFFICEGENERAL) {
            const param = { isBackMap: true };
            SceneManagerController.loadScene(SceneName.SCENE_GAME_MAP, param)
            return;
        }
        if (this.officeChange == OfficePosition.NONE || this.officeChange == this.currentOffice.currentOffice) {
            this.loadOfficeMap(this.currentOffice.currentOffice);
        }
        else {
            this.updateUserDataUserClient();
        }
    }

    private updateUserDataUserClient() {
        UserMeManager.SetClan = Constants.GetMapData(this.officeChange);
        let userMe = UserMeManager.Get;
        let userData = {
            "position_x": Constants.POSX_PLAYER_INIT,
            "position_y": Constants.POSY_PLAYER_INIT,
            "display_name": userMe.user.display_name != "" ? userMe.user.display_name : userMe.user.username,
            "gender": userMe.user.gender,
            "skin_set": UserMeManager.Get.user.skin_set
        }
        WebRequestManager.instance.updateProfile(
            userData,
            (response) => this.loadNextScene(response),
            (error) => this.onError(error)
        );
    }
    private onError(error: any) {
        console.error("Error occurred:", error);

        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }
    private loadNextScene(response) {
        this.loadOfficeMap(this.officeChange);
    }

    private loadOfficeMap(officeMoved: OfficePosition) {
        const previousOffice = UserMeManager.CurrentOffice;
        const previousRoomType = UserMeManager.CurrentRoomType;
        const param = new OfficeSenenParameter(previousOffice.currentOffice, previousRoomType, this.roomTypeTeleport, Constants.convertNameRoom(previousOffice.currentOffice, this.roomTypeTeleport), UserMeManager.CurrentOffice.idclan);
        SceneManagerController.loadScene(SceneName.SCENE_OFFICE, param)
    }
}




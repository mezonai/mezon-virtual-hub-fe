import { _decorator, Component, Node } from 'cc';
import { MissionEvent } from '../Interface/DataMapAPI';
import { UserMeManager } from './UserMeManager';
const { ccclass, property } = _decorator;

@ccclass('MissionEventManager')
export class MissionEventManager {
    private static missionEvent: MissionEvent | null = null;
    public static isShowCompletedPopup : boolean = false;
    public static isShowUserTargetJoin : boolean = false;
    private static missionTimeInterval: any = null;
        public static get Get(): MissionEvent | null {
            return this.missionEvent;
        }
    
        public static set Set(event: MissionEvent | null) {
            this.missionEvent = event;
        }
    
        public static get UserTarget() {
            return this.missionEvent.target_user;
        }

        public static IsUserMeCompeletedMission(): boolean {
            return this.missionEvent.completed_users.some(user => user.id === UserMeManager.Get.user.id);
        }

        public static IsUserCompletedMission(userId: string): boolean {
            return this.missionEvent.completed_users.some(user => user.id === userId);
        }

        public static CompletedMision(): boolean {
            if (this.missionEvent == null || this.missionEvent.completed_users == null) {
                return true;
            }
            return this.missionEvent.completed_users.length == this.missionEvent.max_completed_users;
        }

        public static meIsTargetUser(): boolean {
            if (this.missionEvent?.target_user?.id != null) {
                return this.missionEvent.target_user.id == UserMeManager.Get.user.id;
            }
            return false;
        }

        public static missionInProgress(): boolean {
            return this.missionEvent != null;
        }

        public static startMissionTimer(onExpiredCallback: () => void) {
            if (!this.missionEvent || !this.missionEvent.end_time) return;
            if (this.missionTimeInterval) {
                clearInterval(this.missionTimeInterval);
            }
             const missionEndTime = new Date(this.missionEvent.end_time);
             this.missionTimeInterval = setInterval(() => {
                 const now = new Date();
                 let time =  missionEndTime.getTime() - now.getTime();
                 let remaningTime = Math.floor(time / 1000)
                 if (remaningTime <= 0) {
                     clearInterval(this.missionTimeInterval);
                     this.missionTimeInterval = null;
                     onExpiredCallback();
                     return;
                 }
             }, 1000);
        }

        public static stopMissionTimer() {
            if (this.missionTimeInterval) {
                clearInterval(this.missionTimeInterval);
                this.missionTimeInterval = null;
            }
        }
}



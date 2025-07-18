import { _decorator, Button, Component, Label, Node, Tween } from 'cc';
import { TalkAnimation } from '../../utilities/TalkAnimation';
import { BattleData as BattleData } from '../../Model/PetDTO';
const { ccclass, property } = _decorator;

@ccclass('HandleCombat')
export class HandleCombat extends Component {

    @property(Node) chooseActionPanel: Node = null;
    @property(Node) chooseSkillPanel: Node = null;
    @property(Node) talkPanel: Node = null;

    @property({ type: TalkAnimation }) talkAnimation: TalkAnimation = null;
    private timeTalk: number = 0.25;
    private timeout: number = 1000;

    @property({ type: Button }) giveupBtn: Button = null;
    @property({ type: Button }) fightBtn: Button = null;
    @property({ type: Button }) PetBtn: Button = null;

    @property({ type: Button }) attackSkillFirst: Button = null;
    @property({ type: Button }) attackSkillSecond: Button = null;
    private _onCloseBattle: (() => void) | null = null;

    private introMessages: string[] = [
        "Trận đấu sắp bắt đầu. Bạn đã sẵn sàng chưa?",
        "Các thú cưng đã vào vị trí chiến đấu!",
        "Hãy chọn chiến thuật khôn ngoan để giành chiến thắng!",
        "Hãy chuẩn bị kỹ càng, trận chiến sắp nổ ra!",
        "Thú cưng của bạn đang đợi lệnh từ bạn!",
        "Đừng để đối thủ đánh bại bạn một cách dễ dàng!",
    ];

    setData(handleBattleData: HandleBattleData) {
        // if (handleBattleData != null) {
        //     if (handleBattleData.onCancelBattle) {
        //         this.giveupBtn.node.on(Button.EventType.CLICK, handleBattleData.onCancelBattle, this);
        //     }
        //     if (handleBattleData.onCloseBattle) {
        //         this._onCloseBattle = handleBattleData.onCloseBattle;
        //     }
        //     if (handleBattleData.battleData != null) {
        //         this.attackSkillFirst.node.on(Button.EventType.CLICK, () => { this.HandleSkillFirst(handleBattleData.battleData.pet2.skills[0]) }, this);
        //         this.attackSkillSecond.node.on(Button.EventType.CLICK, () => { this.HandleSkillFirst(handleBattleData.battleData.pet2.skills[1]) }, this);
        //     }
        // }
        // this.chooseActionPanel.active = false;
        // this.chooseSkillPanel.active = false;
        // this.talkPanel.active = true;


        // this.fightBtn.node.on(Button.EventType.CLICK, this.HandleFight, this);
        // this.PetBtn.node.on(Button.EventType.CLICK, this.HandleShowPet, this);

        // this.showMessagesSequentially(this.introMessages, () => {
        //     this.ShowAction();
        // });
        // this.ShowAction();
    }


    ShowAction() {
        this.talkPanel.active = false;
        this.chooseActionPanel.active = true;
        this.chooseSkillPanel.active = false;
    }

    ShowEndCombat(data) {
        this.chooseSkillPanel.active = false;
        this.chooseActionPanel.active = false;
        this.talkPanel.active = true;
        this.talkAnimation?.showBubbleChatCombat(data, this.timeTalk, () => {
            this._onCloseBattle();
        });
    }

    HandleFight() {
        this.chooseActionPanel.active = false;
        this.chooseSkillPanel.active = true;
    }

    HandleShowPet() {
        //
    }

    HandleSkillFirst(battleDataSkill1: number) {
        const skillId = battleDataSkill1;
        this.sendSkillAction(skillId);
    }

    HandleSkillSecond(battleDataSkill2: number) {
        const skillId = battleDataSkill2;
        this.sendSkillAction(skillId);
    }

    sendSkillAction(skillId: number) {
        //
    }

    private showMessagesSequentially(messages: string[], onFinish: () => void) {
        if (!messages || messages.length === 0) {
            onFinish();
            return;
        }

        const randomIndex = Math.floor(Math.random() * messages.length);
        const message = messages[randomIndex];

        this.talkAnimation?.showBubbleChatCombat(message, this.timeTalk, () => {
            setTimeout(onFinish, this.timeout);
        });
    }

    protected onDisable(): void {
        Tween.stopAllByTarget(this.talkAnimation);
    }
}

export interface HandleBattleData {
    onCancelBattle?: () => void;
    onCloseBattle?: () => void;
    battleData: BattleData
}
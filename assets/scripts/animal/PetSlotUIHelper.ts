import { _decorator, Component, Node, Sprite, Animation, Color } from "cc";
import { PetDTO, AnimalRarity } from "../Model/PetDTO";

const { ccclass, property } = _decorator;

@ccclass("PetSlotUIHelper")
export class PetSlotUIHelper extends Component {
    @property(Sprite)
    borderSprite: Sprite = null;

    @property(Animation)
    animator: Animation = null;

    @property({ type: [Color] })
    colorBorder: Color[] = [];   // index: COMMON=0, RARE=1, EPIC=2, LEGENDARY dùng riêng

    @property([Node])
    stars: Node[] = [];

    public setBorder(pet: PetDTO) {
        if (!pet) return;
        if (pet.pet.rarity == AnimalRarity.LEGENDARY) {
            this.animator.node.active = true;
            this.borderSprite.color = this.colorBorder[0];
            this.playAnimBorder(pet.pet.rarity);
        }
        else {
            this.animator.node.active = false;
            const indexColor = pet.pet.rarity == AnimalRarity.COMMON ? 0 : pet.pet.rarity == AnimalRarity.RARE ? 1 : 2;
            this.borderSprite.color = this.colorBorder[indexColor];
        }
    }

    public setBorderTemp(rarity: AnimalRarity) {
        if (rarity == AnimalRarity.LEGENDARY) {
            if (this.animator) this.animator.node.active = true;
            this.borderSprite.color = this.colorBorder[0]; // bạn muốn màu LEGENDARY có riêng thì đổi index ở đây
            this.playAnimBorder(rarity);
        } else {
            if (this.animator) this.animator.node.active = false;
            const indexColor =
                rarity == AnimalRarity.COMMON ? 0 :
                    rarity == AnimalRarity.RARE ? 1 : 2;
            this.borderSprite.color = this.colorBorder[indexColor];
        }
    }
    
    public playAnimBorder(animationName: string) {
        if (animationName != "") {
            this.animator.play(animationName);
        }
    }

    /** Set số sao hiển thị */
    public setStar(starCount: number) {
        if (!this.stars) return;
        this.stars.forEach((star, i) => {
            star.active = i < starCount;
        });
    }

    /** Clear UI */
    public reset() {
        if (this.animator) this.animator.node.active = false;
        this.borderSprite.color = Color.WHITE;
        this.setStar(0);
    }
}

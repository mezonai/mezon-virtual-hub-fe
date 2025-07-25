import { _decorator, Component, Enum, Sprite, SpriteFrame } from 'cc';
import { AnimalElement } from '../../Model/PetDTO';
const { ccclass, property } = _decorator;

@ccclass('TypeMap')
export class TypeMap {
    @property({ type: Enum(AnimalElement) }) animalElement: AnimalElement = AnimalElement.Normal;
    @property({ type: SpriteFrame }) background: SpriteFrame = null;
    @property({ type: SpriteFrame }) ground: SpriteFrame = null;
}
@ccclass('CombatEnvController')
export class CombatEnvController extends Component {
    @property({ type: Sprite }) background: Sprite = null;
    @property({ type: Sprite }) bgLand1: Sprite = null;
    @property({ type: Sprite }) bgLand2: Sprite = null;
    @property({ type: [TypeMap] }) typeMaps: TypeMap[] = [];



    public setEnvironmentByType(type: AnimalElement) {
        const currentTypeMap = this.getTypeMapByType(type);

        if (currentTypeMap.background) {
            this.background.spriteFrame = currentTypeMap.background;
        }

        if (currentTypeMap.ground) {
            this.bgLand1.spriteFrame = currentTypeMap.ground;
            this.bgLand2.spriteFrame = currentTypeMap.ground;
        }
    }

    private getTypeMapByType(type: AnimalElement): TypeMap {
        return this.typeMaps.find(t => t.animalElement === type) || this.typeMaps[0];
    }
}

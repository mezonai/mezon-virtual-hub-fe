import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerInput')
export abstract class PlayerInput extends Component {
    protected inputValue: Vec3 = new Vec3();
    public abstract init(): void;
    public abstract getInput(): Vec3;
}
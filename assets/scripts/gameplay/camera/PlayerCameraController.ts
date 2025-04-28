import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerCameraController')
export class PlayerCameraController extends Component {
    @property(Node)
    target: Node = null; // player

    @property
    deadZoneX: number = 20;

    @property
    deadZoneY: number = 10;

    @property
    smoothSpeed: number = 0.2;

    update(dt: number) {
        if (!this.target) return;

        const camPos = this.node.getWorldPosition();
        const targetPos = this.target.getWorldPosition();

        let diffX = targetPos.x - camPos.x;
        let diffY = targetPos.y - camPos.y;

        if (Math.abs(diffX) < this.deadZoneX) diffX = 0;
        if (Math.abs(diffY) < this.deadZoneY) diffY = 0;

        const desiredPos = new Vec3(
            camPos.x + diffX,
            camPos.y + diffY,
            camPos.z
        );

        // Smooth move
        const newPos = new Vec3();
        Vec3.lerp(newPos, camPos, desiredPos, dt * this.smoothSpeed);
        this.node.setWorldPosition(newPos);
    }
}

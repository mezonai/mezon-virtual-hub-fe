import { _decorator, Component, Node, Vec2 } from 'cc';
import { PetDTO } from './PetDTO';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    start() {

    }

    update(deltaTime: number) {

    }
}
export interface UserDTO {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    lang_tag: string;
    metadata: { status: string };
    google_id: string;
    online: boolean;
    edge_count: number;
    create_time: string;
    update_time: string;
    dob: string;
    gold: number;
    gender: string;
}

export interface WalletDTO {
    value: number;
}

export interface MapDTO {
    id: string;
    name: string;
    map_key: string;
    is_locked: boolean;
    created_at: string;
    updated_at: string;
}

export interface MezonDTO {
    user: UserDTO;
    wallet: WalletDTO;
    email: string;
    mezon_id: string;
    map: MapDTO;
}

export class ColysesusObjectData {
    public sessionId: string;
    public room: Colyseus.Room<any>
    public x: number;
    public y: number;
    public name: string;

    constructor(sessionId: string, room: Colyseus.Room<any>, x: number, y: number, name: string) {
        this.sessionId = sessionId;
        this.room = room;
        this.x = x;
        this.y = y;
        this.name = name;
    }
}

export class PlayerColysesusObjectData extends ColysesusObjectData{
    public skinSet: string
    public userId: string
    public isShowName: boolean;
    public pet_players : string
    constructor(sessionId: string, room: Colyseus.Room<any>, x: number, y: number, name: string, skinSet: string, id: string, isShowName: boolean, pet_players: string) {
        super(sessionId, room, x, y, name);
        this.skinSet = skinSet;
        this.userId = id;
        this.isShowName = isShowName;
        this.pet_players = pet_players;
    }
    
}

export class ItemColysesusObjectData extends ColysesusObjectData{
    public ownerId: string

    constructor(sessionId: string, room: Colyseus.Room<any>, x: number, y: number, name: string, ownerId: string) {
        super(sessionId, room, x, y, name);
        this.ownerId = ownerId;
    }
}

export class PetColysesusObjectData extends ColysesusObjectData{
    public pet: PetDTO;
    public angle: Vec2;
    constructor(sessionId: string, room: Colyseus.Room<any>, x: number, y: number, name: string, angle: Vec2, pet: PetDTO) {
        super(sessionId, room, x, y, name);
        this.pet = pet;
        this.angle = angle;
    }
}
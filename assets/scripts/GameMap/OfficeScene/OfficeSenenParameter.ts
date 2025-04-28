import { OfficePosition } from "../OfficePosition";
import { RoomType } from "../RoomType";

export class OfficeSenenParameter{
    currentOffice: OfficePosition;
    roomStart: RoomType;// Từ Map vào Office nên truyền vào là RoomType = None vì chưa xác định được loại phòng
    roomEnds: RoomType;
    nameRoomServer: string;

    constructor(currentOffice: OfficePosition, roomStart: RoomType, roomEnds: RoomType, nameRoom: string) {
        this.currentOffice = currentOffice;
        this.roomStart = roomStart;
        this.roomEnds = roomEnds;
        this.nameRoomServer = nameRoom;
    }   
}



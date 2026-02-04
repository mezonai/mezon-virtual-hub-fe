export enum MapItemType {
    GOKART = 1,
    DOOR = 2,
    BUY_SHOP = 3,
    ATM = 4,
    GENERAL = 5,
    BUY_SHOP_FOOD = 6,
    BUY_SHOP_FARM = 7,
    INVENTORY_FARM = 8,
}

export enum MapItemAction {
    NOTICE = 10,
    USING = 20,
}


export const InteractMessageMapping: Record<number, string> = {
    [MapItemType.GOKART + MapItemAction.NOTICE]: 'Để Lái',
    [MapItemType.GOKART + MapItemAction.USING]: 'Để Xuống',
    [MapItemType.DOOR + MapItemAction.NOTICE]: 'Để Mở Cửa',
    [MapItemType.BUY_SHOP + MapItemAction.NOTICE]: 'Để Mở Cửa Hàng',
    [MapItemType.ATM + MapItemAction.NOTICE]: 'Để Mở ATM',
    [MapItemType.GENERAL + MapItemAction.NOTICE]: 'Để Tương Tác',
    [MapItemType.BUY_SHOP_FOOD + MapItemAction.NOTICE]: 'Để Mở Cửa Hàng Thức Ăn Pet',
    [MapItemType.BUY_SHOP_FARM + MapItemAction.NOTICE]: 'Để Mở Cửa Hàng Nông Trại',
    [MapItemType.INVENTORY_FARM + MapItemAction.NOTICE]: 'Để Mở Kho Nông Trại',
};
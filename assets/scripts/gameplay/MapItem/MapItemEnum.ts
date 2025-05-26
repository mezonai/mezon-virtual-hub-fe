export enum MapItemType {
    GOKART = 1,
    DOOR = 2,
    BUY_SHOP = 3,
    ATM = 4,
    GENERAL = 5,
    BUY_SHOP_FOOD = 6,
}

export enum MapItemAction {
    NOTICE = 10,
    USING = 20,
}


export const InteractMessageMapping: Record<number, string> = {
    [MapItemType.GOKART + MapItemAction.NOTICE]: 'Để Lái',
    [MapItemType.GOKART + MapItemAction.USING]: 'Để Xuống',
    [MapItemType.DOOR + MapItemAction.NOTICE]: 'Để Mở Cửa',
    [MapItemType.BUY_SHOP + MapItemAction.NOTICE]: 'Để Mở Shop',
    [MapItemType.ATM + MapItemAction.NOTICE]: 'Để Mở ATM',
    [MapItemType.GENERAL + MapItemAction.NOTICE]: 'Để Tương Tác',
    [MapItemType.BUY_SHOP_FOOD + MapItemAction.NOTICE]: 'Để Mở Shop Pet',
};
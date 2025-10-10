import { ClanFundWatcher } from './ClanFundWatcher';
import { ServerManager } from '../core/ServerManager';
import { PurchaseMethod } from '../Model/Item';

export class ClanFundManager {
    public static updateFundFromServer(type: PurchaseMethod, amount: number) {
        ClanFundWatcher.instance.setFund(type, amount);
    }

    public static sendFund(type: PurchaseMethod, amount: number) {
        ServerManager.instance.sendClanFund({ type, amount });
    }
}

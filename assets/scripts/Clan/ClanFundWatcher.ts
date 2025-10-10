import { _decorator, Component, Node } from 'cc';
import { PurchaseMethod } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('ClanFundWatcher')
export class ClanFundWatcher {
    private static _instance: ClanFundWatcher;
    public static get instance() {
        if (!this._instance) this._instance = new ClanFundWatcher();
        return this._instance;
    }
    private  data: Partial<Record<PurchaseMethod, number>> = {[PurchaseMethod.GOLD]: 0};
    private watchers: Map<PurchaseMethod, ((newVal: number, oldVal: number) => void)[]> = new Map();

    private constructor() {
        this.watchers.set(PurchaseMethod.GOLD, []);
    }

    getFund(type: PurchaseMethod = PurchaseMethod.GOLD) {
        return this.data[type];
    }

    setFund(type: PurchaseMethod = PurchaseMethod.GOLD, value: number) {
        const old = this.data[type];
        if (old !== value) {
            this.data[type] = value;
            this.watchers.get(type)?.forEach(cb => cb(value, old));
        }
    }

    onChange(type: PurchaseMethod = PurchaseMethod.GOLD, cb: (newVal: number, oldVal: number) => void) {
        this.watchers.get(type)?.push(cb);
    }

    removeCallback(type: PurchaseMethod = PurchaseMethod.GOLD, cb: (newVal: number, oldVal: number) => void) {
        const arr = this.watchers.get(type);
        if (!arr) return;
        const idx = arr.indexOf(cb);
        if (idx >= 0) arr.splice(idx, 1);
    }

    offAll(type: PurchaseMethod = PurchaseMethod.GOLD) {
        this.watchers.set(type, []);
    }
}

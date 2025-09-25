import { _decorator, Component, Node, Prefab, instantiate, Vec3, Quat, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

interface Pool {
    prefab: Prefab;
    size: number;
}

@ccclass('PoolData')
export class PoolData {
    @property({type: Prefab}) prefab: Prefab = null;
    @property({type: CCInteger}) size: number = 0;
}

@ccclass('ObjectPoolManager')
export class ObjectPoolManager extends Component {
    private static _instance: ObjectPoolManager | null = null;
    public static get instance(): ObjectPoolManager {
        return ObjectPoolManager._instance;
    }
    
    @property(Node)
    poolingParent: Node = null;

    @property([PoolData]) poolDatas: PoolData[] = [];

    private pools: Pool[] = [];
    private poolDictionary: { [key: string]: Node[] } = {};
    private poolParentDictionary: { [key: string]: Node } = {};

    onLoad() {
        this.initPools();
        if (ObjectPoolManager._instance === null) {
            ObjectPoolManager._instance = this;

        }
        else if (ObjectPoolManager._instance !== this) {
            this.node.destroy();
        }
    }

    protected onDestroy(): void {
        ObjectPoolManager._instance = null;
    }

    initPools() {
        for (let i = 0; i < this.poolDatas.length; i++) {
            const pool: Pool = { prefab: this.poolDatas[i].prefab, size: this.poolDatas[i].size };
            this.pools.push(pool);

            const poolContainer = new Node(pool.prefab.name + " Pool");
            poolContainer.setParent(this.poolingParent);

            this.poolParentDictionary[pool.prefab.name] = poolContainer;
            this.poolDictionary[pool.prefab.name] = [];

            for (let j = 0; j < pool.size; j++) {
                const obj = instantiate(pool.prefab);
                obj.setParent(poolContainer);
                obj.active = false;
                obj.name = pool.prefab.name;

                this.poolDictionary[pool.prefab.name].push(obj);
            }
        }

        this.scheduleOnce(() => {
            // Trigger any event to indicate pools are ready
            this.onPoolReady();
        });
    }

    onPoolReady() {
        // Custom event or callback when pool is ready
        console.log('Pools are ready');
    }

    getPoolByTag(tag: string): Pool | null {
        for (const pool of this.pools) {
            if (pool.prefab.name === tag) return pool;
        }
        return null;
    }

    addToPool(pool: Pool): Node {
        const obj = instantiate(pool.prefab);
        obj.setParent(this.poolParentDictionary[pool.prefab.name]);
        obj.active = false;
        obj.name = pool.prefab.name;

        this.poolDictionary[pool.prefab.name].push(obj);
        return obj;
    }

    spawnFromPool(tag: string, position: Vec3 = new Vec3(), rotation: Quat = new Quat()): Node | null {
        if (!this.poolDictionary[tag]) return null;

        if (this.poolDictionary[tag].length === 0) {
            const pool = this.getPoolByTag(tag);
            if (pool) this.addToPool(pool);
        }

        const objectToSpawn = this.poolDictionary[tag].shift();
        if (!objectToSpawn) return null;

        objectToSpawn.active = true;
        return objectToSpawn;
    }

    returnToPool(obj: Node, isSpawnEffect: boolean = true): Node | null {
        const tag = obj.name;
        if (!this.poolDictionary[tag]){
            obj.destroy();
            return null;
        }

        if (this.poolDictionary[tag].indexOf(obj) >= 0) {
            return;
        }
        
        setTimeout(() => {
        obj.active = false;
        }, 0)
        obj.setParent(this.poolParentDictionary[tag]);
        this.poolDictionary[tag].push(obj);

        return obj;
    }

    async returnArrayToPool(objs: Node[]): Promise<void> {
        const temp = [...objs];
        for (const obj of temp) {
            const tag = obj.name;
            if (!this.poolDictionary[tag]) {
                obj.destroy();
            } else {
                obj.active = false;
                obj.setParent(this.poolParentDictionary[tag]);
                this.poolDictionary[tag].push(obj);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 0));
    }

}

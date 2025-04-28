import { _decorator, Component, sys } from 'cc';
import { BundleData } from './LoadBundleController';
const { ccclass, property } = _decorator;

let db: IDBDatabase;
const dbName = "MezonVHubDB";

@ccclass('DBController')
export class DBController extends Component {
    static instance: DBController;

    // @property({ type: String })
    // uiTableName: string = "UI";

    // @property({ type: String })
    // spineTableName: string = "Spine";

    // @property({ type: String })
    // audioTableName: string = "Audio";

    // @property({ type: String })
    // configTableName: string = "Config";
    public initPromise: Promise<IDBDatabase>;


    protected onLoad(): void {
        if (DBController.instance == null) {
            DBController.instance = this;
        }
    }

    protected onDestroy(): void {
        DBController.instance = null;
    }

    getDBVersion(): number {
        return db.version;
    }

    waitForInitDone(): Promise<IDBDatabase> {
        return this.initPromise;
    }

    public initDB(bundleNames: BundleData[]): Promise<IDBDatabase> {
        let version = 12;
        let lastVersion = sys.localStorage.getItem("db_version")
        if (lastVersion && lastVersion > version) {
            version = lastVersion;
        }
        sys.localStorage.setItem("db_version", version);

        let bundleNum = sys.localStorage.getItem("bundle_count");
        if (bundleNum == null) {
            sys.localStorage.setItem("bundle_count", bundleNames.length);
        }
        else if (bundleNum != bundleNames.length) {
            version++;
            sys.localStorage.setItem("db_version", version);
            sys.localStorage.setItem("bundle_count", bundleNames.length);
        }
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, version);

            request.addEventListener('error', () => {
                console.error('Request error:', request.error);
            });

            request.onerror = (event) => {
                console.error('Error opening database:', (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };

            request.onsuccess = (event) => {
                db = (event.target as IDBRequest).result as IDBDatabase;
                console.log('Database opened successfully');
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                db = (event.target as IDBRequest).result as IDBDatabase;

                const storeNames = Array.from(db.objectStoreNames);
                for (const storeName of storeNames) {
                    db.deleteObjectStore(storeName);
                    console.log(`Đã xóa object store: ${storeName}`);
                }

                bundleNames.forEach(bundle => {
                    if (!db.objectStoreNames.contains(bundle.bundleName)) {
                        db.createObjectStore(bundle.bundleName, { keyPath: 'id' });
                    }
                });
                console.log('Database upgrade needed');
            };
        });
    }

    getDataByKey(key: string | number, tableName: string, callback: (result: any) => void) {
        const transaction = db.transaction([tableName], 'readonly');
        const objectStore = transaction.objectStore(tableName);

        try {
            const getRequest = objectStore.get(key);
            getRequest.onsuccess = (event) => {
                const result = (event.target as IDBRequest).result;
                callback(result ?? null);
            };

            getRequest.onerror = (event) => {
                console.error('Error getting data:', (event.target as IDBRequest).error);
                callback(null);
            };
        } catch (e) {
            console.error(`Error accessing table ${tableName}:`, e);
        }
    }

    isTableHasData(id: string | number, tableName: string, callback: (result: any) => void) {
        const transaction = db.transaction([tableName], 'readonly');
        const objectStore = transaction.objectStore(tableName);
        const getRequest = objectStore.get(id);

        getRequest.onsuccess = (event) => {
            const result = (event.target as IDBRequest).result;
            callback(result ?? null);
        };

        getRequest.onerror = (event) => {
            console.error('Error getting row:', (event.target as IDBRequest).error);
            callback(null);
        };
    }

    addData(data: any, tableName: string, callback?: (data: any) => void) {
        this.isTableHasData(data.id, tableName, (dataRetrieve) => {
            if (dataRetrieve != null) {
                this.updateData(tableName, data);
            } else {
                try {
                    const transaction = db.transaction([tableName], 'readwrite');
                    const objectStore = transaction.objectStore(tableName);
                    const request = objectStore.add(data);

                    request.onsuccess = () => {
                        callback?.(data);
                    };

                    request.onerror = () => {
                        callback?.(null);
                    };
                } catch (e) {
                    console.error('Error when adding data:', e);
                }
            }
        });
    }

    getAllData(tableName: string, callback: (data: any[]) => void) {
        const transaction = db.transaction([tableName], 'readonly');
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const data = (event.target as IDBRequest).result;
            callback(data);
        };

        request.onerror = (event) => {
            console.error('Error retrieving data:', (event.target as IDBRequest).error);
        };
    }

    updateData(tableName: string, newData: any) {
        const transaction = db.transaction([tableName], 'readwrite');
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.put(newData);

        request.onsuccess = () => {
        };

        request.onerror = (event) => {
            console.error('Error updating data:', (event.target as IDBRequest).error);
        };
    }

    deleteData(id: string | number, tableName: string) {
        const transaction = db.transaction([tableName], 'readwrite');
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.delete(id);

        request.onsuccess = () => {
        };

        request.onerror = (event) => {
            console.error('Error deleting data:', (event.target as IDBRequest).error);
        };
    }

    clearObjectStore(tableName: string) {
        const transaction = db.transaction([tableName], 'readwrite');
        const objectStore = transaction.objectStore(tableName);

        const clearRequest = objectStore.clear();
        clearRequest.onsuccess = () => {
            console.log(`All data in table ${tableName} cleared successfully.`);
        };

        clearRequest.onerror = (event) => {
            console.error('Error clearing data:', (event.target as IDBRequest).error);
        };
    }
}

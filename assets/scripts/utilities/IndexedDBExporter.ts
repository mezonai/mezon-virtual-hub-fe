import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('IndexedDBExporter')
export class IndexedDBExporter extends Component {
    @property({type: Node}) button: Node = null


    protected start(): void {
        this.button.on("click", () => {
            this.exportAndDownload("MezonVHubDB")
            .then((data) => {
                console.log(data)
            })
        })
    }
    exportIndexedDBToJSON(dbName: string) {
        return new Promise<string>((resolve, reject) => {
            const request = indexedDB.open(dbName);

            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const exportData: Record<string, any[]> = {};
                const storeNames = Array.from(db.objectStoreNames);
                const transaction = db.transaction(storeNames, 'readonly');

                let pendingStores = storeNames.length;

                for (const storeName of storeNames) {
                    const store = transaction.objectStore(storeName);
                    const getAllRequest = store.getAll();

                    getAllRequest.onsuccess = () => {
                        exportData[storeName] = getAllRequest.result;
                        pendingStores--;

                        if (pendingStores === 0) {
                            const json = JSON.stringify(exportData, null, 2);
                            resolve(json);
                        }
                    };

                    getAllRequest.onerror = () => {
                        reject(getAllRequest.error);
                    };
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    downloadJSONFile(jsonData: string, filename = 'indexeddb-export.json') {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a); // Required for Firefox
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async exportAndDownload(dbName: string) {
        try {
            const json = await this.exportIndexedDBToJSON(dbName);
            this.downloadJSONFile(json);
            console.log('✅ IndexedDB exported!');
        } catch (err) {
            console.error('❌ Export failed:', err);
        }
    }
}

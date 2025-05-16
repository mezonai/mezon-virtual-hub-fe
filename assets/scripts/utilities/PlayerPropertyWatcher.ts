export class PlayerPropertyWatcher {
    private data: { gold: number; diamond: number; name: string };
    private watchers: Map<string, ((newValue: any, oldValue: any) => void)[]>;

    constructor(initialGold: number = 0, initialDiamond: number = 0, initialName: string = "Player") {
        this.data = { gold: initialGold, diamond: initialDiamond, name: initialName };
        this.watchers = new Map<string, ((newValue: any, oldValue: any) => void)[]>();

        this.watchers.set("gold", []);
        this.watchers.set("diamond", []);
        this.watchers.set("name", []);
    }

    // Getter and setter for gold
    get gold(): number {
        return this.data.gold;
    }

    set gold(value: number) {
        if (this.data.gold !== value) {
            const oldValue = this.data.gold;
            this.data.gold = value;
            this.notifyWatchers("gold", value, oldValue);
        }
    }

    // Getter and setter for diamond
    get diamond(): number {
        return this.data.diamond;
    }

    set diamond(value: number) {
        if (this.data.diamond !== value) {
            const oldValue = this.data.diamond;
            this.data.diamond = value;
            this.notifyWatchers("diamond", value, oldValue);
        }
    }

    // Getter and setter for name
    get name(): string {
        return this.data.name;
    }

    set name(value: string) {
        if (this.data.name !== value) {
            const oldValue = this.data.name;
            this.data.name = value;
            this.notifyWatchers("name", value, oldValue);
        }
    }

    // Register a watcher for a property
    onChange(property: "gold" | "diamond" | "name", callback: (newValue: any, oldValue: any) => void) {
        this.watchers.get(property)?.push(callback);
    }

    // Remove all watchers for a property
    offAllChange(property: "gold" | "diamond" | "name") {
        this.watchers.set(property, []);
    }

    // Notify all watchers of a property change
    private notifyWatchers(property: "gold" | "diamond" | "name", newValue: any, oldValue: any) {
        this.watchers.get(property)?.forEach(callback => callback(newValue, oldValue));
    }
}
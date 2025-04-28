export class PlayerPropertyWatcher {
    private data: { gold: number; name: string };
    private watchers: Map<string, ((newValue: any, oldValue: any) => void)[]>;

    constructor(initialGold: number = 0, initialName: string = "Player") {
        this.data = { gold: initialGold, name: initialName };
        this.watchers = new Map<string, ((newValue: any) => void)[]>();

        // Initialize watchers for properties
        this.watchers.set("gold", []);
        this.watchers.set("name", []);
    }

    // Getter for gold
    get gold(): number {
        return this.data.gold;
    }

    // Setter for gold (notifies watchers)
    set gold(value: number) {
        if (this.data.gold !== value) {
            const oldValue = this.data.gold;
            this.data.gold = value;
            this.notifyWatchers("gold", value, oldValue);
        }
    }

    // Getter for name
    get name(): string {
        return this.data.name;
    }

    // Setter for name (notifies watchers)
    set name(value: string) {
        if (this.data.name !== value) {
            const oldValue = this.data.name;
            this.data.name = value;
            this.notifyWatchers("name", value, oldValue);
        }
    }

    // Register a watcher for a property
    onChange(property: "gold" | "name", callback: (newValue: any, oldValue: any) => void) {
        this.watchers.get(property)?.push(callback);
    }
    
    offAllChange(property: "gold" | "name") {
        this.watchers.set(property, []);  // Clears the array of watchers for that property
    }

    // Notify all watchers of a property change
    private notifyWatchers(property: "gold" | "name", newValue: any, oldValue: any) {
        this.watchers.get(property)?.forEach(callback => callback(newValue, oldValue));
    }
}
import { Button } from 'cc';

// Khai báo interface mở rộng để TypeScript hiểu có addAsyncListener
declare module 'cc' {
    interface Button {
        addAsyncListener(callback: () => Promise<void>): void;
    }
}

Button.prototype.addAsyncListener = function (this: Button, callback: () => Promise<void>) {
    let isProcessing = false;

    const handler = async () => {
        if (isProcessing) return;
        isProcessing = true;
        try {
            await callback();
        } catch (e) {
            console.error("Error in async button action:", e);
        } finally {
            isProcessing = false;
        }
    };
    this.node.off(Button.EventType.CLICK);
    this.node.on(Button.EventType.CLICK, handler);
};
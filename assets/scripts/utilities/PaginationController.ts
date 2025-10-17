import { _decorator, Component, Button, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PaginationController')
export class PaginationController extends Component {
    @property(Button) nextButton: Button = null!;
    @property(Button) prevButton: Button = null!;
    @property(Label) pageLabel: Label = null!;

    private currentPage: number = 1;
    private totalPages: number = 1;
    private onPageChangeCallback: (page: number) => void = null!;

    public init(onPageChange: (page: number) => void, totalPages: number, startPage: number = 1) {
        this.onPageChangeCallback = onPageChange;
        this.totalPages = totalPages;
        this.currentPage = startPage;

        this.updateButtons();
        this.updateLabel();

        this.nextButton.node.on(Button.EventType.CLICK, this.onNext, this);
        this.prevButton.node.on(Button.EventType.CLICK, this.onPrev, this);
    }

    private async onNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateButtons();
            this.updateLabel();
            this.onPageChangeCallback?.(this.currentPage);
        }
    }

    private async onPrev() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateButtons();
            this.updateLabel();
            this.onPageChangeCallback?.(this.currentPage);
        }
    }

    public setTotalPages(total: number) {
        this.totalPages = total;
        this.updateButtons();
        this.updateLabel();
    }

    private updateButtons() {
        this.prevButton.interactable = this.currentPage > 1;
        this.nextButton.interactable = this.currentPage < this.totalPages;
    }

    private updateLabel() {
        if (this.pageLabel) {
            this.pageLabel.string = ` ${this.currentPage}/${this.totalPages} `;
        }
    }

    public getCurrentPage() {
        return this.currentPage;
    }
}

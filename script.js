window.addEventListener("DOMContentLoaded",() => {
	const ig = new ImageGrid("#img_grid");
});

class ImageGrid {
	constructor(selector) {
		this.el = document.querySelector(selector);
		this.detailPaneOpen = true;
		this.currentImage = 0;
		this.images = 10;

		this.updateView();

		this.el?.addEventListener("click",this.action.bind(this));
		document.addEventListener("keydown",this.action.bind(this));
	}
	action(e) {
		const { key, shiftKey, target } = e;
		const action = target.getAttribute("data-action");
		const imageID = +target.getAttribute("data-id");

		if (key !== "Tab" && !shiftKey) {
			// open the pane (or close if clicking the thumb)
			if (!key && action === "open") {
				if (imageID === this.currentImage && this.detailPaneOpen)
					this.closeDetailPane();
				else
					this.openDetailPane(imageID);

			// close the pane
			} else if (key === "Escape" || action === "close") {
				this.closeDetailPane();

			// previous image
			} else if (key === "ArrowLeft" || (!key && action === "prev")) {
				this.prev();

			// next image
			} else if (key === "ArrowRight" || (!key && action === "next")) {
				this.next();
			}

			this.updateView();
			this.moveFocus(target,action);
		}
	}
	closeDetailPane() {
		this.detailPaneOpen = false;
	}
	openDetailPane(imageID) {
		this.detailPaneOpen = true;
		this.currentImage = imageID;
	}
	prev() {
		--this.currentImage;

		if (this.currentImage < 0)
			this.currentImage = 0;
	}
	next() {
		++this.currentImage;

		if (this.images < 2)
			this.currentImage = 0;
		else if (this.currentImage === this.images)
			this.currentImage = this.images - 1;
	}
	moveFocus(target,action) {
		const isPrev = action === "prev";
		const isNext = action === "next";

		if (isPrev || isNext) {
			if (target.disabled) {
				if (isPrev)
					this.el.querySelector(`[data-action="next"]`)?.focus();
				else if (isNext)
					this.el.querySelector(`[data-action="prev"]`)?.focus();
			} else {
				target.focus();
			}
		}
	}
	updateView() {
		// open or close the pane
		const dataID = this.currentImage;
		const detailPane = document.querySelector("[data-open]");
		detailPane?.setAttribute("data-open",this.detailPaneOpen ? "true" : "false");
		
		// change its DOM location
		const minWidths = [768,1024,1280];
		const matchedWidths = minWidths.filter(width => {
			const mediaQuery = window.matchMedia(`(min-width: ${width}px)`);
			return mediaQuery.matches;
		});
		const imagesPerRow = 2 + matchedWidths.length;
		const moveToRow = 1 + Math.ceil((dataID + 1) / imagesPerRow);
		detailPane.style.gridRow = moveToRow;

		const firstCellInRow = this.el.querySelector(`[data-id="${dataID}"]`);
		this.el.insertBefore(detailPane, firstCellInRow?.parentNode.nextSibling);

		// scroll to it
		if (this.detailPaneOpen) {
			const firstCellBtn = this.el.querySelector(`[data-id="0"]`);
			const firstCell = firstCellBtn?.parentElement;
			const { offsetHeight, offsetTop } = firstCell;
			const scrollY = detailPane.offsetTop - (offsetHeight + offsetTop * 2);

			window.scrollTo({
				top: scrollY,
				behavior: "smooth"
			});
		}

		const paneImage = this.el.querySelector(`[data-image]`);
		const paneThumbBtns = this.el.querySelectorAll(`[data-id]`);
		const paneThumbBtn = this.el.querySelector(`[data-id="${dataID}"]`);
		const paneThumb = paneThumbBtn?.querySelector(`[data-thumb]`);

		// “…active” class
		Array.from(paneThumbBtns).forEach((btn,i) => {
			const activeClass = "img-grid__cell-img-btn--active";

			if (i === dataID && this.detailPaneOpen)
				btn.classList.add(activeClass);
			else
				btn.classList.remove(activeClass);
		});
		
		// update the src
		if (paneImage && paneThumb)
			paneImage.src = paneThumb.src;

		// update the title
		const paneTitle = this.el.querySelector("[data-title]");
		if (paneTitle)
			paneTitle.textContent = `Random Image ${dataID + 1}`;

		// disable the left arrow if on the first image
		const prevButton = this.el.querySelector(`[data-action="prev"]`);
		if (prevButton)
			prevButton.disabled = dataID === 0;
		
		// disable the right arrow if on the last image
		const nextButton = this.el.querySelector(`[data-action="next"]`);
		if (nextButton)
			nextButton.disabled = this.images < 2 || dataID === this.images - 1;
	}
}
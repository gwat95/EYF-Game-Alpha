/*:
@author coffeenahc
@target MZ
@plugindesc
Commissioned work by coffeenahc for grantw95 (fiverr)
*/

//SCENE STOCK
function Scene_StockPrices() { 
    this.initialize(...arguments);
}

Scene_StockPrices.prototype = Object.create(Scene_Base.prototype);
Scene_StockPrices.prototype.constructor = Scene_StockPrices;

Scene_StockPrices.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this);
};

Scene_StockPrices.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createWindowLayer();
    this.createCancelButton();
    this.createWindowStockPrices();
};

Scene_StockPrices.prototype.createBackground = function () {
    this._backgroundFilter = new PIXI.filters.BlurFilter();
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this._backgroundSprite.filters = [this._backgroundFilter];
    this.addChild(this._backgroundSprite);
    this._backgroundSprite.opacity = 192;
};

Scene_StockPrices.prototype.createCancelButton = function () {
    this._cancelButton = new Sprite_Button("cancel");
    this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
    this._cancelButton.y = this.buttonY();
    this.addWindow(this._cancelButton);
};

Scene_StockPrices.prototype.createWindowStockPrices = function () {
    let rect = this.windowStockPricesRect();
    this._windowStockPrices = new Window_StockPrices(rect);
    this._windowStockPrices.setHandler("cancel", this.popScene.bind(this));
    rect.height = this.calcWindowHeight(2.4);
    rect.y = this.calcWindowHeight(1);
    this._windowEYFHeader = new Window_EYFHeader(rect);
    this._windowEYFHeader._label = "Stock Market";
    this.addChild(this._windowStockPrices);
    this.addChild(this._windowEYFHeader);
    this._windowStockPrices.refresh();
    this._windowEYFHeader.refresh();
};

Scene_StockPrices.prototype.windowStockPricesRect = function () {
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - this.calcWindowHeight(4);
    const wx = 5;
    const wy = this.calcWindowHeight(4);
    return new Rectangle(wx, wy, ww, wh);
};

//SCENE INDEX
function Scene_IndexFunds() {
    this.initialize(...arguments);
}

Scene_IndexFunds.prototype = Object.create(Scene_Base.prototype);
Scene_IndexFunds.prototype.constructor = Scene_IndexFunds;

Scene_IndexFunds.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this);
};

Scene_IndexFunds.prototype.terminate = function () {
    EYF._indexFundBeingViewed = null;
};

Scene_IndexFunds.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createWindowLayer();
    this.createCancelButton();
    this.createWindowStockPrices();
};

Scene_IndexFunds.prototype.createBackground = function () {
    this._backgroundFilter = new PIXI.filters.BlurFilter();
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this._backgroundSprite.filters = [this._backgroundFilter];
    this.addChild(this._backgroundSprite);
    this._backgroundSprite.opacity = 192;
};

Scene_IndexFunds.prototype.createCancelButton = function () {
    this._cancelButton = new Sprite_Button("cancel");
    this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
    this._cancelButton.y = this.buttonY();
    this.addWindow(this._cancelButton);
};

Scene_IndexFunds.prototype.createWindowStockPrices = function () {
    let rect = this.windowStockPricesRect();
    this._windowStockPrices = new Window_StockPrices(rect);
    this._windowStockPrices.setHandler("cancel", this.popScene.bind(this));
    this.addChild(this._windowStockPrices);
    this._windowStockPrices.refresh();

    rect.height = this.calcWindowHeight(2.4);
    rect.y = this.calcWindowHeight(1);
    this._windowEYFHeader = new Window_EYFHeader(rect);
    this._windowEYFHeader._label = EYF._indexFundBeingViewed.indexFundName;
    this.addChild(this._windowEYFHeader);
    this._windowEYFHeader.refresh();

    rect.y = this._windowStockPrices.y + this._windowStockPrices.height;
    rect.height = this.calcWindowHeight(1.5);
    this._windowStockPricesFooter = new Window_StockPricesFooter(rect);
    this.addChild(this._windowStockPricesFooter);
};

Scene_IndexFunds.prototype.windowStockPricesRect = function () {
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - this.calcWindowHeight(6);
    const wx = 5;
    const wy = this.calcWindowHeight(4);
    return new Rectangle(wx, wy, ww, wh);
};

//WINDOW STOCK PRICES HEADER
function Window_EYFHeader() {
    this.initialize(...arguments);
}

Window_EYFHeader.prototype = Object.create(Window_Selectable.prototype);
Window_EYFHeader.prototype.constructor = Window_EYFHeader;

Window_EYFHeader.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._label = "Stock Prices";
    this._shouldDrawSubHeader = true;
    this.refresh();
};

Window_EYFHeader.prototype.maxItems = function () {
    return 1;
};

Window_EYFHeader.prototype.drawItem = function (index) {
    let rect = this.itemRect(index);

    this.changeTextColor("#e5eb34");
    this.drawText(this._label, rect.x, rect.y, rect.width, "center");

    if (!this._shouldDrawSubHeader) return;
    this.changeTextColor(ColorManager.systemColor());
    this.drawText("Name", rect.x, rect.y+50, rect.width / 4, "center");
    this.drawText("Symbol", rect.x + rect.width / 4, rect.y+50, rect.width / 4, "center");
    this.drawText("Value", rect.x + (rect.width / 4) * 2, rect.y+50, rect.width / 4, "center");
    this.drawText("% Change", rect.x + (rect.width / 4) * 3, rect.y+50, rect.width / 4, "center");
};

function Window_EYFDialog() {
    this.initialize(...arguments);
}

Window_EYFDialog.prototype = Object.create(Window_Selectable.prototype);
Window_EYFDialog.prototype.constructor = Window_EYFDialog;

Window_EYFDialog.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._rect = rect;
    this.hide();
};

Window_EYFDialog.prototype.maxItems = function () {
    return 1;
};

Window_EYFDialog.prototype.itemRect = function (index) {
    const maxCols = this.maxCols();
    const itemWidth = this.itemWidth();
    const itemHeight = this.itemHeight();
    const colSpacing = this.colSpacing();
    const rowSpacing = this.rowSpacing();
    const col = index % maxCols;
    const row = Math.floor(index / maxCols);
    const x = col * itemWidth + colSpacing / 2 - this.scrollBaseX();
    const y = row * itemHeight + rowSpacing / 2 - this.scrollBaseY();
    const width = itemWidth - colSpacing;
    const height = itemHeight - rowSpacing;
    return new Rectangle(x, y + 60, width, height);
};

Window_EYFDialog.prototype.drawItem = function (index) {
    let rect = this.itemRect(index);
    this.drawText("Ok", rect.x, rect.y, rect.width, "center");
};

Window_EYFDialog.prototype.showText = function (text)  {
    let rect = this._rect;
    this.refresh();
    this.drawText(text, -10, 0, rect.width, "center");
    this.show();
    this.activate();
};

//WINDOW STOCK PRICES
function Window_StockPrices() {
    this.initialize(...arguments);
}

Window_StockPrices.prototype = Object.create(Window_Selectable.prototype);
Window_StockPrices.prototype.constructor = Window_StockPrices;

Window_StockPrices.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._data = [];
    if (EYF._indexFundBeingViewed) {
        EYF._indexFundBeingViewed.stocksArray.forEach(id => {
            this._data.push(EYF.getStocksById(parseInt(id)));
        });
    } else {
        this._data = EYF._stocks.slice(1);
    }
    this.refresh();
    this.activate();
};

Window_StockPrices.prototype.maxItems = function () {
    return this._data.length;
};

Window_StockPrices.prototype.drawItem = function (index) {
    this.changeTextColor(ColorManager.normalColor());
    let rect = this.itemRect(index);
    let item = this._data[index];
    this.drawText(item.stockName, rect.x, rect.y, rect.width / 4, "center");
    this.drawText(item.stockSymbol, rect.x + rect.width / 4, rect.y, rect.width / 4, "center");
    this.drawText(item.stockValue.toFixed(2), rect.x + (rect.width / 4) * 2, rect.y, rect.width / 4, "center");
    if (item.percentChange.includes("+")) {
        this.changeTextColor("#32a852");
    } else if (item.percentChange.includes("-")) {
        this.changeTextColor("#a83238");
    } else {
        this.changeTextColor(ColorManager.normalColor());
    }
    this.drawText(item.percentChange+"%", rect.x + (rect.width / 4) * 3, rect.y, rect.width / 4, "center");
};

Window_StockPrices.prototype.drawAllItems = function () {
    const topIndex = this.topIndex();
    for (let i = 0; i < this.maxVisibleItems(); i++) {
        const index = topIndex + i;
        if (index < this.maxItems()) {
            this.drawItemBackground(index);
            this.drawItem(index);
        }
    }
};

function Window_StockPricesFooter() {
    this.initialize(...arguments);
}

Window_StockPricesFooter.prototype = Object.create(Window_Selectable.prototype);
Window_StockPricesFooter.prototype.constructor = Window_StockPricesFooter;

Window_StockPricesFooter.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.refresh();
};

Window_StockPricesFooter.prototype.maxItems = function () {
    return 1;
};

Window_StockPricesFooter.prototype.drawItem = function (index) {
    let rect = this.itemRect(index);
    let indexFundHoldings = 0;
    let playerIF = EYF.getPlayerIndexFundById(EYF._indexFundBeingViewed.indexFundID);

    if (playerIF) {
        for (let i = 0; i < EYF._indexFundBeingViewed.stocksArray.length; i++) {
            indexFundHoldings += playerIF[i] * EYF.getStocksById(EYF._indexFundBeingViewed.stocksArray[i]).stockValue;
        }
    }

    this.changeTextColor(ColorManager.normalColor());
    this.drawText("Your holdings: ", rect.x+20, rect.y, rect.width, "left");
    this.changeTextColor("#e5eb34");
    this.drawText(indexFundHoldings.toFixed(2), rect.x-20, rect.y, rect.width, "right");
};
/*:
@author coffeenahc
@target MZ
@plugindesc
Commissioned work by coffeenahc for grantw95 (fiverr)

@param Real Estate Vocabulary
@type struct<RealEstateVocab>[]
@desc List of real estate vocab
*/

/*~struct~RealEstateVocab:
 *
 * @param word
 * @type string
 * @text Word
 *
 * @param desc
 * @type string
 * @text Description
 * 
 */

//SCENE REAL ESTATE
function Scene_RealEstate() {
    this.initialize(...arguments);
}

Scene_RealEstate.prototype = Object.create(Scene_Base.prototype);
Scene_RealEstate.prototype.constructor = Scene_RealEstate;

Scene_RealEstate.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this);
};

Scene_RealEstate.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createWindowLayer();
    this.createCancelButton();
    this.createWindowRealEstate();
};

Scene_RealEstate.prototype.createBackground = function () {
    this._backgroundFilter = new PIXI.filters.BlurFilter();
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this._backgroundSprite.filters = [this._backgroundFilter];
    this.addChild(this._backgroundSprite);
    this._backgroundSprite.opacity = 192;
};

Scene_RealEstate.prototype.createCancelButton = function () {
    this._cancelButton = new Sprite_Button("cancel");
    this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
    this._cancelButton.y = this.buttonY();
    this.addWindow(this._cancelButton);
};

Scene_RealEstate.prototype.createWindowRealEstate = function () {
    let rect = this.windowRealEstateRect();
    this._windowRealEstate = new Window_RealEstate(rect);
    this._windowRealEstate.setHandler("cancel", this.popScene.bind(this));
    this._windowRealEstate.setHandler("ok", this.checkDetails.bind(this));
    this.addChild(this._windowRealEstate);

    this._windowRealEstateDetails = new Window_RealEstateDetails(rect);
    this._windowRealEstateDetails.setHandler("cancel", this.popScene.bind(this));
    this._windowRealEstateDetails.setHandler("ok", this.onOkDetails.bind(this));
    this.addChild(this._windowRealEstateDetails);

    this._windowDialog = new Window_EYFDialog(this.dialogRect());
    this._windowDialog.setHandler("ok", this.closeDialog.bind(this));
    this.addChild(this._windowDialog);

    rect.height = this.calcWindowHeight(1.2);
    rect.y = this.calcWindowHeight(1);
    this._windowEYFHeader = new Window_EYFHeader(rect);
    this._windowEYFHeader._label = "Real Estate";
    this._windowEYFHeader._shouldDrawSubHeader = false;
    this.addChild(this._windowEYFHeader);
    this._windowEYFHeader.refresh();

    let vocabJson = JSON.parse(PluginManager.parameters("GBC_RealEstate")["Real Estate Vocabulary"]);
    this._vocab = [];
    for (const word of vocabJson) {
        let vocab = JSON.parse(word);
        this._vocab.push(vocab);
    }

    this._windowVocabulary = new Window_Vocabulary(this.windowVocabularyRect());
    this._windowVocabulary.setItems(this._vocab);
    this.addChild(this._windowVocabulary);
};

Scene_RealEstate.prototype.windowRealEstateRect = function () {
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - this.calcWindowHeight(3);
    const wx = 5;
    const wy = this.calcWindowHeight(3);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_RealEstate.prototype.dialogRect = function () {
    let rect = this.windowRealEstateRect();
    const wh = this.calcWindowHeight(3);
    return new Rectangle((rect.x+rect.width/4)-35, (rect.y+wh)+30, (rect.width/2) + 70, wh);
};

Scene_RealEstate.prototype.closeDialog = function () {
    this._windowDialog.hide();
    this._windowDialog.deactivate();
    this._windowRealEstate.activate();
};

Scene_RealEstate.prototype.popScene = function () {
    if (this._viewingDetails) {
        this._windowEYFHeader._label = "Real Estate";
        this._windowEYFHeader.refresh();
        this._windowRealEstate.show();
        this._windowRealEstate.activate();
        this._windowRealEstateDetails.hide();
        this._windowRealEstateDetails.deactivate();
        this._viewingDetails = false;
    } else {
        SceneManager.pop();
    }
};

Scene_RealEstate.prototype.checkDetails = function () {
    this._viewingDetails = true;
    let item = this._windowRealEstate.item();
    if (item.isOwned) {
        this._windowRealEstate.activate();
        return;
    }
    this._windowEYFHeader._label = "The bank has approved your application. You can buy this home!";
    this._windowEYFHeader.refresh();
    this._windowRealEstate.hide();
    this._windowRealEstate.deactivate();
    this._windowRealEstateDetails.setItem(item);
};

Scene_RealEstate.prototype.onOkDetails = function() {
    let index = this._windowRealEstateDetails._index;
    let item = this._windowRealEstateDetails._item;
    let totalCashout = (item.housePrice * .25) + (item.housePrice * .005) + (item.housePrice * .015) + (item.housePrice * .05);
    if (index == 0) {
        this.purchaseHome();
    } else if (index == 1) {
        if ($gameParty.hasGoal("Buy "+item.houseName)) {
            $gameParty.removeGoal("Buy "+item.houseName);
        } else {
            $gameParty.addGoal("Buy "+item.houseName, totalCashout, 0.05);
        }
        this._windowRealEstateDetails.refresh();
        this._windowRealEstateDetails.activate();
    } else {
        this._windowVocabulary._closeBtn.onClick = () => {
            this._windowVocabulary.close();
            this._windowRealEstateDetails.activate();
        };
        this._windowVocabulary.show();
        this._windowVocabulary.open();
    }
};
 
Scene_RealEstate.prototype.purchaseHome = function () {
    let item = this._windowRealEstateDetails._item;
    let totalCashout = (item.housePrice * .25) + (item.housePrice * .005) + (item.housePrice * .015) + (item.housePrice * .05);

    let currentCash = $gameParty.gold() + ($gameParty.hasGoal("Buy "+item.houseName) ? $gameParty.goalsAccount : 0);

    if (!(currentCash >= totalCashout)) {
        SoundManager.playBuzzer();
        this._windowRealEstate.refresh();
        this._windowRealEstate.show();
        this._windowRealEstateDetails.hide();
        this._windowRealEstateDetails.deactivate();
        this._windowEYFHeader._label = "Real Estate";
        this._windowEYFHeader.refresh();
        this._windowDialog.showText("Not enough balance");
        this._viewingDetails = false;
        return;
    }

    if ($gameParty.hasGoal("Buy "+item.houseName)) {
        $gameParty._gold += $gameParty.goalsAccount;
        $gameParty.goalsAccount = 0;
        $gameParty.removeGoal("BUY "+item.houseName);
    }

    let ammortization = (item.housePrice - (item.housePrice * .25)) / 48;

    item.ammortization = ammortization;
    item.balance = item.housePrice - (item.housePrice * .25);
    item.isOwned = true;
    EYFUI.addActivity("Purchased Real Estate: " +item.houseName, totalCashout, "outflow");
    $gameParty.loseMoney(totalCashout);
    $gameParty.consumeAction();
    $gameParty.consumeHp(10);
    SoundManager.playShop();
    this._windowRealEstate.refresh();
    this._windowRealEstate.show();
    this._windowRealEstateDetails.hide();
    this._windowRealEstateDetails.deactivate();
    this._windowEYFHeader._label = "Real Estate";
    this._windowEYFHeader.refresh();
    this._windowDialog.showText("Congratulations on your purchase");
    this._viewingDetails = false;
};

//WINDOW REAL ESTATE
function Window_RealEstate() {
    this.initialize(...arguments);
}

Window_RealEstate.prototype = Object.create(Window_Selectable.prototype);
Window_RealEstate.prototype.constructor = Window_RealEstate;

Window_RealEstate.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._data = EYF._realEstate.slice(1);
    this.refresh();
    this.activate();
};

Window_RealEstate.prototype.maxItems = function () {
    return this._data.length;
};

Window_RealEstate.prototype.itemHeight = function () {
    return 320;
};

Window_RealEstate.prototype.item = function () {
    return this._data[this._index];
}

Window_RealEstate.prototype.drawItem = function (index) {
    let rect = this.itemRect(index);
    let item = this._data[index];
    if (!item) return;
    console.log(item);
    this.drawIcon(item.houseName, rect.x, rect.y + 7);

    if (item.isOwned) {
        this.drawIcon(item.ownedPic, rect.x + 570, rect.y + 7);
    }

    this.contents.fontSize = 35;
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(item.houseName.toString(), rect.x + 310, rect.y+10, rect.width, "left");

    this.contents.fontSize = 20;
    this.changeTextColor(ColorManager.normalColor());
    this.drawText(item.houseDesc, rect.x + 310, rect.y + 40, rect.width);
    this.drawText("No. of bedrooms: " + item.houseBedrooms, rect.x + 310, rect.y + 80, rect.width, "left");
    this.drawText("No. of bathrooms: " + item.houseBathrooms, rect.x + 310, rect.y + 110, rect.width,"left");
    this.drawText("No. of car port: " + item.houseCarPort, rect.x + 310, rect.y + 140, rect.width, "left");

    this.contents.fontSize = 20;
    this.drawText("Days on market: " + item.daysOnMarket, rect.x + 310, rect.y + 240, rect.width, "left");
    this.changeTextColor("#f5b042");
    if (item.isOwned) {
        this.drawText("Market Value: " + "$" + item.housePrice, rect.x + 310, rect.y + 270, rect.width, "left");
        this.changeTextColor("#35de7b");
        this.drawText("House Equity: " + "$" + (item.housePrice - item.balance), rect.x, rect.y + 270, rect.width - 10, "right");
        this.changeTextColor("#eb4744");
        this.drawText("Mortgage: " + "$" + item.balance, rect.x, rect.y + 240, rect.width-10, "right");
    } else {
        this.drawText("Price: " + "$" + item.housePrice, rect.x + 310, rect.y + 270, rect.width, "left");
    }
};

Window_RealEstate.prototype.drawIcon = function (houseName, x, y) {
    const bitmap = ImageManager.loadBitmap("img/eyf/realestate/", houseName);
    const pw = 300;
    const ph = 300;
    const sx = 0;
    const sy = 0;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
};

//WINDOW REAL ESTATE DETAILS
function Window_RealEstateDetails() {
    this.initialize(...arguments);
}

Window_RealEstateDetails.prototype = Object.create(Window_Selectable.prototype);
Window_RealEstateDetails.prototype.constructor = Window_RealEstateDetails;

Window_RealEstateDetails.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._rect = rect;
    this.hide();
};

Window_RealEstateDetails.prototype.maxItems = function () {
    return 3;
};

Window_RealEstateDetails.prototype.setItem = function (item) {
    this._item = item;
    this.show();
    this.refresh();
    this.activate();
};

Window_RealEstateDetails.prototype.itemRect = function (index) {
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
    return new Rectangle(x, 400 + (index*50), width, height);
};

Window_RealEstateDetails.prototype.drawAllItems = function () {
    const topIndex = this.topIndex();
    for (let i = 0; i < this.maxVisibleItems(); i++) {
        const index = topIndex + i;
        if (index < this.maxItems()) {
            this.drawItemBackground(index);
            this.drawItem(index);
        }
    }
    this.drawDetails();
};

Window_RealEstateDetails.prototype.drawItem = function (index) {
    this.changeTextColor(ColorManager.normalColor());
    this.contents.fontSize = 25;
    let rect = this.itemRect(index);
    if (index == 0) {
        this.drawText("Purchase House", rect.x, rect.y, rect.width, "center");
    } else if (index == 1) {
        if ($gameParty.hasGoal("Buy "+this._item.houseName)) {
            this.drawText("Remove from goals (5% allocation)", rect.x, rect.y, rect.width, "center");
        } else {
            this.drawText("Add to goals (5% allocation)", rect.x, rect.y, rect.width, "center");
        }
    } else {
        this.drawText("Help (Terminologies)", rect.x, rect.y, rect.width, "center");
    }
};

Window_RealEstateDetails.prototype.drawDetails = function () {
    let rect = this._rect;
    let item = this._item;
    if (!item) return;

    this.contents.fontSize = 23;
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(item.houseName.toString(), rect.x + 10, rect.y - 50, rect.width, "left");
    this.changeTextColor(ColorManager.normalColor());
    this.drawText(item.houseDesc, rect.x + 10, rect.y - 20, rect.width);
    this.drawText("Price: " + item.housePrice, rect.x + 10, rect.y + 10, rect.width, "left");

    console.log(item.housePrice * .25);
    let ammortization = (item.housePrice - (item.housePrice * .25)) / 48;
    this.contents.fontSize = 20;
    this.drawText("Monthly amortization of $" + ammortization + ", payable w/in 48 months, at 0% interest!", rect.x + 10, rect.y + 60, rect.width, "left");
    this.contents.fontSize = 23;
    this.drawText("Downpayment of 25%: ", rect.x + 10, rect.y + 110, rect.width, "left");
    this.drawText("$" + (item.housePrice*.25), rect.x - 50, rect.y + 110, rect.width, "right");
    this.drawText("Transfer tax of 0.5% ", rect.x + 10, rect.y + 140, rect.width, "left");
    this.drawText("$" + (item.housePrice * .005), rect.x - 50, rect.y + 140, rect.width, "right");
    this.drawText("Documentary stamp tax (1.5%) ", rect.x + 10, rect.y + 170, rect.width, "left");
    this.drawText("$" + (item.housePrice * .015), rect.x - 50, rect.y + 170, rect.width, "right");
    this.drawText("Insurance ", rect.x + 10, rect.y + 200, rect.width, "left");
    this.drawText("$" + (item.housePrice * .05), rect.x - 50, rect.y + 200, rect.width, "right");

    let totalCashout = (item.housePrice * .25) + (item.housePrice * .005) + (item.housePrice * .015) + (item.housePrice * .05);

    this.drawText("Total Cashout ", rect.x + 10, rect.y + 260, rect.width, "left");
    this.drawText("$" + (totalCashout), rect.x - 50, rect.y + 260, rect.width, "right");
};
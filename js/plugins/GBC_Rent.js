/*:
@author coffeenahc
@target MZ
@plugindesc
Commissioned work by coffeenahc for grantw95 (fiverr)

@param Rent Vocabulary
@type struct<RentVocabulary>[]
@desc List of real estate vocab
*/

/*~struct~RentVocabulary:
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
function Scene_RentUnit() {
    this.initialize(...arguments);
}

Scene_RentUnit.prototype = Object.create(Scene_Base.prototype);
Scene_RentUnit.prototype.constructor = Scene_RentUnit;

Scene_RentUnit.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this);
};

Scene_RentUnit.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createWindowLayer();
    this.createCancelButton();
    this.createWindowRealEstate();
};

Scene_RentUnit.prototype.createBackground = function () {
    this._backgroundFilter = new PIXI.filters.BlurFilter();
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this._backgroundSprite.filters = [this._backgroundFilter];
    this.addChild(this._backgroundSprite);
    this._backgroundSprite.opacity = 192;
};

Scene_RentUnit.prototype.createCancelButton = function () {
    this._cancelButton = new Sprite_Button("cancel");
    this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
    this._cancelButton.y = this.buttonY();
    this.addWindow(this._cancelButton);
};

Scene_RentUnit.prototype.createWindowRealEstate = function () {
    let rect = this.windowRealEstateRect();
    this._windowRentUnit = new Window_RentUnit(rect);
    this._windowRentUnit.setHandler("cancel", this.popScene.bind(this));
    this._windowRentUnit.setHandler("ok", this.checkDetails.bind(this));
    this.addChild(this._windowRentUnit);

    this._windowRentUnitDetails = new Window_RentUnitDetails(rect);
    this._windowRentUnitDetails.setHandler("cancel", this.popScene.bind(this));
    this._windowRentUnitDetails.setHandler("ok", this.onRentDetailsOk.bind(this));
    this.addChild(this._windowRentUnitDetails);

    this._windowDialog = new Window_EYFDialog(this.dialogRect());
    this._windowDialog.setHandler("ok", this.closeDialog.bind(this));
    this.addChild(this._windowDialog);

    rect.height = this.calcWindowHeight(1.2);
    rect.y = this.calcWindowHeight(1);
    this._windowEYFHeader = new Window_EYFHeader(rect);
    this._windowEYFHeader._label = "Units for Rent";
    this._windowEYFHeader._shouldDrawSubHeader = false;
    this.addChild(this._windowEYFHeader);
    this._windowEYFHeader.refresh();

    let vocabJson = JSON.parse(PluginManager.parameters("GBC_Rent")["Rent Vocabulary"]);
    this._vocab = [];
    for (const word of vocabJson) {
        let vocab = JSON.parse(word);
        this._vocab.push(vocab);
    }

    this._windowVocabulary = new Window_Vocabulary(this.windowVocabularyRect());
    this._windowVocabulary.setItems(this._vocab)
    this.addChild(this._windowVocabulary);
};

Scene_RentUnit.prototype.windowRealEstateRect = function () {
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - this.calcWindowHeight(3);
    const wx = 5;
    const wy = this.calcWindowHeight(3);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_RentUnit.prototype.dialogRect = function () {
    let rect = this.windowRealEstateRect();
    const wh = this.calcWindowHeight(3);
    return new Rectangle((rect.x+rect.width/4)-35, (rect.y+wh)+30, (rect.width/2) + 70, wh);
};

Scene_RentUnit.prototype.closeDialog = function () {
    this._windowDialog.hide();
    this._windowDialog.deactivate();
    this._windowRentUnit.activate();
};

Scene_RentUnit.prototype.popScene = function () {
    if (this._viewingDetails) {
        this._windowEYFHeader._label = "Rent Unit";
        this._windowEYFHeader.refresh();
        this._windowRentUnit.show();
        this._windowRentUnit.activate();
        this._windowRentUnitDetails.hide();
        this._windowRentUnitDetails.deactivate();
        this._viewingDetails = false;
    } else {
        SceneManager.pop();
    }
};

Scene_RentUnit.prototype.checkDetails = function () {
    this._viewingDetails = true;
    let item = this._windowRentUnit.item();

    if ($gameParty.houseRented != null) {
        if ($gameParty.houseRented.houseID != item.houseID) {
            this._windowDialog.showText("Terminate previous rented unit first!");
            return;
        }
    }

    this._windowEYFHeader._label = "Rent Contract";
    this._windowEYFHeader.refresh();
    this._windowRentUnit.hide();
    this._windowRentUnit.deactivate();
    this._windowRentUnitDetails.setItem(item);
};

Scene_RentUnit.prototype.onRentDetailsOk = function() {
    let index = this._windowRentUnitDetails._index;
    if (index == 0) this.rentHome();
    else {
        this._windowVocabulary._closeBtn.onClick = () => {
            this._windowVocabulary.close();
            this._windowRentUnitDetails.activate();
        };
        this._windowVocabulary.show();
        this._windowVocabulary.open();
    }
};

Scene_RentUnit.prototype.rentHome = function () {
    let item = this._windowRentUnitDetails._item;

    if (item.isRented) {
        let totalCashout = (item.rentCost * .5) + item.electricityCost + item.waterCost;
        if (!($gameParty.gold() >= totalCashout)) {
            SoundManager.playBuzzer();
            this._windowRentUnit.refresh();
            this._windowRentUnit.show();
            this._windowRentUnitDetails.hide();
            this._windowRentUnitDetails.deactivate();
            this._windowEYFHeader._label = "Rent Unit";
            this._windowEYFHeader.refresh();
            this._windowDialog.showText("Not enough balance");
            this._viewingDetails = false;
            return;
        }
        item.isRented = false;
        $gameParty.loseMoney(totalCashout);
        $gameParty.consumeAction();
        $gameParty.consumeHp(10);
        EYFUI.addActivity("Signed Rent Contract", totalCashout, "outflow");
        this.removeEffects($gameParty.houseRented.rentEffects);
        $gameParty.houseRented = null;
        console.log(EYF._rentUnit);

        SoundManager.playShop();
        this._windowRentUnit.refresh();
        this._windowRentUnit.show();
        this._windowRentUnitDetails.hide();
        this._windowRentUnitDetails.deactivate();
        this._windowEYFHeader._label = "Rent Unit";
        this._windowEYFHeader.refresh();
        this._windowDialog.showText("Rent contract terminated!");
        this._viewingDetails = false;
    } else {
        let totalCashout = (item.rentCost * 2) + (item.rentCost * .02);
        if (!($gameParty.gold() >= totalCashout)) {
            SoundManager.playBuzzer();
            this._windowRentUnit.refresh();
            this._windowRentUnit.show();
            this._windowRentUnitDetails.hide();
            this._windowRentUnitDetails.deactivate();
            this._windowEYFHeader._label = "Rent Unit";
            this._windowEYFHeader.refresh();
            this._windowDialog.showText("Not enough balance");
            this._viewingDetails = false;
            return;
        }

        item.isRented = true;
        $gameParty.loseMoney(totalCashout);
        $gameParty.consumeAction();
        $gameParty.consumeHp(10);
        EYFUI.addActivity("Terminated Rent Contract", totalCashout, "outflow");
        $gameParty.houseRented = {
            houseID: item.houseID,
            rentEffects: item.houseDesc,
            daysUntilRentPayment: 15,
            daysUntilTermination: 365,
            houseRef: item
        };
        this.applyEffects($gameParty.houseRented.rentEffects);
        console.log(EYF._rentUnit);

        SoundManager.playShop();
        this._windowRentUnit.refresh();
        this._windowRentUnit.show();
        this._windowRentUnitDetails.hide();
        this._windowRentUnitDetails.deactivate();
        this._windowEYFHeader._label = "Rent Unit";
        this._windowEYFHeader.refresh();
        this._windowDialog.showText("Rent contract signed!");
        this._viewingDetails = false;
    }
};

Scene_RentUnit.prototype.showRentTerminologies = function() {

};

Scene_RentUnit.prototype.applyEffects = function(effects) {
    let arr = effects.split(", ");
    console.log($gameParty.leader());
    arr.forEach(element => {
        let digit = element.substring("+", element.indexOf(" "));
        if (element.includes("ACTION")) {
            $gameParty.maxActions += parseInt(digit);
        } else if (element.includes("MAX HEALTH")) {
            $gameParty.mhp += parseInt(digit);
        }
    });
    console.log($gameParty.leader());
};

Scene_RentUnit.prototype.removeEffects = function(effects) {
    let arr = effects.split(", ");
    arr.forEach(element => {
        let digit = element.substring("+", element.indexOf(" "));
        if (element.includes("ACTION")) {
            $gameParty.maxActions -= parseInt(digit);
        } else if (element.includes("MAX HEALTH")) {
            $gameParty.mhp -= parseInt(digit);
            if ($gameParty.hp > $gameParty.mhp) {
                $gameParty.hp = $gameParty.mhp;
            }
        }
    });
};

//WINDOW REAL ESTATE
function Window_RentUnit() {
    this.initialize(...arguments);
}

Window_RentUnit.prototype = Object.create(Window_Selectable.prototype);
Window_RentUnit.prototype.constructor = Window_RentUnit;

Window_RentUnit.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._data = EYF._rentUnit.slice(1);
    this.refresh();
    this.activate();
};

Window_RentUnit.prototype.maxItems = function () {
    return this._data.length;
};

Window_RentUnit.prototype.itemHeight = function () {
    return 320;
};

Window_RentUnit.prototype.item = function () {
    return this._data[this._index];
}

Window_RentUnit.prototype.drawItem = function (index) {
    let rect = this.itemRect(index);
    let item = this._data[index];
    if (!item) return;

    this.drawIcon(item.housePic, rect.x, rect.y + 7);

    if (item.isRented) {
        this.drawIcon(item.rentedPic, rect.x + 570, rect.y + 7);
    }

    this.contents.fontSize = 35;
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(item.houseName.toString(), rect.x + 310, rect.y+10, rect.width, "left");

    this.contents.fontSize = 20;
    this.changeTextColor(ColorManager.normalColor());
    this.drawText(item.houseDesc, rect.x + 310, rect.y + 40, rect.width);
    this.drawText("Electricity Cost: " + item.electricityCost, rect.x + 310, rect.y + 80, rect.width, "left");
    this.drawText("Water Cost: " + item.waterCost, rect.x + 310, rect.y + 110, rect.width,"left");

    this.contents.fontSize = 20;
    if (item.isRented) {
        this.drawText("Days until next rent contract ends: " + $gameParty.houseRented.daysUntilTermination, rect.x + 310, rect.y + 215, rect.width, "left");
        this.drawText("Days until next rent payment: " + $gameParty.houseRented.daysUntilRentPayment, rect.x + 310, rect.y + 240, rect.width, "left");
    }
    this.changeTextColor("#f5b042");
    this.drawText("Monthly Rent: " + `$ ` + item.rentCost , rect.x + 310, rect.y + 270, rect.width, "left");
};

Window_RentUnit.prototype.drawIcon = function (housePic, x, y) {
    const bitmap = housePic
    const pw = 300;
    const ph = 300;
    const sx = 0;
    const sy = 0;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
};

//WINDOW REAL ESTATE DETAILS
function Window_RentUnitDetails() {
    this.initialize(...arguments);
}

Window_RentUnitDetails.prototype = Object.create(Window_Selectable.prototype);
Window_RentUnitDetails.prototype.constructor = Window_RentUnitDetails;

Window_RentUnitDetails.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._rect = rect;
    this.hide();
};

Window_RentUnitDetails.prototype.maxItems = function () {
    return 2;
};

Window_RentUnitDetails.prototype.setItem = function (item) {
    this._item = item;
    this.show();
    this.refresh();
    this.activate();
};

Window_RentUnitDetails.prototype.itemRect = function (index) {
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
    return new Rectangle(x, 455 + (index*50), width, height);
};

Window_RentUnitDetails.prototype.drawAllItems = function () {
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

Window_RentUnitDetails.prototype.drawItem = function (index) {
    this.changeTextColor(ColorManager.normalColor());
    this.contents.fontSize = 25;
    let rect = this.itemRect(index);
    if (index == 0) {
        if (this._item.isRented) {
            this.drawText("Terminate Contract", rect.x, rect.y, rect.width, "center");
        } else {
            this.drawText("Rent House", rect.x, rect.y, rect.width, "center");
        }
    } else {
        this.drawText("Help (Vocabulary)", rect.x, rect.y, rect.width, "center");
    }
};

Window_RentUnitDetails.prototype.drawDetails = function () {
    let rect = this._rect;
    let item = this._item;
    if (!item) return;

    this.contents.fontSize = 23;
    this.drawText("Rent Contract (1 YEAR LEASE)", rect.x + 10, rect.y - 50, rect.width, "center");
    this.changeTextColor(this.systemColor());
    this.drawText("Unit Name: ", rect.x + 10, rect.y + 10, rect.width, "left");
    this.drawText("Unit Effects: ", rect.x + 10, rect.y + 35, rect.width, "left");
    this.drawText("Monthly Rent (30 days): ", rect.x + 10, rect.y + 60, rect.width, "left");
    this.drawText("Monthly utility bills: ", rect.x + 10, rect.y + 85, rect.width, "left");
    this.changeTextColor(ColorManager.normalColor());
    this.drawText(item.houseName.toString(), rect.x, rect.y + 10, rect.width - 50, "right");
    this.drawText(item.houseDesc, rect.x, rect.y + 35, rect.width - 50, "right");
    this.drawText("$ " + item.rentCost , rect.x + 10, rect.y + 60, rect.width - 50, "right");
    let utilityBill = (item.electricityCost + item.waterCost);
    this.drawText("$ " + utilityBill , rect.x + 10, rect.y + 85, rect.width - 50, "right");
    this.contents.fontSize = 23;
    this.drawRect(rect.x + 10, rect.y + 125, rect.width - 50, 2);

    let yPos = rect.y + 20;
    if (item.isRented) {
        this.drawText("Electric Bill ", rect.x + 10, yPos + 110, rect.width, "left");
        this.drawText("$ " + (item.electricityCost), rect.x + 10, yPos + 110, rect.width - 50, "right");
        this.drawText("Water Bill", rect.x + 10, yPos + 140, rect.width, "left");
        this.drawText("$ " + (item.waterCost), rect.x + 10, yPos + 140, rect.width - 50, "right");
        this.drawText("Termination Fee", rect.x + 10, yPos + 200, rect.width, "left");
        this.drawText("$ " + (item.rentCost * .5), rect.x + 10, yPos + 200, rect.width - 50, "right");
        let totalCashout = (item.rentCost * .5) + item.electricityCost + item.waterCost;
        this.drawText("Total Termination Penalty ", rect.x + 10, yPos + 260, rect.width, "left");
        this.drawText("$ " + (totalCashout), rect.x + 10, yPos + 260, rect.width - 50, "right");
    } else {
        this.drawText("First Months Rent ", rect.x + 10, yPos + 110, rect.width, "left");
        this.drawText("$ " + (item.rentCost*1), rect.x + 10, yPos + 110, rect.width - 50, "right");
        this.drawText("Last Months Rent ", rect.x + 10, yPos + 140, rect.width, "left");
        this.drawText("$ " + (item.rentCost*1), rect.x + 10, yPos + 140, rect.width - 50, "right");
        this.drawText("Deposit ", rect.x + 10, yPos + 170, rect.width, "left");
        this.drawText("$ " + (item.rentCost * .10), rect.x + 10, yPos + 170, rect.width - 50, "right");
        this.drawText("Misc Charges ", rect.x + 10, yPos + 200, rect.width, "left");
        this.drawText("$ " + (item.rentCost * .01), rect.x + 10, yPos + 200, rect.width - 50, "right");
        let totalCashout = (item.rentCost * 2) + (item.rentCost * .02);
        this.drawText("Initial Cashout ", rect.x + 10, yPos + 260, rect.width, "left");
        this.drawText("$ " + (totalCashout), rect.x + 10, yPos + 260, rect.width - 50, "right");
    }
    this.drawRect(rect.x + 10, yPos + 300, rect.width - 50, 2);
    this.drawText("Tenant: " + $gameParty.leader().name(), rect.x + 10, yPos + 315, rect.width - 50, "left");
    this.drawText("Landlord: Prosperity Homes", rect.x + 10, yPos + 315, rect.width - 50, "right");
};

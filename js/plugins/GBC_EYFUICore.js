/*
@author coffeenahc

@target MZ
@plugindesc
Commissioned work by coffeenahc for grantw95 (fiverr)
*/

let GBCInput = {};

EYFUI = function() {}
EYFUI.DAY = 1;
EYFUI.NIGHT = 2;
EYFUI.shouldBlur = false;
EYFUI.allowMovement = true;
EYFUI.uiVisible = true;
EYFUI.fastTravelVisible = true;
EYFUI.time = 1;
EYFUI.cart = [];
EYFUI.cartUpdated = false;

EYFUI.blur = function() {
    this.shouldBlur = true;
};

EYFUI.unblur = function() {
    this.shouldBlur = false;
};

EYFUI.lockMove = function() {
    this.allowMovement = false;
};

EYFUI.unlockMove = function() {
    this.allowMovement = true;
};

EYFUI.hideUI = function() {
    this.uiVisible = false;
};

EYFUI.showUI = function() {
    this.uiVisible = true;
};

EYFUI.hideFastTravel = function() {
    this.fastTravelVisible = false;
};

EYFUI.showFastTravel = function() {
    this.fastTravelVisible = true;
}

EYFUI.toggleDay = function() {
    this.time = this.DAY;
};

EYFUI.toggleNight = function() {
    this.time = this.NIGHT;
};

EYFUI.addToCart = function(item) {
    this.cart.push(item);
    this.cartUpdated = true;
};

EYFUI.removeFromCart = function(index) {
    this.cart.splice(index, 1);
    this.cartUpdated = true;
};

EYFUI.cartItemQty = function(itemId) {
    let qty = 0;
    this.cart.forEach(item => {
        if (item.id == itemId) qty++;
    });
    return qty;
};

EYFUI.cartTotal = function() {
    let i = 0;
    this.cart.forEach(item => {
        i += item.price;
    });
    return i;
};

EYFUI.addActivity = function(name, amount, type) {
    let activity = {
        name: name,
        amount: amount,
        type: type
    }
    $gameParty.dayActivities.push(activity);
};

EYFUI.cashoutCart = function(name) {
    let totalCost = this.cartTotal();
    if ($gameParty.gold() >= totalCost) {
        $gameParty.loseGold(totalCost);
        $gameParty.consumeAction();
        $gameParty.consumeHp(10);

        this.cart.forEach(item => {
            $gameParty.gainItem(item, 1);
        });

        this.cart = [];
        this.cartUpdated = true;
        this.addActivity(name ? name : "Shopping", totalCost, "outflow");
    }
};

Game_Party.prototype.gainGold = function(amount) {
    this._gold = (this._gold + amount).clamp(0, this.maxGold());
    
    if (!this.goalsAccount) this.goalsAccount = 0;
    if (!this.goals) this.goals = [];
    if (this.goals.length > 0) {
        let totalGoalAllocation = 0;
        this.goals.forEach(goal => {
            totalGoalAllocation += goal.allocation;
        });
        console.log(totalGoalAllocation);
        this._gold = this._gold - (amount*totalGoalAllocation).clamp(0, amount);
        this.goalsAccount += (amount*totalGoalAllocation).clamp(0, amount);
    }
    EYFUI.goldUpdated = true;
};

Game_Party.prototype.loseGold = function(amount) {
    this.gainGold(-amount);
};

Game_Player.prototype.canMove = function() {
    if ($gameMap.isEventRunning() || $gameMessage.isBusy() || $gamePlayer.isShopping || $dataMap.meta.fastTravel) {
        return false;
    }
    if (this.isMoveRouteForcing() || this.areFollowersGathering()) {
        return false;
    }
    if (this._vehicleGettingOn || this._vehicleGettingOff) {
        return false;
    }
    if (this.isInVehicle() && !this.vehicle().canMove()) {
        return false;
    }
    return true;
};

let EYFUI_scenemap_onmaptouch = Scene_Map.prototype.onMapTouch;
Scene_Map.prototype.onMapTouch = function() {
    if (!EYFUI.allowMovement || $dataMap.meta.fastTravel || this._windowVocabulary.active) return;
    if ($dataMap.meta.shopping) {
        let right = this.cartWindowHeaderRect().x + this.cartWindowHeaderRect().width;
        let bottom = this.cartListWindowRect().y + this.cartWindowHeaderRect().height;
        let x = this.cartWindowHeaderRect().x;
        let y = this.cartWindowHeaderRect().y;
        if (TouchInput.x > x && TouchInput.x < right && TouchInput.y > y && TouchInput.y < bottom) return;
    }
    EYFUI_scenemap_onmaptouch.call(this);
};

Spriteset_Base.prototype.createBaseFilters = function() {
    this._baseSprite.filters = [];
    this._baseColorFilter = new ColorFilter();
    this._blurFilter = new PIXI.filters.BlurFilter();
    this._blurFilter.blur = 0;
    this._baseSprite.filters.push(this._baseColorFilter, this._blurFilter);
};

let EYFUI_spritesetmap_update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function() {
    EYFUI_spritesetmap_update.call(this);
    if (EYFUI.shouldBlur && this._blurFilter.blur < 4) {
        this._blurFilter.blur++;
    } else if (!EYFUI.shouldBlur && this._blurFilter.blur > 0) {
        this._blurFilter.blur--;
    }
};

let EYFUI_scenemap_initialize = Scene_Map.prototype.initialize;
Scene_Map.prototype.initialize = function() {
    EYFUI_scenemap_initialize.call(this);
    $gamePlayer.isShopping = false;
};


let EYFUI_scenemap_createdisplayobjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
    EYFUI_scenemap_createdisplayobjects.call(this);
    this.createEYFUIWindow();
    this.createVocabularyWindow();
    console.log($dataMap);
    if ($dataMap.meta.shopping) {
        this.createCartWindowHeader();
        this.createCartListWindow();
        this.createGroceryItemDetailWindow();
        this.createGroceryItemWindow();
    }
    if ($dataMap.meta.summary) {
        this.createSummaryWindow();
        this.createSummaryHeader();
        this.createSummaryFooter();
    }
    if ($dataMap.meta.fastTravel) {
        this._pinSprite = new Sprite();
        this._pinSprite.bitmap = ImageManager.loadSystem("PIN");
        this.addChild(this._pinSprite);
        this.createLocationDetailsWindow();
        this.createFastTravelWindow();
    }
    document.onkeydown = function(e) {
        if (e.key === "x" || e.key === "X") {
            GBCInput.calledClose = true;
        }
    }
    this.createArrowDestination();
};

let EYFUI_scenemap_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    EYFUI_scenemap_update.call(this);
    this._eyfUI.visible = EYFUI.uiVisible;
    if (this._fastTravelWindow) {
        this._fastTravelWindow.visible = EYFUI.fastTravelVisible;
        this._locationDetailsWindow.visible = EYFUI.fastTravelVisible && !$gameMessage.isBusy();
        this._fastTravelWindow.active = !$gameMessage.isBusy();
        this._pinSprite.visible = EYFUI.fastTravelVisible && !$gameMessage.isBusy();
    } 
    if ($gameMessage.isBusy()) {
        if (this._cartList) {
            this._cartList.deactivate();
        }
    }
    if (GBCInput.calledClose) {
        if (this._windowVocabulary.active) this._windowVocabulary.close();
        else if (this._groceryItemWindow && this._groceryItemWindow.active) {
            SoundManager.playCancel();
            this.closeGroceryListWindow();
        }
        GBCInput.calledClose = false;
    }
    if (EYF.playerDestination && this._arrowDestSprite && $dataMap.meta.worldMap) {
        let pinX = Math.round(((EYF.playerDestination.x + 16) / 48) / 0.25) * 48;
        let pinY = Math.round(((EYF.playerDestination.y + 16) / 48) / 0.25) * 48;
        let playerX = $gamePlayer.x * 48;
        let playerY = $gamePlayer.y * 48;
        let distanceX = playerX - pinX;
        let distanceY = playerY - pinY;
        
        let angle = Math.atan2(distanceX, distanceY) * (180 / Math.PI);
        angle = 0 - angle;
        let rotation = angle * (Math.PI / 180);
        this._arrowDestSprite.rotation = rotation;
        let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
        this._distanceLbl.text = distance.toFixed(2)+"m";
        this._arrowDestSprite.visible = true;
        this._distanceLbl.visible = true;
        this._arrowDestSprite.x = ($gamePlayer.screenX()) + 24;
        this._arrowDestSprite.y = ($gamePlayer.screenY()) + 10;
        this._distanceLbl.x = this._arrowDestSprite.x-50;
        this._distanceLbl.y = this._arrowDestSprite.y;
    } else {
        this._arrowDestSprite.visible = false;
        this._distanceLbl.visible = false;
    }
};

Scene_Map.prototype.createVocabularyWindow = function() {
    this._windowVocabulary = new Window_Vocabulary(this.windowVocabularyRect());
    this.addChild(this._windowVocabulary);
};

Scene_Map.prototype.showVocabulary = function(vocabListIndex) {
    let vocabJson = JSON.parse(PluginManager.parameters("GBC_Vocabulary")["Vocabulary "+vocabListIndex]);
    let _vocab = [];
    for (const word of vocabJson) {
        let vocab = JSON.parse(word);
        _vocab.push(vocab);
    }

    this._windowVocabulary.setItems(_vocab);
    this._windowVocabulary._closeBtn.onClick = () => {
        this._windowVocabulary.close();
    };
    this._windowVocabulary.show();
    this._windowVocabulary.open();
};

Scene_Map.prototype.createEYFUIWindow = function() {
    this._eyfUI = new Window_EYFUI(this.EYFUIRect());
    this.addChild(this._eyfUI);
};

Scene_Map.prototype.createArrowDestination = function() {
    this._arrowDestSprite = new Sprite(ImageManager.loadSystem("arrow"));
    this._arrowDestSprite.x = ($gamePlayer.screenX() + 48) + 10;
    this._arrowDestSprite.y = ($gamePlayer.screenY() + 48) + 10;
    this._arrowDestSprite.anchor.set(0.5);

    this._distanceLbl = new PIXI.Text("00.00m", {
        fontSize: 14,
        fill: "white",
        strokeThickness: 2,
        fontWeight: "bold",
        align: "center"
    });
    this._distanceLbl.anchor.set(0.5);
    this._distanceLbl.x = this._arrowDestSprite.x-50;
    this._distanceLbl.y = this._arrowDestSprite.y;
    this.addChild(this._arrowDestSprite);
    this.addChild(this._distanceLbl);
};

Scene_Map.prototype.createFastTravelWindow = function() {
    this._fastTravelWindow = new Window_FastTravel(this.windowFastTravelRect());
    this._fastTravelWindow.setHandler("ok", this.onFastTravelOk.bind(this));
    this._fastTravelWindow.setLocationDetailsWindow(this._locationDetailsWindow);
    this._fastTravelWindow.setPinSprite(this._pinSprite);
    this._fastTravelWindow.select(0);
    this.addChild (this._fastTravelWindow);
};

Scene_Map.prototype.windowFastTravelRect = function() {
    const ww = Graphics.boxWidth / 2;
    const wh = this.calcWindowHeight(1, true);
    const wx = Graphics.boxWidth /2 - ww/2;
    const wy = 20;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Map.prototype.onFastTravelOk = function() {
    let item = this._fastTravelWindow.item();
    let event = $gameMap.event(item.event);
    if (event) {
        $gameMap._interpreter.setup(event.list(), event.eventId());
    }
};

Scene_Map.prototype.createLocationDetailsWindow = function() {
    this._locationDetailsWindow = new Window_LocationDetails(this.windowLocationDetailsRect());
    this.addChild (this._locationDetailsWindow);
};

Scene_Map.prototype.windowLocationDetailsRect = function() {
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, false) + 8;
    const wx = 5;
    const wy = Graphics.boxHeight-wh;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Map.prototype.openGroceryListWindow = function(list) {
    $gamePlayer.isShopping = true;
    if (this._catalogCloseBtn) {
        this._catalogCloseBtn.opacity = 255;
    } else {
        this._catalogCloseBtn = new Sprite_Clickable();
        this._catalogCloseBtn.bitmap = ImageManager.loadSystem("CLOSE");
        this._catalogCloseBtn.x = 745;
        this._catalogCloseBtn.y = 90;
        this._catalogCloseBtn.onClick = () => {
            this.closeGroceryListWindow();
            SoundManager.playCancel();
        };
        this.addChild(this._catalogCloseBtn);
    }
    this._groceryItemWindow.setItems(list);
    this._groceryItemWindow.open();
    this._groceryItemDetailWindow.open();
    this._cartList.select(-1);
    this._cartList.deactivate();
    this._cartList.visible = true;
};

Scene_Map.prototype.closeGroceryListWindow = function() {
    this._catalogCloseBtn.opacity = 0;
    $gamePlayer.isShopping = false;
    this._groceryItemWindow.setItems(null);
    this._groceryItemWindow.close();
    this._groceryItemDetailWindow.close();
    this._cartList.hide();
    this._cartList.deactivate();
};

Scene_Map.prototype.createSummaryWindow = function() {
    this._summaryWindow = new Window_Summary(this.summaryWindowRect());
    this._summaryWindow.setItems($gameParty.dayActivities);
    this.addChild(this._summaryWindow);
};

Scene_Map.prototype.summaryWindowRect = function() {
    const ww = (Graphics.boxWidth / 3) + 150;
    const wh = this.calcWindowHeight(5, false) + 8;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = ((Graphics.boxHeight - wh) / 2) - 30;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Map.prototype.createSummaryHeader = function() {
    this._summaryHeader = new Window_SummaryHeader(this.summaryHeaderRect());
    this.addChild(this._summaryHeader);
};

Scene_Map.prototype.summaryHeaderRect = function() {
    const ww = (Graphics.boxWidth / 3) + 150;
    const wh = this.calcWindowHeight(1, false);
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = ((Graphics.boxHeight - wh) / 2) - 170;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Map.prototype.createSummaryFooter = function() {
    this._summaryFooter = new Window_SummaryFooter(this.summaryFooterRect());
    this._summaryFooter.setHandler("ok", this.onSummaryOk.bind(this));
    this._summaryFooter.setSummaryWindow(this._summaryWindow);
    this.addChild(this._summaryFooter);
};

Scene_Map.prototype.summaryFooterRect = function() {
    const ww = (Graphics.boxWidth / 3) + 150;
    const wh = this.calcWindowHeight(3, false) + 24;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = this._summaryWindow.y + this._summaryWindow.height + 5;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Map.prototype.onSummaryOk = function() {
    let i = this._summaryFooter._index;
    if (i == 0) {
        if (this._summaryWindow._mode == "END") {
            SoundManager.playBuzzer();
            this._summaryFooter.activate();
            return;
        }
        this._summaryWindow.toggleSummaryMode();
        this._summaryFooter.activate();
    } else if (i == 1) {
        SceneManager.push(Scene_EYFMenu);
    } else {
        $gameTemp.reserveCommonEvent(2);
    }
};

Scene_Map.prototype.EYFUIRect = function() {
    const wx = 832;
    const wy = 15;
    const ww = 248;
    const wh = 200;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Map.prototype.createCartWindowHeader = function() {
    this._cartHeaderUI = new Window_CartHeader(this.cartWindowHeaderRect());
    this._cartHeaderUI.setParentScene(this);
    this.addChild(this._cartHeaderUI);
};

Scene_Map.prototype.cartWindowHeaderRect = function() {
    const wx = 10;
    const wy = 25;
    const ww = 248;
    const wh = 200;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Map.prototype.createCartListWindow = function() {
    this._cartList = new Window_CartList(this.cartListWindowRect());
    this._cartList.setHandler("ok", this.removeFromCart.bind(this));
    this._cartList.setHeader(this._cartHeaderUI);
    this.addChild(this._cartList);
};

Scene_Map.prototype.cartListWindowRect = function() {
    const wx = 10;
    const wy = 83;
    const ww = 240;
    const wh = 350;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Map.prototype.toggleCartList = function() {
    if (!this._cartList.visible) {
        this._cartList.show();
        this._cartList.activate();
        this._cartList.select(0);
    } else {
        this._cartList.hide();
        this._cartList.deactivate();
    } 
};

Scene_Map.prototype.createGroceryItemWindow = function() {
    const rect = this.groceryItemWindowRect();
    this._groceryItemWindow = new Window_GroceryItem(rect);
    this._groceryItemWindow.setParentScene(this);
    this._groceryItemWindow.setItemDetailWindow(this._groceryItemDetailWindow);
    this._groceryItemWindow.setHandler("ok", this.addToCart.bind(this));
    this._groceryItemWindow.setHandler("cancel", this.closeGroceryListWindow.bind(this));
    this.addWindow(this._groceryItemWindow);
};

Scene_Map.prototype.addToCart = function() {
    SoundManager.playEquip();
    let item = this._groceryItemWindow.item();
    if (item) {
        EYFUI.addToCart(item);
    }
    this._groceryItemWindow.activate();
};

Scene_Map.prototype.removeFromCart = function() {
    let index = this._cartList._index;
    EYFUI.removeFromCart(index);
    if (this._cartList._list.length > 0) {
        this._cartList.activate();
    } else {
        this._cartList.select(-1);
        this._cartList.deactivate();
    }
};

Scene_Map.prototype.createGroceryItemDetailWindow = function() {
    const rect = this.groceryItemDetailRect();
    this._groceryItemDetailWindow = new Window_GroceryItemDetail(rect);
    this.addWindow(this._groceryItemDetailWindow);
};

Scene_Map.prototype.groceryItemWindowRect = function() {
    const ww = (Graphics.boxWidth / 3) + 150;
    const wh = this.calcWindowHeight(7, false) + 8;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = ((Graphics.boxHeight - wh) / 2) + 65;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_Map.prototype.groceryItemDetailRect = function() {
    const ww = (Graphics.boxWidth / 3) + 150;
    const wh = this.calcWindowHeight(3, false) + 8;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = ((Graphics.boxHeight - wh) / 2) - 150;
    return new Rectangle(wx, wy, ww, wh);
};

Window_Base.prototype.drawCurrencyValue = function(value, unit, x, y, width) {
    const unitWidth = Math.min(80, this.textWidth(unit));
    this.resetTextColor();
    this.drawText(value, x+unitWidth, y, width, "left");
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(unit, x, y, unitWidth, "left");
};

function Window_EYFUI() {
    this.initialize(...arguments);
}

Window_EYFUI.prototype = Object.create(Window_Selectable.prototype);
Window_EYFUI.prototype.constructor = Window_EYFUI;

Window_EYFUI.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._gold = $gameParty.gold();
    this._index = (EYF.viewIndexFundHoldings(1) + EYF.viewIndexFundHoldings(2)).toFixed(2);
    this._savings = $gameVariables.value(11); 
    this._day = $gameVariables.value(8);
    this._month = $gameVariables.value(9);
    this._cs = $gameParty.creditScore;
    this._actionCount = $gameParty.actionCount;
    this._maxActions = $gameParty.maxActions;
    this._hp = $gameParty.hp;
    this._mhp = $gameParty.mhp;
    this._jobLvl = $gameParty.leader()._level;

    this._action = new Sprite();
    this._action.bitmap = ImageManager.loadSystem("Action");
    this._action.x = 10;
    this._action.y = -15;
    this.addChildToBack(this._action);

    this._actionLbl = new PIXI.Text(this._actionCount + "/" + this._maxActions, {
        fontSize: 17,
        fill: "white",
        strokeThickness: 2,
        fontWeight: "bold",
    });
    this._actionLbl.x = 35;
    this._actionLbl.y = -10;
    this.addChildToBack(this._actionLbl);

    this._health = new Sprite();
    this._health.bitmap = ImageManager.loadSystem("Health");
    this._health.x = 80;
    this._health.y = -15;
    this.addChildToBack(this._health);

    this._healthLbl = new PIXI.Text(this._hp + "/" + this._mhp, {
        fontSize: 17,
        fill: "white",
        strokeThickness: 2,
        fontWeight: "bold",
    });
    this._healthLbl.x = 110;
    this._healthLbl.y = -10;
    this.addChildToBack(this._healthLbl);

    this._job = new Sprite();
    this._job.bitmap = ImageManager.loadSystem("Job");
    this._job.x = 180;
    this._job.y = -15;
    this.addChildToBack(this._job);

    this._jobLbl = new PIXI.Text(this._jobLvl, {
        fontSize: 17,
        fill: "white",
        strokeThickness: 2,
        fontWeight: "bold",
    });
    this._jobLbl.x = 210;
    this._jobLbl.y = -10;
    this.addChildToBack(this._jobLbl);

    this._uiTime = new Sprite();
    this._uiTime.bitmap = ImageManager.loadSystem("UISUN");
    this._uiTime.x = 127;
    this._uiTime.y = 85;
    this.addChildToBack(this._uiTime);

    this._uiMoney = new Sprite();
    this._uiMoney.bitmap = ImageManager.loadSystem("UIMONEY");
    this.addChildToBack(this._uiMoney);

    this._uiDay = new Sprite();
    this._uiDay.bitmap = ImageManager.loadSystem("UIDAY");
    this._uiDay.y = 15;
    this._uiDay.x = 2;
    this.addChildToBack(this._uiDay);

    this._csBarContainer = new PIXI.Graphics();
    this._csBarContainer.width = this.width;
    this._csBarContainer.height = 20;
    this._csBarContainer.beginFill("0xffffff");
    this._csBarContainer.drawRect(40, 66, 210, 20);
    
    this._csBar = new PIXI.Graphics();
    this._csBar.beginFill("0x74b531");
    this._csBar.drawRect(42, 67, 206 * this._cs / 1000, 16);
    this.addChildToBack(this._csBar);
    this.addChildToBack(this._csBarContainer);

    this.redrawUI();
};

Window_EYFUI.prototype.redrawUI = function() {
    this.contents.clear();
    this.contents.fontSize = 15;
    this.changeTextColor("#000000")
    this.drawText("Cash on hand", 10, 0, 200, "left");
    this.drawCurrencyValue(this.formatMoney(this._gold), TextManager.currencyUnit, 115, 0, 200);
    this.changeTextColor("#000000");
    this.drawText("Bank", 10, 20, 200, "left");
    this.drawCurrencyValue(this.formatMoney(this._savings), TextManager.currencyUnit, 53, 20, 120);
    this.changeTextColor("#000000");
    this.drawText("Index", 120, 20, 200, "left");
    this.drawCurrencyValue(this.formatMoney(this._index), TextManager.currencyUnit, 165, 20, 100);
    this.contents.fontSize = 18;
    this.contents.fontSize = 18;
    this.contents.textColor = "#000000";
    this.drawText("DAY " + this._day, 20, 85, 200, "right");
    this.drawText("MONTH " + this._month, 20, 85, 200, "left");
    this.contents.textColor = "#ffffff";
    this.drawText("CS: " + this._cs, 110, 45, 200, "left");
    this._actionLbl.text = this._actionCount + "/" + this._maxActions;
    this._actionLbl.updateText();
    this._healthLbl.text = Math.min(this._hp, this._mhp) + "/" + this._mhp;
    this._healthLbl.updateText();
    this._jobLbl.text = $gameParty.leader()._level;
    this._jobLbl.updateText();

    this._csBar.clear();
    if (this._cs < 550) {
        this._csBar.beginFill("0xde4343");
    } else if (this._cs < 701) {
        this._csBar.beginFill("0xfee456");
    } else {
        this._csBar.beginFill("0x37e444");
    }
    this._csBar.drawRect(42, 67, 206 * this._cs / 1000, 16);
};

Window_EYFUI.prototype.formatMoney = function(money) {
    if (money >= 1000) {
      const suffixes = ["", "k", "M", "B", "T"]; // Add more suffixes as needed
      const suffixIndex = Math.floor(Math.log10(money) / 3);
      const shortValue = (money / Math.pow(1000, suffixIndex)).toFixed(2);
      return shortValue + suffixes[suffixIndex];
    }
    return money.toString();
  }


Window_EYFUI.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);  
    if (this._gold != $gameParty.gold()) {
        this._gold = $gameParty.gold();
        this.redrawUI();
    }
    if (this._savings != $gameVariables.value(11)) {
        this._savings = $gameVariables.value(11);
        this.redrawUI();
    }
    if (this._index != (EYF.viewIndexFundHoldings(1) + EYF.viewIndexFundHoldings(2))) {
        this._index = (EYF.viewIndexFundHoldings(1) + EYF.viewIndexFundHoldings(2)).toFixed(2);        
        this.redrawUI();
    }
    if (this._day != $gameVariables.value(8)) {
        this._day = $gameVariables.value(8);    
        this.redrawUI();
    }
    if (this._cs != $gameParty.creditScore) {
        this._cs = $gameParty.creditScore;    
        this.redrawUI();
    }
    if (this._actionCount != $gameParty.actionCount) {
        this._actionCount = $gameParty.actionCount;    
        this.redrawUI();
    }
    if (this._maxActions != $gameParty.maxActions) {
        this._maxActions = $gameParty.maxActions;    
        this.redrawUI();
    }
    if (this._hp != $gameParty.hp) {
        this._hp = $gameParty.hp;    
        this.redrawUI();
    }
    if (this._mhp != $gameParty.mhp) {
        this._mhp = $gameParty.mhp;    
        this.redrawUI();
    }
    if (this._jobLvl != $gameParty.leader()._level) {
        this._jobLvl = $gameParty.leader()._level;    
        this.redrawUI();
    }
};

Window_EYFUI.prototype._createBackSprite = function() {
    this._backSprite = new Sprite();
};

Window_EYFUI.prototype._createFrameSprite = function() {
    this._frameSprite = new Sprite();
};

Window_EYFUI.prototype._refreshBack = function() {};

Window_EYFUI.prototype._refreshFrame = function() {};

function Window_CartHeader() {
    this.initialize(...arguments);
}

Window_CartHeader.prototype = Object.create(Window_Selectable.prototype);
Window_CartHeader.prototype.constructor = Window_CartHeader;

Window_CartHeader.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._total = EYFUI.cartTotal();

    this._cartButton = new Sprite_Clickable();
    this._cartButton.bitmap = ImageManager.loadSystem("UISHOP");
    this._cartButton.onMouseEnter = function() {
        this.bitmap = ImageManager.loadSystem("UISHOP_HOVERED");
    };
    this._cartButton.onMouseExit = function() {
        this.bitmap = ImageManager.loadSystem("UISHOP");
    };
    this.addChildToBack(this._cartButton);

    this._cartTotalUI = new Sprite();
    this._cartTotalUI.bitmap = ImageManager.loadSystem("UITOTAL");
    this._cartTotalUI.x = 57;
    this.addChildToBack(this._cartTotalUI);

    this.redrawTotal();
};

Window_CartHeader.prototype.setParentScene = function(scene) {
    this._parentScene = scene;
    this._cartButton.onClick = function() {
        scene.toggleCartList();
    };
};

Window_CartHeader.prototype.redrawTotal = function() {
    this.contents.clear();
    this.contents.fontSize = 20;
    this.contents.textColor = "#ffffff";
    this.changeTextColor("#000000")
    this.drawText("Total: ", 60,0,200,"left");
    this.drawCurrencyValue(this._total, TextManager.currencyUnit, 110, 0, 100);
};

Window_CartHeader.prototype._createBackSprite = function() {
    this._backSprite = new Sprite();
};

Window_CartHeader.prototype._createFrameSprite = function() {
    this._frameSprite = new Sprite();
};

Window_CartHeader.prototype._refreshBack = function() {};

Window_CartHeader.prototype._refreshFrame = function() {};

function Window_CartList() {
    this.initialize(...arguments);
}

Window_CartList.prototype = Object.create(Window_Selectable.prototype);
Window_CartList.prototype.constructor = Window_CartList;

Window_CartList.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.visible = false;
    this._list = EYFUI.cart;
    this.refresh();
};

Window_CartList.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    if (EYFUI.cartUpdated) {
        this._list = EYFUI.cart;
        this.refresh();
        EYFUI.cartUpdated = false;

        if (this._cartHeader) {
            this._cartHeader._total = this.getTotal();
            this._cartHeader.redrawTotal(); 
        }
    }
};

Window_CartList.prototype.setHeader = function(cartHeader) {
    this._cartHeader = cartHeader;
};

Window_CartList.prototype.getTotal = function() {
    return EYFUI.cartTotal();
};

Window_CartList.prototype.drawItem = function(index) {
    let item = this.itemAt(index);
    let rect = this.itemRect(index);
    this.contents.fontSize = 15;
    if (item) {
        this.drawText(item.name + " ("+item.price+"﹩)", rect.x + 5, rect.y, rect.width, "left");
        this.drawText("➖", rect.x, rect.y, rect.width - 5, "right");
    }
};

Window_CartList.prototype.item = function() {
    return this._list ? this._list[this._index] : null;
};

Window_CartList.prototype.itemAt = function(index) {
    return this._list ? this._list[index] : null;
};

Window_CartList.prototype.maxItems = function() {
    return this._list.length;
};

function Window_GroceryItem() {
    this.initialize(...arguments);
}

Window_GroceryItem.prototype = Object.create(Window_Selectable.prototype);
Window_GroceryItem.prototype.constructor = Window_GroceryItem;

Window_GroceryItem.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.openness = 0;
    this._list = [];
};

Window_GroceryItem.prototype.setParentScene = function(p) {
    this._parent = p;
};

Window_GroceryItem.prototype.setItemDetailWindow = function(itemDetailWindow) {
    this._itemDetailWindow = itemDetailWindow
};

Window_GroceryItem.prototype.setItems = function(items) {
    if (!items) return;
    this._list = [];
    items.forEach(id => {
        this._list.push($dataItems[id]);
    });
    console.log(this._list);
    this.refresh();
    this.activate();
};

Window_GroceryItem.prototype.maxItems = function() {
    return this._list ? this._list.length : null;
};

Window_GroceryItem.prototype.select = function(index) {
    Window_Selectable.prototype.select.call(this, index);
    let item = this.itemAt(index);
    if (this._itemDetailWindow) {
        this._itemDetailWindow.setPreview(item);
    }
};

Window_GroceryItem.prototype.item = function() {
    return this._list ? this._list[this._index] : null;
};

Window_GroceryItem.prototype.itemAt = function(index) {
    return this._list ? this._list[index] : null;
};

Window_GroceryItem.prototype.drawItem = function(index) {
    let item = this.itemAt(index);
    let rect = this.itemRect(index)
    this.drawText("<<< Add to Cart 1 " +item.name, rect.x, rect.y, rect.width, "left");
};

function Window_GroceryItemDetail() {
    this.initialize(...arguments);
}

Window_GroceryItemDetail.prototype = Object.create(Window_Selectable.prototype);
Window_GroceryItemDetail.prototype.constructor = Window_GroceryItemDetail;

Window_GroceryItemDetail.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.openness = 0;
};

Window_GroceryItemDetail.prototype.setPreview = function(item) {
    if (!item) return;
    this.contents.clear();
    let imageSprite = new Sprite();
    imageSprite.bitmap = ImageManager.loadBitmap("img/eyf/grocery/", item.meta.image);
    imageSprite.y = 5;
    imageSprite.x = 5;
    this.addChild(imageSprite);

    this.contents.fontSize = 22;
    this.contents.textColor = "#fbd892";
    this.drawText(item.name, 140, 0, 300, "left");
    this.drawCurrencyValue(item.price, TextManager.currencyUnit, this.width-70, 0, 50);
    this.contents.textColor = "#000000";
    this.contents.fontSize = 15;
    this.drawText(item.description, 140, 30, 300, "left");
    this.contents.textColor = "#bd9be4";
    //this.drawText("["+item.meta.foodType+"]", 140, 50, 300, "left");
};

function Window_Summary() {
    this.initialize(...arguments);
}

Window_Summary.prototype = Object.create(Window_Selectable.prototype);
Window_Summary.prototype.constructor = Window_Summary;

Window_Summary.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = [];
    this._mode = "SUMMARIZE";
};

Window_Summary.prototype.setItems = function(items) {
    this._list = items;
    this.drawSummary();
};

Window_Summary.prototype.drawSummary = function() {
    this.contents.clear();
    this.contentsBack.clear();
    let outflow = 0;
    this._list.filter(item => {return item.type == "outflow"}).forEach(item => {outflow += item.amount});
    let inflow = 0;
    this._list.filter(item => {return item.type == "inflow"}).forEach(item => {inflow += item.amount});
    let net = inflow - outflow;
    this.contents.textColor = "#f43b3b";
    this.drawText("Cash Outflow", 0, 0, this.width-40, "right");
    this.drawCurrencyValue(outflow, TextManager.currencyUnit, 0, 0, 100);
    this.contents.textColor = "#3bf478";
    this.drawText("Cash Inflow", 0, 30, this.width-40, "right");
    this.drawCurrencyValue(inflow, TextManager.currencyUnit, 0, 30, 100);
    this.contents.textColor = "#000000";
    this.drawText("Net Change", 0, 60, this.width-40, "right");
    let symbol = net > 0 ? "+" : "";
    this.drawCurrencyValue(symbol+net, TextManager.currencyUnit, 0, 60, 100);
    this.drawText("Total Cash", 0, 150, this.width-40, "right");
    this.drawCurrencyValue($gameParty.gold(), TextManager.currencyUnit, 0, 150, this.width-30);
};

Window_Summary.prototype.drawConsumedFoods = function() {
    this.contents.clear();
    this.contentsBack.clear();
    this._mode = "END";
    if ($gameParty.consumedFood.length == 0) {
        this.drawText("No foods to consume", 10, 0, this.width, "left");
    } else {
        SoundManager.playRecovery();
        let y = 0;
        $gameParty.consumedFood.forEach(item => {
            this.drawText("Consumed " +item.name , 10, y, this.width, "left");
            y += 30;
        });
    }
};

Window_Summary.prototype.toggleSummaryMode = function() {
    if (this._mode == "SUMMARIZE") {
        this._mode = "LIST_ACTIVITIES"
        this.refresh();
    } else {
        this._mode = "SUMMARIZE";
        this.drawSummary();
    }
};

Window_Summary.prototype.maxItems = function() {
    return this._list ? this._list.length : null;
};

Window_Summary.prototype.item = function() {
    return this._list ? this._list[this._index] : null;
};

Window_Summary.prototype.itemAt = function(index) {
    return this._list ? this._list[index] : null;
};

Window_Summary.prototype.drawItem = function(index) {
    if (this._mode == "SUMMARIZE") return;
    let item = this.itemAt(index);
    let rect = this.itemRect(index)
    let symbol = item.type == "outflow" ? "-" : "+";
    if (item.type == "outflow") this.contents.textColor = "#f43b3b";
    else this.contents.textColor = "#3bf478";
    this.drawText(item.name, rect.x, rect.y, rect.width, "left");
    this.drawCurrencyValue(symbol+item.amount, TextManager.currencyUnit, rect.x, rect.y, rect.width);
};


function Window_SummaryHeader() {
    this.initialize(...arguments);
}

Window_SummaryHeader.prototype = Object.create(Window_Selectable.prototype);
Window_SummaryHeader.prototype.constructor = Window_SummaryHeader;

Window_SummaryHeader.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    let day = $gameVariables.value(8);
    let month = $gameVariables.value(9);
    this.drawText(`Day ${day} Month ${month} Summary`, 0,0,this.width, "center");
};

function Window_SummaryFooter() {
    this.initialize(...arguments);
}

Window_SummaryFooter.prototype = Object.create(Window_Selectable.prototype);
Window_SummaryFooter.prototype.constructor = Window_SummaryFooter;

Window_SummaryFooter.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = ["View activities / summary", "Consume Prep Food", "Continue"];
    this.refresh();
    this.activate();
    this.select(0);
};

Window_SummaryFooter.prototype.setSummaryWindow = function(summaryWindow) {
    this._summaryWindow = summaryWindow;
};

Window_SummaryFooter.prototype.maxItems = function() {
    return this._list ? this._list.length : null;
};

Window_SummaryFooter.prototype.item = function() {
    return this._list ? this._list[this._index] : null;
};

Window_SummaryFooter.prototype.itemAt = function(index) {
    return this._list ? this._list[index] : null;
};

Window_SummaryFooter.prototype.drawItem = function(index) {
    let item = this.itemAt(index);
    let rect = this.itemRect(index)
    if (index == 0 && this._summaryWindow && this._summaryWindow._mode == "END") {
        this.changePaintOpacity(false);
    } else {
        this.changePaintOpacity(true);
    }
    this.drawText(item, rect.x, rect.y, rect.width, "center");
};

Scene_Base.prototype.windowVocabularyRect = function () {
    const ww = Graphics.boxWidth / 2;
    const wh = Graphics.boxHeight - this.calcWindowHeight(2);
    const wx = (Graphics.boxWidth / 2) - (ww / 2);
    const wy = this.calcWindowHeight(1.5);
    return new Rectangle(wx, wy, ww, wh);
};

function Window_Vocabulary() {
    this.initialize(...arguments);
}

Window_Vocabulary.prototype = Object.create(Window_Selectable.prototype);
Window_Vocabulary.prototype.constructor = Window_Vocabulary;

Window_Vocabulary.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = [];
    this.visible = false;
    this.openness = 0;
};

Window_Vocabulary.prototype.setItems = function(items) {
    this._list = items;
    this.refresh();
    this._closeBtn = new Sprite_Clickable();
    this._closeBtn.bitmap = ImageManager.loadSystem("CLOSE");
    this._closeBtn.x = this.width - 63;
    this._closeBtn.y = 8;
    this._closeBtn.onClick = () => {
        this.close();
    }
    this.addChild(this._closeBtn);
};

Window_Vocabulary.prototype.drawAllItems = function() {
    const topIndex = this.topIndex();
    this.contents.fontSize = 25;
    this.drawText("Vocabulary", 0, 5, this.width, "center");
    for (let i = 0; i < this.maxVisibleItems(); i++) {
        const index = topIndex + i;
        if (index < this.maxItems()) {
            this.drawItemBackground(index);
            this.drawItem(index);
        }
    }
};

Window_Vocabulary.prototype.maxScrollY = function() {
    return Math.max(0, (this.overallHeight() - this.innerHeight) + 50);
};

Window_Vocabulary.prototype.open = function() {
    if (!this.isOpen()) {
        this._opening = true;
    }
    this.activate();
    this._closing = false;
    this._closeBtn.opacity = 255;
};

Window_Vocabulary.prototype.close = function() {
    if (!this.isClosed()) {
        this._closing = true;
    }
    this.deactivate();
    this._opening = false;
    this._closeBtn.opacity = 0;
    SoundManager.playCancel();
};

Window_Vocabulary.prototype.maxItems = function() {
    return this._list ? this._list.length : 0
};

Window_Vocabulary.prototype.itemRect = function(index) {
    const maxCols = this.maxCols();
    const itemWidth = this.itemWidth();
    const itemHeight = this.itemHeight();
    const colSpacing = this.colSpacing();
    const rowSpacing = this.rowSpacing();
    const col = index % maxCols;
    const row = Math.floor(index / maxCols);
    const x = col * itemWidth + colSpacing / 2 - this.scrollBaseX();
    const y = row * itemHeight + rowSpacing / 2 - this.scrollBaseY() + 50;
    const width = itemWidth - colSpacing;
    const height = itemHeight - rowSpacing;
    return new Rectangle(x, y, width, height);
};

Window_Vocabulary.prototype.itemHeight = function() {
    return Window_Scrollable.prototype.itemHeight.call(this) + 108;
};

Window_Vocabulary.prototype.drawItem = function(index) {
    let item = this._list[index];
    let rect = this.itemRect(index);
    this.contents.fontSize = 20;
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(item.word, rect.x, rect.y, rect.width, "center");
    this.contents.fontSize = 17;
    this.changeTextColor(ColorManager.normalColor());
    this.drawWrappedText(rect, item.desc);
};

Window_Vocabulary.prototype.drawWrappedText = function(rect, text) {
    let y = 0;
    let line = "";
    for (let i = 0; i <text.length; i++) {
        let c = text[i];
        if ((this.textWidth(line+c) + 28) < this.width) {
            line += c;
        } else {
            this.drawText(line, rect.x+ 10, rect.y+25 + (25*y), rect.width - 20, "left");
            y += 1;
            line = "";
            line += c;
        }

        if (i == text.length - 1) {
            this.drawText(line, rect.x + 10, rect.y+25 + (25*y), rect.width - 20, "left");
        }
    }
};

function Window_FastTravel() {
    this.initialize(...arguments);
}

Window_FastTravel.prototype = Object.create(Window_Selectable.prototype);
Window_FastTravel.prototype.constructor = Window_FastTravel;

Window_FastTravel.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = [
        {name:"EYF Homes", event:6, faceIndex: 0, desc: "Purchase your very own home or rent an accomodation."},
        {name:"EYF City", event:7, faceIndex: 1, desc: "The heart of EYF where you could meet lots of opportunities."},
        {name:"EYF University", event:8, faceIndex: 2, desc: "Home to the brightest of minds in EYF. Learn your way to financial freedom!"},
        {name:"EYF Bank", event:9, faceIndex: 3, desc: "Keep your money safe in the most trusted bank. Invest your money and watch it grow."},
        {name:"EYF Market", event:10, faceIndex: 4, desc: "EYF Market provides you with all of your basic needs."},
        {name:"EYF Business Center", event:11, faceIndex: 5, desc: "Start your own business and employ workers!"}
    ];
    this.refresh();
    this.activate();
};

Window_FastTravel.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    if (this._pinSprite) {
        if (this._pinSprite.tappedBot) {
            this._pinSprite.y -= 0.5;
            if (this._pinSprite.y <= this._pinSprite.topY) {
                this._pinSprite.tappedBot = false;
                this._pinSprite.tappedTop = true;
            }
        } else {
            this._pinSprite.y += 0.5;
            if (this._pinSprite.y >= this._pinSprite.botY) {
                this._pinSprite.tappedBot = true;
                this._pinSprite.tappedTop = false;
            }
        }
    }
};

Window_FastTravel.prototype.item = function() {
    return this._list ? this._list[this._index] : null;
};

Window_FastTravel.prototype.select = function(index) {
    this._index = index;
    this.refreshCursor();
    this.callUpdateHelp();
    let item = this._list ? this._list[index] : null;
    if (item) {
        let event = $gameMap.event(item.event);
        $gamePlayer.setPosition(event._x, event._y);
        $gamePlayer.center(event._x, event._y);
        if (this._locationDetailsWindow) {
            this._locationDetailsWindow.setItem(item);
        }
        if (this._pinSprite) {
            this._pinSprite.x = this.screenX(event._x-1);
            this._pinSprite.y = this.screenY(event._y-4);
            this._pinSprite.botY = this.screenY(event._y-4);
            this._pinSprite.topY = this.screenY(event._y-5) + 20;
            this._pinSprite.tappedTop = false;
            this._pinSprite.tappedBot = true;
            console.log(this._pinSprite.botY + " | " + this._pinSprite.topY);
        }
    }
};

Window_FastTravel.prototype.scrolledX = function(x) {
    return $gameMap.adjustX(x);
};

Window_FastTravel.prototype.scrolledY = function(y) {
    return $gameMap.adjustY(y);
};

Window_FastTravel.prototype.screenX = function(x) {
    const tw = $gameMap.tileWidth();
    return Math.floor(this.scrolledX(x) * tw + tw / 2);
};

Window_FastTravel.prototype.screenY = function(y) {
    const th = $gameMap.tileHeight();
    return Math.floor(
        this.scrolledY(y) * th + th
    );
};

Window_FastTravel.prototype.maxItems = function() {
    return this._list ? this._list.length : 0;
};

Window_FastTravel.prototype.maxPageRows = function() {
    return 1;
};

Window_FastTravel.prototype.drawItem = function(index) {
    let item = this._list[index];
    let rect = this.itemRect(index);
    this.drawText(item.name, rect.x, rect.y, rect.width, "center");
};

Window_FastTravel.prototype.setLocationDetailsWindow = function(window) {
    this._locationDetailsWindow = window;
};

Window_FastTravel.prototype.setPinSprite = function(sprite) {
    this._pinSprite = sprite;
}

function Window_LocationDetails() {
    this.initialize(...arguments);
}

Window_LocationDetails.prototype = Object.create(Window_Selectable.prototype);
Window_LocationDetails.prototype.constructor = Window_LocationDetails;

Window_LocationDetails.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._item = null;
};

Window_LocationDetails.prototype.setItem = function(item) {
    this._item = item;
    this.contents.clear();
    let bitmap = ImageManager.loadFace("Buildings");
    bitmap.addLoadListener(() => {
        this.drawFace("Buildings", item.faceIndex, 0, 0, ImageManager.faceWidth, ImageManager.faceWidth);
        this.contents.fontSize = 25;
        this.changeTextColor(ColorManager.systemColor());
        this.drawText(item.name, ImageManager.faceWidth + 10 ,0,this.width, "left");  
        this.contents.fontSize = 19;
        this.changeTextColor(ColorManager.normalColor());
        this.drawText(item.desc, ImageManager.faceWidth + 10 ,30,this.width, "left");  
    });
};


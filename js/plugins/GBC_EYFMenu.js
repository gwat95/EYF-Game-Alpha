/*
@author coffeenahc

@target MZ
@plugindesc
Commissioned work by coffeenahc for grantw95 (fiverr)
*/

Scene_Map.prototype.callMenu = function() {
    SoundManager.playOk();
    SceneManager.push(Scene_EYFMenu);
    Window_MenuCommand.initCommandPosition();
    $gameTemp.clearDestination();
    this._mapNameWindow.hide();
    this._waitCount = 2;
};

function Scene_EYFMenu() {
    this.initialize(...arguments);
}

Scene_EYFMenu.prototype = Object.create(Scene_MenuBase.prototype);
Scene_EYFMenu.prototype.constructor = Scene_EYFMenu;

Scene_EYFMenu.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_EYFMenu.prototype.terminate = function() {
    Scene_MenuBase.prototype.terminate.call(this);
    let element = document.getElementById("minimap-parent");
    if (element) element.remove();
}

Scene_EYFMenu.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createHeader();
    this.createCommandWindow();
    this.createGoldWindow();
    this.createParamsWindow();
    this.createTaskWindow();
    this.createMapWindow();
    this.createMapCommandWindow();
    this.createPointPickerWindow();
    this.createActivityWindow();
    this.createEYFItemWindow();
    this.createOwnedHousesWindow();
    this.createOwnedBusinessesWindow();
    this.createResumeWindow();
    this.createBlankWindow();
    if ($dataMap.meta.summary) {
        this._commandWindow.select(2);
        this.updateSelection();
        this.commandEFYItem();
        this._commandWindow.deactivate();
    } else {
        this._commandWindow.select(0);
    }
};

Scene_EYFMenu.prototype.updateSelection = function() {
    let index = this._commandWindow._index;
    let item = this._commandWindow.icons[index].action;
    this._activityWindow.visible = false;
    this._itemWindow.visible = false;
    this._ownedHousesWindow.visible = false;
    this._ownedBusinessesWindow.visible = false;
    this._blankWindow.visible = false;
    this._taskWindow.visible = false;
    this._resumeWindow.visible = false;
    if ($dataMap.meta.worldMap) {
        this._mapPointPickerWindow.visible = false;
        this._mapCommandWindow.visible = false;
        this._mapWindow.visible = false;
    }
    let element = document.getElementById("minimap-parent");
    let image = document.getElementById("minimap-content");
    if (element) {
        element.style.visibility = "hidden";
    }
    switch(item) {
        case "quest":
            this.setHeader("Task List");
            this._taskWindow.visible = true;
            break;
        case "map":
            this.setHeader("Map Overview");
            this._mapWindow.visible = true;
            this._mapCommandWindow.visible = true;
            if (element) {
                element.style.visibility = "visible";
                let anchorX = 905;
                let anchorY = 850;
                let focusX = anchorX - (($gamePlayer._x * 48) * (2520/10080)) + 355; 
                let focusY = anchorY - (($gamePlayer._y * 48) * (2100/8400)) + 200;
                image.style.transform = `translate(${focusX}px, ${focusY}px) scale(1)`;
            } else {
                console.log("invisible");
            }
            break;
        case "activity":
            this.setHeader("Day Activities");
            this._activityWindow.visible = true; 
            break;
        case "item":
            this.setHeader("Items");
            this._itemWindow.visible = true;
            this._itemWindow.refresh();
            break;
        case "realestate":
            this.setHeader("Real Estate Portfolio");
            this._ownedHousesWindow.visible = true;
            this._ownedHousesWindow.refresh();
            this._ownedHousesWindow.setPreview(0);
            break;
        case "business":
            this.setHeader("Financial Tracker");
            this._ownedBusinessesWindow.visible = true;
            break;
        case "resume":
            this.setHeader("Your Resume");
            this._resumeWindow.visible = true;
            break;
        case "options":
            this.setHeader("Settings");
            this._blankWindow.visible = true;
            break;
        case "save":
            this.setHeader("Save");
            this._blankWindow.visible = true;
            break;
        case "game end":
            this.setHeader("Exit Game");
            this._blankWindow.visible = true;
            break;
    }
};

Scene_EYFMenu.prototype.createBlankWindow = function() {
    this._blankWindow = new Window_Selectable(this.mainWindowRect());
    this._blankWindow.visible = false;
    this.addChild(this._blankWindow);
}

Scene_EYFMenu.prototype.createHeader = function() {
    this._headerWindow = new Window_Header(this.headerRect());
    this._headerWindow.setText("Day Activities")
    this.addChild(this._headerWindow);
};

Scene_EYFMenu.prototype.headerRect = function() {
    const ww = 725;
    const wh = this.calcWindowHeight(1, true);
    const wx = 140 + 72;
    const wy = 50;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_EYFMenu.prototype.setHeader = function(text) {
    this._headerWindow.setText(text);
};

Scene_EYFMenu.prototype.createActivityWindow = function() {
    this._activityWindow = new Window_Activity(this.mainWindowRect());
    this.addChild(this._activityWindow);
};

Scene_EYFMenu.prototype.createTaskWindow = function() {
    this._taskWindow = new Window_Tasks(this.mainWindowRect());
    this.addChild(this._taskWindow);
};

Scene_EYFMenu.prototype.createMapWindow = function() {
    if (!$dataMap.meta.worldMap) return;
    let rect = this.mainWindowRect();
    rect.height -= 70;
    this._mapWindow = new Window_Map(rect);
    this._mapWindow.setHandler("cancel", this.onFastTravelCancel.bind(this));
    this.addChild(this._mapWindow);
};

Scene_EYFMenu.prototype.createPointPickerWindow = function() {
    if (!$dataMap.meta.worldMap) return;
    let rect = this.mainWindowRect();
    rect.y += (rect.height - 70);
    rect.height = 70;
    this._mapPointPickerWindow = new Window_MapPointPicker(rect);
    this._mapPointPickerWindow.setMapWindow(this._mapWindow);
    this._mapPointPickerWindow.setHandler("ok", this.onFastTravelOk.bind(this));
    this._mapPointPickerWindow.setHandler("cancel", this.onFastTravelCancel.bind(this));
    this.addChild(this._mapPointPickerWindow);
};

Scene_EYFMenu.prototype.createMapCommandWindow = function() {
    if (!$dataMap.meta.worldMap) return;
    let rect = this.mainWindowRect();
    rect.y += (rect.height - 70);
    rect.height = 70;
    this._mapCommandWindow = new Window_MapCommand(rect);
    this._mapCommandWindow.setHandler("ok", this.onMapCommandOk.bind(this));
    this._mapCommandWindow.setHandler("cancel", this.onMapCommandBack.bind(this));
    this.addChild(this._mapCommandWindow);
};

Scene_EYFMenu.prototype.commandMap = function() {
    this._mapCommandWindow.select(0);
    this._mapCommandWindow.activate();
};

Scene_EYFMenu.prototype.onMapCommandOk = function() {
    let index = this._mapCommandWindow._index;
    if (index == 0) {
        this._isPinningOnMap = true;
        this._mapWindow.activate();
        let minimap = document.getElementById("minimap-content");
        minimap.style.cursor = "url('img/system/pin_cursor.png'), auto";
        this._savedMapStyle = Object.assign({}, minimap.style);
        this._mapWindow.removeMapInteractor();
        for (let property in this._savedMapStyle) {
            minimap.style[property] = this._savedMapStyle[property];
        }
        EYF.isPinningDestination = true;
    } else if (index == 1) {
        EYF.playerDestination = null;
        this._mapCommandWindow.activate();
        this._mapWindow.pinPlayer();
    }   else {
        this._mapPointPickerWindow.activate();
        this._mapPointPickerWindow.visible = true;
        this._mapCommandWindow.visible = false;
    }
};

Scene_EYFMenu.prototype.onMapCommandBack = function() {
    this._commandWindow.activate();
    this._mapCommandWindow.deactivate();
    this._mapCommandWindow.deselect();
};

Scene_EYFMenu.prototype.onFastTravelOk = function() {
    if (!$gameParty.hasVehicle) {
        this._mapPointPickerWindow.activate();
        SoundManager.playBuzzer();
    } else {
        let item = this._mapPointPickerWindow.item();
        $gameVariables.setValue(30, 13);
        $gameVariables.setValue(31, item.x);
        $gameVariables.setValue(32, item.y);
        SceneManager.pop();
        $gameTemp.reserveCommonEvent(7);
    }
};

Scene_EYFMenu.prototype.onFastTravelCancel = function() {
    let minimap = document.getElementById("minimap-content");
    this._mapWindow.addMapInteractor(minimap);
    for (let property in this._savedMapStyle) {
        minimap.style[property] = this._savedMapStyle[property];
    }
    EYF.isPinningDestination = false;
    minimap.style.cursor = "auto";
    minimap.removeEventListener('click', this.addPinner);
    this._mapCommandWindow.activate();
    this._mapCommandWindow.visible = true;
    this._mapPointPickerWindow.visible = false;
};

Scene_EYFMenu.prototype.mainWindowRect = function() {
    const ww = 725;
    const wh = this.mainAreaHeight() - this.goldWindowRect().height - 10;
    const wx = 140 + 72;
    const wy = this.mainAreaTop() + 68;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_EYFMenu.prototype.createEYFItemWindow = function() {
    this._itemWindow = new Window_EYFItems(this.mainWindowRect());
    this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
    this._itemWindow.setHandler("cancel", this.onItemBack.bind(this));
    this.addChild(this._itemWindow);
};

Scene_EYFMenu.prototype.onItemOk = function() {
    let item = this._itemWindow.item();
    if (!item) {
        SoundManager.playBuzzer();
        this._itemWindow.activate();
        return;
    }
    if ($dataItems[item.id].meta.foodType == "instant" || $dataMap.meta.summary) {
        $gameParty.consumeItem(item);
        $gameParty.refillHp(parseInt(item.damage.formula));
        if (item.meta.increaseAction) {
            $gameParty.refillAction(parseInt(item.meta.increaseAction));
        }
        console.log(item);
        this._itemWindow._list = $gameParty.items();
        this._itemWindow.refresh();
        this._itemWindow.activate();
        this._paramsWindow.redrawParams();
        SoundManager.playUseItem();
    } else {
        SoundManager.playBuzzer();
        this._itemWindow.activate();
    }
};

Scene_EYFMenu.prototype.onItemBack = function() {
    this._commandWindow.activate();
    this._itemWindow.deactivate();
    this._itemWindow.select(-1);
};

Scene_EYFMenu.prototype.createCommandWindow = function() {
    const rect = this.commandWindowRect();
    const commandWindow = new Window_MenuCommand(rect);
    commandWindow.setHandler("map", this.commandMap.bind(this));
    commandWindow.setHandler("item", this.commandEFYItem.bind(this));
    commandWindow.setHandler("options", this.commandOptions.bind(this));
    commandWindow.setHandler("save", this.commandSave.bind(this));
    commandWindow.setHandler("gameEnd", this.commandGameEnd.bind(this));
    commandWindow.setHandler("cancel", this.commandBack.bind(this));
    commandWindow.setHandler("realestate", this.commandRealEstate.bind(this));
    commandWindow.setParent(this);
    this.addWindow(commandWindow);
    this._commandWindow = commandWindow;
};

Scene_EYFMenu.prototype.commandBack = function() {
    if (this._itemWindow.active) {
        this._commandWindow.activate();
        this._itemWindow.deactivate();
        this._itemWindow.select(-1);
    } else if (this._ownedHousesWindow.active) {
        this._commandWindow.activate();
        this._ownedHousesWindow.deactivate();
        this._ownedHousesWindow.select(-1);
    } else {
        this.popScene();
    }
};

Scene_EYFMenu.prototype.commandEFYItem = function() {
    this._itemWindow.activate();
    this._itemWindow.select(0);
};

Scene_EYFMenu.prototype.commandRealEstate = function() {
    this._ownedHousesWindow.activate();
    this._ownedHousesWindow.select(0);
};

Scene_EYFMenu.prototype.createOwnedHousesWindow = function() {
    this._ownedHousesWindow = new Window_OwnedHouses(this.mainWindowRect());
    this._ownedHousesWindow.setHandler("cancel", this.onHousesBack.bind(this));
    this.addChild(this._ownedHousesWindow);
};

Scene_EYFMenu.prototype.createResumeWindow = function() {
    this._resumeWindow = new Window_Resume(this.mainWindowRect());
    this._resumeWindow.setHandler("cancel", this.onResumeBack.bind(this));
    this.addChild(this._resumeWindow);
};

Scene_EYFMenu.prototype.onHousesBack = function() {
    this._ownedHousesWindow.deactivate();
    this._ownedHousesWindow.select(-1);
    this._commandWindow.activate();
}

Scene_EYFMenu.prototype.onResumeBack = function() {
    this._resumeWindow.deactivate();
    this._resumeWindow.select(-1);
    this._commandWindow.activate();
}

Scene_EYFMenu.prototype.createOwnedBusinessesWindow = function() {
    this._ownedBusinessesWindow = new Window_OwnedBusinesses(this.mainWindowRect());
    this.addChild(this._ownedBusinessesWindow);
};

Scene_EYFMenu.prototype.commandWindowRect = function() {
    const ww = 81;
    const wh = this.mainAreaHeight() - this.goldWindowRect().height + 90;
    const wx = 130;
    const wy = this.mainAreaTop() + 50;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_EYFMenu.prototype.createGoldWindow = function() {
    const rect = this.goldWindowRect();
    this._goldWindow = new Window_Gold(rect);
    this.addWindow(this._goldWindow);
};

Scene_EYFMenu.prototype.createParamsWindow = function() {
    const rect = this.goldWindowRect();
    rect.x += 485;
    this._paramsWindow = new Window_Params(rect);
    this.addWindow(this._paramsWindow);
};

Scene_EYFMenu.prototype.goldWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(1, true);
    const wx = 140 + 68;
    const wy = this.mainAreaBottom() - wh + 60;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_EYFMenu.prototype.commandItem = function() {
    SceneManager.push(Scene_Item);
};

Scene_EYFMenu.prototype.commandOptions = function() {
    SceneManager.push(Scene_Options);
};

Scene_EYFMenu.prototype.commandSave = function() {
    SceneManager.push(Scene_Save);
};

Scene_EYFMenu.prototype.commandGameEnd = function() {
    SceneManager.push(Scene_GameEnd);
};

Window_MenuCommand.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
    this.selectLast();
    this._canRepeat = false;
    this.icons = [
        { action: "quest", bitmap: ImageManager.loadSystem("quest") },
        { action: "activity", bitmap: ImageManager.loadSystem("activity") },
        { action: "item", bitmap: ImageManager.loadSystem("item") },
        { action: "realestate", bitmap: ImageManager.loadSystem("realestate") },
        { action: "business", bitmap: ImageManager.loadSystem("business") },
        { action: "resume", bitmap: ImageManager.loadSystem("resume") },
        { action: "options", bitmap: ImageManager.loadSystem("options") },
        { action: "save", bitmap: ImageManager.loadSystem("save") },
        { action: "game end", bitmap: ImageManager.loadSystem("game end") }
    ];
    if ($dataMap.meta.worldMap) {
        this.icons.splice(1, 0, {action:"map", bitmap: ImageManager.loadSystem("map")})
    }
    for (let i = 0; i < this.icons.length; i++) {
        let bitmap = this.icons[i].bitmap;
        bitmap.addLoadListener(() => {
            let rect = this.itemRect(i);
            this.drawIcon(bitmap, rect.x+2, rect.y+4);
        });
    }
};

Window_MenuCommand.prototype.setParent = function(parentScene) {
    this._parentScene = parentScene;
};

Window_MenuCommand.prototype.select = function(index) {
    this._index = index;
    this.refreshCursor();
    this.callUpdateHelp();
    if (this._parentScene) {
        this._parentScene.updateSelection();
    }
};

Window_MenuCommand.prototype.addMainCommands = function() {
    const enabled = this.areMainCommandsEnabled();
    this.addCommand("quest", "quest", enabled);
    if ($dataMap.meta.worldMap) {
        this.addCommand("map", "map", enabled);
    }
    this.addCommand("activity", "activities", enabled);
    this.addCommand(TextManager.item, "item", enabled);
    this.addCommand("realestate", "realestate", enabled);
    this.addCommand("business", "business", enabled);
    this.addCommand("resume", "resume", enabled);
};

Window_MenuCommand.prototype.addFormationCommand = function() {};

Window_MenuCommand.prototype.drawItem = function(index) {};

Window_MenuCommand.prototype.drawIcon = function (housePic, x, y) {
    const bitmap = housePic
    const pw = 48;
    const ph = 48;
    const sx = 0;
    const sy = 0;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
};

Window_MenuCommand.prototype.itemWidth = function() {
    return 60;
};

Window_MenuCommand.prototype.itemHeight = function() {
    return 60;
};

Window_MenuCommand.prototype.addCommand = function(
    name, symbol, enabled = true, ext = null
) {
    this._list.push({ name: name, symbol: symbol, enabled: enabled, ext: ext, icon: ImageManager.loadSystem(name) });
};

Window_MenuCommand.prototype.drawBackgroundRect = function(rect) {
    const c1 = "#fefbf3";
    const c2 = "#e8e8bf";
    const x = rect.x;
    const y = rect.y;
    const w = rect.width;
    const h = rect.height;
    this.contentsBack.gradientFillRect(x, y, w, h, c1, c1, true);
    this.contentsBack.strokeRect(x, y, w, h, c2);
};

Window_MenuCommand.prototype._refreshBack = function() {};

Window_MenuCommand.prototype._refreshFrame = function() {};

function Window_Header() {
    this.initialize(...arguments);
}

Window_Header.prototype = Object.create(Window_Selectable.prototype);
Window_Header.prototype.constructor = Window_Header;

Window_Header.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
};

Window_Header.prototype.setText = function(text) {
    this.contents.clear();
    this.drawText(text, 10, 0, this.width, "left");
}

function Window_Tasks() {
    this.initialize(...arguments);
}

Window_Tasks.prototype = Object.create(Window_Selectable.prototype);
Window_Tasks.prototype.constructor = Window_Tasks;

Window_Tasks.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = $gameParty.tasks;
    this.refresh();
};

Window_Tasks.prototype.maxItems = function() {
    return this._list ? this._list.length : 0; 
};

Window_Tasks.prototype.drawItem = function(index) {
    let item = this._list[index];
    let rect = this.itemRect(index);
    this.changeTextColor(ColorManager.systemColor());
    this.contents.fontSize = 25;
    this.drawText(item.taskName, rect.x+10, rect.y, rect.width, "left");
    this.contents.fontSize = 17;
    this.contents.textColor = "#bd9be4";
    this.drawText("["+item.taskType+"]", rect.x, rect.y, rect.width-10, "right");
    this.contents.fontSize = 17;
    this.changeTextColor(ColorManager.normalColor());
    this.drawText("[From: "+ item.taskGiver+"]", rect.x + 10, rect.y + 25, rect.width, "left");
    this.drawText(item.taskDesc, rect.x + 10, rect.y + 50, rect.width-20, "left");
};

Window_Tasks.prototype.itemRect = function(index) {
    const maxCols = this.maxCols();
    const itemWidth = this.itemWidth();
    const itemHeight = this.itemHeight() + 60;
    const colSpacing = this.colSpacing();
    const rowSpacing = this.rowSpacing();
    const col = index % maxCols;
    const row = Math.floor(index / maxCols);
    const x = col * itemWidth + colSpacing / 2 - this.scrollBaseX();
    const y = row * itemHeight + rowSpacing / 2 - this.scrollBaseY();
    const width = itemWidth - colSpacing;
    const height = itemHeight - rowSpacing;
    return new Rectangle(x, y, width, height);
};

function Window_Activity() {
    this.initialize(...arguments);
}

Window_Activity.prototype = Object.create(Window_Selectable.prototype);
Window_Activity.prototype.constructor = Window_Activity;

Window_Activity.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = $gameParty.dayActivities;
    this.refresh();
};

Window_Activity.prototype.maxItems = function() {
    return this._list ? this._list.length : 0; 
};

Window_Activity.prototype.drawItem = function(index) {
    let item = this._list[index];
    let rect = this.itemRect(index)
    let symbol = item.type == "Outflow" ? "-" : "+";
    if (item.type == "Outflow") this.contents.textColor = "#f43b3b";
    else this.contents.textColor = "#3bf478";
    this.drawText(item.name, rect.x, rect.y, rect.width, "left");
    this.drawCurrencyValue(symbol+item.amount, TextManager.currencyUnit, rect.x, rect.y, rect.width);
};

function Window_EYFItems() {
    this.initialize(...arguments);
}

Window_EYFItems.prototype = Object.create(Window_Selectable.prototype);
Window_EYFItems.prototype.constructor = Window_EYFItems;

Window_EYFItems.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.visible = false;
    this._list = $gameParty.items();
    this._list.forEach(item => {

    });
    for (let i = 0; i < this._list.length; i++) {
        let item = this._list[i];
        let dataItem = $dataItems[item.id];
        let bitmap = ImageManager.loadBitmap("img/eyf/grocery/", dataItem.meta.image);
        item.icon = bitmap;
        if (i == this._list.length - 1) {
            bitmap.addLoadListener(() => this.refresh());
        }
    };
};

Window_EYFItems.prototype.itemHeight = function() {
    return 140;
};

Window_EYFItems.prototype.itemWidth = function() {
    return 140;
};

Window_EYFItems.prototype.maxItems = function() {
    return 100;
};

Window_EYFItems.prototype.maxCols = function() {
    return 5;
};

Window_EYFItems.prototype.item = function() {
    return this._list ? this._list[this._index] : null;
}

Window_EYFItems.prototype.drawItem = function(index) {
    this.contents.fontSize = 15;
    let item = this._list[index];
    let rect = this.itemRect(index);
    if (item) {
        if ($dataItems[item.id].meta.foodType == "instant" || $dataMap.meta.summary) {
            this.changePaintOpacity(true);
        } else {
            this.changePaintOpacity(false);
        }
        this.drawIcon(item.icon, rect.x+4, rect.y+2);
        this.changeTextColor("#000000")
        this.drawText("qty: " + $gameParty.numItems(item), rect.x+4, rect.y, rect.width, "left");
        this.changeTextColor("#ff2121");
        this.drawText("+" + item.damage.formula +"❤️", rect.x-3, rect.y, rect.width, "right");
        if (item.meta.increaseAction) {
            this.changeTextColor("#f5f518");
            this.drawText("+" + item.meta.increaseAction +"⚡", rect.x-3, rect.y+20, rect.width, "right");
        }
        this.changeTextColor("#bd9be4");
        //this.drawText("["+item.meta.foodType+"]", rect.x + 4, rect.y +95, rect.width, "left");
        this.changeTextColor("#000000")
        this.drawText(item.name, rect.x + 4, rect.y +110, rect.width, "left");
    };
};

Window_EYFItems.prototype.drawIcon = function (pic, x, y) {
    const bitmap = pic
    const pw = 130;
    const ph = 130;
    const sx = 0;
    const sy = 0;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
};


function Window_OwnedHouses() {
    this.initialize(...arguments);
}

Window_OwnedHouses.prototype = Object.create(Window_Selectable.prototype);
Window_OwnedHouses.prototype.constructor = Window_OwnedHouses;

Window_OwnedHouses.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = EYF._realEstate.slice(1).filter(item => {return item.isOwned});
    this.visible = false;
    this.refresh();
};

Window_OwnedHouses.prototype.drawAllItems = function() {
    const topIndex = this.topIndex();
    if (this._list && this._list.length == 0) {
        this.drawText("Empty", 0,0,this.width,"center");
        return;
    }
    for (let i = 0; i < this.maxVisibleItems(); i++) {
        const index = topIndex + i;
        if (index < this.maxItems()) {
            this.drawItemBackground(index);
            this.drawItem(index);
        }
    }
};

Window_OwnedHouses.prototype.itemWidth = function() {
    return 390;
};

Window_OwnedHouses.prototype.maxItems = function () {
    return this._list ? this._list.length : 0;
};

Window_OwnedHouses.prototype.select = function(index) {
    this._index = index;
    this.refreshCursor();
    this.callUpdateHelp();
    this.refresh();
    this.setPreview(index);
};

Window_OwnedHouses.prototype.setPreview = function(index) {
    if (!this._list || this._list.length == 0) {return;}
    this.contents.fontSize = 19;
    let item = this._list[index];
    if (!item) return;
    item.housePic = ImageManager.loadBitmap("img/eyf/realestate/", item.houseName)
    this.drawIcon(item.housePic, 400, 0);
    this.drawText("Days on market: " + item.daysOnMarket+ "﹩", 400, 300, 200, "left");
    this.drawText("Market Value: " + item.housePrice+ "﹩", 400, 320, 200, "left");
    this.drawText("Mortgage: " + item.balance+ "﹩", 400, 340, 200, "left");
    this.drawText("House Equity: " + (item.housePrice - item.balance)+ "﹩", 400, 360, 200, "left");
};

Window_OwnedHouses.prototype.drawItem = function (index) {
    let rect = this.itemRect(index);
    let item = this._list[index];
    if (!item) return;
    this.contents.fontSize = 22;
    this.drawText(item.houseName.toString(), rect.x, rect.y, rect.width, "left");
};

Window_OwnedHouses.prototype.drawIcon = function (housePic, x, y) {
    const bitmap = housePic
    const pw = 300;
    const ph = 300;
    const sx = 0;
    const sy = 0;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
};

function Window_OwnedBusinesses() {
    this.initialize(...arguments);
}

Window_OwnedBusinesses.prototype = Object.create(Window_Selectable.prototype);
Window_OwnedBusinesses.prototype.constructor = Window_OwnedBusinesses;

Window_OwnedBusinesses.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    let container = ImageManager.loadSystem("ft");
    container.addLoadListener(() => {
        this.contents.blt(container, 0, 0, 315, 250, 0, 80);
        this.contents.blt(container, 0, 0, 315, 250, 380, 80);
        //this.contents.blt(container, 0, 0, 315, 250, 0, 260);
        this.contents.blt(container, 0, 0, 315, 250, 380, 260);

        this.contents.fontSize = 40;
        this.contents.outlineColor = "black";
        this.contents.textColor = "white";
        this.contents.outlineWidth = 4;
        this.drawText("Cash", 0, 20, 315, "center");
        this.drawText("Savings", 380, 20, 315, "center");
        //this.drawText("Index", 0, 200, 315, "center");
        this.drawText("Goals", 380, 200, 315, "center");

        this.contents.fontSize = 15;
        this.contents.outlineColor = "white";
        this.contents.textColor = "black";

        let bills = [];
        this.drawText("Reoccurring Bills: ", 10, 200, 300, "center");

        if ($gameParty.houseRented) {
            let totalBills = $gameParty.houseRented.houseRef.rentCost + $gameParty.houseRented.houseRef.electricityCost + $gameParty.houseRented.houseRef.waterCost;
            let rent = "$"+totalBills +" due rent in "+$gameParty.houseRented.daysUntilRentPayment+" days";
            bills.push(rent);
        }

        EYF._realEstate.filter(realEstate => (realEstate && realEstate.isOwned)).forEach(realEstate => {
            if (!realEstate) return;
            bills.push("$"+ realEstate.ammortization +" monthly ammortization for "+realEstate.houseName+" due in "+ (30-$gameVariables.value(8)) +" days");
        });

        for (let i = 0; i < bills.length; i++) {
            this.drawText("- "+bills[i], 10, 220 + (20*i), 300, "left");
        }

        this.drawText("1% compounded monthly", 380, 50, 315, "center");
        let cash = $gameVariables.value(11); // Principal amount
        let interestRate = 0.01; // 1% interest rate per month
        let months = 12; // Number of months
        let finalAmount = cash * Math.pow(1 + interestRate, months);
        let ytd = finalAmount - cash;
        this.drawText("Deposited $" + $gameVariables.value(11) +" at 1% interest / mo. =", 380, 125, 315, "center");
        this.drawText("$" +ytd.toFixed(2)+" Interest YTD", 385, 145, 315, "center");

        let totalGoalAmount = 0;
        let totalGoalAllocation = 0;
        if (!$gameParty.goals) $gameParty.goals = [];
        $gameParty.goals.forEach(goal => {
            totalGoalAmount += goal.amount;
            totalGoalAllocation += goal.allocation;
        })
        this.drawText((totalGoalAllocation*100).toFixed(1)+"% OF EACH PAYCHECK ALLOCATED", 385, 230, 315, "center");

        this.contents.fontSize = 15;
        this.contents.outlineColor = "white";
        this.contents.textColor = "black";
        
        for (let i = 0; i<$gameParty.goals.length; i++) {
            let goal = $gameParty.goals[i];
            this.drawText("- "+goal.name + `[${goal.allocation*100}%]`, 385, 360 + (20*i), 300, "left");
        }


        this.contents.fontSize = 33;
        this.contents.outlineWidth = 3;
        this.contents.outlineColor = "black";
        this.contents.textColor = "white";
        this.drawText("$"+$gameParty.gold(), 0, 110, 315, "center");
        this.contents.outlineColor = "#51ef76";
        this.drawText("$"+$gameVariables.value(11), 380, 95, 315, "center");
        //this.contents.outlineColor = "#ff2841";
        //this.drawText("$"+(EYF.viewIndexFundHoldings(1) + EYF.viewIndexFundHoldings(2)).toFixed(2), 0, 290, 315, "center");
        this.contents.outlineColor = "#000000";
        if (!$gameParty.goalsAccount) $gameParty.goalsAccount = 0;
        this.drawText("$"+$gameParty.goalsAccount, 380, 290, 315, "center");
    })
};

function Window_Map() {
    this.initialize(...arguments);
}

Window_Map.prototype = Object.create(Window_Selectable.prototype);
Window_Map.prototype.constructor = Window_Map;

Window_Map.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.createTilemap();

};

Window_Map.prototype.create = function() {
    Window_Selectable.prototype.create.call(this);
};

Window_Map.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
};

Window_Map.prototype.canvasImg = function(image) {
    
};

Window_Map.prototype.createTilemap = function() {
    ImageManager.loadSystem("minimap");
    ImageManager.loadSystem("PIN");
    ImageManager.loadSystem("PIN_DEST");

    let minimapParent = document.createElement('div');
    minimapParent.id = "minimap-parent";
    minimapParent.style.visibility="hidden";
    minimapParent.oncontextmenu="return false;"

    let minimapViewport = document.createElement('div');
    minimapViewport.id = "minimap-viewport";
    minimapViewport.oncontextmenu="return false;"

    let minimapContent = document.createElement('img');
    minimapContent.id ="minimap-content";
    minimapContent.oncontextmenu="return false;"

    minimapParent.appendChild(minimapViewport);
    minimapViewport.appendChild(minimapContent);
    document.body.appendChild(minimapParent);

    this.addMapInteractor(minimapViewport);
    window.addEventListener('resize', function () {
        if (this._wzoom) this._wzoom.prepare();
    });

    minimapContent.addEventListener('click', this.pinDestination);
    this.pinPlayer();
};

Window_Map.prototype.pinPlayer = function() {
    let minimapContent = document.getElementById('minimap-content');
    let tempImage = document.createElement('img');
    tempImage.src = "/img/system/minimap.png";
    tempImage.onload = () => {
        let tempImage2 = document.createElement('img');
        tempImage2.src = "/img/system/PIN.png";
        
        let canvas = document.createElement("canvas");
        canvas.width = 2520;
        canvas.height = 2100;
        let context = canvas.getContext("2d");
        let scale = (2520/10080);
        let pinSize = (100*scale)*1.5;
        let playerX = ($gamePlayer._x *48) * scale;
        let playerY =  ($gamePlayer._y *48) * scale

        context.drawImage(tempImage, 0, 0);
        context.drawImage(tempImage2, playerX-(pinSize/2), playerY-(pinSize/2), pinSize,  pinSize);
        minimapContent.src = canvas.toDataURL();
        
        const image = new Image();
        image.src = canvas.toDataURL();
        EYF._mapWithPinnedPlayer = image;
        this.addDestination();
    }
}

Window_Map.prototype.pinDestination = function(event) {
    if (!EYF.isPinningDestination) return;
    let minimapContent = document.getElementById('minimap-content');

    let scale = parseFloat(minimapContent.style.transform.substring(minimapContent.style.transform.indexOf("scale(")+6, minimapContent.style.transform.lastIndexOf(")")));
    const rect = minimapContent.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    if (scale < 1) {
        mouseX *= (1 / scale);
        mouseY *= (1 / scale);
    } else if (scale > 1) {
        mouseX /= scale;
        mouseY /= scale;
    }
    console.log(mouseX + " | " + mouseY);
    console.log(rect.left + " | " + rect.top);
    let anchorX = 905;
    let anchorY = 850;
    let focusX = anchorX - mouseX + 355; 
    let focusY = anchorY - mouseY + 200;
    minimapContent.style.transform = `translate(${focusX}px, ${focusY}px) scale(1)`;


    let tempImage = document.createElement('img');
    tempImage.src = EYF._mapWithPinnedPlayer.src;
    tempImage.onload = () => {
        let tempImage2 = document.createElement('img');
        tempImage2.src = "/img/system/PIN_DEST.png";
        
        let canvas = document.createElement("canvas");
        canvas.width = 2520;
        canvas.height = 2100;
        let context = canvas.getContext("2d");
        let scale = (2520/10080);
        let pinSize = (100*scale)*1.5;
        let destX = mouseX;
        let destY = mouseY;

        context.drawImage(tempImage, 0, 0);
        context.drawImage(tempImage2, destX, destY, pinSize,  pinSize);
        minimapContent.src = canvas.toDataURL();
        EYF.playerDestination = {x: mouseX, y: mouseY};
    }
}

Window_Map.prototype.addDestination = function() {
    if (!EYF.playerDestination) return;
    let minimapContent = document.getElementById('minimap-content');

    let mouseX = EYF.playerDestination.x;
    let mouseY = EYF.playerDestination.y;

    let tempImage = document.createElement('img');
    tempImage.src = EYF._mapWithPinnedPlayer.src;
    tempImage.onload = () => {
        let tempImage2 = document.createElement('img');
        tempImage2.src = "/img/system/PIN_DEST.png";
        
        let canvas = document.createElement("canvas");
        canvas.width = 2520;
        canvas.height = 2100;
        let context = canvas.getContext("2d");
        let scale = (2520/10080);
        let pinSize = (100*scale)*1.5;
        let destX = mouseX;
        let destY = mouseY;

        context.drawImage(tempImage, 0, 0);
        context.drawImage(tempImage2, destX, destY, pinSize,  pinSize);
        minimapContent.src = canvas.toDataURL();
    }
}

Window_Map.prototype.addMapInteractor = function(frame) {
    this._wzoom = WZoom.create('#minimap-content', {
        dragScrollableOptions: {
            onGrab: function () {
                frame.style.cursor = 'grabbing';
            },
            onDrop: function () {
                frame.style.cursor = 'grab';
            }
        }, 
        minScale: 0.5,
        maxScale: 10,
        speed :2
    });
};

Window_Map.prototype.removeMapInteractor = function() {
    if (this._wzoom) this._wzoom.destroy();
};

Window_Map.prototype.loadTileset = function() {
    this._tileset = $gameMap.tileset();
    if (this._tileset) {
        const bitmaps = [];
        const tilesetNames = this._tileset.tilesetNames;
        for (const name of tilesetNames) {
            bitmaps.push(ImageManager.loadTileset(name));
        }
        this._tilemap.setBitmaps(bitmaps);
        this._tilemap.flags = $gameMap.tilesetFlags();
    }
};

function Window_MapCommand() {
    this.initialize(...arguments);
}

Window_MapCommand.prototype = Object.create(Window_Selectable.prototype);
Window_MapCommand.prototype.constructor = Window_MapCommand;

Window_MapCommand.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = ["Pin Dest.", "Clear Dest.", "Fast Travel"];
    this.refresh();
};

Window_MapCommand.prototype.maxItems = function() {
    return this._list ? this._list.length : 0;
};

Window_MapCommand.prototype.maxPageRows = function() {
    return 1;
}

Window_MapCommand.prototype.maxCols = function() {
    return 3;
};

Window_MapCommand.prototype.drawItem = function(index) {
    let rect = this.itemRect(index);
    let item = this._list[index];
    this.drawText(item, rect.x, rect.y, rect.width, "center");
}

function Window_MapPointPicker() {
    this.initialize(...arguments);
}

Window_MapPointPicker.prototype = Object.create(Window_Selectable.prototype);
Window_MapPointPicker.prototype.constructor = Window_MapPointPicker;

Window_MapPointPicker.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = [
        {name: "Block A North Texas Avenue", x:18 , y:79},
        {name: "Block B North Capitol Street", x:43 , y:166},
        {name: "Block C North Texas Avenue", x:99 , y:79},
        {name: "Block D North Capitol Street", x:99 , y:166},
        {name: "Block E North Texas Avenue", x:154 , y:79},
        {name: "Block F North Capitol Street", x:154 , y:166},
        {name: "Block G North Texas Avenue", x:165 , y:79},
        {name: "Block H North Capitol Street", x:165 , y:166},
    ];
    this.visible = false;
    this.refresh();
};

Window_MapPointPicker.prototype.setMapWindow = function(mw) {
    this._mapWindow = mw;
};

Window_MapPointPicker.prototype.item = function() {
    return this._list[this._index];
}

Window_MapPointPicker.prototype.select = function(index) {
    this._index = index;
    this.refreshCursor();
    this.callUpdateHelp();
    if (this._mapWindow) {
        let image = document.getElementById("minimap-content");
        let item = this._list[index];
        if (image && item) {
            let anchorX = 905;
            let anchorY = 850;
            let focusX = anchorX - ((item.x * 48) * (2520/10080)) + 355; 
            let focusY = anchorY - ((item.y * 48) * (2100/8400)) + 200;
            image.style.transform = `translate(${focusX}px, ${focusY}px) scale(1)`;
        }
    };
};

Window_MapPointPicker.prototype.maxItems = function() {
    return this._list ? this._list.length : 0;
};

Window_MapPointPicker.prototype.drawItem = function(index) {
    let item = this._list[index];
    let rect = this.itemRect(index);
    this.drawText(item.name, rect.x, rect.y, rect.width, "center");
};

function Window_Params() {
    this.initialize(...arguments);
}

Window_Params.prototype = Object.create(Window_Selectable.prototype);
Window_Params.prototype.constructor = Window_Params;

Window_Params.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.redrawParams();
};

Window_Params.prototype.redrawParams = function() {
    if (!this._action) {
        this._action = new Sprite();
        this._action.bitmap = ImageManager.loadSystem("Action");
        this._action.x = 10;
        this._action.y = 17;
        this.addChild(this._action);
    }

    if (!this._actionLbl) {
        this._actionLbl = new PIXI.Text($gameParty.actionCount + "/" + $gameParty.maxActions, {
            fontSize: 17,
            fill: "white",
            strokeThickness: 2,
            fontWeight: "bold",
            align: "center"
        });
        this._actionLbl.x = 35;
        this._actionLbl.y = 22;
        this.addChild(this._actionLbl);
    } else {this._actionLbl.text = $gameParty.actionCount + "/" + $gameParty.maxActions}

    if (!this._health) {
        this._health = new Sprite();
        this._health.bitmap = ImageManager.loadSystem("Health");
        this._health.x = 80;
        this._health.y = 17;
        this.addChild(this._health);
    }

    if (!this._healthLbl) {
        this._healthLbl = new PIXI.Text($gameParty.hp + "/" + $gameParty.mhp, {
            fontSize: 17,
            fill: "white",
            strokeThickness: 2,
            fontWeight: "bold",
            align: "center"
        });
        this._healthLbl.x = 110;
        this._healthLbl.y = 22;
        this.addChild(this._healthLbl);
    } else {this._healthLbl.text = $gameParty.hp + "/" + $gameParty.mhp}

    if (!this._job) {
        this._job = new Sprite();
        this._job.bitmap = ImageManager.loadSystem("Job");
        this._job.x = 180;
        this._job.y = 17;
        this.addChild(this._job);
    }

    if (!this._jobLbl) {
        this._jobLbl = new PIXI.Text($gameParty.leader()._level, {
            fontSize: 17,
            fill: "white",
            strokeThickness: 2,
            fontWeight: "bold",
        });
        this._jobLbl.x = 210;
        this._jobLbl.y = 22;
        this.addChild(this._jobLbl);
    } else {
        this._jobLbl.text = $gameParty.leader()._level
    }
};

function Window_Resume() {
    this.initialize(...arguments);
}

Window_Resume.prototype = Object.create(Window_Selectable.prototype);
Window_Resume.prototype.constructor = Window_Resume;

Window_Resume.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.contents.fontSize = 17;
    this.drawResume();
};

Window_Resume.prototype.drawCharacter = function(
    characterName, characterIndex, x, y
) {
    const bitmap = ImageManager.loadCharacter(characterName);
    const big = ImageManager.isBigCharacter(characterName);
    const pw = bitmap.width / (big ? 3 : 12);
    const ph = bitmap.height / (big ? 4 : 8);
    const n = big ? 0: characterIndex;
    const sx = ((n % 4) * 3 + 1) * pw;
    const sy = Math.floor(n / 4) * 4 * ph;
    this.contents.blt(bitmap, sx, sy, pw, ph, x - pw / 2, y - ph, 100, 100);
};


Window_Resume.prototype.drawResume = function() {
    this._gold = $gameParty.gold();
    this._index = (EYF.viewIndexFundHoldings(1) + EYF.viewIndexFundHoldings(2)).toFixed(2);
    this._savings = $gameVariables.value(11); 

    if (EYF._playerBitmap) {
        this.contents.blt(EYF._playerBitmap, 48, 0, 48, 48, 40, 20, 100, 100);
    } else {
        this.drawCharacter($gameParty.leader()._characterName, $gameParty.leader()._characterIndex, 70, 70);
    }

    this.drawText($gameParty.leader()._name, 40, 120, 100, "center");
    this.drawIcon(92, 5, 160);
    this.drawText("Job level: " + $gameParty.leader()._level, 0, 160, 170, "right");
    this.contents.fillRect(10, 200, 160, 22,  "#000000");
    this.contents.fillRect(12, 202, 158 * ($gameParty.leader().currentLevelExp()/$gameParty.leader().nextLevelExp()), 18,  "#bd7e4a");
    this.contents.fontSize = 13;
    this.drawText("Next lvl. "+ $gameParty.leader().currentLevelExp()+"/"+$gameParty.leader().nextLevelExp(), 12, 194, 158, "center")
    this.contents.fontSize = 17;
    this.drawIcon(90, 5, 230);
    this.drawText("Health: " + $gameParty.hp, 0, 230, 170, "right");
    this.drawIcon(91, 5, 260);
    this.drawText("Action count: " + $gameParty.actionCount, 0, 260, 170, "right");

    this.drawText("On-hand", 10, 300, 170, "left");
    this.drawCurrencyValue(Math.floor(this._gold), TextManager.currencyUnit, 85, 300, 185);
    this.changeTextColor("#000000");
    this.drawText("Bank", 10, 330, 170, "left");
    this.drawCurrencyValue(Math.floor(this._savings), TextManager.currencyUnit, 85, 330, 185);
    this.changeTextColor("#000000");
    this.drawText("Index", 10, 360, 170, "left");
    this.drawCurrencyValue(Math.floor(this._index), TextManager.currencyUnit, 85, 360, 185);

    this.contents.fontSize = 19;
    this.changeTextColor("#484999");
    this.drawText("Learned Skills: ", 200, 20, 150, "left");
    this.contents.fontSize = 17;
    this.changeTextColor("#000000");
    let skills = $gameParty.specialSkills;
    if (skills) {
        for (let i = 0; i < skills.length; i++) {
            this.drawText("- " + skills[i], 200, 40 + (20*i), 150, "left");
        }
    }
    this.contents.fontSize = 19;
    this.changeTextColor("#4ce0d2");
    this.drawText("Passed Quizzes: ", 400, 20, 150, "left");
    this.contents.fontSize = 17;
    let quizzes = $gameParty.passedQuizzes;
    if (quizzes) {
        for (let i = 0; i < quizzes.length; i++) {
            this.drawText("- " + quizzes[i], 400, 40 + (20*i), 150, "left");
        }
    }
};
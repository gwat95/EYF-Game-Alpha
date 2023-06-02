function Scene_SpecialClass() {
    this.initialize(...arguments);
}

Scene_SpecialClass.prototype = Object.create(Scene_Message.prototype);
Scene_SpecialClass.prototype.constructor = Scene_SpecialClass;

Scene_SpecialClass.prototype.initialize = function() {
    Scene_Message.prototype.initialize.call(this);
};

Scene_SpecialClass.prototype.create = function() {
    Scene_Message.prototype.create.call(this);
    this.createBackground();
    this.createDisplayObjects();
};

Scene_SpecialClass.prototype.createBackground = function() {
    this._backgroundFilter = new PIXI.filters.BlurFilter();
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this._backgroundSprite.filters = [this._backgroundFilter];
    this.addChild(this._backgroundSprite);
    this.setBackgroundOpacity(192);
};

Scene_SpecialClass.prototype.setBackgroundOpacity = function(opacity) {
    this._backgroundSprite.opacity = opacity;
};


Scene_SpecialClass.prototype.createDisplayObjects = function() {
    this.createWindowLayer();
    this.createAllWindows();
};

let gbc_specialclass_scenemessage_createallwindows = Scene_Message.prototype.createAllWindows;
Scene_SpecialClass.prototype.createAllWindows = function() {
    this.createHeaderWindow();
    this.createClassSelectionWindow();
    gbc_specialclass_scenemessage_createallwindows.call(this);
};

Scene_SpecialClass.prototype.createHeaderWindow = function() {
    this._headerWindow = new Window_SpecialClassHeader(this.headerWindowRect());
    this.addWindow(this._headerWindow);
};

Scene_SpecialClass.prototype.headerWindowRect = function() {
    const ww = 900;
    const wh = 80;
    const wx = Graphics.boxWidth / 2 - ww/2;
    const wy = 70;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_SpecialClass.prototype.createClassSelectionWindow = function() {
    this._classSelection = new Window_SpecialClass(this.classSelectionRect());
    this._classSelection.setHandler("ok", this.onItemOk.bind(this));
    this._classSelection.setHandler("cancel", this.onItemCancel.bind(this));
    this.addWindow(this._classSelection);
};

Scene_SpecialClass.prototype.update = function () {
    Scene_Message.prototype.update.call(this);
    if (!$gameMessage.isBusy() && !this._classSelection.active) {
        this._classSelection.activate();
    }
};

Scene_SpecialClass.prototype.onItemOk = function() {
    let item = this._classSelection.item();
    let index = this._classSelection._index;
    if ($gameParty.actionCount >= item.actionCost && $gameParty.gold() >= item.goldCost) {
        if (item.currentProgress == item.maxProgress) {
            $gameMessage.add("You have already mastered this course.");
            SoundManager.playBuzzer();
        } else {
            item.currentProgress += 1;
            $gameParty.loseMoney(item.goldCost);
            $gameParty.consumeAction(item.actionCost);
            this._classSelection.refresh();
            this._classSelection.activate();
            EYFUI.addActivity("Took classes on " + item.name, item.goldCost, "outflow");
            if (item.currentProgress == item.maxProgress) {
                EYFUI.addActivity("Mastered course: " + item.name, 0, "outflow");
                AudioManager.playMe({name: "Victory1", pan: 0, pitch: 100, volume: 100});
                $gameMessage.add("Congratulations. You have now mastered this course and acquired the skill \n\\C[2]"+item.name+"\\C[0].");
                $gameParty.unlockSkill(item.name);
            }
        }
        EYF._specialClasses[index] = item;
        console.log(EYF._specialClasses);
    } else {
        $gameMessage.add("Cost requirements not met.");
        SoundManager.playBuzzer();
    }
};

Scene_SpecialClass.prototype.onItemCancel = function() {
    SceneManager.pop();
};

Scene_SpecialClass.prototype.classSelectionRect = function() {
    const ww = 900;
    const wh = Graphics.boxHeight - 200;
    const wx = Graphics.boxWidth / 2 - ww/2;
    const wy = 150;
    return new Rectangle(wx, wy, ww, wh);
};

function Window_SpecialClassHeader() {
    this.initialize(...arguments);
}

Window_SpecialClassHeader.prototype = Object.create(Window_Selectable.prototype);
Window_SpecialClassHeader.prototype.constructor = Window_SpecialClassHeader;

Window_SpecialClassHeader.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.contents.fontSize = 36;
    this.drawText("Course Selection", 0, 10, rect.width, "center");
};

function Window_SpecialClass() {
    this.initialize(...arguments);
}

Window_SpecialClass.prototype = Object.create(Window_Selectable.prototype);
Window_SpecialClass.prototype.constructor = Window_SpecialClass;

Window_SpecialClass.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = EYF._specialClasses;
    for (let i = 0; i < this._list.length; i++) {
        let bitmap = ImageManager.loadBitmap("img/eyf/specialclasses/", this._list[i].name)
        this._list[i].bitmap = bitmap;
        if (i == this._list.length - 1) {
            bitmap.addLoadListener(() => {
                this.refresh();
                this.activate();
                this.select(0);
            });
        }
    }
};

Window_SpecialClass.prototype.rowSpacing = function() {
    return 10;
};

Window_SpecialClass.prototype.maxCols = function() {
    return 2;
};

Window_SpecialClass.prototype.itemHeight = function() {
    return 150;
};

Window_SpecialClass.prototype.maxItems = function() {
    return this._list ? this._list.length : 0;
};

Window_SpecialClass.prototype.item = function() {
    return this._list[this._index];
};

Window_SpecialClass.prototype.maxPageRows = function() {
    return 1;
};

Window_SpecialClass.prototype.drawItem = function(index) {
    let item = this._list[index];
    let rect = this.itemRect(index);
    this.drawImage(item.bitmap, rect.x, rect.y);
    this.contents.fontSize = 22;
    this.changeTextColor("#484999");
    this.drawText(item.name, rect.x + 160, rect.y, rect.width, "left");
    this.contents.fontSize = 15;
    this.changeTextColor(ColorManager.normalColor());
    this.drawText(`Progress: ${item.currentProgress}/${item.maxProgress}`, rect.x + 160, rect.y+75, rect.width, "left");
    this.drawText(`Course Cost: ﹩${item.goldCost}`, rect.x + 160, rect.y+25, rect.width, "left");
    this.drawText(`Action Count Cost: ${item.actionCost}`, rect.x + 160, rect.y+50, rect.width, "left");
    this.drawIcon(91, rect.x + 310, rect.y+50, rect.width, "left");
    for (let i = 0; i < 10; i++) {
        if (i < item.currentProgress) {
            this.drawIcon(94, rect.x + 148 + (i*28), rect.y+105, rect.width, "left");
        } else {
            this.drawIcon(93, rect.x + 148 + (i*28), rect.y+105, rect.width, "left");
        }
    }
};

Window_SpecialClass.prototype.drawImage = function (pic, x, y) {
    const bitmap = pic
    const pw = 300;
    const ph = 300;
    const sx = 0;
    const sy = 0;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
};
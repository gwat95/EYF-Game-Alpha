/*
@author coffeenahc

@target MZ
@plugindesc
Commissioned work by coffeenahc for grantw95 (fiverr)
*/

EYF.initJobBoard = function() {
    this.jobListings = [];
};

EYF.addToJobBoard = function(actionReq, healthReq, lvlReq, skillReq, payRwrd, expRwrd, title, desc, location, coordinates) {
    let job = {
        action: actionReq,
        health: healthReq,
        level: lvlReq,
        skill: skillReq,
        pay: payRwrd,
        exp: expRwrd,
        title: title,
        description: desc,
        location: location,
        coordinates: coordinates
    };    
    this.jobListings.push(job);
};

EYF.removeFromJobBoard = function(title) {
    for (let i = 0; i < this.jobListings.length; i++) {
        let job = this.jobListings[i];
        if (job.title === title) this.jobListings.splice(i, 1);
        return;
    }
};

function Scene_JobBoard() {
    this.initialize(...arguments);
}

Scene_JobBoard.prototype = Object.create(Scene_Message.prototype);
Scene_JobBoard.prototype.constructor = Scene_JobBoard;

Scene_JobBoard.prototype.initialize = function() {
    Scene_Message.prototype.initialize.call(this);
};

Scene_JobBoard.prototype.create = function() {
    Scene_Message.prototype.create.call(this);
    this.createBackground();
    this.createDisplayObjects();
};

Scene_JobBoard.prototype.update = function() {
    Scene_Message.prototype.update.call(this);
    if (this._jobListWindow && !this._jobListWindow.active && !$gameMessage.isBusy() && !this._dialogWindow.visible && !this._messageWindow.isOpen()) {
        this._jobListWindow.activate();
    }
};

Scene_JobBoard.prototype.createDisplayObjects = function() {
    this.createWindowLayer();
    this.createAllWindows();
    this.createCancelButton();
};

Scene_JobBoard.prototype.createCancelButton = function() {
    this._cancelButton = new Sprite_Button("cancel");
    this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
    this._cancelButton.y = this.buttonY();
    this.addWindow(this._cancelButton);
};

let gbc_jobboard_scenemessage_createallwindows = Scene_Message.prototype.createAllWindows;
Scene_JobBoard.prototype.createAllWindows = function() {
    this.createHelpWindow();
    this.createJobDetailWindow();
    this.createJobListWindow();
    this.createDialogWindow();
    gbc_jobboard_scenemessage_createallwindows.call(this);
};


Scene_JobBoard.prototype.createHelpWindow = function() {
    const rect = this.helpWindowRect();
    this._helpWindow = new Window_Help(rect);
    this._helpWindow.setText("Job Board");
    this.addWindow(this._helpWindow);
};

Scene_JobBoard.prototype.helpWindowRect = function() {
    const wx = (this.calcWindowHeight(1));
    const wy = this.calcWindowHeight(1, false) + 10;
    const ww = Graphics.boxWidth - (this.calcWindowHeight(2, true));
    const wh = this.calcWindowHeight(1, false);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_JobBoard.prototype.createJobListWindow = function() {
    this._jobListWindow = new Window_JobList(this.jobListWindowRect());
    this._jobListWindow.setHandler("cancel", this.popScene.bind(this));
    this._jobListWindow.setHandler("ok", this.onListOk.bind(this));
    this._jobListWindow.setItems(EYF.jobListings);
    this._jobListWindow.setDetailWindow(this._jobDetailWindow);
    this.addWindow(this._jobListWindow);
};

Scene_JobBoard.prototype.jobListWindowRect = function() {
    let width = Graphics.boxWidth / 4;
    let height = Graphics.boxHeight - (this.calcWindowHeight(4, true));
    let x = this.calcWindowHeight(1);
    let y = this.calcWindowHeight(3);
    return new Rectangle(x,y,width,height);
};

Scene_JobBoard.prototype.popScene = function() {
    SceneManager.pop();
};

Scene_JobBoard.prototype.onListOk = function() {
    this.showDialog();
};

Scene_JobBoard.prototype.createDialogWindow = function() {
    this._dialogWindow = new Window_Dialog(this.dialogWindowRect());
    this._dialogWindow.setHandler("ok", this.onDialogOk.bind(this));
    this._dialogWindow.setHandler("cancel", this.hideDialog.bind(this));
    this.addWindow(this._dialogWindow);
};

Scene_JobBoard.prototype.showDialog = function() {
    this._dialogWindow.show();
    this._dialogWindow.open();
    this._dialogWindow.activate();
    this._dialogWindow.select(0);
};

Scene_JobBoard.prototype.hideDialog = function() {
    this._dialogWindow.hide();
    this._dialogWindow.close();
    this._dialogWindow.deactivate();
    this._dialogWindow.deselect();
};

Scene_JobBoard.prototype.onDialogOk = function() {
    let index = this._dialogWindow._index;
    if (index == 0) {
        this.fastTravel();
    } else {
        this.hideDialog()
    }
};

Scene_JobBoard.prototype.fastTravel = function() {
    let dest = this._jobListWindow.item().coordinates;
    if (dest) {
        if ($gameParty.hasVehicle) {
            $gameVariables.setValue(30, dest[0])
            $gameVariables.setValue(31, dest[1]);
            $gameVariables.setValue(32, dest[2]);
            SceneManager.pop();
            $gameTemp.reserveCommonEvent(7);
        } else {
            $gameMessage.add("You don't have a vehicle to fast travel yet.");
            this.hideDialog();
        }
    } else {
        $gameMessage.add("This location does not have a fast travel point.");
        this.hideDialog();
    }
};

Scene_JobBoard.prototype.dialogWindowRect = function() {
    let width = Graphics.boxWidth / 4;
    let height = this.calcWindowHeight(4);
    let x = (Graphics.boxWidth - width) / 2;
    let y = (Graphics.boxHeight - height) / 2;
    return new Rectangle(x,y,width,height);
};

Scene_JobBoard.prototype.createJobDetailWindow = function() {
    this._jobDetailWindow = new Window_JobDetail(this.jobDetailWindowRect());
    this.addWindow(this._jobDetailWindow);
};

Scene_JobBoard.prototype.jobDetailWindowRect = function() {
    let width = Graphics.boxWidth - (Graphics.boxWidth / 4) - 120;
    let height = Graphics.boxHeight - (this.calcWindowHeight(4, true));
    let x = Graphics.boxWidth / 4 + 10 + this.calcWindowHeight(1);
    let y = this.calcWindowHeight(3);
    return new Rectangle(x,y,width,height);
};

Scene_JobBoard.prototype.createBackground = function() {
    this._backgroundFilter = new PIXI.filters.BlurFilter();
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this._backgroundSprite.filters = [this._backgroundFilter];
    this.addChild(this._backgroundSprite);
    this.setBackgroundOpacity(192);
};

Scene_JobBoard.prototype.setBackgroundOpacity = function(opacity) {
    this._backgroundSprite.opacity = opacity;
};

function Window_JobList() {
    this.initialize(...arguments);
}

Window_JobList.prototype = Object.create(Window_Selectable.prototype);
Window_JobList.prototype.constructor = Window_JobList;

Window_JobList.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = [];
};

Window_JobList.prototype.setItems = function(items) {
    console.log(items);
    this._list = items;
    this.refresh();
    this.activate();
    this.select(0);
};

Window_JobList.prototype.item = function() {
    return this._list ? this._list[this._index] : null;
};

Window_JobList.prototype.setDetailWindow = function(dw) {
    this._detailedWindow = dw;
    this.select(0);
};

Window_JobList.prototype.select = function(index) {
    this._index = index;
    this.refreshCursor();
    this.callUpdateHelp();
    if (this._detailedWindow) this._detailedWindow.drawJobDetails(this._list[index]);
};

Window_JobList.prototype.maxItems = function() {
    return this._list ? this._list.length : 0;
};

Window_JobList.prototype.drawItem = function(index) {
    let item = this._list[index];
    let rect = this.itemRect(index);
    this.drawText(item.title, rect.x, rect.y, rect.width, "center");
};

function Window_JobDetail() {
    this.initialize(...arguments);
}

Window_JobDetail.prototype = Object.create(Window_Selectable.prototype);
Window_JobDetail.prototype.constructor = Window_JobDetail;

Window_JobDetail.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);   
};

Window_JobDetail.prototype.drawJobDetails = function(job) {
    if (!job) return;
    let desc = job.description.split("\n");
    let y = desc.length >= 2 ? 30 : 0;
    this.contents.clear();
    this.contents.fontSize = 13;
    this.changeTextColor(ColorManager.systemColor());
    this.drawText("Job Title", 10, 10, this.width, "left");
    this.drawText("Job Description", 10, 60, this.width, "left");
    this.drawText("Job Requirements", 10, 130 + y, this.width, "left");
    this.drawText("Job Compensation", 10, 320 + y, this.width, "left");
    this.drawText("Job Location", 10, 380 + y, this.width, "left");

    this.contents.fontSize = 22;
    this.changeTextColor(ColorManager.normalColor());
    this.drawText(job.title, 10, 30, this.width, "left");
    if (desc.length > 1) {
        this.drawText(desc[0], 10, 80, this.width, "left");
        this.drawText(desc[1], 10, 110, this.width, "left");
    } else {
        this.drawText(job.description, 10, 80, this.width, "left");
    }
    this.drawIcon(90, 10, 160 + y);
    this.drawIcon(91, 10, 200 + y);
    this.drawIcon(92, 10, 240 + y);
    this.drawText(job.health + " health", 50, 160 + y, this.width, "left");
    this.drawText(job.action + " action count", 50, 200 + y, this.width, "left");
    this.drawText("job level " + job.level, 50, 240 + y, this.width, "left");
    this.drawText("skill set: " + job.skill, 50, 280 + y, this.width, "left");
    this.drawText("﹩"+job.pay + " + " + job.exp+"EXP" , 10, 340 + y, this.width, "left");
    this.drawText(job.location, 10, 400 + y, this.width, "left");
};

function Window_Dialog() {
    this.initialize(...arguments);
}

Window_Dialog.prototype = Object.create(Window_Selectable.prototype);
Window_Dialog.prototype.constructor = Window_Dialog;

Window_Dialog.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);   
    this.openness = 0;
    this.visible = false;
    this._list = ["Yes", "No"];
    this.refresh();
};

Window_Dialog.prototype.maxItems = function() {
    return 2;
};

Window_Dialog.prototype.drawAllItems = function() {
    const topIndex = this.topIndex();
    this.drawLabel();
    for (let i = 0; i < this.maxVisibleItems(); i++) {
        const index = topIndex + i;
        if (index < this.maxItems()) {
            this.drawItemBackground(index);
            this.drawItem(index);
        }
    }
};

Window_Dialog.prototype.itemRect = function(index) {
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

Window_Dialog.prototype.drawLabel = function() {
    let label = "Fast Travel?";
    this.drawText(label, 0, 10, this.width-16, "center");
};

Window_Dialog.prototype.drawItem = function(index) {
    let rect = this.itemRect(index);
    this.drawText(this._list[index], rect.x, rect.y, rect.width, "center");
};
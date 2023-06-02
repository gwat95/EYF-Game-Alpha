/*:
@author coffeenahc

@target MZ
@plugindesc Add a feature to rename and delete save files
*/

DataManager.deleteGame = function(savefileId) {
    const saveName = this.makeSavename(savefileId);
    return StorageManager.saveObject(saveName, null).then(() => {
        this._globalInfo[savefileId] = null;
        this.saveGlobalInfo();
        return 0;
    });
};

DataManager.saveGame = function(savefileId, filename) {
    const contents = this.makeSaveContents();
    const saveName = this.makeSavename(savefileId);
    return StorageManager.saveObject(saveName, contents).then(() => {
        let info = this.makeSavefileInfo();
        info.filename = filename;
        this._globalInfo[savefileId] = info;
        this.saveGlobalInfo();
        return 0;
    });
};

DataManager.loadSaveFileCustomImages = function() {

}

let gbc_renamesave_scenefile_create = Scene_File.prototype.create;
Scene_File.prototype.create = function() {
    DataManager.loadSaveFileCustomImages();
    gbc_renamesave_scenefile_create.call(this);
    this.createEditWindow();
    this.createInputWindow();
};

Scene_File.prototype.loadAllCharacterBitmaps = function() {

};

Scene_File.prototype.showInputWindow = function() {
    let index = this._listWindow.index();
    const savefileId = this._listWindow.indexToSavefileId(index);
    const info = DataManager.savefileInfo(savefileId);
    let name = info.filename ? info.filename : "File "+index;
    this._editWindow._name = name;
    this._editWindow.select(name.length);
    this._editWindow.refresh();
    this._editWindow.show();
    this._inputWindow.show();
    this._inputWindow.activate();
};

Scene_File.prototype.hideInputWindow = function() {
    this._editWindow.hide();
    this._inputWindow.hide();
    this._inputWindow.deactivate();
    this._listWindow.refresh();
    this._listWindow.activate();
}

Scene_File.prototype.createEditWindow = function() {
    const rect = this.editWindowRect();
    this._editWindow = new Window_NameEdit(rect);
    this._editWindow._maxLength = 10;
    this._editWindow.select(0);
    this._editWindow.visible = false;
    this.addWindow(this._editWindow);
};

Scene_File.prototype.editWindowRect = function() {
    const inputWindowHeight = this.calcWindowHeight(6, true);
    const padding = $gameSystem.windowPadding();
    const ww = 600;
    const wh = ImageManager.faceHeight + padding * 2;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = (Graphics.boxHeight - (wh + inputWindowHeight + 8)) / 2;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_File.prototype.createInputWindow = function() {
    const rect = this.inputWindowRect();
    this._inputWindow = new Window_NameInput(rect);
    this._inputWindow.setEditWindow(this._editWindow);
    this._inputWindow.setHandler("ok", this.onInputOk.bind(this));
    this._inputWindow.visible = false;
    this._inputWindow.deactivate();
    this.addWindow(this._inputWindow);
};

Scene_File.prototype.onInputOk = function() {
    let index = this._listWindow.index();
    const savefileId = this._listWindow.indexToSavefileId(index);
    let filename = this._editWindow._name;
    if (this.mode() === "load") {
        DataManager.loadGame(savefileId).then(() => {
            $gameSystem.setSavefileId(savefileId);
            $gameSystem.onBeforeSave();
            DataManager.saveGame(savefileId, filename).then(() => this.hideInputWindow());  
        });
    } else {
        $gameSystem.setSavefileId(savefileId);
        $gameSystem.onBeforeSave();
        DataManager.saveGame(savefileId, filename).then(() => this.hideInputWindow());
    }
};

Scene_File.prototype.inputWindowRect = function() {
    const wx = this._editWindow.x;
    const wy = this._editWindow.y + this._editWindow.height + 8;
    const ww = this._editWindow.width;
    const wh = this.calcWindowHeight(6, true);
    return new Rectangle(wx, wy, ww, wh);
};

Scene_File.prototype.onSavefileOk = function() {
    const savefileId = this._listWindow.indexToSavefileId(this._listWindow.index());
    const info = DataManager.savefileInfo(savefileId);
    if (!info || this._listWindow.index() == 0) return false;
    if (this._listWindow.isHoveringEdit()) {
        this.showInputWindow();
        return true;
    } else if (this._listWindow.isHoveringTrash()) {
        this._listWindow.deleteSave();
        return true;
    }
    return false;
};

Scene_Save.prototype.onSavefileOk = function() {
    if (!Scene_File.prototype.onSavefileOk.call(this)) {
        const savefileId = this.savefileId();
        if (this.isSavefileEnabled(savefileId)) {
            this.executeSave(savefileId);
        } else {
            this.onSaveFailure();
        }
    }
};

Scene_Load.prototype.onSavefileOk = function() {
    if (!Scene_File.prototype.onSavefileOk.call(this)) {
        const savefileId = this.savefileId();
        if (this.isSavefileEnabled(savefileId)) {
            this.executeLoad(savefileId);
        } else {
            this.onLoadFailure();
        }
    }
};



Window_SavefileList.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.activate();
    this._mode = null;
    this._autosave = false;
    this.loadAllCharacterBitmaps();
};

Window_SavefileList.prototype.deleteSave = function() {
    const savefileId = this.indexToSavefileId(this.index());
    DataManager.deleteGame(savefileId).then(() => {
        this.refresh();
        this.activate();
        AudioManager.playSe({name: "Cancel1", pan: 0, pitch: 100, volume: 100});
    });    
};

Window_SavefileList.prototype.refreshCursor = function() {
    if (this._cursorAll) {
        this.refreshCursorForAll();
    } else if (this.index() >= 0) {
        let rect = this.itemRect(this.index());
        const savefileId = this.indexToSavefileId(this.index());
        const info = DataManager.savefileInfo(savefileId);
        if (info) {
            if (this.isHoveringEdit()) {
                rect = this.editBtnRect(rect);
                rect.x -= 4;
                rect.y -= 4;
                rect.width += 12;
                rect.height += 12;
            }
            else if (this.isHoveringTrash()) {
                rect = this.trashBtnRect(rect);
                rect.x -= 4;
                rect.y -= 4;
                rect.width += 12;
                rect.height += 12;
            }
        }
        this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
    } else {
        this.setCursorRect(0, 0, 0, 0);
    }
};

Window_SavefileList.prototype.isHoveringEdit = function() {
    const touchPos = new Point(TouchInput.x, TouchInput.y);
    const localPos = this.worldTransform.applyInverse(touchPos);
    return this.hitTestEdit(localPos.x, localPos.y);
};

Window_SavefileList.prototype.hitTestEdit = function(x, y) {
    if (this.innerRect.contains(x, y)) {
        const cx = this.origin.x + x - this.padding;
        const cy = this.origin.y + y - this.padding;
        const topIndex = this.topIndex();
        for (let i = 0; i < this.maxVisibleItems(); i++) {
            const index = topIndex + i;
            if (index < this.maxItems()) {
                const rect = this.itemRect(index);
                if (this.editBtnRect(rect).contains(cx, cy)) {
                    return true;
                }
            }
        }
    }
    return false;
};

Window_SavefileList.prototype.editBtnRect = function(rect) {
    let x = rect.width - 69 - (38/2) + 1;
    let y  = rect.y + 5;
    let width = 38;
    let height = 38;
    let editRect = new Rectangle(x,y,width,height);
    return editRect;
}

Window_SavefileList.prototype.isHoveringTrash = function() {
    const touchPos = new Point(TouchInput.x, TouchInput.y);
    const localPos = this.worldTransform.applyInverse(touchPos);
    return this.hitTestTrash(localPos.x, localPos.y);
};

Window_SavefileList.prototype.hitTestTrash = function(x, y) {
    if (this.innerRect.contains(x, y)) {
        const cx = this.origin.x + x - this.padding;
        const cy = this.origin.y + y - this.padding;
        const topIndex = this.topIndex();
        for (let i = 0; i < this.maxVisibleItems(); i++) {
            const index = topIndex + i;
            if (index < this.maxItems()) {
                const rect = this.itemRect(index);
                if (this.trashBtnRect(rect).contains(cx, cy)) {
                    return true;
                }
            }
        }
    }
    return false;
};

Window_SavefileList.prototype.trashBtnRect = function(rect) {
    let x = rect.width - 24 - (38/2) + 1;
    let y  = rect.y + 5;
    let width = 38;
    let height = 38;
    let trashRect = new Rectangle(x,y,width,height);
    return trashRect;
};

Window_SavefileList.prototype.drawItem = function(index) {
    const savefileId = this.indexToSavefileId(index);
    const info = DataManager.savefileInfo(savefileId);
    const rect = this.itemRectWithPadding(index);
    this.resetTextColor();
    this.changePaintOpacity(this.isEnabled(savefileId));
    this.drawTitle(savefileId, rect.x, rect.y + 4);
    if (info) {
        this.drawContents(info, rect, index);
        if (index != 0) {
            this.drawActionIcons(rect);
        }
    }
};

Window_SavefileList.prototype.drawTitle = function(savefileId, x, y) {
    const info = DataManager.savefileInfo(savefileId);
    if (savefileId === 0) {
        this.drawText(TextManager.autosave, x, y, 180);
    } else if (info && info.filename) {
        this.drawText(info.filename, x, y, 180);
    } else {
        this.drawText(TextManager.file + " " + savefileId, x, y, 180);
    }
};

Window_SavefileList.prototype.drawActionIcons = function(rect) {
    let editIcon = ImageManager.loadSystem("EDIT");
    this.contents.fillRect(rect.width - 70, rect.y + 5, 40, 40, ColorManager.textColor(3));
    this.contents.blt(editIcon, 0, 0, 48, 48, rect.width - 69, rect.y + 5, 38, 38);

    let trashIcon = ImageManager.loadSystem("TRASH");
    this.contents.fillRect(rect.width - 25, rect.y + 5, 40, 40, ColorManager.systemColor());
    this.contents.blt(trashIcon, 0, 0, 48, 48, rect.width - 24, rect.y + 5, 38, 38);
};

Window_SavefileList.prototype.drawContents = function(info, rect, index) {
    const bottom = rect.y + rect.height;
    if (rect.width >= 420) {
        this.drawPartyCharacters(info, rect.x + 220, bottom - 8, index);
    }
    const lineHeight = this.lineHeight();
    const y2 = bottom - lineHeight - 4;
    if (y2 >= lineHeight) {
        this.drawPlaytime(info, rect.x, y2, rect.width);
    }
};

Window_SavefileList.prototype.drawPartyCharacters = function(info, x, y, index) {    
    if (info.characters) {
        let characterX = x;
        for (const data of info.characters) {
            if (data[0] !== "") {
                this.drawCharacter(data[0], data[1], characterX, y, index);
                characterX += 48;
            }
        }
    }
};

Window_SavefileList.prototype.loadAllCharacterBitmaps = function() {
    StorageManager.customBitmaps = [];
    for (let i = 0; i < this.maxItems(); i++) {
        const savefileId = this.indexToSavefileId(i);
        const info = DataManager.savefileInfo(savefileId);
        const saveName = DataManager.makeSavename(savefileId);
        StorageManager.loadObject(saveName).then(contents => {
            //console.log(i);
            //console.log(contents);
            if (!contents) {return};
            let bitmapParams = contents.EYF._playerBitmapParams;
            if (bitmapParams) {
                let baseBitmap = ImageManager.loadBitmap('generator/Body/', bitmapParams[6]+bitmapParams[5], 0, true);
                let clothingBitmap = ImageManager.loadBitmap('generator/Clothing/', bitmapParams[0], 0, true);
                let frontHair1Bitmap = ImageManager.loadBitmap('generator/FrontHair1/', bitmapParams[1], 0, true);
                let frontHair2Bitmap = ImageManager.loadBitmap('generator/FrontHair2/', bitmapParams[2], 0, true);
                let rearHair1Bitmap = ImageManager.loadBitmap('generator/RearHair1/', bitmapParams[3], 0, true);
                let rearHair2Bitmap = ImageManager.loadBitmap('generator/RearHair2/', bitmapParams[4], 0, true);
            
                const combinedBitmap = new Bitmap(144, 192);
        
                Promise.all([baseBitmap, clothingBitmap, rearHair1Bitmap, rearHair2Bitmap, frontHair1Bitmap, frontHair2Bitmap].map(bmp => new Promise((resolve, reject) => bmp.addLoadListener(resolve))))
                .then((bitmaps) => {
                    let hues = [
                        [20,20, 20], // Red
                        [40,40, 40], // Green
                        [60,60, 60], // Blue
                        [80,80, 80], // Yellow
                        [100,100, 100], // Magenta
                        [120,120, 120], // Cyan
                        [140,140, 140], // Maroon
                        [160,160, 160], // Olive
                        [180,180, 180], // Navy
                        [200,200, 200], // Olive green
                    ]
                    if (bitmapParams[7] != 0) {
                        let hairHue = hues[bitmapParams[7]];
                        frontHair1Bitmap = EYF.hueShift(frontHair1Bitmap,  hairHue[0], hairHue[1], hairHue[2], 0);
                        frontHair2Bitmap = EYF.hueShift(frontHair2Bitmap,  hairHue[0], hairHue[1], hairHue[2], 0);
                        rearHair1Bitmap = EYF.hueShift(rearHair1Bitmap,  hairHue[0], hairHue[1], hairHue[2], 0);
                        rearHair2Bitmap = EYF.hueShift(rearHair2Bitmap,  hairHue[0], hairHue[1], hairHue[2], 0);
                    }
                    if (bitmapParams[8] != 0) {
                        let clotheHue = hues[bitmapParams[8]];
                        clothingBitmap = EYF.hueShift(clothingBitmap,  clotheHue[0], clotheHue[1], clotheHue[2], 0);
                    }
                }).finally((bitmaps) => {
                    combinedBitmap.blt(baseBitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
                    combinedBitmap.blt(clothingBitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
                    combinedBitmap.blt(frontHair1Bitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
                    combinedBitmap.blt(frontHair2Bitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
                    combinedBitmap.blt(rearHair1Bitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
                    combinedBitmap.blt(rearHair2Bitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        
                    StorageManager.customBitmaps[i] = combinedBitmap;
                    this.refresh();
                });
            } 
        });
    }
}

Window_SavefileList.prototype.drawCharacter = function(
    characterName, characterIndex, x, y, index
) {
    if (StorageManager.customBitmaps[index]) {
        const bitmap = StorageManager.customBitmaps[index];
        const big = true;
        const pw = bitmap.width / (big ? 3 : 12);
        const ph = bitmap.height / (big ? 4 : 8);
        const n = big ? 0: characterIndex;
        const sx = ((n % 4) * 3 + 1) * pw;
        const sy = Math.floor(n / 4) * 4 * ph;
        this.contents.blt(bitmap, sx, sy, pw, ph, x - pw / 2, y - ph);
    } else {
        Window_Base.prototype.drawCharacter.call(this, characterName, characterIndex, x,y);
    }
};

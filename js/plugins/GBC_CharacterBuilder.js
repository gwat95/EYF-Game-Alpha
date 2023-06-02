/*:
@author coffeenahc

@target MZ
@plugindesc
Commissioned work by coffeenahc for grantw95 (fiverr)

@param maxClothes
@type Number
@default 34

@param maxFrontHair
@type Number
@default 15

@param maxRearHair
@type Number
@default 20

@param maxSkin
@type Number
@default 3

*/

const GBC_CHARACTERBUILDER = PluginManager.parameters("GBC_CharacterBuilder");


EYF.constructPlayerBitmap = function() {
    if (!this._playerBitmapParams) return;
    let baseBitmap = ImageManager.loadBitmap('generator/Body/', this._playerBitmapParams[6]+this._playerBitmapParams[5], 0, true);
    let clothingBitmap = ImageManager.loadBitmap('generator/Clothing/', this._playerBitmapParams[0], 0, true);
    let frontHair1Bitmap = ImageManager.loadBitmap('generator/FrontHair1/', this._playerBitmapParams[1], 0, true);
    let frontHair2Bitmap = ImageManager.loadBitmap('generator/FrontHair2/', this._playerBitmapParams[2], 0, true);
    let rearHair1Bitmap = ImageManager.loadBitmap('generator/RearHair1/', this._playerBitmapParams[3], 0, true);
    let rearHair2Bitmap = ImageManager.loadBitmap('generator/RearHair2/', this._playerBitmapParams[4], 0, true);

    const combinedBitmap = new Bitmap(144, 192);
// How to change the hair
    Promise.all([baseBitmap, clothingBitmap, rearHair1Bitmap, rearHair2Bitmap, frontHair1Bitmap, frontHair2Bitmap, ].map(bmp => new Promise((resolve, reject) => bmp.addLoadListener(resolve))))
    .then((bitmaps) => {
        let hues = [
            [20,20, 20], 
            [40,40, 40], 
            [60,60, 60], 
            [80,80, 80], 
            [100,100, 100], 
            [120,120, 120], 
            [140,140, 140], 
            [160,160, 160], 
            [180,180, 180],
            [200,200, 200], 
        ]
        let hues1 = [
            [30,0, 0], 
            [0,30, 0], 
            [0,0, 30], 
            [80,0, 30], 
            [100,0, 30], 
            [30,0, 100], 
            [140,0, 30], 
            [50,0, 140],
            [180,0, 30],
            [200,100, 30], 
        ]
        if (this._playerBitmapParams[7] != 0) {
            let hairHue = hues[this._playerBitmapParams[7]];
            frontHair1Bitmap = EYF.hueShift(frontHair1Bitmap,  hairHue[0], hairHue[1], hairHue[2], 0);
            frontHair2Bitmap = EYF.hueShift(frontHair2Bitmap,  hairHue[0], hairHue[1], hairHue[2], 0);
            rearHair1Bitmap = EYF.hueShift(rearHair1Bitmap,  hairHue[0], hairHue[1], hairHue[2], 0);
            rearHair2Bitmap = EYF.hueShift(rearHair2Bitmap,  hairHue[0], hairHue[1], hairHue[2], 0);
        }
        if (this._playerBitmapParams[8] != 0) {
            let clotheHue = hues1[this._playerBitmapParams[8]];
            clothingBitmap = EYF.hueShift(clothingBitmap,  clotheHue[0], clotheHue[1], clotheHue[2], 0);
        }
    }).finally((bitmaps) => {
        combinedBitmap.blt(baseBitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        combinedBitmap.blt(clothingBitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        combinedBitmap.blt(frontHair1Bitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        combinedBitmap.blt(frontHair2Bitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        combinedBitmap.blt(rearHair1Bitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        combinedBitmap.blt(rearHair2Bitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        EYF._playerBitmap = combinedBitmap;
        EYF.isCharacterChanged = true;
    });
};

Spriteset_Map.prototype.createCharacters = function() {
    this._characterSprites = [];
    for (const event of $gameMap.events()) {
        this._characterSprites.push(new Sprite_Character(event));
    }
    for (const vehicle of $gameMap.vehicles()) {
        this._characterSprites.push(new Sprite_Character(vehicle));
    }
    for (const follower of $gamePlayer.followers().reverseData()) {
        this._characterSprites.push(new Sprite_Character(follower));
    }
    this._characterSprites.push(new Sprite_Character($gamePlayer));
    for (const sprite of this._characterSprites) {
        this._tilemap.addChild(sprite);
    }
    EYF.constructPlayerBitmap();
};

Sprite_Character.prototype.initialize = function(character) {
    Sprite.prototype.initialize.call(this);
    this.initMembers();
    this.setCharacter(character);
    if (character == $gamePlayer) {
        EYF._playerSprite = this;
    }
};

Sprite_Character.prototype.updateBitmap = function() {
    if (this.isImageChanged()) {
        this._tilesetId = $gameMap.tilesetId();
        this._tileId = this._character.tileId();
        this._characterName = this._character.characterName();
        this._characterIndex = this._character.characterIndex();
        if (this._tileId > 0) {
            this.setTileBitmap();
        } else {
            this.setCharacterBitmap();
        }
    }
    if (EYF.isCharacterChanged) {
        this.setEYFCharacterBitmap();
    } 
};

Sprite_Character.prototype.setCharacterBitmap = function() {
    this.bitmap = ImageManager.loadCharacter(this._characterName);
    this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
};

Sprite_Character.prototype.setEYFCharacterBitmap = function() {
    if (this._character == $gamePlayer && EYF._playerBitmap) {
        this.bitmap = EYF._playerBitmap;
        this._isBigCharacter = true;
        EYF.isCharacterChanged = false;
    }
};

function Scene_CharacterBuilder() {
    this.initialize(...arguments);
}

Scene_CharacterBuilder.prototype = Object.create(Scene_Base.prototype);
Scene_CharacterBuilder.prototype.constructor = Scene_CharacterBuilder;

Scene_CharacterBuilder.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this.createCharPrevWindow();
    this.createPartSelectWindow();
    this.createCommandWindow();
    this.createHeader();
};

Scene_CharacterBuilder.prototype.createHeader = function() {
    this._headerWindow = new Window_Header(this.headerRect());
    this._headerWindow.setText("                           Character Builder")
    this.addChild(this._headerWindow);
};

Scene_CharacterBuilder.prototype.createCharPrevWindow = function() {
    this._charPrevWindow = new Window_CharPreview(this.charPrevWindowRect());
    this.addChild(this._charPrevWindow);
};

Scene_CharacterBuilder.prototype.createPartSelectWindow = function() {
    this._partSelectWindow = new Window_PartSelect(this.partSelectWindowRect());
    this._partSelectWindow.setHandler("ok", this.onPartOk.bind(this));
    this._partSelectWindow.setHandler("cancel", this.onPartCancel.bind(this));
    this._partSelectWindow.setPrevWindow(this._charPrevWindow);
    this.addChild(this._partSelectWindow);
};

Scene_CharacterBuilder.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_CharBuilderCommands(this.commandWindowRect());
    this._commandWindow.setHandler("ok", this.onCommandOk.bind(this));
    this.addChild(this._commandWindow);
};

Scene_CharacterBuilder.prototype.onPartCancel = function() {
    this._commandWindow.activate();
    this._commandWindow.select(0);
    this._partSelectWindow.deselect();
}

Scene_CharacterBuilder.prototype.onLeave = function() {
    this.popScene();
}

Scene_CharacterBuilder.prototype.onPartOk = function() {
    this._partSelectWindow.changePartSelected();
    this._partSelectWindow.activate();
};

Scene_CharacterBuilder.prototype.onCommandOk = function() {
    if (this._commandWindow._index == 0) {
        this._partSelectWindow.activate();
        this._partSelectWindow.select(0);
    } else {
        this.onLeave();
    }
};

Scene_CharacterBuilder.prototype.partSelectWindowRect = function() {
    const ww = 300;
    const wh = this.calcWindowHeight(7, true);
    const wx = 230;
    const wy = (Graphics.boxHeight - wh) / 2;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_CharacterBuilder.prototype.charPrevWindowRect = function() {
    const ww = 300;
    const wh = this.calcWindowHeight(7, true);
    const wx = Graphics.boxWidth - ww - 230;
    const wy = (Graphics.boxHeight - wh) / 2;
    return new Rectangle(wx, wy, ww, wh);
};

Scene_CharacterBuilder.prototype.commandWindowRect = function() {
    const ww = 610;
    const wh = this.calcWindowHeight(2, true);
    const wx = 230;
    const wy = ((Graphics.boxHeight - wh) / 2) + wh + 120;
    return new Rectangle(wx, wy, ww, wh);
}   

Scene_CharacterBuilder.prototype.headerRect = function() {
    const ww = 610;
    const wh = this.calcWindowHeight(1, true);
    const wx = 230;
    const wy = 115;
    return new Rectangle(wx, wy, ww, wh);
};

function Window_CharBuilderCommands() {
    this.initialize(...arguments);
}

Window_CharBuilderCommands.prototype = Object.create(Window_Selectable.prototype);
Window_CharBuilderCommands.prototype.constructor = Window_CharBuilderCommands;

Window_CharBuilderCommands.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = ["Edit","Save"];
    this.refresh();
    this.activate();
    this.select(0);
};

Window_CharBuilderCommands.prototype.maxItems = function() {
    return 2;
};

Window_CharBuilderCommands.prototype.drawItem = function(index) {
    let item = this._list[index];
    let rect = this.itemRect(index);
    this.drawText(item, rect.x, rect.y, rect.width, "center");
}

function Window_PartSelect() {
    this.initialize(...arguments);
}

Window_PartSelect.prototype = Object.create(Window_Selectable.prototype);
Window_PartSelect.prototype.constructor = Window_PartSelect;

Window_PartSelect.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = ["Clothing", "Front Hair", "Rear Hair", "Skin Color", "Body Type", "Hair Color", "Clothes Color"];
    this._clothesIndex = 0; 
    this._clothesMax = GBC_CHARACTERBUILDER["maxClothes"];
    this._frontHairIndex = 0;
    this._frontHairMax = GBC_CHARACTERBUILDER["maxFrontHair"];
    this._rearHairIndex = 0;
    this._rearHairMax = GBC_CHARACTERBUILDER["maxRearHair"];
    this._skinColorIndex = 0;
    this._skinColorMax = GBC_CHARACTERBUILDER["maxSkin"];
    this._bodyIndex = 0;
    this._bodyMax = 1;
    this._hairColorIndex = 0;
    this._hairColorMax = 9;
    this._clothesColorIndex = 0;
    this._clothesColorMax = 9;
    if (EYF._playerBitmapParams) {
        this._clothesIndex = EYF._playerBitmapParams[0];
        this._frontHairIndex = EYF._playerBitmapParams[1];
        this._rearHairIndex = EYF._playerBitmapParams[3];
        this._skinColorIndex = EYF._playerBitmapParams[5];
        this._bodyIndex = EYF._playerBitmapParams[6];
        this._hairColorIndex = EYF._playerBitmapParams[7];
        this._clothesColorIndex = EYF._playerBitmapParams[8]
    } else {
        console.log("false");
    }
    this.refresh();
    this.refreshPreview();
};

Window_PartSelect.prototype.setPrevWindow = function(pw) {
    this._previewWindow = pw;
    this.refreshPreview();
};

Window_PartSelect.prototype.refreshPreview = function() {
    if (this._previewWindow) {
        this._previewWindow.updateList(this._clothesIndex, this._frontHairIndex, this._rearHairIndex, this._skinColorIndex, this._bodyIndex, this._hairColorIndex, this._clothesColorIndex)
        this._previewWindow.drawCharPrev();
    }
};

Window_PartSelect.prototype.changePartSelected = function() {
    switch (this._index) {
        case 0:
            if (this._clothesIndex < this._clothesMax) this._clothesIndex++;
            else this._clothesIndex = 0;
            break;
        case 1:
            if (this._frontHairIndex < this._frontHairMax) this._frontHairIndex++;
            else this._frontHairIndex = 0;
            break;
        case 2:
            if (this._rearHairIndex < this._rearHairMax) this._rearHairIndex++;
            else this._rearHairIndex = 0;
            break;
        case 3:
            if (this._skinColorIndex < this._skinColorMax) this._skinColorIndex++;
            else this._skinColorIndex = 0;
            break;
        case 4:
            if (this._bodyIndex == 0) this._bodyIndex = 1;
            else this._bodyIndex = 0;
            break;
        case 5:
            if (this._hairColorIndex < this._hairColorMax) this._hairColorIndex++;
            else this._hairColorIndex = 0;
            break;
        case 6:
            if (this._clothesColorIndex < this._clothesColorMax) this._clothesColorIndex++;
            else this._clothesColorIndex = 0;
            break;
        default:
            break;
    }
    this.refreshPreview();
    this.refresh();
};

Window_PartSelect.prototype.maxItems = function() {
    return this._list.length;
};

Window_PartSelect.prototype.drawItem = function(index) {
    let item = this._list[index];
    let rect = this.itemLineRect(index);
    let partIndex = -1;
    switch (index) {
        case 0:
            partIndex = this._clothesIndex;
            break;
        case 1:
            partIndex = this._frontHairIndex;
            break;
        case 2:
            partIndex = this._rearHairIndex;
            break;
        case 3:
            partIndex = this._skinColorIndex;
            break;
        case 4:
            partIndex = this._bodyIndex;
            break;
        case 5:
            partIndex = this._hairColorIndex;
            break;
        case 6:
            partIndex = this._clothesColorIndex;
            break;
    }
    this.drawText(item + "("+partIndex+")", rect.x,rect.y,rect.width,"center");
};

function Window_CharPreview() {
    this.initialize(...arguments);
}

Window_CharPreview.prototype = Object.create(Window_Selectable.prototype);
Window_CharPreview.prototype.constructor = Window_CharPreview;

Window_CharPreview.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._list = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (EYF._playerBitmapParams) {
        this._list = EYF._playerBitmapParams;
    } 
    this.drawCharPrev();
};

Window_CharPreview.prototype.updateList = function(clothing, frontHair, rearHair, skin, gender, hairColor, clotheColor) {
    this._list = [
        clothing.toString(), 
        frontHair.toString(), 
        frontHair.toString(), 
        rearHair.toString(), 
        rearHair.toString(), 
        skin.toString(),
        gender == 0 ? "Male" : "Female",
        hairColor,
        clotheColor
    ];
};

Window_CharPreview.prototype.drawCharPrev = function() {
    this.contents.clear();
    EYF._playerBitmapParams = this._list;
    EYF.constructPlayerBitmap();
    console.log("draw charprev");
    let baseBitmap = ImageManager.loadBitmap('generator/Body/', this._list[6]+this._list[5], 0, true);
    let clothingBitmap = ImageManager.loadBitmap('generator/Clothing/', this._list[0], 0, true);
    let frontHair1Bitmap = ImageManager.loadBitmap('generator/FrontHair1/', this._list[1], 0, true);
    let frontHair2Bitmap = ImageManager.loadBitmap('generator/FrontHair2/', this._list[2], 0, true);
    let rearHair1Bitmap = ImageManager.loadBitmap('generator/RearHair1/', this._list[3], 0, true);
    let rearHair2Bitmap = ImageManager.loadBitmap('generator/RearHair2/', this._list[4], 0, true);

    const combinedBitmap = new Bitmap(144, 192);
  
    Promise.all([baseBitmap, clothingBitmap, rearHair1Bitmap, rearHair2Bitmap, frontHair1Bitmap, frontHair2Bitmap, ].map(bmp => new Promise((resolve, reject) => bmp.addLoadListener(resolve))))
    .then((bitmaps) => {
        let hues = [
            [20,20, 20], 
            [40,40, 40], 
            [60,60, 60], 
            [80,80, 80], 
            [100,100, 100], 
            [120,120, 120], 
            [140,140, 140], 
            [160,160, 160], 
            [180,180, 180],
            [200,200, 200], 
        ]
        let hues1 = [
            [30,0, 0], 
            [0,30, 0], 
            [0,0, 30], 
            [80,0, 30], 
            [100,0, 30], 
            [30,0, 100], 
            [140,0, 30], 
            [50,0, 140],
            [180,0, 30],
            [200,100, 30], 
        ]
        if (this._list[7] != 0) {
            let hairHue = hues[this._list[7]];
            frontHair1Bitmap = EYF.hueShift(frontHair1Bitmap,  hairHue[0], hairHue[1], hairHue[2], 0);
            frontHair2Bitmap = EYF.hueShift(frontHair2Bitmap,  hairHue[0], hairHue[1], hairHue[2], 0);
            rearHair1Bitmap = EYF.hueShift(rearHair1Bitmap,  hairHue[0], hairHue[1], hairHue[2], 0);
            rearHair2Bitmap = EYF.hueShift(rearHair2Bitmap,  hairHue[0], hairHue[1], hairHue[2], 0);
        }
        if (this._list[8] != 0) {
            let clotheHue = hues1[this._list[8]];
            clothingBitmap = EYF.hueShift(clothingBitmap,  clotheHue[0], clotheHue[1], clotheHue[2], 0);
        }
    }).finally((bitmaps) => {
        combinedBitmap.blt(baseBitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        combinedBitmap.blt(clothingBitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        combinedBitmap.blt(frontHair1Bitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        combinedBitmap.blt(frontHair2Bitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        combinedBitmap.blt(rearHair1Bitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        combinedBitmap.blt(rearHair2Bitmap, 0, 0, combinedBitmap.width, combinedBitmap.height, 0, 0);
        this.contents.blt(combinedBitmap, 0, 0, 144, 192, 25, 10, 144 * 1.5, 192 * 1.5); 
    });
};

EYF.hueShift = function(bitmap, r, g, b, gray) {
    var newBitmap = new Bitmap(bitmap.width, bitmap.height);
    var context = newBitmap.context;
    var imageData = bitmap.context.getImageData(0, 0, bitmap.width, bitmap.height);
    var pixels = imageData.data;

    for (var i = 0; i < pixels.length; i += 4) {
        pixels[i] -= r;
        pixels[i + 1] -= g;
        pixels[i + 2] -= b;
        pixels[i + 3] += gray;
    }

    context.putImageData(imageData, 0, 0);

    return newBitmap;
};
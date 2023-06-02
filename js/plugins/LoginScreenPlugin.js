/*:
* @plugindesc Login Screen Plugin
* @author GrantW
*
* @help
* This plugin adds a login screen before the title screen for PlayFab authentication.
*/

(function() {
  class Scene_Login extends Scene_Base {
    constructor() {
      super();
    }

    create() {
      super.create();
      this.createBackground();
      this.createWindowLayer();
      this.createLoginWindow();
      this.createUsernameInput();
      this.createPasswordInput();
    }

activateUsernameInput() {
  this._usernameInput.setFocused(true);
  this._passwordInput.setFocused(false);
}

activatePasswordInput() {
  this._usernameInput.setFocused(false);
  this._passwordInput.setFocused(true);
}

    createBackground() {
      this._backgroundSprite = new Sprite();
      this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
      this.addChild(this._backgroundSprite);
    }

    createLoginWindow() {
      this._loginWindow = new Window_Login(0, 0);
      this._loginWindow.setHandler('login', this.login.bind(this));
      this.addWindow(this._loginWindow);
    }

createUsernameInput() {
  this._usernameInput = new Window_LoginInput(0, 0, "Username");
  this._usernameInput.setFocused(true); // Focus on the username input by default
  this._usernameInput.children.forEach(child => {
    child.on('mousedown', this.activateUsernameInput.bind(this));
  });
  this._usernameInput.x = (Graphics.boxWidth - this._usernameInput.width) / 2 + 20;
  this._usernameInput.y = (Graphics.boxHeight - this._usernameInput.height) / 2 - this._usernameInput.height - 10;
  this._usernameInput.width -= 40;
  this.addWindow(this._usernameInput);
}

createPasswordInput() {
  this._passwordInput = new Window_LoginInput(0, 0, "Password");
  this._passwordInput.children.forEach(child => {
    child.on('mousedown', this.activatePasswordInput.bind(this));
  });
  this._passwordInput.x = (Graphics.boxWidth - this._passwordInput.width) / 2 + 20;
  this._passwordInput.y = (Graphics.boxHeight - this._passwordInput.height) / 2 + 10;
  this._passwordInput.width -= 40;
  this.addWindow(this._passwordInput);
}



    login() {
      const username = this._usernameInput.getText();
      const password = this._passwordInput.getText();
      
      // Add PlayFab authentication code here

      SceneManager.goto(Scene_Title);
    }

    start() {
      super.start();
      SceneManager.clearStack();
    }
  }

class Window_LoginInput extends Window_Base {
  constructor(x, y, label) {
    const rect = new Rectangle(x, y, Graphics.boxWidth - 40, 48);
    super(rect);
    this._label = label;
    this._text = "";
    this._focused = false;
    this.refresh();
  }

  getText() {
    return this._text;
  }

  setFocused(focused) {
    this._focused = focused;
    this.updateCursor();
    if (focused) {
      this.activateInput();
    }
  }

  updateCursor() {
    if (this._focused) {
      const x = this.textWidth(this._label) + this.textWidth(this._text);
      this.setCursorRect(x, 0, 24, this.contents.fontSize);
    } else {
      this.setCursorRect(0, 0, 0, 0);
    }
  }

  refresh() {
    this.contents.clear();
    this.drawText(this._label, 0, 0);
    this.drawText(this._text, this.textWidth(this._label), 0, this.contents.width, 'right');
    this.updateCursor();
  }

activateInput() {
  const callback = (text) => {
    this._text = text;
    this.refresh();
  };
  const background = 1;
  const title = this._label;
  const initialText = this._text;
  const maxLength = 20;
  const stripControlCharacters = true;
  SceneManager.push(Scene_InputName);
  SceneManager.prepareNextScene({
    maxLength: maxLength,
    stripControlCharacters: stripControlCharacters,
    title: title,
    background: background,
    callback: callback,
    initialText: initialText
    });
  }
}



  class Window_Login extends Window_Command {
    constructor(x, y) {
      const rect = new Rectangle(x, y, 240, 120);
      super(rect);
      this.updatePlacement();
      this.update();
    }

    windowWidth() {
      return 240;
    }

    windowHeight() {
      return this.fittingHeight(2);
    }

    updatePlacement() {
      this.x = (Graphics.boxWidth - this.width) / 2;
      this.y = Graphics.boxHeight - this.height - 20;
    }

    makeCommandList() {
      this.addCommand('Login', 'login');
      this.addCommand('Cancel', 'cancel');
    }
  }

  SceneManager._scene = new Scene_Login();
  SceneManager._nextScene = null;

  const oldSceneBootStart = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function() {
    oldSceneBootStart.call(this);
    this.checkPlayerLocation();
    DataManager.setupNewGame();
    SceneManager.goto(Scene_Login);
    Window_TitleCommand.initCommandPosition();
  };
})();

Input._shouldPreventDefault = function(keyCode) {
    switch (keyCode && !EYF._isOnLoginScreen) {
        case 8: // backspace
        case 9: // tab
        case 33: // pageup
        case 34: // pagedown
        case 37: // left arrow
        case 38: // up arrow
        case 39: // right arrow
        case 40: // down arrow
            return true;
    }
    return false;
};


SceneManager.onError = function(event) {
    console.error(event.message);
    console.error(event.filename, event.lineno);
    let errorMessage = "";
    if (EYF._isOnLoginScreen) {
        event.message.errorDetails.Email.forEach(error => {
            errorMessage += error +"\n";
        });
        event.message.errorDetails.Password.forEach(error => {
            errorMessage += error +"\n";
        });
        console.log(errorMessage);
        window.alert(errorMessage);
        return;
    };
    try {
        this.stop();
        Graphics.printError("Error", event.message, event);
        AudioManager.stopAll();
    } catch (e) {
        //
    }
};

let gbc_eyf_scenetitle_create = Scene_Title.prototype.create;
Scene_Title.prototype.create = function() {
    gbc_eyf_scenetitle_create.call(this);
    PlayFab.settings.titleId = "7C515";
    this._commandWindow.deactivate();
    this._hasLoggedIn = false;
    EYF._isOnLoginScreen = true;
    this.showLoginScreen();
};

Scene_Title.prototype.update = function() {
    if (!this.isBusy()) {
        this._commandWindow.open();
    }
    Scene_Base.prototype.update.call(this);
    this.updateBackgroundMovement();
    if (!this._hasLoggedIn && EYF._playfabUser) {
        this._hasLoggedIn = true;
        EYF._isOnLoginScreen = false;
        this._commandWindow.activate();
        this.hideLoginScreen();
    }
};

Scene_Title.prototype.showLoginScreen = function() {
    let element = document.getElementById('loginBox');
    let loginBtn = document.getElementById('login-btn');
    let registerBtn = document.getElementById('register-btn');
    if (element) {
        element.style.display = "block";
        loginBtn.onclick = this.login;
        registerBtn.onclick = this.register;
    }
};

Scene_Title.prototype.hideLoginScreen = function() {
    let element = document.getElementById('loginBox');
    if (element) {
        element.style.display = "none";
    }
};

Scene_Title.prototype.login = function() {
    let inputEmail = document.getElementById('input-email');
    let inputPass = document.getElementById('input-password');
    if (inputEmail && inputPass) {
        const request = {
            Email: inputEmail.value,
            Password: inputPass.value,
        };
        PlayFabClientSDK.LoginWithEmailAddress(request, onLoginSuccess, this.onLoginError);
    }
};

Scene_Title.prototype.register = function() {
    let inputEmail = document.getElementById('input-email');
    let inputPass = document.getElementById('input-password');
    if (inputEmail && inputPass) {
        const request = {
            Email: inputEmail.value,
            Password: inputPass.value,
            Username: inputEmail.value.substring(0, inputEmail.value.indexOf('@'))
        };
        PlayFabClientSDK.RegisterPlayFabUser(request, onRegisterSuccess, onRegisterError);
    }
};

function onLoginSuccess(result) {
    EYF._playfabUser = result.Request;
};

function onLoginError(error) {
    EYF._playfabUser = null;
};

function onRegisterSuccess(result) {
    console.log(result);
    window.alert("Registration successful. You may now login.");
};

function onRegisterError(error) {
    console.log(error);
};

Scene_Title.prototype.updateBackgroundMovement = function() {
    if (this._backSprite1) {
        if (!this._reachedPoint && !this._enroute) {
            let minX = 0-(1938 - Graphics.boxWidth) + 400;
            let minY = 0-(1398 - Graphics.boxHeight) + 100;
            let maxX = 0;
            let maxY = 0;
            let randX = Math.floor(Math.random() * (maxX - minX + 1) + minX);
            let randY = Math.floor(Math.random() * (maxY - minY + 1) + minY);
            this.destX = randX;
            this.destY = randY;
            if (this._backSprite1.x < this.destX) this.xInc = 1;
            else this.xInc = -1;

            if (this._backSprite1.y < this.destY) this.yInc = 1;
            else this.yInc = -1;
            this._enroute = true;
            this._reachedX = false;
            this._reachedY = false;
        } else if (this._enroute && !this._reachedPoint) {
            this._backSprite1.x += this.xInc;
            this._backSprite1.y += this.yInc;
            if (this.xInc > 1) {
                if (this._backSprite1.x >= this.destX) this._reachedX = true;
            } else {
                if (this._backSprite1.x <= this.destX) this._reachedX = true;
            }


            if (this.yInc > 1) {
                if (this._backSprite1.y >= this.destY) this._reachedY = true;
            } else {
                if (this._backSprite1.y <= this.destY) this._reachedY = true;
            }

            if (this._reachedX && this._reachedY) {
                this._reachedPoint = true;
                this._enroute = false;
            }
        } else if (this._reachedPoint) this._reachedPoint = false;
    }
}

Scene_Title.prototype.clamp = (num, min, max) => Math.min(Math.max(num, min), max);
Scene_Title.prototype.centerSprite = function(sprite) {};

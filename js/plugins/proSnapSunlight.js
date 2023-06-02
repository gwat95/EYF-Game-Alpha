/** /*:
 * @author William Ramsey
 * @plugindesc Beautiful Sunlight
 *  
 * @help
 * PLUGIN COMMAND:
 * Activate/deactivate with the following plugin command
 * 
 * sunBeam true
 * subBeam false
 * 
 * Configure with
 * sunBeamConf 1
 * 
 * Where 1 is a number. Higher = more beams
 */

(() => {
    if (!proSnapCoreInstalled) return;
    if (proSnapQuality !== true) return;

    const pCommands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        pCommands.call(this, command, args);
        if (command === 'sunBeam') {
            switch (args[0]) {
                case 'true':
                    SceneManager._scene.proSunBeam.enabled = true;
                    SceneManager._scene.proSunLight.enabled = true;
                    GLOBAL_ENABLED = true;
                    break;
                case 'false':
                    SceneManager._scene.proSunBeam.enabled = false;
                    SceneManager._scene.proSunLight.enabled = false;
                    GLOBAL_ENABLED = false;
                    break;
            }
        }
        if (command === 'sunBeamConf') {
            SceneManager._scene.proSunBeam.gain = Number(args[0])
        }
    };

    var GLOBAL_ENABLED = false;
    var proSunBeam;
    var proSunLight;

    const sms = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        sms.apply(this, arguments);
        if (!proSunBeam) {
            proSunBeam = new PIXI.filters.GodrayFilter({
                angle: -45,
                parallel: true,
                gain: 0.23,
                lacunarity: 15
            });
            proSunLight = new PIXI.filters.AdjustmentFilter({
                gamma: 0.9,
                saturation: 0.9,
                contrast: 1.1,
                red: 1.1,
                green: 1,
                blue: 0.87
            });
        }

        this.proSunBeam = proSunBeam;
        this.proSunLight = proSunLight;
        proSunBeam.enabled = GLOBAL_ENABLED;
        proSunLight.enabled = GLOBAL_ENABLED;
        proSunBeam.progress = 0;
        proSunLight.blendMode = 0;
        this.proFilters = [];
        this.proFilters.push(proSunBeam);
        this.proFilters.push(proSunLight);
        this.children[0].filters = this.proFilters;
    }

    const smu = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        smu.apply(this, arguments);
        proSunBeam.time = ($gameMap._displayY + $gameMap._displayX) / 16 + proSunBeam.progress;
        proSunBeam.progress += 0.005;
    }

})();
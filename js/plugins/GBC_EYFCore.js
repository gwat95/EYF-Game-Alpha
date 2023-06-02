/*:
@author coffeenahc

@target MZ
@plugindesc
Commissioned work by coffeenahc for grantw95 (fiverr)

@param Stocks
@type struct<StockStruct>[]
@desc List of stocks

@param Index Funds
@type struct<IndexFundsStruct>[]
@desc List of index funds

@param Real Estate
@type struct<RealEstateStruct>[]
@desc List of real estate

@param Rent Unit
@type struct<RentStruct>[]
@desc List of rent unit
*/

/*~struct~StockStruct:
 *
 * @param stockID
 * @type Number
 * @text ID
 *
 * @param stockName
 * @type string
 * @text Stock Name
 * 
 * @param stockSymbol
 * @type string
 * @text Stock Symbol
 * 
 * @param stockValue
 * @type Number
 * @text Initial Stock Value
 */

/*~struct~IndexFundsStruct:
 *
 * @param indexFundID
 * @type Number
 * @text ID
 *
 * @param indexFundName
 * @type string
 * @text Index Fund Name
 * 
 * @param stocksArray
 * @type string
 * @text Stock IDs
 * @desc Separate by comma
 */

/*~struct~RealEstateStruct:
 *
 * @param houseID
 * @type Number
 * @text ID
 *
 * @param houseName
 * @type string
 * @text House Name
 * 
 * @param houseDesc
 * @type string
 * @text House Desc
 *
 * @param houseBedrooms
 * @type Number
 * @text No. of bedrooms
 * 
 * @param houseBathrooms
 * @type Number
 * @text No. of bathrooms
 * 
 * @param houseCarPort
 * @type Number
 * @text No. of car port
 * 
 * @param daysOnMarket
 * @type Number
 * @text Days on market
 * 
 * @param housePrice
 * @type Number
 * @text Price of house
 * 
 * @param housePic
 * @type string
 * @text House pic filename
 * @desc located under img/eyf/realestate
 */

/*~struct~RentStruct:
 *
 * @param houseID
 * @type Number
 * @text ID
 *
 * @param houseName
 * @type string
 * @text House Name
 * 
 * @param houseDesc
 * @type string
 * @text House Desc
 *
 * @param electricityCost
 * @type Number
 * @text Cost of electricity
 * 
 * @param waterCost
 * @type Number
 * @text Cost of water
 * 
 * @param communityServicesCost
 * @type Number
 * @text Cost of community service
 * 
 * @param daysUntilRentPayment
 * @type Number
 * @text Days until next rent payment
 * 
 * @param rentCost
 * @type Number
 * @text Monthly rent
 * 
 * @param housePic
 * @type string
 * @text House pic filename
 * @desc located under img/eyf/rentunit
 */

const GBC_EYFPARAMS = PluginManager.parameters("GBC_EYFCore");

function EYF() {}

EYF.initialize = function () {
    this._playerIFs = []

    this._specialClasses = [
        {name:"accounting", maxProgress: 10, currentProgress: 0, goldCost: 500, actionCost: 1, desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"},
        {name:"automotive", maxProgress: 10, currentProgress: 0, goldCost: 500, actionCost: 1, desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"},
        {name:"baking", maxProgress: 10, currentProgress: 0, goldCost: 500, actionCost: 1, desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"},
        {name:"engineer", maxProgress: 10, currentProgress: 0, goldCost: 500, actionCost: 1, desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"},
        {name:"history", maxProgress: 10, currentProgress: 0, goldCost: 500, actionCost: 1, desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"},
        {name:"it", maxProgress: 10, currentProgress: 0, goldCost: 500, actionCost: 1, desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"},
        {name:"linguistics", maxProgress: 10, currentProgress: 0, goldCost: 500, actionCost: 1, desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"},
        {name:"nursing", maxProgress: 10, currentProgress: 0, goldCost: 500, actionCost: 1, desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"},
        {name:"physics", maxProgress: 10, currentProgress: 0, goldCost: 500, actionCost: 1, desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"},
        {name:"realtor", maxProgress: 10, currentProgress: 0, goldCost: 500, actionCost: 1, desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"},
        {name:"farming", maxProgress: 10, currentProgress: 0, goldCost: 500, actionCost: 1, desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"},    
    ]

    if (!this._stocks) {
        let stockJSON = JSON.parse(GBC_EYFPARAMS["Stocks"]);
        this._stocks = [];
        for (const s of stockJSON) {
            let stock = JSON.parse(s);
            this._stocks[stock.stockID] =
            {
                stockID: parseInt(stock.stockID),
                stockName: stock.stockName.toString(),
                stockSymbol: stock.stockSymbol.toString(),
                stockValue: parseFloat(stock.stockValue),
                percentChange: "0"
            };
        }
    }

    if (!this._indexFunds) {
        let ifJSON = JSON.parse(GBC_EYFPARAMS["Index Funds"]);
        this._indexFunds = [];
        for (const i of ifJSON) {
            let index = JSON.parse(i);
            this._indexFunds[index.indexFundID] =
            {
                indexFundID: parseInt(index.indexFundID),
                indexFundName: index.indexFundName.toString(),
                stocksArray: index.stocksArray.split(","),
            };
        }
    }

    if (!this._realEstate) {
        let houseJSON = JSON.parse(GBC_EYFPARAMS["Real Estate"]);
        this._realEstate = [];
        for (const h of houseJSON) {
            let house = JSON.parse(h);
            this._realEstate[house.houseID] =
            {
                houseID: parseInt(house.houseID),
                houseName: house.houseName,
                houseDesc: house.houseDesc.toString(),
                houseBedrooms: house.houseBedrooms,
                houseBathrooms: house.houseBathrooms,
                houseCarPort: house.houseCarPort,
                daysOnMarket: parseInt(house.daysOnMarket),
                housePrice: parseInt(house.housePrice),
            };
        }
    }

    if (!this._rentUnit) {
        let houseJSON = JSON.parse(GBC_EYFPARAMS["Rent Unit"]);
        this._rentUnit = [];
        for (const h of houseJSON) {
            let house = JSON.parse(h);
            this._rentUnit[house.houseID] =
            {   
                houseID: parseInt(house.houseID),
                houseName: house.houseName,
                houseDesc: house.houseDesc.toString(),
                electricityCost: parseInt(house.electricityCost),
                waterCost: parseInt(house.waterCost),
                communityServicesCost: parseInt(house.communityServicesCost),
                daysUntilRentPayment: parseInt(house.daysUntilRentPayment),
                rentCost: parseInt(house.rentCost),
                housePic: ImageManager.loadBitmap("img/eyf/rentunit/", house.houseName),
                rentedPic: ImageManager.loadBitmap("img/eyf/rentunit/", "rented")
            };
        }
    }
};

EYF.getStocksById = function (id) {
    return this._stocks ? this._stocks.find(stock => {
        if (stock) {
            return id == stock.stockID
        }
    }) : null;
};

EYF.getIndexFundById = function (id) {
    return this._indexFunds ? this._indexFunds.find(index => {
        if (index) {
            return id == index.indexFundID
        }
    }) : null;
};

EYF.getPlayerIndexFundById = function (id) {
    return this._playerIFs[id];
};

EYF.updateStockPrices = function () {
    this._stocks.forEach(stock => {
        if (!stock) return;
        let isUp = Math.random() >= 0.4 ? true : false;
        let percentChange = Math.random() * 7;
        let preChange = stock.stockValue;
        if (isUp) {
            stock.prevStockValue = preChange;
            stock.percentChange = (isUp ? "+" : "-") + percentChange.toFixed(2);
            stock.stockValue += ((stock.stockValue * percentChange) / 100);
            console.log("Increasing stock " + stock.stockName + " by " + percentChange + ". From " + preChange + " to " + stock.stockValue);
        } else {
            stock.prevStockValue = preChange;
            stock.percentChange = (isUp ? "+" : "-") + percentChange.toFixed(2);
            stock.stockValue -= ((stock.stockValue * percentChange) / 100);
            console.log("Decreasing stock " + stock.stockName + " by " + percentChange + ". From " + preChange + " to " + stock.stockValue);
        }
    });
};

EYF.updateRealEstate = function () {
    this._realEstate.forEach(realEstate => {
        if (!realEstate) return;
        realEstate.daysOnMarket += 1;
        realEstate.housePrice += Math.floor((realEstate.housePrice * (Math.random(5) / 1000)));
        if (realEstate.isOwned && realEstate.balance > 0) {
            if ($gameParty.gold() >= realEstate.ammortization) {
                $gameParty.loseMoney(realEstate.ammortization);
                EYFUI.addActivity("Paid Ammortization", realEstate.ammortization, "outflow");
                realEstate.balance -= realEstate.ammortization;
            }
        }
    });
};

EYF.updateRent = function() {
    let houseRented = $gameParty.houseRented;
    if (houseRented) {
        if (houseRented.daysUntilTermination == 1) {
            $gameParty.houseRented = null;
            EYF._rentUnit.forEach(item => {
                item.isRented = false;
            });
            $gameMessage.add("Your Rent Contract has come to an end.");
            $gameMessage.add("Credit Score increased by 100!");
            $gameParty.gainCreditScore(100);
        } else {
            if (houseRented.daysUntilRentPayment == 1) {
                $gameParty.houseRented.daysUntilRentPayment = 15;
                $gameParty.loseMoney($gameParty.houseRented.houseRef.rentCost);
                $gameParty.loseMoney($gameParty.houseRented.houseRef.electricityCost);
                $gameParty.loseMoney($gameParty.houseRented.houseRef.waterCost);
                //$gameParty.loseMoney($gameParty.houseRented.houseRef.communityServicesCost);
                EYFUI.addActivity("Monthly Rent", $gameParty.houseRented.houseRef.rentCost, "outflow");
                EYFUI.addActivity("Electricity Bill", $gameParty.houseRented.houseRef.electricityCost, "outflow");
                EYFUI.addActivity("Water Bill", $gameParty.houseRented.houseRef.waterCost, "outflow");
                //EYFUI.addActivity("Community Services", $gameParty.houseRented.houseRef.communityServicesCost, "outflow");
            } else {
                $gameParty.houseRented.daysUntilRentPayment -= 1;
                $gameParty.houseRented.daysUntilTermination -= 1;
            }
        }
    }
};

EYF.updateLotto = function() {
    let winningNumbers = [];
    for (let i = 0; i < 7; i++) {
        winningNumbers.push(Math.floor(Math.random() * 51));
    }

    let lottoTickets = $gameParty.items().filter(item => {
        return $dataItems[item.id].meta.lotto;
    })[0];

    if (lottoTickets) {
        for (let i = 0; i < $gameParty.numItems(lottoTickets); i++) {
            let matchNumbers = 0;
            for (let i = 0; i < 7; i++) {
                let randomNum = (Math.floor(Math.random() * 51));
                if (winningNumbers.includes(randomNum)) {
                    matchNumbers += 1;
                }
            }
            if (matchNumbers == 2) {
                $gameParty.gainGold(15);
                EYFUI.addActivity("Lotto Ticket Won 2 Numbers", 15, "inflow");
            } else if (matchNumbers == 3) {
                $gameParty.gainGold(500);
                EYFUI.addActivity("Lotto Ticket Won 3 Numbers", 500, "inflow");
            } else if (matchNumbers == 4) {
                $gameParty.gainGold(2000);
                EYFUI.addActivity("Lotto Ticket Won 4 Numbers", 2000, "inflow");
            } else if (matchNumbers == 5) {
                $gameParty.gainGold(10000);
                EYFUI.addActivity("Lotto Ticket Won 5 Numbers", 10000, "inflow");
            } else if (matchNumbers == 6) {
                $gameParty.gainGold(50000);
                EYFUI.addActivity("Lotto Ticket Won 6 Numbers", 50000, "inflow");
            } else if (matchNumbers == 7) {
                $gameParty.gainGold(1000000);
                EYFUI.addActivity("Lotto Ticket Won 7 Numbers", 1000000, "inflow");
            } else {
                console.log("no winning tickets");
            }

            $gameParty.loseItem(lottoTickets, 1);
        };
    }
};

EYF.updatePlayer = function() {
    $gameParty.actionCount = $gameParty.maxActions;
    $gameParty.consumedFood = [];
    $gameParty.dayActivities = [];
};


EYF.investIntoIF = function (id, amount) {
    let indexFund = this.getIndexFundById(id);
    console.log(indexFund);
    let playerIndexFund = this._playerIFs[id];
    if (playerIndexFund) {
        console.log("Adding to index fund investment");
        for (let i = 0; i < indexFund.stocksArray.length; i++) {
            let weightedAmount = amount / indexFund.stocksArray.length;
            let stockPrice = this.getStocksById(indexFund.stocksArray[i]).stockValue;
            this._playerIFs[id][i] += weightedAmount / stockPrice;
        }
    } else {
        console.log("Investing into new index fund");
        this._playerIFs[id] = [];
        for (let i = 0; i < indexFund.stocksArray.length; i++) {
            let weightedAmount = amount / indexFund.stocksArray.length;
            let stockPrice = this.getStocksById(indexFund.stocksArray[i]).stockValue;
            this._playerIFs[id].push(weightedAmount / stockPrice);
        }
    }
    console.log(this._playerIFs);
    $gameParty.loseGold(amount);
    
};

EYF.withdrawFromIF = function (id, amount) {
    let indexFund = this.getIndexFundById(id);
    let playerIndexFund = this._playerIFs[id];
    if (playerIndexFund) {
        console.log("Withdrawing from index fund investment");
        $gameParty.gainGold(amount);
        let postPlayerHoldings = this.viewIndexFundHoldings(id) - amount;
        let weightedAmount = postPlayerHoldings / indexFund.stocksArray.length;
        for (let i = 0; i < indexFund.stocksArray.length; i++) {
            let stockPrice = this.getStocksById(indexFund.stocksArray[i]).stockValue;
            this._playerIFs[id][i] = weightedAmount / stockPrice;
        }
    };
    console.log(this._playerIFs);
};

EYF.viewIndexFundHoldings = function (id) {
    let indexFund = this.getIndexFundById(id);
    let playerIF = this._playerIFs[id];
    if (playerIF) {
        let indexFundHoldings = 0;
        for (let i = 0; i < indexFund.stocksArray.length; i++) {
            indexFundHoldings += playerIF[i] * EYF.getStocksById(indexFund.stocksArray[i]).stockValue;
        }
        return indexFundHoldings;
    } else {
        return 0;
    }
}

EYF.viewIndexFund = function (id) {
    this._indexFundBeingViewed = this.getIndexFundById(id);
    SceneManager.push(Scene_IndexFunds);
};

EYF.increaseTurn = function () {
    this.updatePlayer();

    let days = $gameVariables.value(8);
    let months = $gameVariables.value(9);

    if (days >= 30) {
        this.updateRealEstate();
        $gameVariables.setValue(8, 1);
        $gameVariables.setValue(9, months + 1);
    } else {
        $gameVariables.setValue(8, days + 1);
    }

    this.updateStockPrices();
    this.updateRent();
    this.updateLotto();
};

let gbc_eyf_gamesystem_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function () {
    gbc_eyf_gamesystem_initialize.call(this);
    EYF.initialize();
};

let gbc_eyf_datamanager_makesavecontents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function () {
    let contents = gbc_eyf_datamanager_makesavecontents.call(this);
    let eyf = {
        _playerIFs: EYF._playerIFs,
        _stocks: EYF._stocks,
        _indexFunds: EYF._indexFunds,
        _realEstate: EYF._realEstate,
        _specialClasses: EYF._specialClasses,
        _playerBitmapParams: EYF._playerBitmapParams
    }
    contents.EYF = eyf;
    return contents;
};

let gbc_eyf_datamanager_extractsavecontents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function (contents) {
    gbc_eyf_datamanager_extractsavecontents.call(this, contents);
    let eyf = contents.EYF;
    EYF._playerIFs = eyf._playerIFs;
    EYF._stocks = eyf._stocks;
    EYF._indexFunds = eyf._indexFunds;
    EYF._realEstate = eyf._realEstate;
    EYF._specialClasses = eyf._specialClasses;
    EYF._playerBitmapParams = eyf._playerBitmapParams;
    console.log(EYF);
};

let gbc_eyf_gameparty_initialize = Game_Party.prototype.initialize;
Game_Party.prototype.initialize = function() {
    gbc_eyf_gameparty_initialize.call(this);
    this.hp = 120;
    this.mhp = 120;
    this.maxActions = 3;
    this.actionCount = 3;
    this.creditScore = 300;
    this.houseRented = null;
    this.hasVehicle = false;
    this.consumedFood = [];
    this.dayActivities = [];
    this.tasks = [];
    this.specialSkills = [];
    this.passedQuizzes = [];
    this.goalsAccount = 0;
    this.goals = [];
};

Game_Party.prototype.addGoal = function(goalName, amount, a) {
    console.log("ADD GOAL " + goalName);
    this.goals.push({name:goalName, amount:amount, allocation:a});
    console.log(this.goals);
}

Game_Party.prototype.removeGoal = function(goalName) {
    let goalIndex = -1;
    for (let i = 0; i < this.goals.length; i++) {
        let goal = this.goals[i];
        if (goal.name === goalName) {
            goalIndex = i;
            break;
        }
    }
    if (goalIndex != -1) {
        this.goals.splice(goalIndex, 1);
    }
}

Game_Party.prototype.hasGoal = function(goalName) {
    if (!this.goals) this.goals = [];
    for (let i = 0; i < this.goals.length; i++) {
        let goal = this.goals[i];
        if (goal.name === goalName) {
            return true;
        }
    }
    return false;
}

Game_Party.prototype.addTask = function(taskGiver, taskType, taskName, taskDesc) {
    let task = {taskGiver: taskGiver, taskType: taskType, taskName: taskName, taskDesc: taskDesc}
    this.tasks.push(task);
};

Game_Party.prototype.removeTask = function(taskName) {
    let taskIndex = -1;
    for (let i = 0; i < this.tasks.length; i++) {
        let task = this.tasks[i];
        if (task.taskName === taskName) {
            taskIndex = i;
            break;
        }
    }
    if (taskIndex != -1) {
        this.tasks.splice(taskIndex, 1);
    }
};

Game_Party.prototype.loseMoney = function(amount) {
    if ((this._gold - amount) >= 0) {
        this.gainCreditScore(Math.floor(amount * 0.01))
    } else {
        this.loseCreditScore(Math.floor(amount * 0.02));
    }
    this._gold -= Math.floor(amount);
};

Game_Party.prototype.consumeAction = function(i) {
    this.actionCount -= i ? i : 1;
};

Game_Party.prototype.refillAction = function(i) {
    this.actionCount += i ? i : 1;
};

Game_Party.prototype.consumeHp = function(amount) {
    this.hp -= amount;
};

Game_Party.prototype.refillHp = function(amount) {
    this.hp += amount;
};

Game_Party.prototype.gainCreditScore = function(amount) {
    if ((this.creditScore + amount) >= 850) this.creditScore = 850;
    else this.creditScore += amount;
};

Game_Party.prototype.loseCreditScore = function(amount) {
    if ((this.creditScore + amount) <= 350) this.creditScore = 350;
    this.creditScore -= amount;
};
// I added this line "((this.creditScore + amount) <= 350) this.creditScore = 350;" so the 
// credit score wont go below 350 anymore. - Grant

Game_Party.prototype.consumeRandomFood = function() {
    let prepItems = $gameParty.items().filter(item => {return item.meta.foodType == "prep"});
    while (this.hp < this.mhp && prepItems.length > 0) {
        let i = Math.floor(Math.random() * prepItems.length);
        $gameParty.consumePrepItem(prepItems[i]);
    }
};

Game_Party.prototype.consumePrepItem = function(item) {
    if (DataManager.isItem(item) && item.consumable) {
        this.loseItem(item, 1);
        this.hp = Math.min(this.hp + parseInt(item.damage.formula), this.mhp);
        this.consumedFood.push(item);
    }
};

Game_Party.prototype.consumeItem = function(item) {
    if (DataManager.isItem(item) && item.consumable) {
        if ($dataItems[item.id].meta.increaseAction) {
            $gameParty.actionCount += parseInt($dataItems[item.id].meta.increaseAction);
        }
        this.loseItem(item, 1);
    }
};

Game_Party.prototype.unlockSkill = function(skill) {
    if (!this.specialSkills.includes(skill)) this.specialSkills.push(skill);
};

Game_Party.prototype.passQuiz = function(quiz) {
    if (!this.passedQuizzes) this.passedQuizzes = [];
    if (!this.passedQuizzes.includes(quiz)) this.passedQuizzes.push(quiz);
};

Game_Party.prototype.hasSkill = function(skill) {
    return this.specialSkills.includes(skill);
};

let gbc_eyf_gameactor_levelup = Game_Actor.prototype.levelUp;
Game_Actor.prototype.levelUp = function() {
    gbc_eyf_gameactor_levelup.call(this);
    if (this._level % 3 == 0) {
        if ($gameParty.maxActions < 20) {
            $gameParty.maxActions += 1;
        } else {
            $gameParty.maxActions = 20;
        }
    }
};
function EYF() {}

EYF.initialize = function () {
    this._playerIFs = []
    this._playerSprite = null;
    this._playerBitmap = null;
    this._playerBitmapParams = null;
    
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
        console.log(this._stocks);
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
        console.log(this._indexFunds);
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
                housePic: ImageManager.loadBitmap("img/eyf/realestate/", house.houseName),
                ownedPic: ImageManager.loadBitmap("img/eyf/realestate/", "owned")
            };
        }
        console.log(this._realEstate);
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
        console.log(this._rentUnit);
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
                $gameParty.loseMoney($gameParty.houseRented.houseRef.communityServicesCost);
                EYFUI.addActivity("Monthly Rent", $gameParty.houseRented.houseRef.rentCost, "outflow");
                EYFUI.addActivity("Electricity Bill", $gameParty.houseRented.houseRef.electricityCost, "outflow");
                EYFUI.addActivity("Water Bill", $gameParty.houseRented.houseRef.waterCost, "outflow");
                EYFUI.addActivity("Community Services", $gameParty.houseRented.houseRef.communityServicesCost, "outflow");
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
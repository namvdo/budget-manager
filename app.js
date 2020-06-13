var budgetController = (function () {
  // closures, even the outter function effectively gone but it still has access to the data of the outer function
  var data = {
    allItems: {
      inc: [],
      exp: [],
    },
    totals: {
      inc: 0,
      exp: 0,
    },
    budget: 0,
    percentage: -1,
  };
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach((item) => (sum += item.value));
    data.totals[type] = sum;
  };
  return {
    addItem: function (type, description, value) {
      var newItem, id;
      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else if (data.allItems[type].length == 0) {
        id = 0;
      }
      if (type === "inc") {
        newItem = new Income(id, description, value);
      } else {
        newItem = new Expense(id, description, value);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },
    calculateBudget: function () {
      // calculate the income and expeses
      calculateTotal("inc");
      calculateTotal("exp");
      // calculate the budget: income - expenses
      data.budget = data.totals["inc"] - data.totals["exp"];
      // calculate the percentage of income
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }
    },
    getBudget: function () {
      return {
        budget: data.budget,
        income: data.totals.inc,
        expenses: data.totals.exp,
        percentage: data.percentage,
      };
    },
    deleteItem: function (type, id) {
      var ids, index;
      ids = data.allItems[type].map((item) => item.id);
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculatePercentage: function () {
      data.allItems.exp.forEach((item) => {
        item.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function () {
      var allPercentages = data.allItems.exp.map((item) => {
        return item.getPercentage();
      });
      return allPercentages;
    },
    testing: function () {
      console.log(data);
    },
  };
})();

var UIController = (function () {
  var domStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetValue: ".budget__value",
    budgetIncome: ".budget__income--value",
    budgetExpenses: ".budget__expenses--value",
    budgetPercentage: ".budget__expenses--percentage",
    eventContainer: ".container",
    expensesPercentage: ".item__percentage",
    dateLabel: ".budget__title--month",
  };
  var formatNumber = function (num, type) {
    var numSplit, integerPart, decPart;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    integerPart = numSplit[0].split("");
    decPart = numSplit[1];
    if (integerPart.length > 3) {
      for (var i = integerPart.length - 4; i >= 0; i -= 3) {
        integerPart[i] += ",";
      }
    }
    if (type === "inc") {
      return "+ " + integerPart.join("") + "." + decPart;
    } else {
      return "- " + integerPart.join("") + "." + decPart;
    }
  };
  var nodeListForEach = function (fields, callback) {
    for (var i = 0; i < fields.length; i++) {
      callback(fields[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(domStrings.inputType).value, // will be either income or expense
        description: document.querySelector(domStrings.inputDescription).value,
        value: parseFloat(document.querySelector(domStrings.inputValue).value),
      };
    },
    addListItem: function (obj, type) {
      var html, newHtml, element;
      // create HTML with placeholder text
      if (type === "inc") {
        element = domStrings.incomeContainer;
        html = `<div class="item clearfix" id="inc-%id%">
        <div class="item__description">%description%</div>
        <div class="right clearfix">
            <div class="item__value">%value%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div>
        </div>`;
      } else if (type === "exp") {
        element = domStrings.expenseContainer;
        html = `<div class="item clearfix" id="exp-%id%">
        <div class="item__description">%description%</div>
        <div class="right clearfix">
            <div class="item__value">%value%</div>
            <div class="item__percentage">21%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div>
    </div>`;
      }
      // replace placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
      // insert html to the dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    clearInputField: function () {
      var inputs = document.querySelectorAll(
        domStrings.inputDescription + ", " + domStrings.inputValue
      );
      var inputsArr = Array.prototype.slice.call(inputs);
      inputsArr.forEach((input) => (input.value = ""));
      inputs[0].focus();
    },
    displayBudget: function (obj) {
      document.querySelector(domStrings.budgetValue).textContent = obj.budget;
      document.querySelector(domStrings.budgetIncome).textContent = obj.income;
      document.querySelector(domStrings.budgetExpenses).textContent =
        obj.expenses;
      if (obj.percentage > 0) {
        document.querySelector(domStrings.budgetPercentage).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(domStrings.budgetPercentage).textContent = "---";
      }
    },
    deleteListItem: function (selectorId) {
      var element = document.getElementById(selectorId);
      element.parentNode.removeChild(element);
    },
    displayPercentages: function (percentages) {
      var fields;
      fields = document.querySelectorAll(domStrings.expensesPercentage);
      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    displayTime: function () {
      var now, year, month, months;
      now = new Date();
      year = now.getFullYear();
      months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      month = now.getMonth();
      document.querySelector(domStrings.dateLabel).textContent =
        months[month] + ", " + year;
    },
    changeType: function() {
      var fields = document.querySelectorAll(domStrings.inputType + ", " + domStrings.inputDescription + ", " + domStrings.inputValue);
      console.log(fields);
      nodeListForEach(fields, cur => {
        cur.classList.toggle('red-focus');
      });
      document.querySelector(domStrings.inputBtn).classList.toggle('red');
    },
    getDomStrings: function () {
      return domStrings;
    },
  };
})();

var AppController = (function (budgetCtrl, UICtrl) {
  var DOM = UICtrl.getDomStrings();
  var ctrlAddItem = function () {
    var input, newItem;
    // 1 . get the field input data
    input = UICtrl.getInput();
    // 2. add the item to the budget controller
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. add the item to the ui controller and clear input fields
      UICtrl.addListItem(newItem, input.type);

      UICtrl.clearInputField();

      // 4. calculate and update the budget
      updateBudget();

      // 5. update percentages

      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemId, splitId, type, id;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id; // id is the #id of this html element

    if (itemId) {
      splitId = itemId.split("-");
      type = splitId[0];
      id = splitId[1];
      // 1. delete item from the budget
      budgetCtrl.deleteItem(type, parseInt(id));
      // 2. delete item from the ui

      UICtrl.deleteListItem(itemId);
      // 3. update the budget

      updateBudget();
      // 4. update the percentage
      updatePercentages();
    }
  };
  var updateBudget = function () {
    // 1. calculate the budget
    budgetCtrl.calculateBudget();
    // 2. return the budget
    var budget = budgetCtrl.getBudget();
    // 3. display the budget on the UI
    UICtrl.displayBudget(budget);
  };
  var setUpEventListiner = function () {
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    // the key pressed down will be passed to the function
    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.eventContainer)
      .addEventListener("click", ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
  };

  var updatePercentages = function () {
    // 1. calculate the percentage
    budgetCtrl.calculatePercentage();
    // 2. update the percentage
    var percentages = budgetCtrl.getPercentages();
    // 3. update the ui
    UICtrl.displayPercentages(percentages);
  };

  return {
    init: function () {
      console.log("App started!");
      setUpEventListiner();
      UICtrl.displayBudget({
        budget: 0,
        income: 0,
        expenses: 0,
        percentage: 0,
      });
      UICtrl.displayTime();
    },
  };
})(budgetController, UIController);

AppController.init();

 var budgetController = (function(){

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percent = -1;
    }

    Expense.prototype.calcPercentages = function(totalIncome){
        if(totalIncome > 0){
            this.percent = Math.round(((this.value)/totalIncome)*100);
        } 
    }

    Expense.prototype.getPercentages = function(){
        return this.percent;
    }

    var totalData = function(type){
        var sum = 0;
        data.totals[type] = data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        expPercentage: -1
    }

    return {
        addNewItem: function(type, des, val){

            var newItem, ID;

            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            else{
                newItem = new Expense(ID, des, val);
            }

            data.allItems[type].push(newItem);
        
            return newItem;

        },

        calculateBudget: function(){
            totalData('inc');
            totalData('exp');

            data.budget = data.totals.inc-data.totals.exp;
            if(data.totals.inc > 0){
                data.expPercentage = Math.round((data.totals.exp/data.totals.inc)*100);
            }
        },

        getData: function(){
            return {
                budget: data.budget,
                income: data.totals.inc,
                expenses: data.totals.exp,
                percent: data.expPercentage
            }
        },

        deleteItem: function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
            
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentages(data.totals.inc);
            });
        },

        getPercentages: function(){
            var percentages = data.allItems.exp.map(function(cur){
                return cur.getPercentages();
            });
            return percentages;
        },

        testing: function(){
            console.log(data);
        }
    }

 })();



 var uiController = (function(){

    var domStrings = {
        type: '.add__type',
        description: '.add__description',
        value: '.add__value',
        btn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formattedNumber = function(num, type){
        var arr,int,dec,type;
        num = Math.abs(num).toFixed(2);
        arr = num.split('.');
        int = arr[0];
        dec = arr[1];
        int = int.split("").reverse().map((n, i)=>{
            if(i%3==0 && i!=0)
                return n+',';
            else
                return n;    
        }).reverse().join('');

        return (type === 'exp'? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callBack){
        for(var i = 0; i<list.length; i++){
            callBack(list[i], i);
        }
    };

    return {
        retDomStrings: function(){return domStrings},

        addListItem: function(obj, givTyp){
            var html, newHTML, container;

            if(givTyp === 'inc'){
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            
                container = domStrings.incomeContainer;
            }
            else{
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            
                container = domStrings.expensesContainer;
            }

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formattedNumber(obj.value, givTyp));

            document.querySelector(container).insertAdjacentHTML('beforeend', newHTML);

        },

        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(domStrings.description + ', ' + domStrings.value);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach( (current, index, array) => {
                current.value = "";
            });

            fieldsArr[0].focus();

        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(domStrings.budgetLabel).textContent = formattedNumber(obj.budget, type);
            document.querySelector(domStrings.incomeLabel).textContent = formattedNumber(obj.income, 'inc');
            document.querySelector(domStrings.expensesLabel).textContent = formattedNumber(obj.expenses, 'exp');

            if(obj.percent > 0){
                document.querySelector(domStrings.percentLabel).textContent = obj.percent + '%';
            } else{
                document.querySelector(domStrings.percentLabel).textContent = '---';
            }
        },

        deleteItem: function(id){
            el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },

        displayPerc: function(percentage){
            var nodeList = document.querySelectorAll(domStrings.itemPercLabel);

            nodeListForEach(nodeList, function(current, index){
                if(percentage[index] > 0){
                    current.textContent = percentage[index] + '%';
                } else{
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function(){
            var curYear = new Date().getFullYear();
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var curMonth = months[new Date().getMonth()];

            document.querySelector(domStrings.dateLabel).textContent = curMonth + ' ' + curYear;
        },

        chColor: function(){
            var fields = document.querySelectorAll(
                domStrings.type + ',' +
                domStrings.description + ',' +
                domStrings.value 
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(domStrings.btn).classList.toggle('red');
        },

        inputDetails: function(){
            return{
                uiType: document.querySelector(domStrings.type).value,
                uiDescription: document.querySelector(domStrings.description).value,
                uiValue: parseFloat(document.querySelector(domStrings.value).value)
            }
        }

    };

 })();



 var controller = (function(budgetCtrl, uiCtrl){

    var inputFunction = function(){

        var inpDet = uiCtrl.inputDetails();

        if(inpDet.uiDescription != "" && inpDet.uiValue > 0){
            var newItem = budgetCtrl.addNewItem(inpDet.uiType, inpDet.uiDescription, inpDet.uiValue);

            uiCtrl.addListItem(newItem, inpDet.uiType);

            uiCtrl.clearFields();

            calculateBudget();

            updatePercentages();
        }
    };

    var calculateBudget = function(){
        budgetCtrl.calculateBudget();
        var data = budgetCtrl.getData();
        uiCtrl.displayBudget(data);
    }

    var ctrlDeleteItem = function(event){
        var itemId, arr;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            arr = itemId.split('-');
            type = arr[0];
            id = parseInt(arr[1]);
        }

        budgetCtrl.deleteItem(type, id);

        uiCtrl.deleteItem(itemId);

        calculateBudget();

        updatePercentages();
    }

    var updatePercentages = function(){
        budgetCtrl.calculatePercentages();
        var percentageArr = budgetCtrl.getPercentages();
        uiCtrl.displayPerc(percentageArr);
    };

    var setupEventListeners = function(){
        var DOM = uiCtrl.retDomStrings();
        document.querySelector(DOM.btn).addEventListener('click', inputFunction);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13){
                inputFunction();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.type).addEventListener('change', uiCtrl.chColor);
    };


    return{
        init: function(){
            setupEventListeners();
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                income: 0,
                expenses: 0,
                percent: -1
            });
        }
    }

 })(budgetController, uiController);

 controller.init();
// ==UserScript==
// @name         星野爱
// @version      1.0.0
// @match        https://buyertrade.taobao.com/trade/*
// @grant        none
// @license      MIT
// ==/UserScript==

var orderList = {};
var ProductNameBlackList = [];
var defaultProductNameBlackList = ["保险服务", "增值服务", "买家秀"];

//通知气泡默认属性
function createToast() {
    let Toast = document.createElement("div");
    let ToastText = document.createTextNode("通知气泡");

    Toast.id = "Toast";
    Toast.style.visibility = "hidden";
    Toast.style.position = "fixed";
    Toast.style.bottom = "0px";
    Toast.style.fontSize = "17px";
    Toast.style.minWidth = "200px";
    Toast.style.backgroundColor = "#4CAF50";
    Toast.style.color = "white";
    Toast.style.textAlign = "center";
    Toast.style.borderRadius = "10px";
    Toast.style.padding = "10px";
    Toast.style.zIndex = 1;
    Toast.style.right = "1%";

    Toast.appendChild(ToastText);
    document.getElementById("page").appendChild(Toast);
}

//调用通知气泡
function Toast(toastTextContent, alwaysShow = false) {
    let Toast = document.getElementById("Toast");

    Toast.style.visibility = "visible";
    Toast.textContent = toastTextContent;

    if (alwaysShow === false) {
        setTimeout(function () {
            Toast.style.visibility = "hidden";
        }, 3000);
    }
}

//商品名称黑名单默认属性
function createBlackListTextarea(element) {
    let Textarea = document.createElement("TEXTAREA");
    let TextareaTitle = document.createElement("p");

    Textarea.id = "blackList";
    Textarea.rows = 8;
    Textarea.cols = 30;
    Textarea.placeholder = "商品名称黑名单关键词，每行一条。";
    Textarea.style.padding = "5px";

    TextareaTitle.textContent = "商品名称黑名单关键词";
    TextareaTitle.style.fontSize = "15px";
    TextareaTitle.style.fontWeight = 700;

    element.insertBefore(Textarea, element.childNodes[0]);
    element.insertBefore(TextareaTitle, element.childNodes[0]);
}

//复选框默认属性
function addCheckbox(element, onchangeFunc, text, id) {
    const checkbox = document.createElement("input");
    const checkboxLabel = document.createElement("label");

    checkbox.id = id;
    checkbox.type = "checkbox";
    checkbox.defaultChecked = true;

    checkbox.style.marginRight = "2px";

    checkboxLabel.for = id;
    checkboxLabel.textContent = text;

    checkbox.onchange = function () {
        onchangeFunc();
    };

    element.appendChild(checkbox);
    element.appendChild(checkboxLabel);
}

//按钮默认属性
function addButton(element, onclickFunc, text = "按钮", id, width = "160px", height = "60px") {
    const button = document.createElement("input");

    button.id = id;
    button.type = "button";
    button.value = text;
    button.style.height = height;
    button.style.width = width;
    button.style.align = "center";
    button.style.marginLeft = "40px";
    button.style.color = "white";
    button.style.background = "#409EFF";
    button.style.border = "1px solid #409EFF";

    button.style.fontSize = "16px";

    button.onclick = function () {
        onclickFunc();
    };

    element.appendChild(button);
}

//在订单数据页面添加控件
const orderListPage = /(http|https):\/\/buyertrade\.taobao.*?\/trade/g;
if (orderListPage.exec(document.URL)) {
    const orderListMain = document.getElementById("J_bought_main");

    const userMain = document.createElement("div");
    const userMainText = document.createElement("span");
    const userMainList = document.createElement("ul");
    const userMainListRow1List = document.createElement("ul");

    const userMainListRow1 = document.createElement("li");
    const userMainListRow2 = document.createElement("li");
    const userMainListRow3 = document.createElement("li");

    const userMainListRow11 = document.createElement("li");
    const userMainListRow12 = document.createElement("li");
    const userMainListRow13 = document.createElement("li");

    userMain.id = "userMain";
    userMainText.id = "userMainText";
    userMainList.id = "userMainList";
    userMainListRow1List.id = "userMainListRow1List";

    userMainListRow1.id = "userMainListRow1";
    userMainListRow2.id = "userMainListRow2";
    userMainListRow3.id = "userMainListRow3";
    userMainListRow11.id = "userMainListRow11";
    userMainListRow12.id = "userMainListRow12";
    userMainListRow13.id = "userMainListRow13";

    orderListMain.insertBefore(userMain, orderListMain.childNodes[0]);
    userMain.appendChild(userMainText);
    userMain.appendChild(userMainList);
    userMainList.appendChild(userMainListRow1);
    userMainList.appendChild(userMainListRow2);
    userMainList.appendChild(userMainListRow3);
    userMainListRow1.appendChild(userMainListRow1List);
    userMainListRow1List.appendChild(userMainListRow11);
    userMainListRow1List.appendChild(userMainListRow12);
    userMainListRow1List.appendChild(userMainListRow13);

    createToast();
    createBlackListTextarea(userMainText);

    addCheckbox(userMainListRow11, changeBlackListStatus, "商品名黑名单过滤", "BlackListStatus");
    addCheckbox(userMainListRow12, changeDelayStatus, "快照获取随机延时", "DelayStatus");
    addCheckbox(userMainListRow13, changeSnapProductNameStatus, "快照商品名称获取", "SnapProductNameStatus");

    addButton(userMainListRow2, cleanBlackList, "清空黑名单列表", "cleanBlackList");
    addButton(userMainListRow2, resetBlackList, "重置黑名单列表", "resetBlackList");
    addButton(userMainListRow2, setBlackList, "设置黑名单列表", "setBlackList");

    addButton(userMainListRow3, cleanOrdersList, "清空订单数据", "cleanOrdersList");
    addButton(userMainListRow3, exportOrdersList, "导出订单数据", "exportOrdersList");
    addButton(userMainListRow3, addCurrentPageOrdersToList, "添加本页订单", "addOrdersList");

    // 新增输入框
    const excludeOrdersDiv = document.createElement("div");
    excludeOrdersDiv.style.display = "flex";
    excludeOrdersDiv.style.alignItems = "center";
    userMainListRow3.appendChild(excludeOrdersDiv);

    const excludeOrdersInput = document.createElement("textarea");
    excludeOrdersInput.id = "excludeOrdersInput";
    excludeOrdersInput.rows = 5;
    excludeOrdersInput.cols = 30;
    excludeOrdersInput.placeholder = "请输入要排除的订单号，每行一个";
    excludeOrdersDiv.appendChild(excludeOrdersInput);

    // 新增时间范围选择器
    const dateRangeDiv = document.createElement("div");
    dateRangeDiv.style.display = "flex";
    dateRangeDiv.style.alignItems = "center";
    dateRangeDiv.style.marginLeft = "20px";  // 增加空白
    userMainListRow3.appendChild(dateRangeDiv);

    const startDateInput = document.createElement("input");
    startDateInput.type = "date";
    startDateInput.id = "startDateInput";
    dateRangeDiv.appendChild(startDateInput);

    const toLabel = document.createElement("span");
    toLabel.textContent = " 至 ";
    toLabel.style.margin = "0 10px";
    dateRangeDiv.appendChild(toLabel);

    const endDateInput = document.createElement("input");
    endDateInput.type = "date";
    endDateInput.id = "endDateInput";
    dateRangeDiv.appendChild(endDateInput);

    document.getElementById("exportOrdersList").disabled = true;
    document.getElementById("exportOrdersList").style.opacity = 0.6;

    document.getElementById("cleanOrdersList").disabled = true;
    document.getElementById("cleanOrdersList").style.opacity = 0.6;

    setElementStyle();
    resetBlackList();

    console.info("在订单数据页面添加按钮!");
}

function setElementStyle() {
    const userMain = document.getElementById("userMain");
    const userMainText = document.getElementById("userMainText");
    const userMainList = document.getElementById("userMainList");
    const userMainListRow1List = document.getElementById("userMainListRow1List");

    const userMainListRow1 = document.getElementById("userMainListRow1");
    const userMainListRow2 = document.getElementById("userMainListRow2");
    const userMainListRow3 = document.getElementById("userMainListRow3");
    const userMainListRow11 = document.getElementById("userMainListRow11");
    const userMainListRow12 = document.getElementById("userMainListRow12");
    const userMainListRow13 = document.getElementById("userMainListRow13");

    userMain.style.height = "180px";

    userMainText.style.float = "left";
    userMainText.style.width = "240px";
    userMainText.style.paddingLeft = "30px";
    userMainText.style.display = "inline-block";

    userMainList.style.float = "left";
    userMainList.style.width = "600px";
    //userMainList.style.marginTop = "20px";
    userMainList.style.marginLeft = "-20px";

    userMainListRow1.style.fontSize = "14px";
    userMainListRow1.style.marginBottom = "35px";

    userMainListRow2.style.marginBottom = "20px";

    userMainListRow3.style.marginBottom = "20px";
    userMainListRow3.style.display = "flex"; // 使用 flex 布局
    userMainListRow3.style.flexWrap = "wrap"; // 允许换行

    userMainListRow11.style.float = "left";
    userMainListRow11.style.width = "160px";
    userMainListRow11.style.marginLeft = "40px";

    userMainListRow12.style.float = "left";
    userMainListRow12.style.width = "160px";
    userMainListRow12.style.marginLeft = "40px";

    userMainListRow13.style.float = "left";
    userMainListRow13.style.width = "160px";
    userMainListRow13.style.marginLeft = "40px";
}

//重置按钮状态
function ResetButtonStatus() {
    document.getElementById("addOrdersList").style.background = "#409EFF";

    document.getElementById("tp-bought-root").removeEventListener("click", ResetButtonStatus);
}

//数据转为csv文本文件
function toCsv(header, data, filename) {
    let rows = "";
    let row = header.join(",");
    rows += row + "\n";

    _.forEach(data, (value) => {
        rows += value.join(",") + "\n";
    });

    let blob = new Blob(["\ufeff" + rows], { type: "text/csv;charset=utf-8;" });
    let encodedUrl = URL.createObjectURL(blob);
    let url = document.createElement("a");
    url.setAttribute("href", encodedUrl);
    url.setAttribute("download", filename + ".csv");
    document.body.appendChild(url);
    url.click();
}

var currentPageOrdersData = {};
//添加本页订单数据
function addCurrentPageOrdersToList() {
    const mainOrders = document.getElementsByClassName("js-order-container");

    var isEnableSnapProductName = document.getElementById("SnapProductNameStatus").checked;

    document.getElementById("addOrdersList").style.background = "#ff9800";

    currentPageOrdersData = {};

    //遍历每条订单记录
    for (let order of mainOrders) {
        let items = processOrderList(order);

        if (!items) {
            continue;
        }

        _.forEach(items, (value, key) => {
            orderList[key] = value;
            if (isEnableSnapProductName === false) {
                currentPageOrdersData[key] = value;
            }
        });

        //break; //TODO:测试单条订单记录
    }

    if (isEnableSnapProductName === false) {
        document.getElementById("addOrdersList").style.background = "#4CAF50";

        document.getElementById("tp-bought-root").addEventListener("click", ResetButtonStatus);

        Toast("添加 " + Object.keys(currentPageOrdersData).length + " 条订单,已添加 " + Object.keys(orderList).length + " 条订单。");
        console.info("添加 " + Object.keys(currentPageOrdersData).length + " 条订单,已添加 " + Object.keys(orderList).length + " 条订单。");

        console.info("本页订单数据:");
        console.info(currentPageOrdersData);
    }

    document.getElementById("exportOrdersList").disabled = false;
    document.getElementById("exportOrdersList").style.opacity = 1;

    document.getElementById("cleanOrdersList").disabled = false;
    document.getElementById("cleanOrdersList").style.opacity = 1;
}

function exportOrdersList() {
    const header = ["快照商品名称","商品链接", "商品主图",  "单价", "数量", "实付款", "退款状态"];

    var dateTime = new Date();

    var dateTimeFullMonth = dateTime.getMonth() + 1;
    var dateTimeFullDay = dateTime.getDate();

    dateTimeFullMonth = dateTimeFullMonth < 10 ? "0" + dateTimeFullMonth : dateTimeFullMonth;
    dateTimeFullDay = dateTimeFullDay < 10 ? "0" + dateTimeFullDay : dateTimeFullDay;

    const dateStr = dateTime.getFullYear() + "-" + dateTimeFullMonth + "-" + dateTimeFullDay;
    const timeStr = dateTime.getHours() + "-" + dateTime.getMinutes() + "-" + dateTime.getSeconds();
    const filename = "淘宝买家订单数据导出_" + dateStr + "_" + timeStr;

    // 过滤掉退款状态为 "退款" 的订单
    const filteredOrderList = _.filter(orderList, (order) => order[10] !== "退款");

    // 获取要排除的订单号
    const excludeOrdersInput = document.getElementById("excludeOrdersInput").value;
    const excludeOrders = excludeOrdersInput.split("\n").map(order => order.trim());

    // 获取时间范围
    const startDate = document.getElementById("startDateInput").value;
    const endDate = document.getElementById("endDateInput").value;

    // 排除指定订单号和不在时间范围内的订单
    const modifiedOrderList = filteredOrderList.filter(order => {
        const orderDate = order[1];
        const inDateRange = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
        return !excludeOrders.includes(order[0]) && inDateRange;
    });

    // 只保留所需的列
    const finalOrderList = modifiedOrderList.map(order => [
        order[3],  // 交易快照
        order[6],  // 商品链接
        order[5],  // 商品主图
        order[8],  // 单价
        order[9],  // 数量
        order[11], // 实付款
        order[12]  // 退款状态
    ]);

    toCsv(header, finalOrderList, filename);
}

//清空订单数据
function cleanOrdersList() {
    let count = Object.keys(orderList).length;
    orderList = {};

    Toast("清空了: " + count + " 条订单数据!");
    console.info("清空了: " + count + " 条订单数据!");
}

//清空黑名单列表
function cleanBlackList() {
    ProductNameBlackList = [];
    document.getElementById("blackList").value = "";

    Toast("清空黑名单列表!");
    console.info("清空黑名单列表!");
    console.info("ProductNameBlackList:" + ProductNameBlackList);
}

//重置黑名单列表
function resetBlackList() {
    ProductNameBlackList = [];
    document.getElementById("blackList").value = "";

    for (let index = 0; index < defaultProductNameBlackList.length; index++) {
        ProductNameBlackList[index] = defaultProductNameBlackList[index];
        document.getElementById("blackList").value += defaultProductNameBlackList[index] + "\n";
    }

    Toast("重置黑名单列表!");
    console.info("重置黑名单列表!");
    console.info("ProductNameBlackList:" + ProductNameBlackList);
}

//设置黑名单列表
function setBlackList() {
    var textareaContent = document.getElementById("blackList").value + "\n";
    var blackList = textareaContent.match(/.+\n/g);

    for (let index = 0; index < blackList.length; index++) {
        ProductNameBlackList[index] = blackList[index].replace("\n", "");
    }

    Toast("设置黑名单列表!");
    console.info("设置黑名单列表!");
    console.info("ProductNameBlackList:" + ProductNameBlackList);
}

//启用/禁用 商品名黑名单过滤
function changeBlackListStatus() {
    let BlackListStatus = document.getElementById("BlackListStatus").checked;

    if (BlackListStatus === true) {
        document.getElementById("cleanBlackList").disabled = false;
        document.getElementById("cleanBlackList").style.opacity = 1;

        document.getElementById("resetBlackList").disabled = false;
        document.getElementById("resetBlackList").style.opacity = 1;

        document.getElementById("setBlackList").disabled = false;
        document.getElementById("setBlackList").style.opacity = 1;

        Toast("启用商品名黑名单过滤!");
        console.info("启用商品名黑名单过滤!");
    } else {
        document.getElementById("cleanBlackList").disabled = true;
        document.getElementById("cleanBlackList").style.opacity = 0.6;

        document.getElementById("resetBlackList").disabled = true;
        document.getElementById("resetBlackList").style.opacity = 0.6;

        document.getElementById("setBlackList").disabled = true;
        document.getElementById("setBlackList").style.opacity = 0.6;

        Toast("禁用商品名黑名单过滤!");
        console.info("禁用商品名黑名单过滤!");
    }
}

//启用/禁用 快照获取随机延时
function changeDelayStatus() {
    let DelayStatus = document.getElementById("DelayStatus").checked;

    if (DelayStatus === true) {
        Toast("启用快照获取随机延时1.0~3.0S!");
        console.info("启用快照获取随机延时1.0~3.0S!");
    } else {
        Toast("禁用快照获取随机延时!");
        console.info("禁用快照获取随机延时!");
    }
}

//启用/禁用 快照商品名称获取
function changeSnapProductNameStatus() {
    let SnapProductNameStatus = document.getElementById("SnapProductNameStatus").checked;

    if (SnapProductNameStatus === true) {
        Toast("启用快照商品名称获取!");
        console.info("启用快照商品名称获取!");
    } else {
        Toast("禁用快照商品名称获取!");
        console.info("禁用快照商品名称获取!");
    }
}

var orderDataIndexListCount = 0;
var orderDataIndexList = [];
var getSnapShotProductNameCount = 0;
var orderListSnapShotProductName = {};
//获取快照商品名称
function getSnapShotProductName(snapShotUrl, orderDataIndex) {
    var orderDataItemIndex = 14;
    var randomTimeout = 0;
    var isenableDelay = document.getElementById("DelayStatus").checked;
    if (isenableDelay === true) {
        let min = 1000; //毫秒
        let max = 3000; //毫秒
        randomTimeout = Math.round(Math.random() * (max - min)) + min;
    }

    orderDataIndexList[orderDataIndexListCount] = orderDataIndex;
    orderDataIndexListCount++;

    Toast("正在获取快照商品名称...", true);
    console.info("正在获取快照商品名称...");

    setTimeout(function () {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                orderListSnapShotProductName[orderDataIndex] = this.responseText.match(/<title>(.*)<\/title>/)[1];

                getSnapShotProductNameCount--;
                //console.info("快照商品名称:" + orderListSnapShotProductName[orderDataIndex]);

                if (getSnapShotProductNameCount === 0) {
                    document.getElementById("addOrdersList").style.background = "#4CAF50";

                    document.getElementById("tp-bought-root").addEventListener("click", ResetButtonStatus);

                    let element = document.createElement("span");
                    _.forEach(orderListSnapShotProductName, (value, index) => {
                        element.innerHTML = value;
                        element.innerHTML = element.innerHTML.replace(/&amp;([a-zA-Z]*)/g, "&$1");
                        element.innerHTML = element.innerHTML.replace(/,/g, "，");

                        orderListSnapShotProductName[index] = element.innerText;
                        orderList[index][orderDataItemIndex] = orderListSnapShotProductName[index];
                    });
                    element.remove();

                    _.forEach(orderDataIndexList, (value) => {
                        currentPageOrdersData[value] = orderList[value];
                    });

                    orderDataIndexListCount = 0;
                    orderDataIndexList = [];

                    Toast("添加 " + Object.keys(currentPageOrdersData).length + " 条订单,已添加 " + Object.keys(orderList).length + " 条订单。");
                    console.info("添加 " + Object.keys(currentPageOrdersData).length + " 条订单,已添加 " + Object.keys(orderList).length + " 条订单。");

                    console.info("本页订单数据:");
                    console.info(currentPageOrdersData);
                }
            }
        };
        xhttp.open("GET", snapShotUrl);
        xhttp.send();
    }, randomTimeout);
}

//处理订单数据
function processOrderList(order) {
    let orderData = {};
    let textContent = order.textContent;
    let pattern = /(\d{4}-\d{2}-\d{2})订单号: ()/;
    let isExist = pattern.exec(textContent);

    if (!isExist) {
        console.info("暂未发现订单！");
    } else {
        const date = isExist[1];
        const id = order.querySelector("div[data-id]").getAttribute("data-id");

        var index = 0;

        var ShopNameQuery = null;
        var picUrlQuery = null;
        var ProductUrlQuery = null;
        var ProductNameQuery = null;
        var snapshotUrlQuery = null;
        var SKUNameQuery = null;
        var RealPriceQuery = null;
        var countQuery = null;
        var refundQuery = null;
        var actualFeeQuery = null;
        var statusQuery = null;
        var DetailUrlQuery1 = null;
        var DetailUrlQuery2 = null;

        while (true) {
            if (index === 0) {
                ShopNameQuery = order.querySelector("a[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:0.0.1.0.1']");
                actualFeeQuery = order.querySelector("span[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:1:0.$" + index + ".$4.0.0.2.0.1']");
                statusQuery = order.querySelector("span[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:1:0.$" + index + ".$5.0.0.0']");
                DetailUrlQuery1 = order.querySelector("a[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:1:0.$" + index + ".$5.0.1.$0.0']");
                DetailUrlQuery2 = order.querySelector("a[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:1:0.$" + index + ".$5.0.1.$1.0']");
            }

            picUrlQuery = order.querySelector("img[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:1:0.$" + index + ".$0.0.0.0.0']");
            ProductUrlQuery = order.querySelector("a[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:1:0.$" + index + ".$0.0.1.0.0']");
            ProductNameQuery = order.querySelector("span[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:1:0.$" + index + ".$0.0.1.0.0.1']");
            snapshotUrlQuery = order.querySelector("a[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:1:0.$" + index + ".$0.0.1.0.1']");
            SKUNameQuery = order.querySelector("p[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:1:0.$" + index + ".$0.0.1.1']");
            RealPriceQuery = order.querySelector("span[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:1:0.$" + index + ".$1.0.1.1']");
            countQuery = order.querySelector("p[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:1:0.$" + index + ".$2.0.0']");
            refundQuery = order.querySelector("span[data-reactid='.0.7:$order-" + id + ".$" + id + ".0.1:1:0.$" + index + ".$3.0.$0.0.$text']");

            index++;
            let orderDataIndex = id + index;

            if (ProductNameQuery === null) {
                break;
            }

            //过滤黑名单项：如"保险服务"、"增值服务"、"买家秀"等;
            var isEnableBlackList = document.getElementById("BlackListStatus").checked;
            if (isEnableBlackList === true && ProductNameBlackList.length > 0) {
                var searchResult = null;

                for (let item of ProductNameBlackList) {
                    searchResult = ProductNameQuery.textContent.search(item);
                    if (searchResult > -1) {
                        break;
                    }
                }

                if (searchResult > -1) {
                    continue;
                }
            }

            //修复淘宝订单页面中的字符实体显示错误和英文逗号导致的CSV导入Excel后数据错行；
            ProductNameQuery.innerHTML = ProductNameQuery.innerHTML.replace(/&amp;([a-zA-Z]*)/g, "&$1");
            ProductNameQuery.innerHTML = ProductNameQuery.innerHTML.replace(/,/g, "，");
            if (SKUNameQuery !== null) {
                SKUNameQuery.innerHTML = SKUNameQuery.innerHTML.replace(/&amp;([a-zA-Z]*).*?：/g, "&$1;");
                SKUNameQuery.innerHTML = SKUNameQuery.innerHTML.replace(/,/g, "，");
            }

            var orderInfoId = id;
            var orderInfoDate = date;
            var sellerInfoShopName = ShopNameQuery === null ? "" : ShopNameQuery.innerText;
            var subOrdersIteminfoPicUrl = picUrlQuery === null ? "" : picUrlQuery.src;
            var subOrdersIteminfoProductUrl = ProductUrlQuery === null ? "" : ProductUrlQuery.href;
            var subOrdersIteminfoProductName = ProductNameQuery.textContent;
            var subOrdersIteminfoSnapUrl = snapshotUrlQuery === null ? "" : snapshotUrlQuery.href;
            var subOrdersIteminfoSKUName = SKUNameQuery === null ? "" : SKUNameQuery.innerText;
            var subOrdersPriceinfoRealPrice = RealPriceQuery === null ? "" : RealPriceQuery.textContent;
            var subOrdersQuantityCount = countQuery === null ? "" : countQuery.textContent;
            var subOrdersRefund = refundQuery === null ? "" : refundQuery.innerText === "查看退款" ? "退款" : "";
            var payInfoActualFee = actualFeeQuery === null ? "" : actualFeeQuery.textContent;
            var statusInfoStatus = statusQuery === null ? "" : statusQuery.textContent;
            var statusInfoDetailUrl = DetailUrlQuery1 === null ? (DetailUrlQuery2 === null ? "" : DetailUrlQuery2.href) : DetailUrlQuery1.href;

            var subOrdersSnapshotProductName = null;

            //获取快照商品名称
            var isEnableSnapProductName = document.getElementById("SnapProductNameStatus").checked;
            if (isEnableSnapProductName === true) {
                getSnapShotProductNameCount++;
                getSnapShotProductName(subOrdersIteminfoSnapUrl, orderDataIndex);
            } else {
                subOrdersSnapshotProductName = "";
            }

            //精简数据
            subOrdersIteminfoProductUrl = subOrdersIteminfoProductUrl.replace(/&_u=\w*/, "");
            subOrdersIteminfoPicUrl = subOrdersIteminfoPicUrl.replace(/_80x80.(jpg|png)/, "");
            subOrdersIteminfoSnapUrl = subOrdersIteminfoSnapUrl.replace(/&snapShot=true/, "");
            subOrdersIteminfoSKUName = subOrdersIteminfoSKUName.replace(/颜色分类：?/, "");

            orderData[orderDataIndex] = [
                orderInfoId,
                orderInfoDate,
                sellerInfoShopName,
                subOrdersIteminfoProductName,
                subOrdersIteminfoSKUName,
                subOrdersIteminfoPicUrl,
                subOrdersIteminfoProductUrl,
                subOrdersIteminfoSnapUrl,
                subOrdersPriceinfoRealPrice,
                subOrdersQuantityCount,
                subOrdersRefund,
                payInfoActualFee,
                statusInfoStatus,
                statusInfoDetailUrl,
                subOrdersSnapshotProductName,
            ];
        }
    }
    return orderData;
}

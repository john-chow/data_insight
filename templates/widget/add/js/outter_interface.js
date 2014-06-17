// 拿到绘图对象
function getEc(id) {
    return window.drawer[id]
}

// 设置某绘图图像的背景
function setBgColor(id, color) {
    var drawer  = window.drawer[id];
    drawer.setBgColor(color);
    drawer.draw()
}

// 设置绘图图像实例的颜色序列
// colorList类型是数组，[]
function setIsColors(id, colorList) {
    var drawer  = window.drawer[id];
    drawer.setIsColors(colorList);
    drawer.draw()
}


// 设置绘图图像实例的颜色序列
// symbolList类型是数组，[]
// 可选范围 
// [ 
//      'circle', 'rectangle', 'triangle', 'diamond', 
//      'emptyCircle', 'emptyRectangle', 'emptyTriangle', 'emptyDiamond' 
// ]
function setIsSymbols(id, symbolList) {
    var drawer = window.drawer[id];
    drawer.setIsSymbols(symbolList);
    drawer.draw()
}



//定义一个简单的函数，判断参数是不是数字 
function  isNumber (para){ 
    if (typeof para=="number") { 
        return true; 
    }else{ 
        return false; 
    } 
} 
     
//这个函数用于判断传入的数是不是偶数 
function isEven(val) { 
    return val % 2 === 0; 
}
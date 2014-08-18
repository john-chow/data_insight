/*
*   编写各种约定俗成的映射关系
*/
function cvtToTime(variable) {
    // 必须是数字 + 's/m/h/d/m/y/'的格式
    // 否则返回0 
    var re = /^(\d+)[sSmMhHdD]$/;
    var reNum = /^(\d+)/;
    var reUnit = /[sSmMhHdD]$/;

    if(!re.test(variable))    return 0

    num = parseInt(variable.match(reNum)[0]);
    unit = variable.match(reUnit)[0];
    result = 0;
    switch(unit) {
        case "s":
        case "S":
            result = num * 1000
            break;
        
        case "m":
        case "M":
            result = num * 60 * 1000
            break;

        case "h":
        case "H":
            result = num * 60 * 60 * 1000
            break;

        case "d":
        case "D":
            result = num * 24 * 60 * 60 * 1000
            break;

        default:
            result = 0;
            break;
    }

    return result
}

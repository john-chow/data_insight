test( "hello test", function() {
  ok( 1 == "1", "Passed!" );
});

//test的第一个参数是展现在页面上的这个测试集合的名称，可以指定任何有意义的名字 
test('isNumber()',function(){ 
    //列举各种可能的情况，保证每种条件应该符合的逻辑 
    //ok 是QUnit中最常见的用于判断的函数，不过只能判断true和false 
    //正确，则绿色的条子，错误就会爆红 
    ok(isNumber(2), "2是一个数字"); 
    ok(!isNumber("2"),"字符串2不是一个数字"); 
    ok(isNumber(NaN),"NaN是一个数字");       
} ); 


test("isEven()" ,function(){ 
    //equals(actual,expected,[message]) 用于相当的判断函数 
    equal(true,isEven(2),'2是偶数'); 
    equal(false,isEven(3),'3不是偶数'); 
} ); 
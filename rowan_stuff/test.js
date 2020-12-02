


function a(){
    t1 = performance.now();
    console.log (b());
    t2 = performance.now();
    console.log(t2-t1);
}

function b(){
    num = 0;
    for (i=1; i<10000001; i++){
        num = 1**i;
    }
    return num;
}
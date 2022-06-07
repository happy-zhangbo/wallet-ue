var array = ["1","2","3","4","5","6"]
let a;
try{
    array.forEach(item => {
        if(item === "5"){
            a = item

        }
        console.log(item);
    })
}catch (e){
    if(e.message != "End") throw e;
}


console.log("SUccess");
console.log(a);
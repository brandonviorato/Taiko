window.addEventListener ("DOMContentLoaded", function() {
    console.log("hello");
    calcAcc();

    var inputs = document.getElementsByTagName('input');
    for (var i in inputs) {
        switch (inputs[i].type) {
            case "number":
                inputs[i].addEventListener("input", calcAcc);
                break;
        }
    }

})
function calcAcc() {
    accuracy = document.getElementById("acc").value;
    console.log(accuracy);
}
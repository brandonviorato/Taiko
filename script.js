// only works if this exists out here
// NOTE: this can be commented out if there is no "let" in front of variables in calcPP
// let starRating = document.getElementById("strain").value;// strain
// let od = document.getElementById("od-input").value; // OD value
// let maxCombo = document.getElementById("numcircles").value;
// let missCount = document.getElementById("misses").value;
// let hitWindow300 = calcHitWindow(od); // OD for 300 in ms
// let accuracy = document.getElementById("acc").value / 100;

// currently works.
window.addEventListener("DOMContentLoaded", function () {
    console.log("test");

    calcPP();

    var ez = document.getElementById("EZ");
    var hr = document.getElementById("HR");
    var ht = document.getElementById("HT");
    var dt = document.getElementById("DT");

    ez.addEventListener("click", uncheck(hr));
    hr.addEventListener("click", uncheck(ez));
    ht.addEventListener("click", uncheck(dt));
    dt.addEventListener("click", uncheck(ht));

    var inputs = document.getElementsByTagName('input');
    for (var i in inputs) {
        switch (inputs[i].type) {
            case "number":
                inputs[i].addEventListener("input", calcPP);
                break;
            case "checkbox":
                inputs[i].addEventListener("click", calcPP);
                break;
        }
    }
});

function uncheck(elem) {
    return function () {
        elem.checked = false;
    };
}

// scales OD based on selected mods.
function scaleOd(od) {
    if (document.getElementById("EZ").checked) { // ez is selected
        od /= 2;
    }
    if (document.getElementById("HR").checked) { // hr is selected
        od *= 1.4;
    }
    od = Math.max(Math.min(od, 10), 0); // OD is less than 10 and greater than 0
    return od;
}
// calculates hit window
function calcHitWindow(od) {
    od = scaleOd(od); // scale OD first

    let hitWindow = 35; // base window in ms

    if (od > 5) {
        hitWindow += (20 - 35) * (od - 5) / 5; // tighten hit window
    } 
    else if (od < 5) {
        hitWindow -= (35 - 50) * (5 - od) / 5; // loosen hit window
    }

    // adjust hit window based on selected mods
    if (document.getElementById("HT").checked) {
        hitWindow /= 0.75;
    }
    if (document.getElementById("DT").checked) {
        hitWindow /= 1.5;
    }
    
    return Math.round(hitWindow * 100) / 100; // 2 decimals NOTE: messes with accuracy of calculations
}
// calculates difficulty value
function calcDifficultyValue(starRating, maxCombo, effectiveMissCount, accuracy) {
    let difficultyValue;
    let lengthBonus;

    difficultyValue = Math.pow(5 * Math.max(1.0, starRating / 0.115) - 4.0, 2.25) / 1150.0;
    lengthBonus = 1 + 0.1 * Math.min(1.0, maxCombo / 1500.0);

    difficultyValue *= lengthBonus;

    difficultyValue *= Math.pow(0.986, effectiveMissCount);

    return difficultyValue * Math.pow(accuracy, 2.0);
}
// calculates accuracy value
function calcAccuracyValue(hitWindow300, accuracy) {
    if (hitWindow300 <= 0) {
        return 0;
    }

    let accuracyValue;
    let lengthBonus;

    accuracyValue = Math.pow(60.0 / hitWindow300, 1.1) * Math.pow(accuracy, 8.0) * Math.pow(starRating, 0.4) * 27.0;
    lengthBonus = Math.min(1.15, Math.pow(maxCombo / 1500.0, 0.3));

    accuracyValue *= lengthBonus;

    // // Slight HDFL Bonus for accuracy. A clamp is used to prevent against negative values. TO BE IMPLEMENTED
    // if (score.Mods.Any(m => m is ModFlashlight<TaikoHitObject>) && score.Mods.Any(m => m is ModHidden) && !isConvert)
    // accuracyValue *= Math.Max(1.0, 1.1 * lengthBonus);

    return accuracyValue;
}
// The effectiveMissCount is calculated by gaining a ratio for totalSuccessfulHits and increasing the miss penalty for shorter object counts lower than 1000.
function calcEffectiveMissCount(maxCombo, missCount) {
    let effectiveMissCount;

    let userCombo = maxCombo - missCount;

    effectiveMissCount = Math.max(1.0, 1000.0 / userCombo) * missCount;

    return effectiveMissCount;
}

function calcPP() {
    // get user input values
    starRating = document.getElementById("strain").value;// strain
    od = document.getElementById("od-input").value; // OD value
    maxCombo = document.getElementById("numcircles").value;
    missCount = document.getElementById("misses").value;
    hitWindow300 = calcHitWindow(od); // OD for 300 in ms
    accuracy = document.getElementById("acc").value / 100;

    // calculate individual values
    let totalValue;
    let multiplier = 1.13;
    let effectiveMissCount = calcEffectiveMissCount(maxCombo, missCount);
    let difficultyValue = calcDifficultyValue(starRating, maxCombo, effectiveMissCount, accuracy);
    let accuracyValue = calcAccuracyValue(hitWindow300, accuracy);

    // calculate mod bonuses
    if (document.getElementById("HD").checked) {
        multiplier *= 1.075;
        difficultyValue *= 1.025;
    }

    if (document.getElementById("EZ").checked) {
        multiplier *= 0.975;
        difficultyValue *= 0.985;
    }

    // if (document.getElementById("FL").checked) {
    //     difficultyValue *= 1.05 * strainLengthBonus
    // }

    if (document.getElementById("HR").checked) {
        difficultyValue *= 1.05;
    }

    // if (document.getElementById("HD").checked && document.getElementById("FL").checked) {
    //     accValue *= Math.max(1.050, 1.075 * accLengthBonus);
    // }


    // final PP calculation
    totalValue = Math.pow(Math.pow(difficultyValue, 1.1) + Math.pow(accuracyValue, 1.1), 1.0 / 1.1) * multiplier;

    document.getElementById("pp").innerHTML = Math.round(totalValue * 1000) / 1000 + " pp"
}
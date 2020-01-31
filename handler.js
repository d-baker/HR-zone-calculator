$(document).ready(function() {
    const adjustments = {"50%": 0.5, "60%": 0.6};

    const algorithms = {
        "traditional":  function (age, adjustment) {
            return (220 - age) * adjustment;

            },
        "modern":  function (age, adjustment) { 
            return (206 - (age * 0.88)) * adjustment;
            }
    };

    /*************** Formulae  *************/

    function calculateAT(algorithm, age, adjustment) {
        return algorithm(age, adjustment);
    }

    // RHR + 10%
    function calculateRestingUpperBound(restingHR) {
        return restingHR + (restingHR / 10);
    }

    // RHR + 20%
    function calculateActiveRecoveryUpperBound(restingHR) {
        return restingHR + (restingHR / 5);
    }

    /************* Zone formats ************/

    function getBasicZones(restingHR, anaerobicThreshold) {
        return {
            "Rest" : [restingHR, calculateRestingUpperBound(restingHR)],
            "Active recovery" : [calculateRestingUpperBound(restingHR) + 1, calculateActiveRecoveryUpperBound(restingHR)],
            "Exertion" : [calculateActiveRecoveryUpperBound(restingHR) + 1, anaerobicThreshold]
        };
    };

    function getGarminGraphZones(restingHR, anaerobicThreshold) {
        return {
            "Zone 1" : [restingHR, calculateRestingUpperBound(restingHR)],
            "Zone 2" : [calculateRestingUpperBound(restingHR), calculateRestingUpperBound(restingHR) +1],
            "Zone 3" : [calculateRestingUpperBound(restingHR) + 1, calculateActiveRecoveryUpperBound(restingHR)],
            "Zone 4" : [calculateActiveRecoveryUpperBound(restingHR), calculateActiveRecoveryUpperBound(restingHR) + 1],
            "Zone 5" : [calculateActiveRecoveryUpperBound(restingHR) + 1, anaerobicThreshold]
        };
    };

    function getGarminActivityZones(restingHR, anaerobicThreshold) {
        return {
            "Zone 1" : ["Your lowest observed HR", restingHR],
            "Zone 2" : [restingHR, calculateRestingUpperBound(restingHR) + 1],
            "Zone 3" : [calculateRestingUpperBound(restingHR) + 1, calculateActiveRecoveryUpperBound(restingHR)],
            "Zone 4" : [calculateActiveRecoveryUpperBound(restingHR), anaerobicThreshold],
            "Zone 5" : [anaerobicThreshold, "Your highest observed HR"]
        };
    };

    /*************** Form handling  *************/

    $("form").submit(function(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        var algorithmInput = formData.get('algorithm');
        var adjustmentInput = formData.get('adjustment');
        var age = parseInt(formData.get('age'));
        var restingHR = parseInt(formData.get('rhr'));
        var zoneType = formData.get('zoneType');

        var algorithm = algorithms[algorithmInput];
        var adjustment = adjustments[adjustmentInput];

        var zones = calculateZones(zoneType, algorithm, adjustment, age, restingHR);

        createTable(zones);
        insertAT(calculateAT(algorithm, age, adjustment));
    });

    function calculateZones(zoneType, algorithm, adjustment, age, restingHR) {
        var anaerobicThreshold = calculateAT(algorithm, age, adjustment);

        switch(zoneType) {
            case "garminGraph":
                return getGarminGraphZones(restingHR, anaerobicThreshold);
                break;
            case "garminActivity":
                return getGarminActivityZones(restingHR, anaerobicThreshold);
                break;
            default:
                return getBasicZones(restingHR, anaerobicThreshold);
        }
    }

    function createTable(zones) {
        $table = $("#zones tbody");
        $table.empty();
        $.each(zones, function(zoneName, values) {
            var lowerBound = values[0];
            var upperBound = values[1];
            lowerBound = isNaN(lowerBound) ? lowerBound : Math.round(lowerBound),
            upperBound = isNaN(upperBound) ? upperBound : Math.round(upperBound)

            $table.append(
                $('<tr>').append(
                    $('<th>').text(zoneName)).append(
                    $('<td>').text(lowerBound)).append(
                    $('<td>').text(upperBound))
                )
        });
        $("#zones").removeClass("hidden");
        $('html, body').animate({
            scrollTop: ($('#zones table').offset().top)
        },500);
    }

    function insertAT(anaerobicThreshold) {
        $el = $("#anaerobicThreshold .value");
        $el.text(Math.round(anaerobicThreshold));
        $("#anaerobicThreshold").removeClass("hidden");
    }

});
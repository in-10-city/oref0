function iobTotal(opts, time) {
    var now = time.getTime();
    var iobCalc = opts.calculate;
    var treatments = opts.treatments;
    var profile_data = opts.profile;
    var iob = 0;
    var bolussnooze = 0;
    var basaliob = 0;
    var activity = 0;
    var netbasalinsulin = 0;
    var hightempinsulin = 0;
    var microBolusInsulin = 0;
    var microBolusIOB = 0;
    if (!treatments) return {};
    //if (typeof time === 'undefined') {
        //var time = new Date();
    //}

    treatments.forEach(function(treatment) {
        if(treatment.date <= time.getTime( )) {
            var dia = profile_data.dia;
            var dia_ago = now - profile_data.dia*60*60*1000;
            // tIOB = total IOB
            var tIOB = iobCalc(treatment, time, dia);
            if (tIOB && tIOB.iobContrib) iob += tIOB.iobContrib;
            if (tIOB && tIOB.activityContrib) activity += tIOB.activityContrib;
            // keep track of bolus IOB separately for snoozes, but decay it twice as fast
            // only snooze for boluses that deliver more than 30m worth of basal (excludes SMBs)
            //if (treatment.insulin && treatment.started_at) {
                //console.error(treatment.insulin, treatment.started_at, profile_data.current_basal/1.5);
            //}
            if (treatment.insulin > profile_data.current_basal/1.5 && treatment.started_at) {
                //default bolussnooze_dia_divisor is 2, for 2x speed bolus snooze
                // bIOB = bolus IOB
                var bIOB = iobCalc(treatment, time, dia / profile_data.bolussnooze_dia_divisor);
                //console.log(treatment);
                //console.log(bIOB);
                if (bIOB && bIOB.iobContrib) bolussnooze += bIOB.iobContrib;
            } else {
                // track microBolus IOB, but also count it toward basaliob and hightempinsulin
                if (treatment.insulin <= profile_data.current_basal/1.5 && treatment.started_at) {
                    if(treatment.date > dia_ago && treatment.date <= now) {
                        microBolusInsulin += treatment.insulin;
                    }
                    if (tIOB && tIOB.iobContrib) {
                        microBolusIOB += tIOB.iobContrib;
                    }
                }
                // aIOB = basal IOB
                var aIOB = iobCalc(treatment, time, dia);
                if (aIOB && aIOB.iobContrib) basaliob += aIOB.iobContrib;
                if (treatment.insulin) {
                    if(treatment.date > dia_ago && treatment.date <= now) {
                        netbasalinsulin += treatment.insulin;
                        if (treatment.insulin > 0) {
                            hightempinsulin += treatment.insulin;
                        }
                    }
                }
            }
        }
    });

    return {
        iob: Math.round( iob * 1000 ) / 1000,
        activity: Math.round( activity * 10000 ) / 10000,
        bolussnooze: Math.round( bolussnooze * 1000 ) / 1000,
        basaliob: Math.round( basaliob * 1000 ) / 1000,
        netbasalinsulin: Math.round( netbasalinsulin * 1000 ) / 1000,
        hightempinsulin: Math.round( hightempinsulin * 1000 ) / 1000,
        microBolusInsulin: Math.round( microBolusInsulin * 1000 ) / 1000,
        microBolusIOB: Math.round( microBolusIOB * 1000 ) / 1000,
        time: time
    };
}

exports = module.exports = iobTotal;


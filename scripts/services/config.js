app.constant("dbConfig", {
    objectStores: {
        entries: "entries",
        players: "players"
    }
});

app.factory("config", ["utils", function(utils){
    var entries = {
        milestone: {
            types: [
                { id: "smile", text: "Smiled for the first time! :)" },
                { id: "turnedOver", text: "Turned over for the first time!" },
                { id: "laughter", text: "Laughed for the first time! :D" },
                { id: "solids", text: "Has started eating solids." },
                { id: "crawling", text: "Has started crawling!" },
                { id: "sitting", text: "Sat up for the first time!!" },
                { id: "standing", text: "Stood up for the first time!" },
                { id: "steps", text: "Has taken the first steps!" },
                { id: "word", text: "Said:" },
                { id: "potty", text: "Used the potty for the first time!" },
                { id: "haircut", text: "Had the first haircut!" },
                { id: "walking", text: "Started walking!" },
                { id: "daycare", text: "Has started going to daycare" },
                { id: "diapers", text: "Is not using diapers anymore!" },
                { id: "pacifier", text: "Has been weaned from the pacifier" }
            ]
        }
    };

    var lastSync,
        syncOfferDeclined;

    entries.milestone.typesIndex = utils.arrays.toIndex(entries.milestone.types, "id");

    return {
        entries: entries,
        localization: {
            height: {
                all: ["cm", "inches"],
                selected: "cm"
            },
            weight: {
                all: ["kg", "lb"],
                selected: "kg"
            }
        },
        sync: {
            declineSyncOffer: function(){
                syncOfferDeclined = true;
                localStorage.setItem("syncOfferDeclined", "1");
            },
            get lastSyncTimestamp(){
                if (lastSync === undefined) {
                    lastSync = localStorage.getItem("lastSync");

                    if (lastSync)
                        lastSync = new Date(parseInt(lastSync));
                    else
                        lastSync = null;
                }

                return lastSync;
            },
            set lastSyncTimestamp(value){
                if (!angular.isDate(value))
                    throw TypeError("Invalid type for lastSyncTimestamp, must be a date.");

                lastSync = value;
                localStorage.setItem("lastSync", lastSync.valueOf());
            },
            get synOfferDeclined(){
                if (syncOfferDeclined === undefined)
                    syncOfferDeclined = !!localStorage.getItem("syncOfferDeclined");

                return syncOfferDeclined;
            },
            syncOfferEntryCount: 3
        }
    }
}]);
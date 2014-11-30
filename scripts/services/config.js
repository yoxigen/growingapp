app.constant("dbConfig", {
    objectStores: {
        entries: "entries",
        players: "players"
    }
});

app.factory("config", ["utils", "localization", function(utils, localization){
    var entries = {
        images: { width: 600, height: 600 },
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
        },
        teeth: {
            list: [
                { id: "centralIncisorLowerRight", name: "Lower right central incisor" },
                { id: "centralIncisorLowerLeft", name: "Lower left central incisor" },
                { id: "centralIncisorUpperRight", name: "Upper right central incisor" },
                { id: "centralIncisorUpperLeft", name: "Upper left central incisor" },
                { id: "lateralIncisorLowerRight", name: "Lower right lateral incisor" },
                { id: "lateralIncisorLowerLeft", name: "Lower left lateral incisor" },
                { id: "lateralIncisorUpperRight", name: "Upper right lateral incisor" },
                { id: "lateralIncisorUpperLeft", name: "Upper left lateral incisor" },
                { id: "canineLowerRight", name: "Lower right canine" },
                { id: "canineLowerLeft", name: "Lower left canine" },
                { id: "canineUpperRight", name: "Upper right canine" },
                { id: "canineUpperLeft", name: "Upper left canine" },
                { id: "firstMolarLowerRight", name: "Lower right first molar" },
                { id: "firstMolarLowerLeft", name: "Lower left first molar" },
                { id: "firstMolarUpperRight", name: "Upper right first molar" },
                { id: "firstMolarUpperLeft", name: "Upper left first molar" },
                { id: "secondMolarLowerRight", name: "Lower right second molar" },
                { id: "secondMolarLowerLeft", name: "Lower left second molar" },
                { id: "secondMolarUpperRight", name: "Upper right second molar" },
                { id: "secondMolarUpperLeft", name: "Upper left second molar" }
            ]
        }
    };

    var currentLocalization = localization.getLocalizationDefaults();

    var localizationSetTime,
        lastSync,
        syncOfferDeclined;

    entries.milestone.typesIndex = utils.arrays.toIndex(entries.milestone.types, "id");
    entries.teeth.index = utils.arrays.toIndex(entries.teeth.list, "id");

    function getLocalization(){
        var storageLocalization = localStorage.app_localization;
        if (storageLocalization) {
            storageLocalization = JSON.parse(storageLocalization);
            if (storageLocalization.__updateTime__)
                localizationSetTime = new Date(storageLocalization.__updateTime__);
        }
        for(var p in storageLocalization){
            if (currentLocalization[p])
                currentLocalization[p].selected = storageLocalization[p];
        }
    }

    getLocalization();

    return {
        entries: entries,
        getCurrentLocalization: function(){
            var values = {};
            for(var p in currentLocalization){
                values[p] = currentLocalization[p].selected;
            }
            values.__updateTime__ = localizationSetTime;
            return values;
        },
        getLocalizedDate: function(date){
            if (!angular.isDate(date))
                throw new Error("Invalid date: " + date);

            return moment(date).format(currentLocalization.date.selected);
        },
        localization: currentLocalization,
        players: {
            getCurrentPlayerId: function(){
                var playerId = localStorage.currentPlayer;
                if (playerId)
                    return parseInt(playerId);

                return null;
            },
            removeCurrentPlayerId: function(){
                localStorage.removeItem("currentPlayer");
            },
            setCurrentPlayerId: function(playerId){
                localStorage.currentPlayer = String(playerId);
            },
            playerImageSize: { width: 400, height: 400 }
        },
        saveLocalization: function(localizationState){
            if (!localizationSetTime || !localizationState.__updateTime__ || localizationState.__updateTime__ > localizationSetTime) {
                var changed = false;

                for (var p in localizationState) {
                    if (currentLocalization[p] && currentLocalization[p].selected !== localizationState[p]) {
                        currentLocalization[p].selected = localizationState[p];
                        changed = true;
                    }
                }

                if (changed) {
                    localizationState.__updateTime__ = new Date().valueOf();
                    localStorage.setItem("app_localization", JSON.stringify(localizationState));
                    return true;
                }
            }

            return false;
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
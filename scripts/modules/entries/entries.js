define(["angular", "modules/entries/entries_module"], function(angular){
    "use strict";

    angular.module("Entries").factory("entries", entries);

    entries.$inject = ["utils", "localization", "config", "dbConfig", "EntryType"];

    function entries(utils, localization, config, dbConfig, EntryType){
        var entryTypes = [
            {
                "id": "photo",
                "name": "Photo",
                "icon": "photo",
                color: "rgb(249, 131, 44)"
            },
            {
                "id": "note",
                "name": "Note",
                "icon": "note",
                color: "#4e7dbc",
                allowDescription: false
            },
            {
                "id": "weight",
                "name": "Weight",
                template: "value",
                "icon": "weight",
                insight: "weight",
                insightIcon: "charts",
                color: "#397a42",
                "prepareForEdit": function(entry){
                    var convertMethod = localization.convertFromUnit;
                    entry.properties.weight = parseFloat(convertMethod("weight", entry.properties.value || entry.properties.weight, config.localization.weight.selected).toFixed(2));
                },
                "preSave": function(entry){
                    entry.properties.value = localization.convertToUnit("weight", entry.properties.weight, config.localization.weight.selected);
                    delete entry._unitValue;
                },
                "localizationDependencies": ["weight"]
            },
            {
                "id": "height",
                "name": "Height",
                insight: "height",
                insightIcon: "charts",
                template: "value",
                "icon": "height",
                color: "#139798",
                "prepareForEdit": function(entry){
                    var convertMethod = localization.convertFromUnit;
                    entry.properties.height = parseFloat(convertMethod("height", entry.properties.value || entry.properties.height, config.localization.height.selected).toFixed(2));
                },
                "preSave": function(entry){
                    entry.properties.value = localization.convertToUnit("height", entry.properties.height, config.localization.height.selected);
                },
                "localizationDependencies": ["height"]
            },
            {
                "id": "milestone",
                "name": "Milestone",
                "icon": "star",
                color: "rgb(255, 204, 4)"
            },
            {
                "id": "speech",
                "name": "Speech",
                "icon": "word",
                color: "rgb( 255, 68, 68 )"
            },
            {
                "id": "teeth",
                "name": "Tooth",
                "icon": "tooth",
                color: "rgb(165, 98, 199)"
            },
            {
                "id": "vaccine",
                insight: "vaccines",
                insightIcon: "list",
                "name": "Vaccine",
                "icon": "syringe",
                "color": "rgb(81, 202, 24)",
                parse: function(entry){
                    entry.vaccine = config.entries.vaccines.index[entry.properties.vaccineId];
                }

            }
        ];

        entryTypes = entryTypes.map(function(typeConfig){
            return new EntryType(typeConfig);
        });

        var entryTypesIndex = {};
        entryTypes.forEach(function(entryType){
            entryTypesIndex[entryType.id] = entryType;
        });

        return {
            get typesArray(){
                return entryTypes;
            },
            get types(){
                return entryTypesIndex;
            },
            getEntryDateText: function(date, birthDate){
                return date.toLocaleDateString() + " | " + utils.dates.getAge(date, birthDate);
            },
            /**
             * Checks whether a given entry type is valid - meaning, exists in the entry types array.
             * @param entryType
             * @returns {boolean}
             */
            isValidEntryType: function(entryType){
                return !!~entryTypes.indexOf(entryType);
            }
        };
    }
});
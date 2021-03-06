define(["angular", "insights/vaccines/vaccines"], function(){
    angular.module("Vaccines").controller("VaccinesController", vaccinesController);

    vaccinesController.$inject = ["$scope", "vaccines", "entriesModel", "utils"];

    function vaccinesController($scope, vaccines, entriesModel, utils){
        var vm = this;

        vm.editEntry = entriesModel.editEntry;

        entriesModel.onNewEntry.subscribe(onNewEntry);
        entriesModel.onUpdateEntry.subscribe(onUpdateEntry);
        entriesModel.onRemoveEntry.subscribe(onRemoveEntry);

        $scope.$on("$destroy", function(){
            entriesModel.onNewEntry.unsubscribe(onNewEntry);
            entriesModel.onUpdateEntry.unsubscribe(onUpdateEntry);
            entriesModel.onRemoveEntry.unsubscribe(onUpdateEntry);
        });

        setVaccines();

        function onNewEntry(entry){
            if (entry.type.id === "vaccine") {
                vm.entries.push(entry);
                sortEntries();
            }
        }

        function onUpdateEntry(entry){
            if (entry.type.id === "vaccine") {
                var vaccineEntry = utils.arrays.find(vm.entries, function(_entry){
                    return _entry.timestamp === entry.timestamp;
                });

                if (vaccineEntry){
                    vm.entries.splice(vm.entries.indexOf(vaccineEntry), 1, entry);
                }

                sortEntries();
            }
        }

        function onRemoveEntry(entry){
            if (entry.type.id === "vaccine") {
                var vaccineEntry = utils.arrays.find(vm.entries, function(_entry){
                    return _entry.timestamp === entry.timestamp;
                });

                if (vaccineEntry){
                    vm.entries.splice(vm.entries.indexOf(vaccineEntry), 1);
                }
            }
        }

        function sortEntries(){
            vm.entries.sort(function(a,b){
                if (a.date === b.date)
                    return 0;

                if (a.date > b.date)
                    return -1;

                return 1;
            });
        }

        function setVaccines(){
            vaccines.getVaccines().then(function(vaccineEntries){
                vm.entries = vaccineEntries;
            });
        }
    }
});
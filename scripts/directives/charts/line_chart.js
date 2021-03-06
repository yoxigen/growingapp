define(["angular", "d3", "modules/chart", "services/utils"], function (angular, d3) {
    'use strict';

    angular.module('Charts').directive('lineChart', lineChartDirective);

    lineChartDirective.$inject = ["Chart", "utils"];

    function lineChartDirective(Chart, utils) {
        return {
            template: '<div class="chart-wrapper"><div class="chart multiline"></div><ul class="chart-legend"></ul></div>',
            restrict: 'E',
            require: "?ngModel",
            replace: true,
            link: function postLink(scope, element, attrs, ngModel) {
                var defaultOptions = {
                        circleRadius: 3
                    },
                    chart = new Chart(defaultOptions, draw),
                    line,
                    points,
                    color,
                    percentileColor,
                    helpersData;

                scope.$watch(attrs.helpers, function (value) {
                    if (!value)
                        return;

                    helpersData = value;
                    if (chart.drawn)
                        drawHelpers();
                });

                element.css("height", "100%");

                chart.getTooltipText = function (d) {
                    return utils.strings.parseValue(chart.settings.tooltipText, d);
                };

                chart.preRender = function () {
                    color = chart.getColorScale();
                    percentileColor = chart.getColorScale("percentiles");

                    chart.legendData = chart.data.map(function (d) {
                        return { text: d.name, color: color(d.name) };
                    })
                };

                chart.init(scope, element.children().eq(0), attrs);

                chart.onResize = function () {
                    chart.elements.path.attr("d", function (d) {
                        return line(d.values);
                    });
                    if (!points)
                        points = this.svg.selectAll(".point");

                    points
                        .attr("cx", function (d) {
                            return chart.options.circleRadius / 4 + chart.scale.x(utils.objects.getObjectByPath(d, chart.settings.x));
                        })
                        .attr("cy", function (d) {
                            return chart.scale.y(d.value || utils.objects.getObjectByPath(d, chart.settings.y));
                        });

                    chart.elements.helperPaths.forEach(function (path) {
                        path.attr("d", function (d) {
                            return line(d.values);
                        });
                    });
                };

                scope.$on("$destroy", function () {
                    element.off();
                    element.empty();
                });

                function drawHelpers() {
                    chart.elements.helpers = chart.elements.helpersContainer.selectAll(".helper")
                        .data(helpersData)
                        .enter().append("g")
                        .attr("class", "helper");

                    chart.elements.helperPaths = [];
                    chart.elements.helpers.each(function (helper, i) {
                        chart.elements.helperPaths.push(d3.select(chart.elements.helpers[0][i]).append("path")
                            .attr("class", "line helper")
                            .attr("d", function (d) {
                                return line(d.values);
                            }).style("stroke", function (d) {
                                return percentileColor(d.name);
                            }));
                    });

                    createLegend();
                }

                function draw() {
                    if (!this.data || !this.data.length)
                        return false;

                    var self = this,
                        svg = this.dataSvg;

                    line = d3.svg.line()
                        .interpolate(chart.settings.interpolate || "linear")
                        .x(function (d) {
                            return chart.scale.x(utils.objects.getObjectByPath(d, chart.settings.x));
                        })
                        .y(function (d) {
                            return chart.scale.y(d.value || utils.objects.getObjectByPath(d, chart.settings.y));
                        });

                    setDomain();

                    chart.elements.helpersContainer = svg.append("g").attr("class", "helpers");

                    chart.elements.series = svg.selectAll(".series")
                        .data(self.data)
                        .enter().append("g")
                        .attr("class", "series pointsGroup");

                    chart.elements.path = chart.elements.series.append("path")
                        .attr("class", "line")
                        .attr("d", function (d) {
                            return line(d.values);
                        })
                        .style("stroke", function (d) {
                            return color(d.name);
                        });


                    chart.elements.series.each(function (series, i) {
                        d3.select(chart.elements.series[0][i]).selectAll(".point").data(series.values)
                            .enter().append("circle")
                            .attr("class", "point")
                            .attr("r", chart.options.circleRadius)
                            .attr("cx", function (d) {
                                return chart.options.circleRadius / 4 + chart.scale.x(utils.objects.getObjectByPath(d, chart.settings.x));
                            })
                            .attr("cy", function (d) {
                                return chart.scale.y(utils.objects.getObjectByPath(d, chart.settings.y));
                            })
                            .attr("data-tooltip", chart.settings.tooltipText ? "" : null)
                            .attr("data-selectable", chart.settings.onSelect ? "" : null)
                            .style("fill", function (d) {
                                return color(series.name)
                            })
                    });

                    if (helpersData && !chart.elements.helpers)
                        drawHelpers();
                    else
                        createLegend();
                }

                function createLegend() {
                    var legendElement = d3.select(element[0].childNodes[1]),
                        legendData = [];

                    chart.data.forEach(function (series) {
                        legendData.push({ name: series.name, color: color(series.name) });
                    });

                    if (helpersData) {
                        helpersData.forEach(function (helper) {
                            legendData.push({ name: helper.name, color: percentileColor(helper.name) });
                        });
                    }

                    legendElement.selectAll("li").data(legendData)
                        .enter().append("li")
                        .html(function (d) {
                            return '<span class="chart-legend-item-color" style="background-color: ' + d.color + '"></span> ' + d.name;
                        });
                }

                function setDomain() {
                    chart.scale.x.domain(getDomain("x"));
                    chart.scale.y.domain(getDomain("y"));
                }

                function getDomain(axis, minValue, maxValue) {
                    var min, max,
                        property = chart.settings[axis];

                    chart.data.forEach(function (series) {
                        series.values.forEach(function (item) {
                            var value = utils.objects.getObjectByPath(item, property);
                            if (minValue === undefined) {
                                if (min === undefined || value < min)
                                    min = value;
                            }

                            if (maxValue === undefined) {
                                if (max === undefined || value > max)
                                    max = value;
                            }
                        });
                    });

                    if (helpersData) {
                        var minHelperValue = helpersData[0].values[0],
                            maxHelperValue = helpersData[helpersData.length - 1].values[helpersData[0].values.length - 1];

                        min = utils.objects.getObjectByPath(minHelperValue, property);
                        if (min === undefined || min === null)
                            min = minHelperValue.value;

                        max = utils.objects.getObjectByPath(maxHelperValue, property) || maxHelperValue.value;
                        if (max === undefined || max === null)
                            max = maxHelperValue.value;
                    }

                    return[min !== undefined ? min : minValue, max !== undefined ? max : maxValue];
                }
            }
        };
    }
});
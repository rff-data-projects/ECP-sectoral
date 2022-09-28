const width_c2 = '120px; text-align: center;">';

(function(H) { // https://stackoverflow.com/questions/39570557/want-to-move-y-axis-scrollbar-with-mouse-wheel-in-highcharts-highstock

    //internal functions
    function stopEvent(e) {
      if (e) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        if (e.stopPropagation) {
          e.stopPropagation();
        }
        e.cancelBubble = true;
      }
    }
  
    //the wrap
    H.wrap(H.Chart.prototype, 'render', function(proceed) {
      var chart = this,
        mapNavigation = chart.options.mapNavigation;
  
      proceed.call(chart);
  
      // Add the mousewheel event
      H.addEvent(chart.container, document.onmousewheel === undefined ? 'DOMMouseScroll' : 'mousewheel', function(event) {
  
        var delta, extr, step, newMin, newMax, axis = chart.xAxis[0];
  
        e = chart.pointer.normalize(event);
        // Firefox uses e.detail, WebKit and IE uses wheelDelta
        delta = -e.detail || (e.wheelDelta / 120);
        delta = delta < 0 ? 1 : -1;

        if (chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop)) {
          extr = axis.getExtremes();
          step = (extr.max - extr.min) / 5 * delta;
          axis.setExtremes(extr.min + step, extr.max + step, true, false);
        }
  
        stopEvent(event); // Issue #5011, returning false from non-jQuery event does not prevent default
        return false;
      });
    });
  }(Highcharts));

function  BarChart(ddata, loc_juri, pricing, sector){

    let numb = loc_juri.length
    let cur_max = Math.max(...ddata)

    Highcharts.chart('viz', {
        chart: {
            type: 'bar',
            marginLeft: 150,
            marginBottom: 100,
            panning: true,
            style: {
                fontFamily: "Calibre Web Regular"
            }
        },
        colors: ['#04273C'],
        title: {
            text: ''
        },
        xtitle: {
            text: ''
        },
        xAxis: {
            categories: loc_juri,
            title: {
                text: null
            },
            min: 0,
            max: numb >= 6 ? 5 : numb-1,
            scrollbar: {
                enabled: true,
                barBorderRadius: 5,
                barBorderWidth: 1,
                barBackgroundColor: '#c2e1fb',
                barBorderColor: '#c2e1fb',
                buttonBackgroundColor: '#fff',
                buttonBorderColor: '#fff',
                buttonArrowColor: '#fff',
                buttonBorderWidth: 0,
                height: 8,
                rifleColor: '#c2e1fb',
                trackBackgroundColor: "#fff",
                trackBorderColor: '#f8f8f8',
            },
            labels: { 
                style: {
                    fontSize:'16px'
                },
                formatter: function() { // http://jsfiddle.net/02rnjnkx/
                    if (typeof this.value !== 'number') {
                      return this.value;
                    }
                }
              },
            events: {
                afterSetExtremes: function() {
                  var xAxis = this,
                    numberOfPoints = xAxis.series[0].points.length,
                    minRangeValue = xAxis.getExtremes().min,
                    maxRangeValue = xAxis.getExtremes().max;

                  if (minRangeValue < 0) {
                    xAxis.setExtremes(null, xAxis.options.max);
                  } else if (maxRangeValue > numberOfPoints) {
                    xAxis.setExtremes(numberOfPoints - xAxis.options.max, numberOfPoints);
                  }
                }
              }
        },
        yAxis: {
            min: 0,
            max : cur_max + Math.max(1, Math.round(cur_max*0.10)),
            title: {
                text: null,
                align: 'high'
            },
            labels: {
                overflow: 'justify',
                format:  '${text}',
                style: {
                    fontSize:'16px'
                }
            },
            gridLineWidth : 0,
        },
        tooltip: {
            valuePrefix: '$',
            useHTML: true,
            backgroundColor: '#fff',
            formatter: function() {
                /* 'The value for <b>' + this.x + '</b> is <b>' + this.y + '</b>, in series '+ this.series.name; */
                return "<div class = 'tool_head'>" + this.x + "</div>"+
                                        '<div class="grid-container"> \
                                        <div class="grid-item"> Carbon Price (2019$)</div>\
                                        <div class="grid-item" style = "max-width:' + width_c2 + '$' +  this.y  +  '</div>\
                                        <div class="grid-item"> Sector</div>\
                                        <div class="grid-item" style = "max-width:' + width_c2 + sector  + '</div>\
                                        <div class="grid-last-item"> Pricing </div>\
                                        <div class="grid-last-item" style = "max-width:' + width_c2 +  (pricing === 'tax_rate_incl_ex_kusd' ? 'Carbon Tax' : 'Cap and Trade')  +'</div>\
                                        </div>'
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: false
                }
            },
            cropThreshold: 100000 // https://stackoverflow.com/questions/48308040/highcharts-highstock-scrollbar-issue
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Price',
            data: ddata
        }]
    });
}

function MultiChart(ddata, loc_juri, pricing, sector){

    let numb = loc_juri.length

    let all_vals = ddata
                    .map(d => d.data)
                    .flat()
                    .filter(d => d !== null)
    
    let cur_max = Math.max(...all_vals)

    Highcharts.chart('viz', {
        chart: {
            type: 'bar',
            marginBottom: 100,
            marginLeft: 150,
            panning: true,
            style: {
                fontFamily: "Calibre Web Regular",
            }
        },
        colors: ['#04273C', '#88C4F4', '#50B161'],
        title: {
            text: ''
        },
        xAxis: {
            categories: loc_juri,
            title: {
                text: null
            },
            min: 0,
            max: numb >= 6 ? 5 : numb-1,
            scrollbar: {
                enabled: true,
                barBorderRadius: 5,
                barBorderWidth: 1,
                barBackgroundColor: '#c2e1fb',
                barBorderColor: '#c2e1fb',
                buttonBackgroundColor: '#fff',
                buttonBorderColor: '#fff',
                buttonArrowColor: '#fff',
                buttonBorderWidth: 0,
                height: 8,
                rifleColor: '#c2e1fb',
                trackBackgroundColor: "#fff",
                trackBorderColor: '#f8f8f8',
            },
            labels: {  
                style: {
                    fontSize:'16px'
                },
                formatter: function() { // http://jsfiddle.net/02rnjnkx/
                    if (typeof this.value !== 'number') {
                      return this.value;
                    }
                  }
              },
            events: { // http://jsfiddle.net/02rnjnkx/
                afterSetExtremes: function() {
                  var xAxis = this,
                    numberOfPoints = xAxis.series[0].xData.length,
                    minRangeValue = xAxis.getExtremes().min,
                    maxRangeValue = xAxis.getExtremes().max;
          
                  if (minRangeValue < 0) {
                    xAxis.setExtremes(null, xAxis.options.max);
                  } else if (maxRangeValue > numberOfPoints) {
                    xAxis.setExtremes(numberOfPoints - xAxis.options.max, numberOfPoints);
                  }
                }
              }
        },
        yAxis: {
            min: 0,
            max : cur_max + Math.max(1, Math.round(cur_max*0.10)),
            title: {
                text: null,
                align: 'high'
            },
            labels: {
                overflow: 'justify',
                format:  '${text}',
                style: {
                    fontSize:'16px'
                }
            },
            gridLineWidth : 0
        },
        tooltip: {
            valuePrefix: '$',
            useHTML: true,
            backgroundColor: '#fff',
            formatter: function() {
                /* 'The value for <b>' + this.x + '</b> is <b>' + this.y + '</b>, in series '+ this.series.name; */
                return "<div class = 'tool_head'>" + this.x + "</div>"+
                                        '<div class="grid-container"> \
                                        <div class="grid-item"> Carbon Price (2019$)</div>\
                                        <div class="grid-item" style = "max-width:' + width_c2 + '$' +  this.y  +  '</div>\
                                        <div class="grid-item"> Sector</div>\
                                        <div class="grid-item" style = "max-width:' + width_c2 + sector  + '</div>\
                                        <div class="grid-item"> Pricing instrument</div>\
                                        <div class="grid-item" style = "max-width:' + width_c2 +  (pricing === 'tax_rate_incl_ex_kusd' ? 'Carbon Tax' : 'Cap and Trade')  +'</div>\
                                        <div class="grid-last-item"> Product </div>\
                                        <div class="grid-last-item" style = "max-width:' + width_c2 +  this.series.name  + '</div>\
                                        </div>'
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: false
                }
            },
            series: {
                pointPadding: 0,
                /* groupPadding: 0, */
                borderWidth: 0,
                shadow: false
            },
            cropThreshold: 100000 //https://stackoverflow.com/questions/48308040/highcharts-highstock-scrollbar-issue
        },
        legend: {
            align: 'center',
            verticalAlign: 'bottom',
            x: 0,
            y: 0,
            floating: true,
            borderWidth: 0,
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
            shadow: false,
            itemStyle: {
                fontSize: '16px',
                fontFamily: 'Calibre Web Regular',
                fontWeight: 'normal'
            }
        },
        credits: {
            enabled: false
        },
        series: ddata
    });
}

function NoDataChart(){
    Highcharts.chart('viz', {
        chart: {
            type: 'bar',
            marginBottom: 100,
            marginLeft: 150
        },
        title: {
            text: 'No data for current selection of Pricing instrument, Sector, Year, and Juridictions'
        },
        credits: {
            enabled: false
        }
    });
}



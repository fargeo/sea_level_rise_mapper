
$(document).ready(function(){

    var tileSize;
    var markarr = [];
    var mposarr = [];
    var samparr = [];
    var loadLat,
        loadLng,
        loadZoom;
    var filtval,
        filtVal;

    $(".fa-info-circle").on('click', function() {
        $(".slrpill_container").toggleClass("slrpill_container_lower", 400)
        if ($("#infodiv").hasClass("infodiv") === true) {
            $("#infodiv").switchClass( "infodiv", "infodiv_lower", 400);
        } else {
            $("#infodiv").switchClass( "infodiv_lower", "infodiv", 400);
        }
        $("#scenario-definitions").fadeToggle(400)
    });


    for (i = new Date('2011').getFullYear(); i < 2151; i+=1) {
        $('#yearpicker').append($('<option />').val(i).html(i));
        }


    var dHash = window.location.hash.replace("#","").split("/");
        try{
            if (dHash.length==4){
                filtval = 1.0*dHash[3];
                filtVal = filtval;
                loadLat = dHash[0];
                loadLng = dHash[1];
                loadZoom = dHash[2];
                percentage = dHash[3];
            }
            else{
                filtval = 6.0;
                filtVal = 6.0;
                loadLat = 37.7833;
                loadLng = -122.3767;
                loadZoom = 14;
                percentage = 0.001;
            }

        }
        catch(err){
            filtval = 6.0;
            filtVal = 6.0;
            loadLat = 37.7833;
            loadLng = -122.3767;
            loadZoom = 14;
            percentage = 0.001;
        }
        $("#elevVal").html("<b>"+Math.round(filtVal*100)/100+" ft</b>")
        $("#inundated_area_value").html("<b>"+Math.round(percentage*100)/100+" mi<sup>2</sup></b>")
        $('#chart_control_input').val(Math.round(filtVal * 10) / 10)
        var XSARR;
        var dataXS;
        var XSoptions;
        var chartXS;

        function drawXS(addData) {

            XSARR = [["X","Elevation - NAVD88 Ft.","Y2"]];
            
            for (i = 0;i<addData.length;i++){
                XSARR.push([addData[i][0],addData[i][1],filtval]);
            }
            
            dataXS = google.visualization.arrayToDataTable(XSARR);
            
            XSoptions = {
                seriesType: "lines",
                series: {1: {type: "area",lineWidth:0,visibleInLegend:false}},
                colors: ["#F03", "#04A"],
                enableInteractivity: false,
                legend:{position:"top"},
                animation: {duration:300,easing:"out"},
                chartArea:{left:"5%",top:"15%",width:"90%",height:"75%"},
                hAxis:{
                format: "####",
                gridlines: {count:10}
                }
            };
            
            chartXS = new google.visualization.ComboChart(document.getElementById('xs_div'));
            chartXS.draw(dataXS, XSoptions);
            
            google.visualization.events.addListener(chartXS, 'click', function(e){xsClickPath(e)});
            
            function xsClickPath(e){
                var sXS = true
                clickPath(e,sXS);
            }
          }
          
        var chart;
        var data;
        var options;
        var slrscen;

        function flashElement(eid){
            $(eid).switchClass( "reg", "highlight", 500, function(){$(eid).switchClass( "highlight", "reg", 500)})
        }

        function calculateSeaLevelFromYear(year, scenario) {
            var seaLevel = scenario.A * (year*year) + scenario.B * year + scenario.C;
            return seaLevel; 
        }

        function clickPath(e, isXS){
            var nval = null;       
            var year = 2010;
            var scenario;   
            if (e != true){
                if (isXS==true){
                    nval = chartXS.getChartLayoutInterface().getVAxisValue(e.y)
                    if (nval<0){
                        nval = 0
                        }
                    }
                    else{
                        if (e.y != undefined) {
                            nval = chart.getChartLayoutInterface().getVAxisValue(e.y)
                        } else if (e.target.name === "yearpicker" || e.target.name === "scenario-radios") {
                            scenario = $('option[name=scenario-radios]:selected').val()
                            year = $('#yearpicker').val()
                            nval = calculateSeaLevelFromYear(year, slrscen[scenario])
                        }
                        if (nval === null) {
                            nval = e.currentTarget.value;
                        }
                        if (nval<0){
                            nval = 0
                        }
                    }   
                    $('#chart_control_input').val(Math.round(nval * 10) / 10)
                    filtval = nval;
            }
            
            for (i=0;i<datarr1.length-1;i++) {
                data.setValue(i,4, filtval);
            }

            if (dataXS != undefined){
                for (i=0;i<XSARR.length-1;i++) {
                    dataXS.setValue(i,2,filtval);
                }
            }   
            
            filtTiles(filtval);
                    
            chart.draw(data, options);
            if (chartXS != undefined){
                chartXS.draw(dataXS, XSoptions);
            }
                    
            predYears = {}
            predYears.LOW = Math.round(((-1*slrscen.LOW.B)+Math.sqrt((slrscen.LOW.B*slrscen.LOW.B)-4*slrscen.LOW.A*(slrscen.LOW.C-filtval)))/(2*slrscen.LOW.A));
            predYears.MID = Math.round(((-1*slrscen.MID.B)+Math.sqrt((slrscen.MID.B*slrscen.MID.B)-4*slrscen.MID.A*(slrscen.MID.C-filtval)))/(2*slrscen.MID.A));
            predYears.HIGH = Math.round(((-1*slrscen.HIGH.B)+Math.sqrt((slrscen.HIGH.B*slrscen.HIGH.B)-4*slrscen.HIGH.A*(slrscen.HIGH.C-filtval)))/(2*slrscen.HIGH.A));
            
            for (i in predYears){
            
                if (isNaN(predYears[i]) == true || predYears[i]<slrscen.INFO.MIN){
                    predYears[i] = "-"
                }
                else if (predYears[i]>slrscen.INFO.MAX){
                    predYears[i] = "2150+"
                }

            }
            
            $("#highscenario").html("<h4>" + predYears.HIGH + "</h4>");
            $("#midscenario").html("<h4>" + predYears.MID + "</h4>");
            $("#lowscenario").html("<h4>" + predYears.LOW + "</h4>");
            scenario = $('option[name=scenario-radios]:selected').val()
            if (predYears[scenario] === "2150+") {
                $('#yearpicker').val(slrscen.INFO.MAX)
            } else if (predYears[scenario] === "-") {
                $('#yearpicker').val(slrscen.INFO.MIN)
            } else {
                $('#yearpicker').val(predYears[scenario])
            }
            flashElement(".slrpills");

        }

        function drawChart() {
        
            datarr1 = [["YEAR","Low GG Scenario","Mid GG Scenario","High GG Scenario","Current Level"]];
            sty = 2010;

            $.getJSON("slr_coeff.json", function(dload){
                slrscen = dload;
                
                for(i=dload.INFO.MIN;i<dload.INFO.MAX+1;i++){
                    lowval = dload.LOW.A*(i*i)+dload.LOW.B*i+dload.LOW.C;
                    midval = dload.MID.A*(i*i)+dload.MID.B*i+dload.MID.C;
                    highval = dload.HIGH.A*(i*i)+dload.HIGH.B*i+dload.HIGH.C;
                    datarr1.push([i,lowval,midval,highval,filtVal]);
                }
                
                data = google.visualization.arrayToDataTable(datarr1);

                options = {
                    titleTextStyle: {fontSize: 14},
                    seriesType: "lines",
                    series: {3: {type: "area",lineWidth:0,visibleInLegend:false}},
                    colors: ["#888","#444", "#111", "#04A"],
                    enableInteractivity: false,
                    legend:{position:"top"},
                    animation: {duration:300,easing:"out"},
                    chartArea:{left:"5%",top:"15%",width:"90%",height:"75%"},
                    hAxis:{
                        format: "####",
                        gridlines: {count:10}
                    }
                };

                chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
                chart.draw(data, options);
                google.visualization.events.addListener(chart, 'click', function(e){clickPath(e)});
                $('#chart_control_input, #yearpicker, #scenario-radios').on('change', function(e) {
                    clickPath(e);
                });
            });
         }

        // var mbTiles = new L.tileLayer("http://tiles-archesapp.rhcloud.com/sf_ft/map/{z}/{x}/{y}.png", {
        //     tms: false,
        //     opacity: 1,
        //     zIndex: -999
        // });

        var mbTiles = new L.tileLayer("SF_FT/{z}/{x}/{y}.png", {
            tms: false,
            opacity: 1,
            zIndex: -999
        });



        var streetsLayer = L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            });

        var aerialLayer = L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            });        

        streetsLayer.setZIndex(-999);
        aerialLayer.setZIndex((-1000))
        layerarr = [streetsLayer, mbTiles, aerialLayer];

        
        var map = L.map('map_canvas',{
            layers: layerarr[0]
        }).setView([loadLat, loadLng], loadZoom);
        
        var tilarr = {"data":{},"display":{},"info":{}};
        var tiles = new L.TileLayer.Canvas({unloadInvisibleTiles:true, zIndex:10000});
        cLayer = 1;

        $("#baselayers").on("change", function(e){
            console.log(e.target.id)
        })

        var baseMaps = {
            "Streets": streetsLayer,
            "Aerial": aerialLayer
        };

        var overlayMaps = {
            "Elevation": mbTiles
        };
        L.control.layers(baseMaps, overlayMaps,  {position: 'topleft' }).addTo(map);

        tiles.on('tileunload', function(e){
            delete tilarr.display[""+e.tile._tilePoint.x+e.tile._tilePoint.y];
            delete tilarr.data[""+e.tile._tilePoint.x+e.tile._tilePoint.y];
            delete tilarr.info[""+e.tile._tilePoint.x+e.tile._tilePoint.y];
        });

        ctr = 0

        stct = 0;

        var polyline = L.polyline(mposarr, {color: 'red'});
        var xsCounter = 0;
        var qmark = L.marker();

        function qLoc(e){
            qmark.setLatLng(e.latlng);
            qmark.addTo(map);
            a = latLng2tile(e.latlng.lat,e.latlng.lng, map.getZoom());
            filtval = tilarr.data[a.tileCall][a.arrInd];
            filtTiles(filtval);
            $('#chart_control_input').val(Math.round(filtval * 10) / 10)
            clickPath(true);
            
        };
        map.on("moveend",function(){
            var hVal = "#"+""+map.getCenter().toString().replace("LatLng(","").replace(")","").replace(", ","/")+"/"+map.getZoom()+"/"+filtval+"/"+percentage;
            history.pushState(null,null,hVal);
        });
        map.on("mousemove", moveToolTip);
        map.on("mouseout",function(){$(".hovertip").hide()});
        var movecount = 0

        function moveToolTip(e){
            var elevation;
            if (movecount == 5){
                a = latLng2tile(e.latlng.lat,e.latlng.lng, map.getZoom());
                if (tilarr.data[a.tileCall] != undefined) {
                    elevation = Math.round(tilarr.data[a.tileCall][a.arrInd]*100)/100;
                    movecount = 0;
                    $(".hovertip").show();
                    $(".hovertip").html(elevation);
                    $(".hovertip").css("top",e.containerPoint.y-30);
                    $(".hovertip").css("left",e.containerPoint.x+20);
                }
            }
            movecount+=1

        }
        $("#closexs").hide();
        $(".xsdiv").on("click",XShandlerIn);
        $("#closexs").on("click", XShandlerOut);
        var clicks = 0;
        map.on("click", qLoc);
        
        function XShandlerIn(){
            map.removeLayer(qmark);
            map.off("click");
            $(this).switchClass( "small", "big", 500);
            $(this).html("<div id='xs_div'><p><i>Click on map to begin drawing Cross-section</i></p></div>");
            $(this).off("click");
            $("#closexs").show(500);
            clicks = 0;
            map.on("click", drawXSmarks);
        }
        function XShandlerOut(){
            $("#closexs").hide(500);
            map.off("click");
            mposarr.length = 0;
            map.removeLayer(polyline);
            for (i = 0; i<markarr.length;i++){
                map.removeLayer(markarr[i]);
            }
            
            markarr.length = 0;
            samparr.length = 0;
            $(".xsdiv").switchClass( "big", "small", 500);
            $(".xsdiv").html("<button class='btn'>Draw XS</button>");
            $(".xsdiv").on("click",XShandlerIn);
            map.on("click", qLoc);
        }
        var sampIters;
        var sampInter = 20;
        var dist;

        function drawXSmarks(e){
            $("#xs_div").html("");
            markarr.push(L.marker(e.latlng));
            markarr[markarr.length-1].addTo(map)
            if (markarr.length>1){
                dist = markarr[markarr.length-2].getLatLng().distanceTo(e.latlng)   ;
                sampIters = 75;
                console.log(dist);
                for (i=0;i<sampIters+1;i++){
                    latI = ((e.latlng.lat-mposarr[mposarr.length-1].lat)/sampIters)*i+mposarr[mposarr.length-1].lat;
                    lngI = ((e.latlng.lng-mposarr[mposarr.length-1].lng)/sampIters)*i+mposarr[mposarr.length-1].lng;
                    a = latLng2tile(latI,lngI, map.getZoom());
                    try{
                        samparr.push([xsCounter,tilarr.data[a.tileCall][a.arrInd],filtval]);
                    }
                    catch(err){
                        samparr.push([xsCounter,0.0,filtval]);
                    }
                    xsCounter+=(dist/20)*3.2808;
                }
            }
            
            
            if (clicks>0){
                drawXS(samparr)
            }
            
            clicks+=1
            mposarr.push(e.latlng);
            polyline.setLatLngs(mposarr);
            polyline.addTo(map);
        };
        
        tiles.drawTile = function (canvas, tile, zoom) {
            
            z = map.getZoom();
            var context = canvas.getContext('2d');
            var dataCanvas = canvas.getContext('2d');

            tileSize = this.options.tileSize;
            displayData = context.createImageData(tileSize,tileSize);

            var imageObj = new Image();
        
            imageObj.onload = function() {
                dataCanvas.drawImage(imageObj, 0, 0)
                ctr+=1
                var imageData = dataCanvas.getImageData(0, 0, tileSize, tileSize);
                var dataArray = new Float32Array(65536);
                pos = 0;
                for (y = 0; y < tileSize; y++) {
                    for (x = 0; x < tileSize; x++) {
                        tDataVal = Math.round(10*475.83*((imageData.data[pos]*(255*255)+imageData.data[pos+1]*255+imageData.data[pos+2])/16777216))/10;
                        dataArray[pos/4] = (tDataVal);
                        if (tDataVal > filtval){
                            pval = 0
                        }
                        else{
                            pval = 175;
                        }
                        
                        displayData.data[pos++] = Math.max(0,Math.min(255, 0));
                        displayData.data[pos++] = Math.max(0,Math.min(255, 50))
                        displayData.data[pos++] = Math.max(0,Math.min(255, 180));
                        displayData.data[pos++] = Math.max(0,Math.min(255, pval));
                        
                        }
                }
                
                tilarr.display[""+tile.x+tile.y] = context;
                tilarr.data[""+tile.x+tile.y] = dataArray;
                tilarr.info[""+tile.x+tile.y] = {"row":tile.x,"col":tile.y}
                context.putImageData(displayData,0,0);
            }
            
            imageObj.src = "SF_FT/"+z+"/"+tile.x+"/"+tile.y+".png"
            
        }
        
        $("#animbutton").on("mousedown", function(){
            animator()
        });

        $(".print").on("click", function(){
            if (window.print) {
                window.print()
            }
        });

        function showBasemapSelectorPanel(){
            $("#inundation-by-year").fadeToggle(400);
        };
        
        function animator(){
            anim = window.setInterval(function(){
                if (filtval>475){
                    window.clearInterval(anim)
                }
            filtval+=0.5;
            filtTiles(filtval);
            }, 10);
            $("#animbutton").on("mouseup", function(){
                window.clearInterval(anim)
                filtTiles(filtval);
                clickPath(true);
            });
        }

        function filtTiles(filtVal){
            var hVal;
            var pixelCount = 0;
            var inundationPixelCount = 0;
            var dryPixelCount = 0;
            var inundationThreshold = 4;
            var totalc = 0
            var percentage;
            $.each(tilarr.display, function(i){
                idata1 = tilarr.display[i].getImageData(0,0,tileSize,tileSize);
                pos = 0;
                for (y = 0; y < tileSize; y++) {
                    for (x = 0; x < tileSize; x++) {
                        totalc += 1
                        tcalc = tilarr.data[i][pos/4];
                        if (tcalc > filtVal){
                            pval = 0;
                            dryPixelCount += 1;
                        }
                        else{
                            pval = 175;
                            if (tcalc > inundationThreshold && tcalc <= filtVal) {
                                inundationPixelCount += 1;
                            }
                        }
                        idata1.data[pos++] = Math.max(0,Math.min(255, 0));
                        idata1.data[pos++] = Math.max(0,Math.min(255, 50))
                        idata1.data[pos++] = Math.max(0,Math.min(255, 180));
                        idata1.data[pos++] = Math.max(0,Math.min(255, pval));
                    }
                }
            
                try{
                    tilarr.display[i].putImageData(idata1,0,0)
                }
                catch(err){
                }
                $("#elevVal").html("<b>" + Math.round(filtval*100)/100 + " ft.</b>").fadeIn();

            });
        percentage = (inundationPixelCount / (dryPixelCount+inundationPixelCount)) * 100
        $("#inundated_area_value").html("<b>" + Math.round(percentage * 13.563)/100 + " mi<sup>2</sup></b>").fadeIn()
        hVal = "#"+""+map.getCenter().toString().replace("LatLng(","").replace(")","").replace(", ","/")+"/"+map.getZoom()+"/"+filtVal+"/"+percentage;
        history.pushState(null,null,hVal);
        }

        tiles.addTo(map);
        drawChart(); 

 });

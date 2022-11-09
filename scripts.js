function loaddata(){    
	   // add height width and initial number of towns
        var w = 900;
		var h = 700;
		var ntown = 25;
        
		
		var projection = d3.geoAlbers().center([0, 65]).rotate([4.4, 0]).parallels([50, 50]).scale(5000).translate([w/2, h/2]);
        var path = d3.geoPath().projection(projection);

		// for svg map
		var svg = d3.select("div#map")
					.append("svg")
					.attr("width", w)
					.attr("height", h);

		// tooltip
		var tooltip = d3.select("body")
						.append("div")
						.attr("class", "tooltip");

		// zooming and pan control
		var zooming = function(d) {
			var off_set = [d3.event.transform.x, d3.event.transform.y];
			var nscale = d3.event.transform.k * 9000;

			//update existing positions
			projection.translate(off_set)
				      .scale(nscale);

			svg.selectAll("path").attr("d", path);

			svg.selectAll("circle")
			   .attr("cx", function(d) { return projection([d.lng, d.lat])[0]; })
			   .attr("cy", function(d) { return projection([d.lng, d.lat])[1]; })
			   .attr("r", function(d) { return d.Population / 10000; });
		}

		var zoom = d3.zoom()
					 .scaleExtent([0.2, 4.0])
					 .translateExtent([[-5000, -5000], [5000, 5000]])
					 .on("zoom", zooming);

		
		var center = projection([-10, 50]);

		
		var map = svg.append("g")
				     .attr("id", "map")
					 .call(zoom)
					 .call(zoom.transform, d3.zoomIdentity
					 .translate(w / 2, h / 2)
					 .scale(0.25)
					 .translate(-center[0], -center[1]));

		//create rectangular background for map
		map.append("rect")
		   .attr("x", 0)
		   .attr("y", 0)
		   .attr("width", w)
		   .attr("height", h)
		   .attr("fill", "light grey");

		//Load in GeoJSON map data
		d3.json("output.json", function(json) {
			map.selectAll("path")
			   .data(json.features)
			   .enter()
			   .append("path")
			   .attr("class", function(d) {
				   var value = d.properties.FID;
				   return "FID" + value
			   })
			   .attr("d", path);
            
			// add country names and border    
            // map.append("path")
            //    .datum(topojson.mesh(uk, uk.objects.subunits, function(a, b) { return a !== b && a.id !== "IRL"; }))
            //    .attr("d", path)
            //    .attr("class", "subunit-boundary");

            // map.append("path")
            //    .datum(topojson.mesh(uk, uk.objects.subunits, function(a, b) { return a === b && a.id === "IRL"; }))
            //    .attr("d", path)
            //    .attr("class", "subunit-boundary IRL");

            // map.selectAll(".subunit-label")
            //    .data(topojson.feature(uk, uk.objects.subunits).features)
            //  .enter().append("text")
            //    .attr("class", function(d) { return "subunit-label " + d.id; })
            //    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
            //    .attr("dy", ".35em")
            //    .text(function(d) { return d.properties.name; });

			//Load in towns data and plot them on map
			
			d3.json("http://34.78.46.186/Circles/Towns/" + ntown, function(towns) {
				map.selectAll("circle")
				   .data(towns)
				   .enter()
				   .append("circle")
				   .attr("cx", function(d) { return projection([d.lng, d.lat])[0]; })
				   .attr("cy", function(d) { return projection([d.lng, d.lat])[1]; })
				   .attr("r", function(d) { return d.Population / 10000; })
				   .attr("class", "circle")
				   .on("mouseover", mouseover)
				   .on("mousemove", mousemove)
				   .on("mouseleave", mouseleave)

			
				   d3.select("#reload")
				    		  .on("click", function() {
								  d3.json("http://34.78.46.186/Circles/Towns/" + ntown, function(towns) {
									 svg.selectAll("circle")
									  .data(towns)
									  .transition().duration(1000)
									  .ease(d3.easeBounce)
									  .attr("cx", function(d) { return projection([d.lng, d.lat])[0]; })
									  .attr("cy", function(d) { return projection([d.lng, d.lat])[1]; })
									  .attr("r", function(d) { return d.Population / 10000; })
									  .attr("class", "circle");
								   
							   //    map.selectAll(".place-label")
							   // 	   .data(towns)
							   // 	   .enter().append("text")
							   // 	   .attr("class", "place-label")
							   // 	//    .attr("transform", function(d) { return "translate(" + projection([d.lng, d.lat]) + ")"; })
							   // 	//    .attr("dy", ".35em")
							   // 	   .text(function(d) { return d.Town; });
								   
								  })
								  
						    })
			 
				// add location names on map
				// // map.selectAll(".place-label")
				// 	.data(towns)
			  	// 	.enter().append("text")
				// 	.attr("x", function(d) { return projection([d.lng, d.lat])[0]; })
				// 	.attr("y", function(d) { return projection([d.lng, d.lat])[1]; })
				// 	.attr("class", "place-label")
				//     // .attr("transform", function(d) { return "translate(" + projection([d.lng, d.lat]) + ")"; })
				//     .attr("dy", ".35em")
				// 	.text(function(d) { return d.Town; });
				});
			

			//  tooltip functionality
			var mouseover = function(d) { tooltip.style("opacity", 1) };
			var mousemove = function(d) {
            	tooltip.html("<b>Town:</b> " + d.Town + "<br>" + "<b>County:</b> " + d.County + "<br>" + "<b>Population:</b> " + d.Population + "<br>" + "<b>Longitude:</b> " + d.lng + "<br>" + "<b>Latitude:</b> " + d.lat)
					   .style("left", (d3.mouse(this)[0] + 100) + "px")
					   .style("top", (d3.mouse(this)[1]) + "px")
			};
			var mouseleave = function(d) { tooltip.style("opacity", 0) };

			
		});
		
		// display value for slider	
		
			var rangeslider = document.getElementById("sliderRange");
			var output = document.getElementById("value");
			let update = () => output.innerHTML = rangeslider.value;
            rangeslider.addEventListener('input', update);
            update();
		// };

}	

window.onload = loaddata;
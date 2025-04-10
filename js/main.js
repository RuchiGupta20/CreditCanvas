// Set up the SVG canvas dimensions
const width = 960, height = 600;
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Use Albers USA projection (great for fitting all states neatly)
const projection = d3.geoAlbersUsa()
  .scale(1000)
  .translate([width / 2, height / 2]);

// D3 geoPath uses the projection to convert GeoJSON data into SVG paths
const path = d3.geoPath().projection(projection);

// Tooltip that floats near the mouse on hover
const tooltip = d3.select(".tooltip");

// Load both the US state boundaries (TopoJSON) and the financial data (CSV)
Promise.all([
  d3.json("assets/us-states.json"),
  d3.csv("data/Combined_State_Financial_Profile.csv")
]).then(([us, data]) => {

  // ---------------------------------------------------------------------
  // Data Structure: HashMap to map each state name to its financial data
  //
  // This object lets us instantly look up data by state name. It's useful
  // when coloring the map and when showing tooltips with specific info.
  // ---------------------------------------------------------------------
  const stateFinancialDataMap = {};
  const ficoScores = []; // we'll use this to compute the FICO color range

  data.forEach(d => {
    const state = d.State;
    const fico = +d["Avg FICO Score"];
    const debt = +d["Avg Credit Card Debt"];
    const income = +d["Avg Income 2021"];
    const ratio = +d["Credit Card Debt to Income Ratio"];

    // Each state is associated with an object containing all its data
    stateFinancialDataMap[state] = {
      fico: fico,
      debt: debt,
      income: income,
      ratio: ratio
    };

    ficoScores.push(fico);
  });

  // ---------------------------------------------------------------------
  // Color Scale: Maps FICO scores to a gradient from red to green
  //
  // Lower scores will be reddish, average scores yellowish, and
  // higher scores green, helping users visually compare states.
  // ---------------------------------------------------------------------
  const ficoMin = d3.min(ficoScores);
  const ficoMax = d3.max(ficoScores);

  const colorScale = d3.scaleLinear()
    .domain([ficoMin, (ficoMin + ficoMax) / 2, ficoMax])
    .range(["#d73027", "#fee08b", "#1a9850"]);

  // Convert TopoJSON to GeoJSON for D3 rendering
  const states = topojson.feature(us, us.objects.states).features;

  // ---------------------------------------------------------------------
  // Draw state shapes and apply fill colors based on FICO score
  // ---------------------------------------------------------------------
  svg.selectAll("path")
    .data(states)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", d => {
      const stateName = d.properties.name;
      const val = stateFinancialDataMap[stateName];
      return val ? colorScale(val.fico) : "#ccc"; // gray fallback if data missing
    })
    .attr("stroke", "#fff")
    .on("mouseover", (event, d) => {
      const stateName = d.properties.name;
      const val = stateFinancialDataMap[stateName];

      if (val) {
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`
          <strong>${stateName}</strong><br/>
          FICO Score: ${val.fico}<br/>
          Income: $${Number(val.income).toLocaleString()}<br/>
          Credit Card Debt: $${Number(val.debt).toLocaleString()}<br/>
          Debt-to-Income Ratio: ${val.ratio}
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      }
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // ---------------------------------------------------------------------
  // Add a visual legend to show what the FICO score gradient means
  // ---------------------------------------------------------------------
  const legendWidth = 300, legendHeight = 10;
  const legendSvg = svg.append("g")
    .attr("transform", `translate(${width - legendWidth - 40},${height - 50})`);

  const legendGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "fico-gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%");

  legendGradient.append("stop").attr("offset", "0%").attr("stop-color", "#d73027");
  legendGradient.append("stop").attr("offset", "50%").attr("stop-color", "#fee08b");
  legendGradient.append("stop").attr("offset", "100%").attr("stop-color", "#1a9850");

  legendSvg.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#fico-gradient)");

  const legendScale = d3.scaleLinear()
    .domain([ficoMin, ficoMax])
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
    .ticks(5)
    .tickFormat(d3.format(".0f"));

  legendSvg.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis);

  legendSvg.append("text")
    .attr("x", legendWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text("FICO Score Gradient");

}).catch(error => console.error("Error loading files:", error));

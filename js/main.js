// ---------------------------
// US FINANCIAL MAP SECTION
// ---------------------------

const width = 960, height = 600;
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const projection = d3.geoAlbersUsa()
  .scale(1000)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);
const tooltip = d3.select(".tooltip");

Promise.all([
  d3.json("assets/us-states.json"),
  d3.csv("data/Combined_State_Financial_Profile.csv")
]).then(([us, data]) => {
  const stateFinancialDataMap = {};
  const ficoScores = [];

  data.forEach(d => {
    const state = d.State;
    const fico = +d["Avg FICO Score"];
    const debt = +d["Avg Credit Card Debt"];
    const income = +d["Avg Income 2021"];
    const ratio = +d["Credit Card Debt to Income Ratio"];
    stateFinancialDataMap[state] = { fico, debt, income, ratio };
    ficoScores.push(fico);
  });

  const ficoMin = d3.min(ficoScores);
  const ficoMax = d3.max(ficoScores);
  const colorScale = d3.scaleLinear()
    .domain([ficoMin, (ficoMin + ficoMax) / 2, ficoMax])
    .range(["#d73027", "#fee08b", "#1a9850"]);

  const states = topojson.feature(us, us.objects.states).features;

  svg.selectAll("path")
    .data(states)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", d => {
      const val = stateFinancialDataMap[d.properties.name];
      return val ? colorScale(val.fico) : "#ccc";
    })
    .attr("stroke", "#fff")
    .on("mouseover", (event, d) => {
      const val = stateFinancialDataMap[d.properties.name];
      if (val) {
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`
          <strong>${d.properties.name}</strong><br/>
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

// ---------------------------
// LOAN APPROVAL PREDICTOR
// ---------------------------

document.getElementById("loan-form").addEventListener("submit", function(event) {
  event.preventDefault();

  const input = {
    Age: +document.getElementById("age").value,
    Dependents: +document.getElementById("dependents").value,
    Annual_Income: +document.getElementById("income").value,
    Credit_Score: +document.getElementById("credit").value,
    Total_Existing_Loan_Amount: +document.getElementById("loan_total").value,
    Outstanding_Debt: +document.getElementById("debt").value,
    Marital_Status: document.getElementById("marital").value,
    Education: document.getElementById("education").value,
    Residential_Status: document.getElementById("residence").value
  };

  // Simulated score — replace this with model/API call later

  fetch("http://localhost:5000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  })
  .then(response => response.json())
  .then(data => {
    const score = data.probability;
    updateGauge(score);
  })
  .catch(error => {
    console.error("Prediction error:", error);
  });
  
});

// Speedometer-style gauge with pointer and labeled regions
function updateGauge(score) {
  const gauge = d3.select("#gauge-container");
  gauge.selectAll("*").remove();

  const width = 500;
  const height = 150;
  const centerX = width / 2;
  const centerY = height * 0.9;
  const outerRadius = 130;
  const innerRadius = 90;

  const svg = gauge.append("svg")
    .attr("width", width)
    .attr("height", height);

  const segments = [
    {
      label: "Poor",
      color: "#d73027",
      range: [0, 0.25],
      tip: "Loan approval probability is poor. Consider reducing outstanding debt or improving your credit score."
    },
    {
      label: "Fair",
      color: "#fee08b",
      range: [0.25, 0.5],
      tip: "Loan approval probability is fair. Paying off credit card debt can help improve your chances."
    },
    {
      label: "Good",
      color: "#91cf60",
      range: [0.5, 0.75],
      tip: "Loan approval probability is good. Maintain your financial profile to keep improving."
    },
    {
      label: "Excellent",
      color: "#1a9850",
      range: [0.75, 1.0],
      tip: "Loan approval probability is excellent. Great job keeping a strong credit history!"
    }
  ];
    
  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(d => Math.PI * d.range[0])
    .endAngle(d => Math.PI * d.range[1]);

  const arcGroup = svg.append("g")
    .attr("transform", `translate(${centerX},${centerY}) rotate(-90)`);

  const tooltip = d3.select("#gauge-tooltip");

  arcGroup.selectAll("path")
    .data(segments)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => d.color)
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.label}</strong><br/>${d.tip}`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  const pointerAngle = Math.PI * score;
  const pointerLength = outerRadius + 15;

  const pointer = [
    { x: 0, y: 0 },
    {
      x: pointerLength * Math.cos(pointerAngle - Math.PI / 2),
      y: pointerLength * Math.sin(pointerAngle - Math.PI / 2)
    }
  ];

  const pointerLine = d3.line()
    .x(d => d.x)
    .y(d => d.y);

  svg.append("g")
    .attr("transform", `translate(${centerX},${centerY}) rotate(-90)`)
    .append("path")
    .datum(pointer)
    .attr("d", pointerLine)
    .attr("stroke", "#000")
    .attr("stroke-width", 4);

  svg.append("circle")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", 6)
    .attr("fill", "#000");

  svg.append("text")
    .attr("x", centerX)
    .attr("y", height + 10)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .text(`Approval Probability: ${(score * 100).toFixed(1)}%`);
}

// Show a default 50% gauge on load
document.addEventListener("DOMContentLoaded", function () {
  updateGauge(0.5);
});

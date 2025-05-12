// EVENT LISTENER FOR CREDIT PREDICTION, WHICH IS WHY IT IS AT THE TOP OF THE FILE, OUTSIDE OF FUNCTIONS
// On change, if loan is "Yes", user can edit the existing-loans field
// Else, it gets grayed out again, and the user can't edit it
// This is a way of automating bounds checking for loan input


document.addEventListener("DOMContentLoaded", () => {
  const loanSel  = document.getElementById("c-loan-history");
  const loansBox = document.getElementById("c-existing-loans");

  function toggleExistingLoans() {
    const hasLoan = loanSel.value === "Yes";
    loansBox.disabled = !hasLoan;
    loansBox.required =  hasLoan;
    loansBox.value    =  hasLoan ? "" : 0;
  }
  toggleExistingLoans();                 // initial state
  loanSel.addEventListener("change", toggleExistingLoans);
});

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

  // Get input values
  const age = +document.getElementById("age").value;
  const dependents = +document.getElementById("dependents").value;
  const income = +document.getElementById("income").value;
  const loanTotal = +document.getElementById("loan_total").value;
  const debt = +document.getElementById("debt").value;

  // Create or get error message element
  let errorMsg = document.getElementById("form-error");
  if (!errorMsg) {
    errorMsg = document.createElement("div");
    errorMsg.id = "form-error";
    errorMsg.style.color = "#d73027";
    errorMsg.style.marginTop = "10px";
    errorMsg.style.textAlign = "center";
    document.getElementById("loan-form").appendChild(errorMsg);
  }

  // Validate non-negative values
  if (age < 0) {
    errorMsg.textContent = "Age cannot be negative";
    return;
  }
  if (dependents < 0) {
    errorMsg.textContent = "Number of dependents cannot be negative";
    return;
  }
  if (income < 0) {
    errorMsg.textContent = "Annual income cannot be negative";
    return;
  }
  if (loanTotal < 0) {
    errorMsg.textContent = "Total existing loan amount cannot be negative";
    return;
  }
  if (debt < 0) {
    errorMsg.textContent = "Outstanding debt cannot be negative";
    return;
  }

  // Clear any previous error message
  errorMsg.textContent = "";

  // Get credit score range and calculate average
  const creditScoreRange = document.getElementById("credit").value;
  const [minScore, maxScore] = creditScoreRange.split("-").map(Number);
  const averageCreditScore = Math.round((minScore + maxScore) / 2);

  const input = {
    Age: age,
    Dependents: dependents,
    Annual_Income: income,
    Credit_Score: averageCreditScore,
    Total_Existing_Loan_Amount: loanTotal,
    Outstanding_Debt: debt,
    Marital_Status: document.getElementById("marital").value,
    Education: document.getElementById("education").value,
    Residential_Status: document.getElementById("residence").value
  };

  fetch("https://creditcanvas.onrender.com/scatter-sample", {
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

  const width = window.screen.width || 1000;
  const height = 550;
  const centerX = width / 2;
  const centerY = height * 0.92;
  const outerRadius = 380;
  const innerRadius = 330;

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


// --------------------------

// CREDIT APPROVAL

// --------------------------



document.getElementById("credit-form").addEventListener("submit", e => {
  e.preventDefault();

  const $ = id => document.getElementById(id);
  const errBox = $("c-form-error");
  errBox.textContent = "";

  // helper to validate non-neg numeric inputs
  function pos(val, label) {
    if (val < 0 || isNaN(val)) {
      errBox.textContent = `${label} cannot be negative`;
      throw new Error(label);
    }
    return val;
  }

  try {
    // Updates value of the two dynamic fields into the payload
    const hasLoan = document.getElementById("c-loan-history").value;
    const loanFlag = hasLoan === "Yes" ? 1 : 0;

    const existingLoans = hasLoan === "Yes" ? pos(+document.getElementById("c-existing-loans").value, "Existing loans") : 0;
    const payload = {
      Age: pos(+$("c-age").value, "Age"),
      Dependents: pos(+$("c-dependents").value, "Dependents"),
      Marital_Status: $("c-marital").value,
      Employment_Status: $("c-employment").value,
      Residential_Status: $("c-residence").value,
      Annual_Income: pos(+$("c-income").value, "Annual income"),
      Monthly_Expenses: pos(+$("c-expenses").value, "Monthly expenses"),
      Existing_Loans: pos(existingLoans, "Number of loans "),
      Total_Existing_Loan_Amount: pos(+$("c-loan-total").value, "Loan amount"),
      Outstanding_Debt: pos(+$("c-debt").value, "Outstanding debt"),
      Bank_Account_History: pos(+$("c-bank-history").value, "Bank history"),
      Loan_History: loanFlag
    };

    // make sure dropdowns are selected
    if (
      !payload.Marital_Status ||
      !payload.Employment_Status ||
      !payload.Residential_Status
    ) {
      errBox.textContent = "Please choose all dropdown options";
      return;
    }

    // POST to the credit prediction endpoint
    fetch("https://creditcanvas.onrender.com/credit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(d => {
        // Score is returned
        const rawScore = d.score;
        // Calculate angle of needle of credit wheel in radians                
        const t = Math.min(1, Math.max(0, (rawScore - 300) / 550));
        updateCreditGauge(t, rawScore)})
      .catch(() => (errBox.textContent = "Server error – request was not processed. Please try again."));
  } catch {
    /* error already displayed */
  }
});

// Gauge is identical to the loan predictor, reusing tooltip & colors
// However, instead of just the angle, the raw score is also included as a parameter
function updateCreditGauge(t, score) {
  const container = d3.select("#credit-gauge-container");
  container.selectAll("*").remove();

    const W = window.screen.width || 1000;
    H = 550,
    CX = W / 2,
    CY = H * 0.92,
    R = 380,
    r = 330;

  // Wheel is divided into the following four segments, based on angle, label, color, and tip
  // On hover over the segment, the tip will show
  const segs = [
    { label: "Poor", color: "#d73027", range: [0, 0.5], tip: "Your credit score is significantly below average. Consider getting a secured or beginner credit card to build your credit." },
    { label: "Fair", color: "#fee08b", range: [0.5, 0.67], tip: "Your credit score is slightly below average. Keep paying your credit card and loans on time." },
    { label: "Good", color: "#91cf60", range: [0.67, 0.8], tip: "Your credit score is at or slightly above average. This unlocks new opportunities to take out a loan at a good rate or get a better credit card, but also keep building your credit."},
    { label: "Excellent", color: "#1a9850", range: [0.8, 1.0], tip: "Your credit is score is well above average. You will likely get approved for any credit card and loans at the best interest rates."}
  ];

  const svg = container.append("svg").attr("width", W).attr("height", H);
  const arc = d3.arc()
    .innerRadius(r)
    .outerRadius(R)
    .startAngle(d => Math.PI * d.range[0])
    .endAngle(d => Math.PI * d.range[1]);

  const gArc = svg
    .append("g")
    .attr("transform", `translate(${CX},${CY}) rotate(-90)`);

  const tooltip = d3.select("#credit-gauge-tooltip");

  // Add segments and animations for labels
  gArc
    .selectAll("path")
    .data(segs)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => d.color)
    .on("mouseover", (ev, d) => {
      tooltip.style("opacity", 1)
        .html(`<strong>${d.label}</strong><br/>${d.tip}`)
        .style("left", ev.pageX + 10 + "px")
        .style("top", ev.pageY - 20 + "px");
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));

  // Calculate the location of the pointer using the angle in radians
  const angle = Math.PI * t,
    L = R + 15;
  const pointer = [
    [0, 0],
    [L * Math.cos(angle - Math.PI / 2), L * Math.sin(angle - Math.PI / 2)]
  ];

  svg
    .append("g")
    .attr("transform", `translate(${CX},${CY}) rotate(-90)`)
    .append("path")
    .attr("d", d3.line()(pointer))
    .attr("stroke", "#000")
    .attr("stroke-width", 4);

  svg.append("circle").attr("cx", CX).attr("cy", CY).attr("r", 6).attr("fill", "#000");

  // Adds textual credit score to the visualization for easy interpretation
  lbl = ""
  if (score !== null){
    if (score >= 740){
      lbl = "Excellent"
    } else if (score >= 670) {
      lbl = "Good"
    } else if (score >= 580) {
      lbl = "Fair"
    } else {
      lbl = "Poor"
    }
  }
  svg
    .append("text")
    .attr("x", CX)
    .attr("y", H + 10)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .text(`Predicted Credit Score: ${lbl}`);
}

// Show default gauge on load
document.addEventListener("DOMContentLoaded", () => updateCreditGauge(0.5, null));


// ---------------------------
// SCATTERPLOT: initial structure with axes + labels + legend
// ---------------------------

const scatterWidth = 1000;
const scatterHeight = 600;
const scatterMargin = 60;

// Create SVG container
const scatterSvg = d3.select("#scatterplot")
  .append("svg")
  .attr("width", scatterWidth)
  .attr("height", scatterHeight);

// Scales with default domain — just placeholder values
const scatterX = d3.scaleLinear()
  .domain([500, 850]) // estimated credit score range
  .range([scatterMargin, scatterWidth - scatterMargin]);

const scatterY = d3.scaleLinear()
  .domain([20000, 120000]) // estimated income range
  .range([scatterHeight - scatterMargin, scatterMargin]);

// Add X axis
scatterSvg.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${scatterHeight - scatterMargin})`)
  .call(d3.axisBottom(scatterX).tickFormat(d3.format("d")))
  .selectAll("text")
  .style("font-weight", "bold");

scatterSvg.select(".x-axis path")
  .style("stroke-width", 2);

scatterSvg.selectAll(".x-axis line")
  .style("stroke-width", 2);

// X axis label
scatterSvg.append("text")
  .attr("x", scatterWidth / 2)
  .attr("y", scatterHeight - 25)
  .attr("text-anchor", "middle")
  .attr("font-size", "15px")
  .attr("font-weight", "bold")
  .text("Credit Score");

// Add Y axis
scatterSvg.append("g")
  .attr("class", "y-axis")
  .attr("transform", `translate(${scatterMargin}, 0)`)
  .call(d3.axisLeft(scatterY))
  .selectAll("text")
  .style("font-weight", "bold");

scatterSvg.select(".y-axis path")
  .style("stroke-width", 2);

scatterSvg.selectAll(".y-axis line")
  .style("stroke-width", 2);

// Y axis label
scatterSvg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -scatterHeight / 2)
  .attr("y", 10)
  .attr("text-anchor", "middle")
  .attr("font-size", "15px")
  .attr("font-weight", "bold")
  .text("Annual Income");

// Add legend
const legend = scatterSvg.append("g")
  .attr("transform", `translate(${scatterWidth - 900}, ${scatterMargin})`);

legend.append("circle")
  .attr("cx", -5).attr("cy", 0).attr("r", 12).attr("fill", "green");
legend.append("text")
  .attr("x", 12).attr("y", 4).text("Approved").attr("font-size", "15px");

legend.append("circle")
  .attr("cx", -5).attr("cy", 40).attr("r", 12).attr("fill", "red");
legend.append("text")
  .attr("x", 12).attr("y", 45).text("Rejected").attr("font-size", "15px");

// Tooltip div already exists (reuses .tooltip class)
const scatterTooltip = d3.select(".tooltip");

// Button click loads data points
document.getElementById("generate-btn").addEventListener("click", function () {
  d3.json("https://creditcanvas.onrender.com/predict").then(data => {
    // Recalculate axis domains based on data
    scatterX.domain(d3.extent(data, d => d.Credit_Score));
    scatterY.domain(d3.extent(data, d => d.Annual_Income));

    scatterSvg.select(".x-axis")
      .transition()
      .call(d3.axisBottom(scatterX).tickFormat(d3.format("d")));

    scatterSvg.select(".y-axis")
      .transition()
      .call(d3.axisLeft(scatterY));

    // Remove old points (if any)
    scatterSvg.selectAll("circle.data-point").remove();

    // Add new points
    scatterSvg.selectAll("circle.data-point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", d => scatterX(d.Credit_Score))
      .attr("cy", d => scatterY(d.Annual_Income))
      .attr("r", 12)
      .attr("fill", d => d.Loan_Approval_Status === 1 ? "green" : "red")
      .attr("opacity", 0.7)
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(100).attr("r", 10);
        scatterTooltip.transition().style("opacity", 1);
        scatterTooltip.html(`
          <strong>Credit Score:</strong> ${d.Credit_Score}<br/>
          <strong>Income:</strong> $${Number(d.Annual_Income).toLocaleString()}<br/>
          <strong>Status:</strong> ${d.Loan_Approval_Status === 1 ? "Approved" : "Rejected"}
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(100).attr("r", 6);
        scatterTooltip.transition().style("opacity", 0);
      });
  }).catch(err => {
    console.error("Error loading scatter data:", err);
  });
});



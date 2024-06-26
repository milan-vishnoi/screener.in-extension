const quarterswise = document.getElementById("quarters");
const yearwise = document.getElementById("profit-loss");
const balancesheet = document.getElementById("balance-sheet");
const cashflow = document.getElementById("cash-flow");

const { quarterRows, yearRows, balancesheetRows, cashflowRows } = getRows();

console.log("Quarter Rows:" + quarterRows.length);
console.log("yearwise Rows:" + yearRows.length);
console.log("balancesheet Rows:" + balancesheetRows.length);
console.log("cashflow Rows:" + cashflowRows.length);

quarterRows.forEach((row, index) => {
  //let growth = calculate(quarterswise,index);
  let growth = calculate(row, index);
  addColumn(row, index, growth);
});

function getRows() {
    const quarterRows = quarterswise.querySelectorAll("tr");
    const yearRows = yearwise.querySelectorAll(
        ".data-table.responsive-text-nowrap tr"
    );
    const balancesheetRows = balancesheet.querySelectorAll("tr");
    const cashflowRows = cashflow.querySelectorAll("tr");
    return { quarterRows, yearRows, balancesheetRows, cashflowRows };
}

// for(let i = 1; i <= 11; i++)
// {
//     let growth = calculate(quarterswise,i);
//     buildColumn(quarterswise,i, growth);
// }

function addColumn(row, index, value) {
  if (index == 0) {
    const newHeaderCell = document.createElement("th");
    newHeaderCell.innerText = "YoY Growth";
    row.appendChild(newHeaderCell);
  } else {
    const newDataCell = document.createElement("td");
    newDataCell.innerText = value.toPrecision(4) + "%";
    row.appendChild(newDataCell);
  }
}

console.log("extension run");

function buildColumn(section, i, growth) {
  if (i == 1) {
    let theadRow = section.querySelector("thead tr");
    let newHeaderCell = document.createElement("th");
    newHeaderCell.textContent = "YoY Growth";
    theadRow.appendChild(newHeaderCell);
  }

  let newRow = section.querySelector("tbody tr:nth-child(" + i + ")");
  let newDataCell = document.createElement("td");
  newDataCell.textContent = growth.toPrecision(4) + "%";
  newRow.appendChild(newDataCell);
}

// function calculate(section,i) {
//     console.log("Calculating Growth");
//     let latestQtrCell = section.querySelector('tr:nth-child(' + i + ') td:last-child').textContent.trim().replace(',', '');
//     let latestQtrRevenue = parseFloat(latestQtrCell);
//     console.log("Latest: ₹"+latestQtrRevenue);
//     let previousYearCell = section.querySelector('tr:nth-child(' + i + ') td:nth-last-child(5)').textContent.trim().replace(',', '');
//     let previouYearRevenue = parseFloat(previousYearCell);
//     console.log("Previous: ₹"+previouYearRevenue);
//     let growth = calculateGrowth(latestQtrRevenue, previouYearRevenue);
//     return growth;
// }

function calculate(row, index) {
  if (index === 0) {
    return;
  } else {
    console.log("Calculating Growth");
    let latestQtrCell = row
      .querySelector("td:nth-last-child(1)")
      .innerText.trim()
      .replace(",", "");
    let latestQtrRevenue = parseFloat(latestQtrCell);
    console.log("Latest: ₹" + latestQtrRevenue);
    let previousYearCell = row
      .querySelector("td:nth-last-child(5)")
      .innerText.trim()
      .replace(",", "");
    let previouYearRevenue = parseFloat(previousYearCell);
    console.log("Previous: ₹" + previouYearRevenue);
    let growth = calculateGrowth(latestQtrRevenue, previouYearRevenue);
    return growth;
  }
}

function calculateGrowth(latest, previous) {
  return ((latest - previous) / previous) * 100;
}

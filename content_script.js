const quarterswise = document.getElementById("quarters");
const yearwise = document.getElementById("profit-loss");
const balancesheet = document.getElementById("balance-sheet");
const cashflow = document.getElementById("cash-flow");

const { quarterRows, yearRows, balancesheetRows, cashflowRows } = getRows();

console.log("Quarter Rows:" + quarterRows.length);
console.log("yearwise Rows:" + yearRows.length);
console.log("balancesheet Rows:" + balancesheetRows.length);
console.log("cashflow Rows:" + cashflowRows.length);

const updateQuarterSection = (columnExist) => {
  if (columnExist) {
    const resultColumn = quarterswise
      .querySelectorAll("tr td:last-child,th:last-child")
      .forEach((item) => item.remove());
  }
  quarterRows.forEach((row, index) => {
    let growth = calculateGrowth(row, index, 1, 5);
    addColumn(row, index, growth);
  });
};

const updateYearSection = (columnExist) => {
  if (columnExist) {
    const resultColumn = yearwise
      .querySelectorAll("tr td:last-child,th:last-child")
      .forEach((item) => item.remove());
  }
  yearRows.forEach((row, index) => {
    let growth = calculateGrowth(row, index, 1, 2);
    addColumn(row, index, growth);
  });
};

const updateBalanceSheetSection = (columnExist) => {
  if (columnExist) {
    const resultColumn = balancesheet
      .querySelectorAll("tr td:last-child,th:last-child")
      .forEach((item) => item.remove());
  }
  balancesheetRows.forEach((row, index) => {
    let growth = calculateGrowth(row, index, 1, 2);
    addColumn(row, index, growth);
  });
};

const updateCashFlowSection = (columnExist) => {
  if (columnExist) {
    const resultColumn = cashflow
      .querySelectorAll("tr td:last-child,th:last-child")
      .forEach((item) => item.remove());
  }
  cashflowRows.forEach((row, index) => {
    let growth = calculateGrowth(row, index, 1, 2);
    addColumn(row, index, growth);
  });
};

updateQuarterSection(false);
updateYearSection(false);
updateBalanceSheetSection(false);
updateCashFlowSection(false);

quarterswise.addEventListener("click", () => updateQuarterSection(true));
yearwise.addEventListener("click", updateYearSection(true));
balancesheet.addEventListener("click", updateBalanceSheetSection(true));
cashflow.addEventListener("click", updateCashFlowSection(true));

function getRows() {
  const quarterRows = quarterswise.querySelectorAll("tr");
  const yearRows = yearwise.querySelectorAll(
    ".data-table.responsive-text-nowrap tr"
  );
  const balancesheetRows = balancesheet.querySelectorAll("tr");
  const cashflowRows = cashflow.querySelectorAll("tr");
  return { quarterRows, yearRows, balancesheetRows, cashflowRows };
}

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

function calculateGrowth(row, index, latestColumnNumber, previousColumnNumber) {
  if (index === 0) {
    return;
  } else {
    console.log("Calculating Growth");
    let latestCell = row
      .querySelector(`td:nth-last-child(${latestColumnNumber})`)
      .innerText.trim()
      .replace(",", "");
    let latestValue = parseFloat(latestCell);
    console.log("Latest: ₹" + latestValue);
    let previousCell = row
      .querySelector(`td:nth-last-child(${previousColumnNumber})`)
      .innerText.trim()
      .replace(",", "");
    let previousValue = parseFloat(previousCell);
    console.log("Previous: ₹" + previousValue);
    let growth = calculateChange(latestValue, previousValue);
    return growth;
  }
}

function calculateChange(latest, previous) {
  return ((latest - previous) / previous) * 100;
}

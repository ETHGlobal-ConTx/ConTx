function injectScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("dist/injectedScript.bundle.js");
  (document.head || document.documentElement).appendChild(script);
}

let txInfo = {};

// This function adds a new column before the first column in all rows of the table
function addColumnBeforeFirst() {
  // Select the first table on the page (modify this selector as needed for your use case)
  const table = document.querySelector("table");
  if (!table) return;

  // Add a header column if the table has a header row
  const header = table.querySelector("thead tr");
  if (header) {
    const headerColumn = document.createElement("th");
    header.insertBefore(headerColumn, header.firstChild); // Insert before the first column
  }

  // Add a cell to each row in the table body
  const rows = table.querySelectorAll("tbody tr");
  rows.forEach((row) => {
    const newCell = row.insertCell(0); // 0 index inserts at the beginning
    newCell.textContent = ">"; // Modify as needed
  });
}

// Run the function to modify the table
// addColumnBeforeFirst();

function addCollapsibleDivs() {
  // Select the table and its rows
  const table = document.querySelector("table"); // Adjust the selector as needed
  if (!table) return;

  const rows = table.querySelectorAll("tr");
  rows.forEach((row, index) => {
    // Skip the header row if needed
    if (index === 0) {
      return;
    }

    // Create a button to toggle the div visibility
    const toggleButton = document.createElement("div");
    toggleButton.style.margin = "5px";
    toggleButton.innerHTML = ">";
    // toggleButton.innerHTML = '<img src="images/right.svg" alt="Description">';
    // let img = document.createElement("img");
    // img.src = chrome.runtime.getURL("images/right.svg");
    // toggleButton.appendChild(img);

    // Insert the button in the first cell of the row
    const firstCell = row.cells[0];
    firstCell.insertBefore(toggleButton, firstCell.firstChild);

    // Create a collapsible div
    const collapsibleRow = document.createElement("tr");
    collapsibleRow.style.display = "none"; // Start collapsed
    const collapsibleCol = document.createElement("td");
    collapsibleCol.colSpan = 10;
    collapsibleCol.id = "collapsible-row-" + index; // Customize as needed
    collapsibleCol.classList.add("collapsible-row"); // Customize as needed
    // collapsibleCol.style.backgroundColor = "#f9f9f9"; // Styling example
    // collapsibleCol.style.border = "1px solid #ddd";
    // collapsibleCol.style.marginTop = "5px";
    // collapsibleCol.style.padding = "8px";
    collapsibleRow.appendChild(collapsibleCol);

    const wrapper = document.createElement("div");
    wrapper.style.padding = "24px";

    collapsibleCol.appendChild(wrapper);

    const headerRow = document.createElement("div");
    headerRow.style.display = "flex";
    headerRow.style.justifyContent = "space-between";
    headerRow.style.alignItems = "center";
    headerRow.style.marginBottom = "16px";
    wrapper.appendChild(headerRow);

    const title = document.createElement("b");
    title.textContent = "Transaction Details";
    title.style.fontSize = "14px";
    headerRow.appendChild(title);

    const content = document.createElement("div");
    content.style.display = "flex";
    content.style.justifyContent = "space-between";
    content.style.alignItems = "flex-start";
    wrapper.appendChild(content);

    const noteWrapper = document.createElement("div");
    noteWrapper.style.display = "flex";
    noteWrapper.style.flexDirection = "column";
    noteWrapper.style.padding = "12px";
    noteWrapper.style.border = "1px solid #ddd";
    noteWrapper.style.borderRadius = "4px";
    noteWrapper.style.width = "100%";
    content.appendChild(noteWrapper);

    const noteTitle = document.createElement("b");
    noteTitle.textContent = "Note";
    noteTitle.style.fontSize = "14px";
    noteWrapper.appendChild(noteTitle);

    const note = document.createElement("textarea");
    note.id = "note";
    note.style.width = "100%";
    note.style.height = "100px";
    note.style.border = "none";
    noteWrapper.appendChild(note);

    const infoWrapper = document.createElement("div");
    infoWrapper.style.display = "flex";
    infoWrapper.style.flexDirection = "column";
    infoWrapper.style.padding = "12px";
    infoWrapper.style.borderRadius = "4px";
    infoWrapper.style.width = "100%";
    content.appendChild(infoWrapper);

    const categoryRow = document.createElement("div");
    categoryRow.style.display = "flex";
    categoryRow.style.justifyContent = "space-between";
    categoryRow.style.alignItems = "center";

    const categoryLabel = document.createElement("label");
    categoryLabel.textContent = "Category";
    categoryLabel.htmlFor = "category";
    categoryLabel.style.minWidth = "200px";
    categoryRow.appendChild(categoryLabel);

    // Create a select element
    const categorySelect = document.createElement("select");
    categorySelect.id = "categorySelect"; // Set an ID for the select
    categorySelect.style.width = "100%";

    // Options to be added - you can customize this array
    const options = [
      "Donation",
      "Grant",
      "Payroll",
      "Purchase",
      "Rent",
      "Equality",
      "Investment",
      "Service fee",
      "Subscription fee",
      "Supplier fee",
      "Other",
    ];

    // Create and append the options
    for (const optionText of options) {
      const option = document.createElement("option");
      option.value = optionText;
      option.textContent = optionText;
      categorySelect.appendChild(option);
    }
    categoryRow.appendChild(categorySelect);

    infoWrapper.appendChild(categoryRow);

    // Insert the div after the row
    row.parentNode.insertBefore(collapsibleRow, row.nextSibling);

    const actionRow = document.createElement("div");
    actionRow.style.display = "flex";
    actionRow.style.justifyContent = "flex-end";
    actionRow.style.alignItems = "center";
    actionRow.style.marginTop = "16px";
    wrapper.appendChild(actionRow);

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.marginRight = "8px";
    cancelButton.style.padding = "8px 16px";
    cancelButton.style.border = "none";
    cancelButton.style.borderRadius = "4px";
    cancelButton.style.backgroundColor = "#ddd";
    cancelButton.style.cursor = "pointer";
    actionRow.appendChild(cancelButton);

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.style.padding = "8px 16px";
    saveButton.style.border = "none";
    saveButton.style.borderRadius = "4px";
    saveButton.style.backgroundColor = "#007bff";
    saveButton.style.color = "#fff";
    saveButton.style.cursor = "pointer";
    actionRow.appendChild(saveButton);

    // Event listener to toggle the visibility of the div
    toggleButton.addEventListener("click", function () {
      collapsibleRow.style.display =
        collapsibleRow.style.display === "none" ? "" : "none";
    });

    cancelButton.addEventListener("click", function () {
      collapsibleRow.style.display = "none";
    });

    saveButton.addEventListener("click", function () {
      saveButton.textContent = "Saving...";
      saveButton.disabled = true;
      const note = document.querySelector("#note").value;
      const category = document.querySelector("#categorySelect").value;
      const txHash = row.querySelector("td:nth-child(2)").textContent;
      const fromAdd = row.querySelector("td:nth-child(7)").textContent;
      const txType = row.querySelector("td:nth-child(8)").textContent;
      const toAdd = row.querySelector("td:nth-child(9)").textContent;
      fetch("https://dev.serve.giveth.io/ethglobal_hackathon/metadata", {
        method: "POST", // or 'GET', 'PUT', 'DELETE', etc.
        headers: {
          "Content-Type": "application/json",
          // Additional headers
        },
        body: JSON.stringify({
          txChain: "baseGoerli",
          category,
          txHash,
          description: note,
          sender: fromAdd,
        }), // body data type must match "Content-Type" header
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        })
        .catch((error) => console.error("Error:", error))
        .finally(() => {
          saveButton.disabled = false;
          saveButton.textContent = "Save";
          collapsibleRow.style.display = "none";
        });
    });
  });
}

// Run the function to modify the table

// function addDivToTransactions() {
//   // Select all the transaction rows
//   var transactionRows = document.querySelectorAll("tbody>tr");

//   transactionRows.forEach(function (row) {
//     const cols = row.querySelectorAll("&>td");
//     console.log("cols", cols);
//     const txHash = cols[1].textContent;
//     const fromAdd = cols[7].textContent;
//     const txType = cols[8].textContent;
//     const toAdd = cols[9].textContent;

//     // Create a new div element
//     var newDiv = document.createElement("tr");
//     newDiv.innerHTML = `<td colspan="11">transactionHash: ${txHash}<br />TX Type:${txType}<br />From:${fromAdd}<br />To:${toAdd}</td>`;
//     newDiv.style.backgroundColor = "#f0f0f0"; // Example styling

//     // Insert the new div after the transaction row
//     row.parentNode.insertBefore(newDiv, row.nextSibling);
//   });
// }

function getTransactionHashes() {
  const txElements = document.querySelectorAll(
    'tr>td:nth-child(2)>a[href^="/tx/"]'
  );
  const txHashes = Array.from(txElements).map((el) => el.textContent.trim());
  console.log("txHashes", txHashes);
  fetch(
    `https://dev.serve.giveth.io/ethglobal_hackathon/metadata?tx_hashes=${txHashes.join(
      "&"
    )}`,
    {
      method: "GET", // or 'GET', 'PUT', 'DELETE', etc.
      headers: {
        "Content-Type": "application/json",
        // Additional headers
      },
    }
  )
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error))
    .finally(() => {});

  // return txHashes;
}

function main() {
  console.log("Hello from content script!");
  injectScript();
  getTransactionHashes();
  addCollapsibleDivs();
}

window.onload = main;

function injectScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("dist/injectedScript.bundle.js");
  (document.head || document.documentElement).appendChild(script);
}

let txInfo = {};
let account;
let signature;

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

async function addCollapsibleDivs() {
  // Remove all existing collapsible divs
  const elements = document.querySelectorAll(".collapsible-row");
  elements.forEach((element) => element.remove());

  const toggles = document.querySelectorAll(".toggle-button");
  toggles.forEach((element) => element.remove());

  // Select the table and its rows
  const table = document.querySelector("table"); // Adjust the selector as needed
  if (!table) return;

  const rows = table.querySelectorAll("tr");
  rows.forEach((row, index) => {
    // Skip the header row if needed
    if (index === 0) {
      return;
    }

    const txHash = row.querySelector("td:nth-child(3)").textContent;
    const fromAdd = row.querySelector("td:nth-child(8)").textContent;
    const isOwner = fromAdd?.toLowerCase() === account?.toLowerCase();
    console.log("fromAdd", fromAdd);
    console.log("account", account);
    console.log("isOwner", isOwner);

    // Create a button to toggle the div visibility
    const toggleButton = document.createElement("div");
    toggleButton.classList.add("toggle-button");
    toggleButton.style.margin = "5px";
    toggleButton.style.cursor = "pointer";
    // toggleButton.innerHTML = ">";
    let img = document.createElement("img");
    img.src = chrome.runtime.getURL("images/right.svg");
    toggleButton.appendChild(img);
    // Event listener to toggle the visibility of the div
    toggleButton.addEventListener("click", function () {
      collapsibleRow.style.display =
        collapsibleRow.style.display === "none" ? "" : "none";
    });

    // Insert the button in the first cell of the row
    const firstCell = row.cells[0];
    firstCell.insertBefore(toggleButton, firstCell.firstChild);

    // Create a collapsible div
    const collapsibleRow = document.createElement("tr");
    collapsibleRow.style.display = "none"; // Start collapsed
    collapsibleRow.classList.add("collapsible-row"); // Customize as needed
    const collapsibleCol = document.createElement("td");
    collapsibleCol.colSpan = 10;
    collapsibleCol.id = "collapsible-col-" + index; // Customize as needed
    collapsibleCol.classList.add("collapsible-col"); // Customize as needed
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

    const note = document.createElement(isOwner ? "textarea" : "div");
    note.id = "note";
    note.style.width = "100%";
    note.style.height = "100px";
    note.style.border = "none";
    note.innerText = txInfo[txHash]?.description || "";
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

    if (isOwner) {
      // Create a select element
      const categorySelect = document.createElement("select");
      categorySelect.id = "categorySelect"; // Set an ID for the select
      categorySelect.style.width = "100%";

      // Options to be added - you can customize this array
      const options = [
        { value: 1, key: "Donation" },
        { value: 2, key: "Grant" },
        { value: 3, key: "Payroll" },
        { value: 4, key: "Purchase" },
        { value: 5, key: "Rent" },
        { value: 6, key: "Equality" },
        { value: 7, key: "Investment" },
        { value: 8, key: "Service fee" },
        { value: 9, key: "Subscription fee" },
        { value: 10, key: "Supplier fee" },
        { value: 11, key: "Other" },
      ];

      // Create and append the options
      for (const optionText of options) {
        const option = document.createElement("option");
        option.value = optionText.value;
        option.textContent = optionText.key;
        categorySelect.appendChild(option);
      }
      categoryRow.appendChild(categorySelect);

      categorySelect.value = txInfo[txHash]?.category || 1;
    } else {
      const category = document.createElement("div");
      category.id = "category";
      category.textContent = txInfo[txHash]?.category || "";
      categoryRow.appendChild(category);
    }

    infoWrapper.appendChild(categoryRow);

    const fileRow = document.createElement("div");
    fileRow.style.display = "flex";
    fileRow.style.justifyContent = "space-between";
    fileRow.style.alignItems = "center";

    const fileLabel = document.createElement("label");
    fileLabel.textContent = "File";
    fileLabel.htmlFor = "file";
    fileLabel.style.minWidth = "200px";
    fileRow.appendChild(fileLabel);

    if (isOwner) {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.id = "fileInput";
      fileInput.style.width = "100%";
      fileRow.appendChild(fileInput);

      fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          uploadFile(file);
        }
      });
    } else {
      const file = document.createElement("div");
      file.id = "file";
      file.textContent = txInfo[txHash]?.file || "";
      fileRow.appendChild(file);
    }
    infoWrapper.appendChild(fileRow);

    const attestationRow = document.createElement("div");
    attestationRow.style.display = "flex";
    attestationRow.style.justifyContent = "space-between";
    attestationRow.style.alignItems = "center";

    const attestationLabel = document.createElement("label");
    attestationLabel.textContent = "Attestation";
    attestationLabel.htmlFor = "attestation";
    attestationLabel.style.minWidth = "200px";
    attestationRow.appendChild(attestationLabel);

    if (isOwner) {
      const attestationInput = document.createElement("button");
      attestationInput.id = "attestationInput";
      attestationInput.textContent = "Create New Attestation";

      attestationRow.appendChild(attestationInput);
    }

    infoWrapper.appendChild(attestationRow);

    // Insert the div after the row
    row.parentNode.insertBefore(collapsibleRow, row.nextSibling);

    if (isOwner) {
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

      cancelButton.addEventListener("click", function () {
        collapsibleRow.style.display = "none";
      });

      saveButton.addEventListener("click", async function () {
        if (!signature) {
          window.postMessage(
            {
              type: "ConTx",
              action: "SIGN_MESSAGE",
            },
            "*"
          );
          return;
        }
        saveButton.textContent = "Saving...";
        saveButton.disabled = true;
        const _note = note.value;
        const _category = categorySelect.value;
        const txHash = row.querySelector("td:nth-child(3)").textContent;
        const fromAdd = row.querySelector("td:nth-child(8)").textContent;
        try {
          const res = await fetch(
            "https://dev.serve.giveth.io/ethglobal_hackathon/metadata",
            {
              method: "POST", // or 'GET', 'PUT', 'DELETE', etc.
              headers: {
                "Content-Type": "application/json",
                // Additional headers
              },
              body: JSON.stringify({
                txChain: "baseGoerli",
                category: _category,
                txHash,
                description: _note,
                sender: fromAdd,
              }), // body data type must match "Content-Type" header
            }
          );
          const data = await res.json();
        } catch (error) {
          console.error("Error:", error);
        } finally {
          saveButton.disabled = false;
          saveButton.textContent = "Save";
          collapsibleRow.style.display = "none";
        }
      });
    }
  });
}

async function initialListeners() {
  window.addEventListener("message", async (event) => {
    if (event.data.type !== "ConTx") return;
    console.log("event", event.data);
    switch (event.data.action) {
      case "SET_ACCOUNT":
        account = event.data.account;
        signature = null;
        addCollapsibleDivs();
        break;
      case "SET_SIGNATURE":
        signature = event.data.signature;
        account = event.data.account;
        break;

      default:
        break;
    }
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

async function getTransactionHashes() {
  try {
    const txElements = document.querySelectorAll(
      'tr>td:nth-child(3)>a[href^="/tx/"]'
    );
    const txHashes = Array.from(txElements).map((el) => el.textContent.trim());
    console.log("txHashes", txHashes);
    const res = await fetch(
      `https://dev.serve.giveth.io/ethglobal_hackathon/metadata?tx_hashes=${txHashes.join(
        ","
      )}`,
      {
        method: "GET", // or 'GET', 'PUT', 'DELETE', etc.
        headers: {
          "Content-Type": "application/json",
          // Additional headers
        },
      }
    );
    const data = await res.json();
    console.log(data);
    txInfo = data.reduce((acc, item) => {
      acc[item.txHash] = item;
      return acc;
    }, {});
  } catch (error) {
    console.error("Error:", error);
  } finally {
    console.log("txInfo", txInfo);
  }
}

function insertColumnAtStart(tableId) {
  const table = document.querySelector("table");
  console.log("table", table);
  if (!table) return; // Exit if table not found

  for (const row of table.rows) {
    const newCell = row.insertCell(0); // Inserts a new cell at the first position
  }
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("https://dev.serve.giveth.io/ipfs", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("File uploaded successfully", result);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

async function main() {
  console.log("Hello from content script!");
  insertColumnAtStart();
  initialListeners();
  injectScript();
  await getTransactionHashes();
  await addCollapsibleDivs();
}

window.onload = main;

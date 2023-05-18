// Get the file input element
let fileInput = document.getElementById("file-input");

let keywords = [];

function readExcel(e) {
  let file = e.target.files[0];

  let reader = new FileReader();
  reader.readAsBinaryString(file);
  reader.onload = function () {
    let data = reader.result;
    let workbook = XLSX.read(data, { type: "binary" });
    let sheet_name = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[sheet_name];

    let range = XLSX.utils.decode_range(worksheet["!ref"]);
    let numRows = range.e.r + 1;

    for (let i = 0; i < numRows; i++) {
      let cellAddress = "A" + (i + 1);
      let cell = worksheet[cellAddress];
      if (cell && cell.v) {
        keywords.push(cell.v);
      } else {
        break;
      }
    }
    console.log(keywords);
    fetch('http://127.0.0.1:5000/get_trends_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ keywords: keywords })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Something went wrong');
      }
    })
    .then(data => {
      console.log(data);
      createExcelFile(data);
    })
    .catch(error => {
      console.error(error);
    });
  };
}

function createExcelFile(data) {
  // Create a new workbook
  var workbook = XLSX.utils.book_new();

  // Create a worksheet
  var worksheet = XLSX.utils.aoa_to_sheet(getExcelData(data));

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Generate the Excel file
  var excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Convert the buffer to a Blob object
  var blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Create a download link
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'data.xlsx';

  // Append the link to the document body
  document.body.appendChild(link);

  // Programmatically trigger the download
  link.click();

  // Cleanup
  document.body.removeChild(link);
}

function getExcelData(data) {
  const excelData = [];
  const headerRow = ['Name'];

  for (const keyword of data) {
    headerRow.push(keyword.name);
  }

  excelData.push(headerRow);

  const months = Object.keys(data[0].months);

  for (const month of months) {
    const row = [month];

    for (const keyword of data) {
      const value = keyword.months[month] || 0;
      row.push(value);
    }

    excelData.push(row);
  }

  return excelData;
}

// Add an event listener for when a file is selected
fileInput.addEventListener("change", function(e){
  readExcel(e)
});

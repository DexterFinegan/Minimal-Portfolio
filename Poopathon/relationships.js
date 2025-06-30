
document.getElementById("ddlViewBy").addEventListener("change", (event) => {
  console.log("Selected Value:", event.target.value);
  console.log("Selected Text:", event.target.options[event.target.selectedIndex].text);
});


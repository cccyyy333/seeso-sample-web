function container_init() {
    contain=document.getElementById("container");
    contain.style.display = "none";
    for (let i = 0; i < 3; i++) {
      const elementId = String.fromCharCode(97 + i); // 'a', 'b', 'c'
      con[i] = document.getElementById(elementId);
      con[i].style.backgroundColor = "gray";
      con[i].style.fontSize = "30px";
      con[i].style.display = "inline-block"
      con[i].style.width = "200px";
      con[i].style.height = "200px";
      con[i].style.textAlign = "center";
      con[i].style.lineHeight = "200px"; 
      con[i].style.margin= "100px"
    }
  }
  
  function showContainers() {
    contain.style.display = "block";
  }
  
  /*
    document.addEventListener("DOMContentLoaded", () => {
    container_init();
  });
  */


  
  function checkGazeInContainer(gazeInfo) {
    con.forEach((container) => {
      const rect = container.getBoundingClientRect();
      if (
        gazeInfo.x >= rect.left &&
        gazeInfo.x <= rect.right &&
        gazeInfo.y >= rect.top &&
        gazeInfo.y <= rect.bottom
      ) {
        container.style.backgroundColor = "green"; // Change color when the gaze is inside
      } else {
        container.style.backgroundColor = "gray"; // Revert color when the gaze is outside
      }
    });
  }
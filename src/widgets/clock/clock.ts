//AI generated

// Create a new widget element
var container = document.getElementById('clockWidget');

// Function to update the clock display
function updateClock() {
    const now = new Date(); // Get the current time
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    let period = "AM";

    // 12-hour format logic
    if (hours === 0) {
        hours = 12;  // 12 AM
    } else if (hours > 12) {
        hours = hours - 12; // Convert to 1-12 range for PM
        period = "PM";
    }

    const timeString = `${hours}:${minutes}:${seconds} ${period}`;

    // Update the HTML with the current time
    container!.innerHTML = `
    <span style="font-size: 72px; text-shadow: 2px 2px #000; color:white;">${timeString}</span>
  `;
}

// Call the updateClock function initially to display the time
updateClock();

// Update the clock every second
setInterval(updateClock, 1000); 
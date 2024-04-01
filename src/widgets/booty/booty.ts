import chipi from '@/assets/chipi.gif';

// Create the container for the box
var container = document.createElement('div');
container.style.position = 'relative'; // Important for containing absolute child 
document.body.appendChild(container);

// Create the box element
var box = document.createElement('img');
box.id = 'box'; // Set the ID for styling
container.appendChild(box);
box.src = chipi;
// <img src="chipi.gif" style="width:100px;height;100px;border-radius=10px"></img>
// Apply styles through JavaScript
box.style.width = '100px';
box.style.height = '100px';
box.style.position = 'absolute'; // Important for positioning within the container
box.style.top = '100px';
box.style.left = '100px';

// Animation Logic (similar to the previous example)
var boxWidth = box.offsetWidth;
var boxHeight = box.offsetWidth;
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

var speedX = 2;
var speedY = 2;
var isFlipped = true;

function animate() {
    // Move the box
    var left = parseInt(box.style.left) + speedX;
    var top = parseInt(box.style.top) + speedY;

    // Bounce off the edges
    if (left + boxWidth + (boxWidth / 2) >= windowWidth || left < 0) {
        speedX = -speedX;
        isFlipped = !isFlipped;
    }
    if (top + boxHeight + (boxHeight / 2) >= windowHeight || top < 0) {
        speedY = -speedY;
        //isFlipped = !isFlipped;
    }

    // Update the box position
    box.style.left = left + 'px';
    box.style.top = top + 'px';

    box.style.transform = isFlipped ? 'scaleX(-1)' : 'scaleX(1)';

    requestAnimationFrame(animate); // Loop the animation
}

animate(); 
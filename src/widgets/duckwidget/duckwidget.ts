import './duckwidget.css';

const pics = [
    "https://muon.blog/mycology/coverimages/Agaric",
    "https://muon.blog/mycology/coverimages/Amanita",
    "https://muon.blog/mycology/coverimages/Armillaria",
    "https://muon.blog/mycology/coverimages/Boletes",
    "https://muon.blog/mycology/coverimages/Brackets",
    "https://muon.blog/mycology/coverimages/Chlorophyllum",
    "https://muon.blog/mycology/coverimages/Coral",
    "https://muon.blog/mycology/coverimages/Cups",
    "https://muon.blog/mycology/coverimages/Cortinarius",
    "https://muon.blog/mycology/coverimages/Funnels",
    "https://muon.blog/mycology/coverimages/Inkcaps",
    "https://muon.blog/mycology/coverimages/Jellies",
    "https://muon.blog/mycology/coverimages/Lactarius",
    "https://muon.blog/mycology/coverimages/Melanoleuca",
    "https://muon.blog/mycology/coverimages/Misc",
    "https://muon.blog/mycology/coverimages/Mycena",
    "https://muon.blog/mycology/coverimages/Puffballs",
    "https://muon.blog/mycology/coverimages/Russula",
    "https://muon.blog/mycology/coverimages/Slime_Moulds",
    "https://muon.blog/mycology/coverimages/Lichen",
    "https://muon.blog/mycology/coverimages/Stinkhorns",
    "https://muon.blog/mycology/coverimages/Toothed",
    "https://muon.blog/mycology/coverimages/Tricholoma",
    "https://muon.blog/mycology/coverimages/Waxcaps",
    "https://muon.blog/mycology/coverimages/Xylaria",
];

const widget = document.getElementById('duckswidget')!;

changePic();
function changePic() {
    (document.getElementById("picthing") as HTMLImageElement).src = pics[Math.floor(Math.random() * pics.length)] + ".jpg";
    widget.classList.remove('dragging');  // Ensure the class is removed initially
}

// drag logic
let isDragging = false;
let offsetX: number, offsetY: number;

widget.addEventListener('mousedown', (e) => {
    isDragging = true;
    console.log('Mouse down!');
    // Calculate offset of mouse position relative to the widget's top-left corner
    offsetX = e.clientX - widget.offsetLeft;
    offsetY = e.clientY - widget.offsetTop;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    console.log('Mouse drag!');
    // Update widget's position based on mouse movement and offset
    widget.style.left = (e.clientX - offsetX) + 'px';
    widget.style.top = (e.clientY - offsetY) + 'px';
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});
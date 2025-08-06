
function lerp(A, B, t) {
    return A + (B - A) * t;
}

// Get intersection point between two line segments
function getIntersection(A, B, C, D) {
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);
    
    if (bottom != 0) {
        const t = tTop / bottom;
        const u = uTop / bottom;
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t
            };
        }
    }
    
    return null;
}

// Check if two polygons intersect
function polysIntersect(poly1, poly2) {
    for (let i = 0; i < poly1.length; i++) {
        for (let j = 0; j < poly2.length; j++) {
            const touch = getIntersection(
                poly1[i],
                poly1[(i + 1) % poly1.length],
                poly2[j],
                poly2[(j + 1) % poly2.length]
            );
            if (touch) {
                return true;
            }
        }
    }
    return false;
}

// Get random value between min and max
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

// Get random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Normalize angle to be between -PI and PI
function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}

// Convert degrees to radians
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

// Convert radians to degrees
function toDegrees(radians) {
    return radians * 180 / Math.PI;
}

// Distance between two points
function distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Clamp value between min and max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// RGB to hex color conversion
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Get color based on value (0-1) from red to green
function getColor(value) {
    const alpha = Math.abs(value);
    const R = value < 0 ? 255 : 255 - Math.floor(255 * alpha);
    const G = value > 0 ? 255 : 255 - Math.floor(255 * alpha);
    return "rgb(" + R + "," + G + ",0)";
}


function getRGBA(value){
    const alpha=Math.abs(value);
    const R=value<0?0:255;
    const G=R;
    const B=value>0?0:255;
    return "rgba("+R+","+G+","+B+","+alpha+")";
}
                

function getRandomColor(){
    const hue=290+Math.random()*260;
    return "hsl("+hue+", 100%, 60%)";
}
function getRandomSpeed(){
    return Math.random()*3;
}
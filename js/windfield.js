// Global settings (shared across all instances)
const perlin_noise = noise;

let detail = 10;
let rotation_factor = 1;
let noise_density = 0.001;
let noise_multiplier = 0.008;

let length_min = 0.5;
let length_max = 0.8;
let weight_min = 2;
let weight_max = 10;

let size = 35;

let stroke_color = '#36ABDB';


function getResponsiveSize(baseSize) {
    const width = window.innerWidth;

    if (width < 768) {
        return 25;
    } else if (width < 992) {
        return 28;
    } else {
        return baseSize;
    }
}

class Windfield {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.lines = [];
        this.frame_number = 1;
        this.play = this.container.getAttribute("wf_play") === "true" ? true : false;
        this.still = !this.play;
        this.wf_size = getResponsiveSize(size);
        this.stroke_color = this.container.getAttribute("wf_stroke_color") || stroke_color;

        this.initP5();
    }

    // create a P5 canvas inside the container
    initP5() {
        new p5((p) => {
            this.p = p;

            p.setup = () => this.setup();
            p.draw = () => this.draw();
            p.windowResized = () => this.windowResized();
        }, this.container);
    }

    setup() {
        this.wf_size = getResponsiveSize(size);
        this.container.style.background = "transparent";
        this.detail = Math.round(this.container.clientWidth / this.wf_size);
        this.canvas = this.p.createCanvas(this.container.clientWidth, this.container.clientHeight);
        
        if ( this.play ) {
            this.setupObserver();
        }

        // if its still, only call draw once
        if (this.still) {
            this.draw();
            this.p.noLoop();
        }
    } 

    // stop the windfield, if its not in view, play it if in view
    setupObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                this.play = entry.isIntersecting;
                if (this.play) {
                    this.p.loop();
                } else {
                    this.p.noLoop();
                }
            });
        }, { threshold: 0.1 });

        observer.observe(this.container);
    }

    windowResized() {
        this.p.resizeCanvas(this.container.clientWidth, this.container.clientHeight);
        this.wf_size = getResponsiveSize(size); // or re-read attribute if you use it
        this.draw();
    }

    draw() {
        this.p.clear();
        this.p.background('rgba(100%, 100%, 100%, 0)');

        if (this.play) {
            this.frame_number++;
        }

        let new_width = this.p.width;
        let new_height = this.p.height;
        this.detail = Math.round(this.container.clientWidth / this.wf_size);
        let columns = this.detail;
        let rect_size = new_width / this.detail;
        let rows = Math.floor(new_height / rect_size);
        let offset_x = (this.p.width - rect_size * columns) / 2;
        let offset_y = (this.p.height - rect_size * rows) / 2;

        this.p.strokeCap(this.p.SQUARE);
        this.p.noFill();

        this.lines = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                this.lines.push(new Line(this.p, rect_size * c + offset_x, rect_size * r + offset_y, rect_size, this.frame_number, this.stroke_color));
            }
        }

        this.lines.forEach(l => l.draw());
    }
}

class Line {
    constructor(p, x, y, rect_size, frame_number, stroke_color) {
        this.p = p;
        this.x = x;
        this.y = y;
        this._x = this.x * noise_density;
        this._y = this.y * noise_density;
        this.rect_size = rect_size;
        this.frame_number = frame_number; // Now it's passed into the class
        this.stroke_color = stroke_color; // Stroke color is passed here
    }

    draw() {
        const noiseValue = perlin_noise.simplex3(this._x, this._y, this.frame_number * noise_multiplier);
        this.p.push();
        this.p.translate(this.x + this.rect_size / 2, this.y + this.rect_size / 2);
        this.p.rotate(this.p.map(noiseValue, -1, 1, 0, this.p.TWO_PI * rotation_factor));

        const weight = this.p.map(noiseValue, -1, 1, weight_min, weight_max);
        const len = this.p.map(noiseValue, -1, 1, length_min, length_max);

        this.p.strokeWeight(weight);
        this.p.stroke(this.stroke_color); // Use the passed stroke color
        this.p.line(-this.rect_size * 0.5 * len, 0, this.rect_size * 0.5 * len, 0);

        this.p.pop();
    }
}

// Initialize all Windfield instances
window.addEventListener('DOMContentLoaded', function () {
    // Init the variables   
    length_min = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--_windfield---wf_length_min').trim());
    length_max = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--_windfield---wf_length_max').trim());
    weight_min = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--_windfield---wf_weight_min').trim());
    weight_max = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--_windfield---wf_weight_max').trim());
    rotation_factor = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--_windfield---wf_rotation').trim());
    
    // Initialize all Windfield instances
    const wf_containers = document.querySelectorAll(".wf_container");
    const windfields = [];

    // Initialize all Windfield instances if there are multiple on the page
    wf_containers.forEach(container => {
        windfields.push(new Windfield(container));
    });

});

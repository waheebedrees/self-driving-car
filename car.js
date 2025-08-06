class Car {
    constructor(x, y, width, height, controlType, maxSpeed = 3, color='black') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;
        
        
        this.useBrain = controlType == "AI";
        
        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
        }
        this.controls = new Controls(controlType);
        
        // For tracking performance
        this.distanceTraveled = 0;
        this.lastY = y;
        this.fitness = 0;

        
        this.img=new Image();
        this.img.src="car.png";

        this.mask=document.createElement("canvas");
        this.mask.width=width;
        this.mask.height=height;

        const maskCtx=this.mask.getContext("2d");
        this.img.onload=()=>{
            maskCtx.fillStyle=color;
            maskCtx.rect(0,0,this.width,this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation="destination-atop";
            maskCtx.drawImage(this.img,0,0,this.width,this.height);
        }
    }

  
    update(roadBorders, traffic) {
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
            
            // Update distance traveled (fitness)
            if (this.y < this.lastY) {
                this.distanceTraveled += this.lastY - this.y;
                this.lastY = this.y;
            }
            this.fitness = this.distanceTraveled;
        }
        
        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
            );
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);
            
            if (this.useBrain) {          
            // this.controls.forward=outputs[0] > 0.5 ? 1 : 0;
            // this.controls.left=outputs[1] > 0.3 ? 1 : 0;
            // this.controls.right=outputs[2] > 0.3 ? 1 : 0;
            // this.controls.reverse=outputs[3] > 0.4 ? 1 : 0;

        //   this.controls.left=outputs[1]
        //   this.controls.right=outputs[2];
          
        this.controls.forward = 0;
        this.controls.left = 0;
        this.controls.right = 0;
        this.controls.reverse = 0;
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];

        if (outputs[0] > 0.2) { // Assuming output is between 0 and 1
            this.controls.forward = 1;
        }
        if (Math.abs(outputs[1]) > Math.abs(outputs[2])) { // Left is stronger
            if (outputs[1] > 0){ 
                this.controls.left = 1;
                this.controls.right=0;
            }
            else {
                this.controls.right = 1;
                this.controls.left = 0;
            } // If left is stronger but negative, it means turn right
        } else { // Right is stronger or equal
            if (outputs[2] > 0) 
            {
                this.controls.right = 1;
                this.controls.left = 0;
            } // If left is stronger but negative, it means turn right
            else {
                this.controls.left = 1; // If right is stronger but negative, it means turn left
                this.controls.right=0;

            }
        }

        if(self.speed ==0){
         this.speed = Math.max(self.speed, this.speed + this.friction * 3); // Stronger friction for braking

        }

                 // Handle reverse: gradual stop (brake) if moving forward, or allow slow reverse if already stopped/moving backward
        if (outputs[3] > 0.5) { // If reverse is suggested
            if (this.speed > 0) { // If car is moving forward, apply brake
                this.speed = Math.max(0, this.speed - this.friction * 3); // Stronger friction for braking
            } else if (this.speed > -this.maxSpeed / 4) { // Allow slow reverse if not moving fast backward
                this.controls.reverse = 1;
            }
        }
                // this.controls.forward = outputs[0];
                // this.controls.left = outputs[1];
                // this.controls.right = outputs[2];
                // this.controls.reverse = outputs[3];
            }
        }
    }

  
    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            if (polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }
    
    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });
        
        return points;
    }
    
    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }
        
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }
        
        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }
        
        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left) {
                this.angle += 0.03 * flip;
            }
            if (this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }
        
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }
    
    draw(ctx,drawSensor=false){
        if(this.sensor && drawSensor){
            this.sensor.draw(ctx);
        }

        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(-this.angle);
        if(!this.damaged){
            ctx.drawImage(this.mask,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height);
            ctx.globalCompositeOperation="multiply";
        }
        ctx.drawImage(this.img,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height);
        ctx.restore();

    }
}

class Controls {
    constructor(type) {
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;
        
        switch (type) {
            case "KEYS":
                this.#addKeyboardListeners();
                break;
            case "DUMMY":
                this.forward = true;
                break;
        }
    }
    
    #addKeyboardListeners() {
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = true;
                    break;
                case "ArrowRight":
                    this.right = true;
                    break;
                case "ArrowUp":
                    this.forward = true;
                    break;
                case "ArrowDown":
                    this.reverse = true;
                    break;
            }
        }
        
        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = false;
                    break;
                case "ArrowRight":
                    this.right = false;
                    break;
                case "ArrowUp":
                    this.forward = false;
                    break;
                case "ArrowDown":
                    this.reverse = false;
                    break;
            }
        }
    }
}


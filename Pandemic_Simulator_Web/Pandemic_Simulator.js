class Person {
    
    constructor(b, st, min, max, q) {
        this.bound = b;
        this.status = st;
        this.vx = 0;
        this.vy = 0;
        this.x = Math.random() * b.width;
        this.y = Math.random() * b.height;
        this.count = 0;
        this.recovery = this.randomIntFromInterval(min, max);
        this.quarantine = q;
    }

    dist(p2) {
        return Math.sqrt(Math.pow(this.x - p2.x, 2) + Math.pow(this.y - p2.y, 2));
    }

    infect(p) {
        
		if ((this.status == 3) || (this.status == 2)) {
			return false;
		}
		var result = (p >= Math.random());
		if (result) {
			this.status = 2;
		}
		return result;
    }

    randomWalk() {
        var ax = 0.01 * (2 * Math.random() - 1);
		var ay = 0.01 * (2 * Math.random() - 1);
		this.vx += ax;
		this.vy += ay;
		if ((this.x + this.vx) > (this.bound.x + this.bound.width)) {
			this.x = this.x + this.vx - this.bound.width;
		} else {
			this.x += this.vx;
		}
		if ((this.y + this.vy) > (this.bound.y + this.bound.height)) {
			this.y = this.y + this.vy - this.bound.height;
		} else {
			this.y += this.vy;
		}
		if (this.status == 2) {
			this.count += 1;
			if (this.count == this.recovery) {
				this.status = 3;
				return true;
			}
		}
		
		return false;
    }

    moveTowards(rect, speed) {
        if (rect.contains(this)) {
            this.bound = rect;
            this.randomWalk();
			return;
		}
		var dist = Math.sqrt(Math.pow(rect.y + rect.height / 2 - this.y, 2) + Math.pow(rect.x + rect.width / 2 - this.x, 2));
		var sinA = (rect.y + rect.height / 2 - this.y) / dist;
		var cosA = (rect.x + rect.width / 2 - this.x) / dist;
		this.vx = speed * cosA;
		this.vy = speed * sinA;
		this.x += this.vx;
		this.y += this.vy;
    }

    show() {
        strokeWeight(10);
        if (this.status == 1) {
            stroke('green');
            point(this.x, this.y);
        } else if (this.status == 2) {
            stroke('red');
            point(this.x, this.y);
        } else if (this.status == 3) {
            stroke('grey');
            point(this.x, this.y);
        }
    }

    highlight() {
        strokeWeight(10);
        stroke('white');
        point(this.x, this.y);
    }

    randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    randomBoolean() {
        return (Math.random() > 0.5);
    }
}

class QuadTree {
    constructor(rec, c) {
        this.bound = rec;
		this.capacity = c;
		this.people = new Set();
		this.divided = false;
    }

    insert(p) {
        if (!this.bound.contains(p)) {
			return false;
		}
		if (this.people.size < this.capacity) {
			this.people.add(p);
			return true;
		} else {
			if (!this.divided) {
				this.subdivide();
			}
			if (this.nw.insert(p)) {
				return true;
			} else if (this.ne.insert(p)) {
				return true;
			} else if (this.sw.insert(p)) {
				return true;
			} else if (this.se.insert(p)) {
				return true;
			} else {
				return false;
			}
			 
		}
    }

    subdivide() {
        this.nw = new QuadTree(new Rectangle(this.bound.x, this.bound.y, this.bound.width / 2, this.bound.height / 2), this.capacity);
		this.ne = new QuadTree(new Rectangle(this.bound.x + this.bound.width / 2, this.bound.y, this.bound.width / 2, this.bound.height / 2), this.capacity);
		this.sw = new QuadTree(new Rectangle(this.bound.x, this.bound.y + this.bound.height / 2, this.bound.width / 2, this.bound.height / 2), this.capacity);
		this.se = new QuadTree(new Rectangle(this.bound.x + this.bound.width / 2 , this.bound.y + this.bound.height / 2, this.bound.width / 2, this.bound.height / 2), this.capacity);
		this.divided = true;
    }

    // query people of given status in the provided area
    // type = "Circle" or "Rect"
    query(area, st, type) {
        if (type == "Circle") {
            let result = new Set();
            if (!this.bound.intersectCircle(area)) {
                return result;
            } else {
                for (let p of this.people) {
                    if (area.contains(p)) {
                        if (p.status == st) {
                            result.add(p);
                        }
                    }
                }
                if (this.divided) {
                    result = new Set([...result, ...this.nw.query(area, st, type)]);
                    result = new Set([...result, ...this.ne.query(area, st, type)]);
                    result = new Set([...result, ...this.sw.query(area, st, type)]);
                    result = new Set([...result, ...this.se.query(area, st, type)]);
                }
                return result;
            }
        } else if (type == "Rect") {
            let result = new Set();
            if (!this.bound.intersectRect(area)) {
                return result;
            } else {
                for (let p of this.people) {
                    if (area.contains(p)) {
                        if (p.status == st) {
                            result.add(p);
                        }
                    }
                }
                if (this.divided) {
                    result = new Set([...result, ...this.nw.query(area, st, type)]);
                    result = new Set([...result, ...this.ne.query(area, st, type)]);
                    result = new Set([...result, ...this.sw.query(area, st, type)]);
                    result = new Set([...result, ...this.se.query(area, st, type)]);
                }
                return result;
            }
        }

    }

    show() {
        strokeWeight(1);
        stroke('white');
        noFill();
        rect(this.bound.x, this.bound.y, this.bound.width, this.bound.height);

        strokeWeight(3);
        for (let p of this.people) {
            p.show();
        }
        if (this.divided) {
            this.nw.show();
            this.ne.show();
            this.sw.show();
            this.se.show();
        }
    }


}

class Rectangle {
    constructor(xc, yc, w, h) {
        this.x = xc;
        this.y = yc;
        this.width = w;
        this.height = h;
    }

    contains(p) {
        if ((p.x >= this.x) && (p.y >= this.y) && (p.x <= (this.x + this.width)) && (p.y <= (this.y + this.height))) {
            return true;
        }
        return false;
    }

    intersectRect(rect2) {
        return !((this.x + this.width < rect2.x) || (this.x > rect2.x + rect2.width) || (this.y + this.height < rect2.y) || (this.y > rect2.y + rect2.height));
    }

    intersectCircle(c) {
        var edgeX = Math.abs(this.x - c.x);
        var edgeY = Math.abs(this.y - c.y);
        if ((edgeX > (c.radius + this.width)) || (edgeY > (c.radius + this.height))) {
            return false;
        }
        if (edgeX <= this.width || edgeY <= this.height) {
            return true;
        }
        
        var edges = Math.pow((edgeX - this.width), 2) + Math.pow((edgeY - this.height), 2);
        
        return edges <= (c.radius * c.radius);
    }

    show() {
        noFill();
        stroke('green');
        strokeWeight(5);
        rect(this.x, this.y, this.width, this.height);
    }
}

class Circle {
    constructor(xc, yc, r) {
        this.x = xc;
        this.y = yc;
        this.radius = r;
    }

    contains(p) {
        let dis = (this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y);
        return (dis <= (this.radius * this.radius));
    }

    show() {
        noFill();
        stroke('green');
        strokeWeight(5);
        circle(this.x, this.y, 2 * this.radius);
    }
}
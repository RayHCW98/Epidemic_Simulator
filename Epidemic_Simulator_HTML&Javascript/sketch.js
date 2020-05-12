var area;
var healthy;
var infected;
var immune;
var rec;
var cir;
var contactR;
var contactP;
var airborneR;
var airborneP;
var minL;
var maxL;
var data;
var quarantine = false;
var norma = true;
var zombie = false;
var iteration;
var healthyN;
var infectedN;
var immuneN;
var quaSpeed;
var attackRadius;
var attackSpeed;

function setup() {

    createCanvas(1000, 900);
    reset();

}

function reset() {
    
    area = new Rectangle(50, 50, 800, 800);
    rec = new Rectangle(400, 400, 100, 100);
    cir = new Circle(500, 500, 500);

    contactR = sliderContactR.value;
    contactP = sliderContactP.value * 0.01;
    airborneR = sliderAirborneR.value;
    airborneP = sliderAirborneP.value * 0.01;

    minL = Math.floor(sliderMinR.value);
    maxL = Math.floor(sliderMaxR.value);

    healthyN = sliderHealthyN.value;
    infectedN = sliderInfectedN.value;
    immuneN = sliderImmuneN.value;

    quaSpeed = sliderQuarantineS.value;
    attackRadius = sliderAttackR.value;
    attackSpeed = sliderAttackS.value;

    iteration = 0;
    data = new Array();
    healthy = new Set();

    

    for (let i = 0; i < healthyN; ++i) {
        healthy.add(new Person(area, 1, minL, maxL));
    }

    infected = new Set();
    for (let i = 0; i < infectedN; ++i) {
        infected.add(new Person(area, 2, minL, maxL));
    }

    immune = new Set();
    for (let i = 0; i < immuneN; ++i) {
        immune.add(new Person(area, 3, minL, maxL));
    }
}

function draw() {
    ++iteration;
    background(51);
    if (quarantine) {
        var qt = new QuadTree(area, 50);
        var qt2 = new QuadTree(rec, 50);
        for (let p of healthy) {
            if (rec.close(p)) {
                p.moveAway(rec, 0.3);
            } else {
                p.randomWalk();
            }
            
            //p.moveTowards(rec, 1);
            //p.moveTowards(area, 1);
        }
        for (let p of immune) {
            if (rec.close(p)) {
                p.bound = area;
                p.moveAway(rec, 0.3);
            } else if (rec.contains(p)) {
                p.bound = area;
                p.moveAway(rec, 0.3);
            } else {
                p.bound = area;
                p.randomWalk();
            }
            
            //p.moveTowards(rec, 1);
            //p.moveTowards(area, 1);
        }
        for (let p of infected) {
            if (p.moveTowards(rec, quaSpeed)) {
                p.bound = area;
                immune.add(p);
                
                infected.delete(p);
                
            }
            //p.moveTowards(rec, 1);
            //p.moveTowards(area, 1);
        }

        for (let p of healthy) {
            qt.insert(p);
            qt2.insert(p);
        }
        for (let p of immune) {
            qt.insert(p);
            qt2.insert(p);
        }
        for (let p of infected) {
            qt.insert(p);
            qt2.insert(p);
        }

        if (healthy.size != 0) {
            let newlyInfected = new Set();
            for (let p of infected) {
                let suspect = qt.query(new Circle(p.x, p.y, airborneR), 1, "Circle");
                for (let q of suspect) {
                    if (q.bound != p.bound) {
                        suspect.delete(q);
                    }
                }
                for (let q of suspect) {
                    if (q.infect(airborneP)) {
                        newlyInfected.add(q);
                        
                    } else if ((p.dist(q) <= contactR) && (q.infect(contactP))) {
                        newlyInfected.add(q);
                        
                    }
                }
            }
            for (let p of newlyInfected) {
                healthy.delete(p);
                infected.add(p);
            }
        }
        if (infected.size != 0) {
            if (data.length < 900) {
                data.push([healthy.size, infected.size, immune.size]);
            } else {
                data.shift();
                data.push([healthy.size, infected.size, immune.size]);
            }
        }   
        /*
        let h = healthy.size;
        let infe = infected.size;
        let imm = immune.size;

        data.push([h, infe, imm]);
        */
        qt.show();
        
        qt2.show();
    } else if (norma) {
        var qt = new QuadTree(area, 50);
        
        for (let p of healthy) {
            p.randomWalk();
            //p.moveTowards(rec, 1);
            //p.moveTowards(area, 1);
        }
        for (let p of immune) {
            p.randomWalk();
            //p.moveTowards(rec, 1);
            //p.moveTowards(area, 1);
        }
        for (let p of infected) {
            if (p.randomWalk()) {
                immune.add(p);
                infected.delete(p);
            }
            //p.moveTowards(rec, 1);
            //p.moveTowards(area, 1);
        }

        for (let p of healthy) {
            qt.insert(p);
        }
        for (let p of immune) {
            qt.insert(p);
        }
        for (let p of infected) {
            qt.insert(p);
        }

        if (healthy.size != 0) {
            let newlyInfected = new Set();
            for (let p of infected) {
                let suspect = qt.query(new Circle(p.x, p.y, airborneR), 1, "Circle");
                for (let q of suspect) {
                    if (q.infect(airborneP)) {
                        newlyInfected.add(q);
                    } else if ((p.dist(q) <= contactR) && (q.infect(contactP))) {
                        newlyInfected.add(q);
                    }
                }
            }
            for (let p of newlyInfected) {
                healthy.delete(p);
                infected.add(p);
            }
        }
        
        if (infected.size != 0) {
            if (data.length < 900) {
                data.push([healthy.size, infected.size, immune.size]);
            } else {
                data.shift();
                data.push([healthy.size, infected.size, immune.size]);
            }
        }   
        qt.show();
        
        
    } else if (zombie) {
        var qt = new QuadTree(area, 50);
        
        for (let p of healthy) {
            p.randomWalk();
            //p.moveTowards(rec, 1);
            //p.moveTowards(area, 1);
        }
        for (let p of immune) {
            p.randomWalk();
            //p.moveTowards(rec, 1);
            //p.moveTowards(area, 1);
        }

        for (let p of healthy) {
            qt.insert(p);
        }
        for (let p of immune) {
            qt.insert(p);
        }

        for (let p of infected) {
            if (healthy.size != 0) {
                let targets = qt.query(new Circle(p.x, p.y, attackRadius), 1, "Circle");
                if (targets.size == 0) {
                    if (p.randomWalk()) {
                        immune.add(p);
                        qt.insert(p);
                        infected.delete(p);
                    }
                } else {
                    for (let q of targets) {
                        if (p.attack(q, attackSpeed)) {
                            immune.add(p);
                            qt.insert(p);
                            infected.delete(p);
                        }
                        break;
                    }
                }
            } else {
                if (p.randomWalk()) {
                    immune.add(p);
                    qt.insert(p);
                    infected.delete(p);
                }
            }
        }

        
        for (let p of infected) {
            qt.insert(p);
        }

        if (healthy.size != 0) {
            let newlyInfected = new Set();
            for (let p of infected) {
                let suspect = qt.query(new Circle(p.x, p.y, airborneR), 1, "Circle");
                for (let q of suspect) {
                    if (q.infect(airborneP)) {
                        newlyInfected.add(q);
                    } else if ((p.dist(q) <= contactR) && (q.infect(contactP))) {
                        newlyInfected.add(q);
                    }
                }
            }
            for (let p of newlyInfected) {
                healthy.delete(p);
                infected.add(p);
            }
        }
        
        if (infected.size != 0) {
            if (data.length < 900) {
                data.push([healthy.size, infected.size, immune.size]);
            } else {
                data.shift();
                data.push([healthy.size, infected.size, immune.size]);
            }
        }   
        
        qt.show();
    }

    
    textSize(32);
    stroke('white');
    strokeWeight(3);
    text(healthy.size + infected.size + immune.size, 900, 100);
    stroke(131, 175, 155);
    text(healthy.size, 900, 200);
    stroke(254, 67, 101);
    text(infected.size, 900, 300);
    stroke(249, 205, 173);
    text(immune.size, 900, 400);
    //text(iteration, 900, 500);
    /*
    showData(data);
    */
}

function showData(data) {
    var total = healthy.size + infected.size + immune.size;
    for (let i = 0; i < data.length; ++i) {
        strokeWeight(1);
        stroke(131, 175, 155);
        line(1000, i, 1000 + 500 * data[i][0] / total, i);
        stroke(254, 67, 101);
        line(1000 + 500 * data[i][0] / total, i, 1000 + 500 * (data[i][0] + data[i][1]) / total, i);
        stroke(249, 205, 173);
        line(1000 + 500 * (data[i][0] + data[i][1]) / total, i, 1500, i);

    }
}

function qua() {
    if (quarantine == true) {
        return;
    }
    quarantine = true;
    norma = false;
    zombie = false;
    reset();
}

function normal() {
    if (norma == true) {
        return;
    }
    quarantine = false;
    norma = true;
    zombie = false;
    reset();
}

function zomb() {
    if (zombie == true) {
        return;
    }
    quarantine = false;
    norma = false;
    zombie = true;
    reset();
}


package com.ray.pandemicSimulator;


import java.util.HashSet;

public class QuadTree {
	Rectangle bound;
	int capacity;
	HashSet<Person> people;
	boolean divided;
	QuadTree nw;
	QuadTree ne;
	QuadTree sw;
	QuadTree se;
	
	
	public QuadTree(Rectangle rec, int c) {
		this.bound = rec;
		this.capacity = c;
		this.people = new HashSet<Person>();
		this.divided = false;
	}
	
	public boolean insert(Person p) {
		if (!this.bound.contains(p)) {
			return false;
		}
		if (this.people.size() < this.capacity) {
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
	
	public void insert(HashSet<Person> people) {
		for (Person p: people) {
			this.insert(p);
		}
	}
	
	public HashSet<Person> query(Person.Circle c) {
		HashSet<Person> result = new HashSet<Person>();
		if (!this.bound.intersects(c)) {
			return result;
		} else {
			for (Person p: this.people) {
				if (c.contains(p)) {
					result.add(p);
				}
			}
			if (this.divided) {
				result.addAll(this.nw.query(c));
				result.addAll(this.ne.query(c));
				result.addAll(this.sw.query(c));
				result.addAll(this.se.query(c));
			}
			return result;
		}
	}
	
	public HashSet<Person> query(Rectangle rect) {
		HashSet<Person> result = new HashSet<Person>();
		if (!this.bound.intersects(rect)) {
			return result;
		} else {
			for (Person p: this.people) {
				if (rect.contains(p)) {
					result.add(p);
				}
			}
			if (this.divided) {
				result.addAll(this.nw.query(rect));
				result.addAll(this.ne.query(rect));
				result.addAll(this.sw.query(rect));
				result.addAll(this.se.query(rect));
			}
			return result;
		}
		
	}
	
	public HashSet<Person> queryHealthy(Person.Circle c) {
		HashSet<Person> result = new HashSet<Person>();
		if (!this.bound.intersects(c)) {
			return result;
		} else {
			for (Person p: this.people) {
				if (c.contains(p)) {
					if (p.status == 1) {
						result.add(p);
					}
					
				}
			}
			if (this.divided) {
				result.addAll(this.nw.query(c));
				result.addAll(this.ne.query(c));
				result.addAll(this.sw.query(c));
				result.addAll(this.se.query(c));
			}
			return result;
		}
	}
	
	public HashSet<Person> queryHealthy(Rectangle rect) {
		HashSet<Person> result = new HashSet<Person>();
		if (!this.bound.intersects(rect)) {
			return result;
		} else {
			for (Person p: this.people) {
				if (rect.contains(p)) {
					if (p.status == 1) {
						result.add(p);
					}
				}
			}
			if (this.divided) {
				result.addAll(this.nw.query(rect));
				result.addAll(this.ne.query(rect));
				result.addAll(this.sw.query(rect));
				result.addAll(this.se.query(rect));
			}
			return result;
		}
		
	}
	
	public void subdivide() {
		this.nw = new QuadTree(new Rectangle(this.bound.x, this.bound.y, this.bound.width / 2, this.bound.height / 2), this.capacity);
		this.ne = new QuadTree(new Rectangle(this.bound.x + this.bound.width / 2, this.bound.y, this.bound.width / 2, this.bound.height / 2), this.capacity);
		this.sw = new QuadTree(new Rectangle(this.bound.x, this.bound.y + this.bound.height / 2, this.bound.width / 2, this.bound.height / 2), this.capacity);
		this.se = new QuadTree(new Rectangle(this.bound.x + this.bound.width / 2 , this.bound.y + this.bound.height / 2, this.bound.width / 2, this.bound.height / 2), this.capacity);
		this.divided = true;
	}
	
	@Override
	public String toString() {
		String result =  "bound: " + this.bound.toString() +
				"capacity: " + this.capacity + "\n" +
				"people: " + this.people.size() + "\n";
		
		if (this.people.size() == 0) {
			result = result.concat("None\n");
		} else {
			for (Person p: this.people) {
				result = result.concat(p.toString());
			}
		}
		
		result = result.concat("divided: " + this.divided + "\n");
		
		if (this.divided) {
			result = result.concat("nw: " + this.nw.toString() + "\n");
			result = result.concat("ne: " + this.ne.toString() + "\n");
			result = result.concat("sw: " + this.sw.toString() + "\n");
			result = result.concat("se: " + this.se.toString() + "\n");
		}
		return result;
	}
	
	
	static class Rectangle {
		// Origin at top left corner
		double x;
		double y;
		double width;
		double height;
		
		
		public Rectangle(double xc, double yc, double w, double h) {
			this.x = xc;
			this.y = yc;
			this.width = w;
			this.height = h;
			
		}
		
		public boolean contains(Person p) {
			if ((p.x >= this.x) && (p.y >= this.y) && (p.x <= (this.x + this.width)) && (p.y <= (this.y + this.height))) {
				return true;
			}
			return false;
		}
		
		public boolean intersects(Person.Circle c) {
			
			double edgeX = Math.abs(this.x - c.x);
			double edgeY = Math.abs(this.y - c.y);
			if ((edgeX > (c.radius + this.width)) || (edgeY > (c.radius + this.height))) {
				return false;
			}
			if (edgeX <= this.width || edgeY <= this.height) {
		    	return true;
		    }
			
			double edges = Math.pow((edgeX - this.width), 2) + Math.pow((edgeY - this.height), 2);
			
		    return edges <= (c.radius * c.radius);
		}
		
		public boolean intersects(Rectangle rect2) {
			return ((this.x + this.width < rect2.x) || (this.x > rect2.x + rect2.width) || (this.y + this.height < rect2.y) || (this.y > rect2.y + rect2.height));
		}
		
		@Override
		public String toString() {
			return "x: " + this.x + "\n" + 
		"y: " + this.y + "\n" +
		"width: " + this.width + "\n" +
		"height: " + this.height + "\n";
		
					
		}
	}
}

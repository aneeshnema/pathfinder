export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static make_point(arr) {
        console.assert(Array.isArray(arr) && arr.length == 2, "cannot convert arr to Point");
        return new Point(arr[0], arr[1]);
    }

    get getxy() {
        return [this.x, this.y];
    }

    get getstr() {
        return this.x + '-' + this.y;
    }

    equals(other) {
        console.assert(other instanceof Point || Array.isArray(other), "other must be Point or Array");
        if (Array.isArray(other))
            return this.x == other[0] && this.y == other[1];
        return this.x == other.x && this.y == other.y;
    }
}

class Heap {
    constructor(compare) {
        this.arr = new Array();
        this.size = 0;
        this.compare = compare;
    }

    parent(i) {
        return (i - 1) / 2 | 0;
    }

    left(i) {
        return 2 * i + 1 | 0;
    }

    right(i) {
        return 2 * i + 2 | 0;
    }

    heapify(i) {
        var l = this.left(i), r = this.right(i), m = i;
        if (l < this.size && this.compare(this.arr[l], this.arr[m]) < 0)
            m = l;
        if (r < this.size && this.compare(this.arr[r], this.arr[m]) < 0)
            m = r;
        if (m != i) {
            let temp = this.arr[m];
            this.arr[m] = this.arr[i];
            this.arr[i] = temp;
            this.heapify(m);
        }
    }

    buildheap() {
        for (let i = this.size / 2 - 1 | 0; i >= 0; i--)
            this.heapify(i);
    }

    push(...vals) {
        for (let val of vals) {
            this.arr.push(val);
            var i = this.size++;
            while (i > 0 && this.compare(this.arr[i], this.arr[this.parent(i)]) < 0) {
                var temp = this.arr[this.parent(i)];
                this.arr[this.parent(i)] = this.arr[i];
                this.arr[i] = temp;
                i = this.parent(i);
            }
        }
    }

    pop() {
        if (this.size == 0) {
            console.error("Cannot pop from empty Heap");
            return undefined;
        }
        this.size--;
        if (this.size == 0)
            return this.arr.pop();
        var root = this.arr[0];
        this.arr[0] = this.arr.pop();
        this.heapify(0);
        return root;
    }
}

export class Grid {
    constructor(n, m) {
        this.n = n;
        this.m = m;
        this.weight = Grid.make_grid(n, m);
        this.distance;
    }

    static make_grid(n, m, val = 0.1) {
        let grid = new Array(n);
        for (let i = 0; i < n; i++)
            grid[i] = new Array(m).fill(val);
        return grid;
    }

    getneighbours(p) {
        var neighbours = [];
        if (p.x > 0)
            neighbours.push(new Point(p.x - 1, p.y));
        if (p.x < this.n - 1)
            neighbours.push(new Point(p.x + 1, p.y));
        if (p.y > 0)
            neighbours.push(new Point(p.x, p.y - 1));
        if (p.y < this.m - 1)
            neighbours.push(new Point(p.x, p.y + 1));
        return neighbours;
    }

    compare(a, b) {
        return this.distance[a.x][a.y] - this.distance[b.x][b.y];
    }

    hurestic_dist(p){
        return Math.abs(this.end.x - p.x) + Math.abs(this.end.y - p.y);
    }

    compare_astar(a, b){
        return this.compare(a, b) + 0.1*this.hurestic_dist(a) - 0.1*this.hurestic_dist(b);
    }
    
    dijistra(start, end) {
        console.assert(start instanceof Point || Array.isArray(start), "start must be instance of Point or Array");
        console.assert(end instanceof Point || Array.isArray(end), "end must be instance of Point or Array");
        if (Array.isArray(start))
            start = Point.make_point(start);
        if (Array.isArray(end))
            end = Point.make_point(end);
        let parent = Grid.make_grid(this.n, this.m, new Point(-1, -1));
        let heap = new Heap(this.compare.bind(this));
        this.distance = Grid.make_grid(this.n, this.m, Infinity);
        this.distance[start.x][start.y] = 0;
        heap.push(start);
        let visorder = [];
        while (heap.size > 0 && parent[end.x][end.y].equals([-1, -1])) {
            let top = heap.pop();
            let cur_vis = [];
            for (let p of this.getneighbours(top)) {
                if (this.weight[p.x][p.y] == Infinity) continue;
                if (this.distance[p.x][p.y] > this.distance[top.x][top.y] + this.weight[top.x][top.y]) {
                    parent[p.x][p.y] = top;
                    this.distance[p.x][p.y] = this.distance[top.x][top.y] + this.weight[top.x][top.y];
                    heap.push(p);
                    cur_vis.push(p);
                }
            }
            visorder.push(cur_vis);
        }
        if (parent[end.x][end.y].equals([-1, -1])) {
            console.log("no path found");
            return [undefined, visorder];
        }
        let path = [];
        for (var p = parent[end.x][end.y]; !p.equals(start); p = parent[p.x][p.y])
            path.unshift(p);
        console.assert(start.equals(p), "error in found path");
        console.log('total cost =', this.distance[end.x][end.y]);
        return [path, visorder];
    }

    astar(start, end) {
        console.assert(start instanceof Point || Array.isArray(start), "start must be instance of Point or Array");
        console.assert(end instanceof Point || Array.isArray(end), "end must be instance of Point or Array");
        if (Array.isArray(start))
            start = Point.make_point(start);
        if (Array.isArray(end))
            end = Point.make_point(end);
        this.start = start;
        this.end = end;
        let parent = Grid.make_grid(this.n, this.m, new Point(-1, -1));
        let heap = new Heap(this.compare_astar.bind(this));
        this.distance = Grid.make_grid(this.n, this.m, Infinity);
        this.distance[start.x][start.y] = 0;
        heap.push(start);
        let visorder = [];
        while (heap.size > 0 && parent[end.x][end.y].equals([-1, -1])) {
            let top = heap.pop();
            let cur_vis = [];
            for (let p of this.getneighbours(top)) {
                if (this.weight[p.x][p.y] == Infinity) continue;
                if (this.distance[p.x][p.y] > this.distance[top.x][top.y] + this.weight[top.x][top.y]) {
                    parent[p.x][p.y] = top;
                    this.distance[p.x][p.y] = this.distance[top.x][top.y] + this.weight[top.x][top.y];
                    heap.push(p);
                    cur_vis.push(p);
                }
            }
            visorder.push(cur_vis);
        }
        if (parent[end.x][end.y].equals([-1, -1])) {
            console.log("no path found");
            return [undefined, visorder];
        }
        let path = [];
        for (var p = parent[end.x][end.y]; !p.equals(start); p = parent[p.x][p.y])
            path.unshift(p);
        console.assert(start.equals(p), "error in found path");
        console.log('total cost =', this.distance[end.x][end.y]);
        delete this.start;
        delete this.end;
        return [path, visorder];
    }

    bfs(start, end) {
        console.assert(start instanceof Point || Array.isArray(start), "start must be instance of Point or Array");
        console.assert(end instanceof Point || Array.isArray(end), "end must be instance of Point or Array");
        if (Array.isArray(start))
            start = Point.make_point(start);
        if (Array.isArray(end))
            end = Point.make_point(end);
        let parent = Grid.make_grid(this.n, this.m, new Point(-1, -1));
        let queue = [start];
        let visorder = [];
        parent[start.x][start.y] = start;
        while (queue.length > 0 && parent[end.x][end.y].equals([-1, -1])) {
            let front = queue.shift();
            let cur_vis = [];
            for (let p of this.getneighbours(front)) {
                if (this.weight[p.x][p.y] == Infinity) continue;
                if (parent[p.x][p.y].equals([-1, -1])) {
                    parent[p.x][p.y] = front;
                    queue.push(p);
                    cur_vis.push(p);
                }
            }
            visorder.push(cur_vis);
        }
        if (parent[end.x][end.y].equals([-1, -1])) {
            console.log("no path found");
            return [undefined, visorder];
        }
        let path = [];
        for (var p = parent[end.x][end.y]; !p.equals(start); p = parent[p.x][p.y])
            path.unshift(p);
        console.assert(start.equals(p), "error in found path");
        return [path, visorder];
    }

    dfs(start, end) {
        console.assert(start instanceof Point || Array.isArray(start), "start must be instance of Point or Array");
        console.assert(end instanceof Point || Array.isArray(end), "end must be instance of Point or Array");
        if (Array.isArray(start))
            start = Point.make_point(start);
        if (Array.isArray(end))
            end = Point.make_point(end);
        let parent = Grid.make_grid(this.n, this.m, new Point(-1, -1));
        let stack = [start];
        let visorder = [];
        parent[start.x][start.y] = start;
        while (stack.length > 0 && parent[end.x][end.y].equals([-1, -1])) {
            let top = stack.pop();
            let cur_vis = [];
            for (let p of this.getneighbours(top)) {
                if (this.weight[p.x][p.y] == Infinity) continue;
                if (parent[p.x][p.y].equals([-1, -1])) {
                    parent[p.x][p.y] = top;
                    stack.push(p);
                    cur_vis.push(p);
                }
            }
            visorder.push(cur_vis);
        }
        if (parent[end.x][end.y].equals([-1, -1])) {
            console.log("no path found");
            return [undefined, visorder];
        }
        let path = [];
        for (var p = parent[end.x][end.y]; !p.equals(start); p = parent[p.x][p.y])
            path.unshift(p);
        console.assert(start.equals(p), "error in found path");
        return [path, visorder];
    }
}
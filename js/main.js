import {Point, Grid} from './pathfinder.js';

var current_cell_type = 'cell-wall';
var current_algo = 'dijistra';
var map_wrapper;
var map;
var start;
var end;

class Map extends Grid {
    constructor(n, m) {
        super(n, m);
        this.content = Map.make_table(n, m);
        this.path = [];
        this.visorder = [];
    }

    static make_table(rows, cols, id) {
        var table = document.createElement('table');
        if (id != undefined)
            table.id = id;
        for (let r = 0; r < rows; r++) {
            let row = document.createElement('tr');
            for (let c = 0; c < cols; c++) {
                let cell = document.createElement('td');
                cell.id = r + '-' + c;
                cell.classList.add('cell');
                cell.classList.add('cell-free');
                row.append(cell);
            }
            table.append(row);
        }
        return table;
    }

    getcoordinates(id) {
        console.assert(typeof (id) == 'string', 'id not string');
        return id.split('-').map(Number);
    }

    getcelltype(id) {
        return document.getElementById(id).classList[1];
    }

    toggle_cell(cell, cell_type) {
        if (typeof (cell) == 'string')
            cell = document.getElementById(cell);
        var [x, y] = this.getcoordinates(cell.id);
        if (cell.classList.contains(cell_type)) {
            cell.className = 'cell cell-free';
            this.weight[x][y] = Map.cell_weights['cell-free'];
        }
        else {
            cell.className = 'cell ' + cell_type;
            this.weight[x][y] = Map.cell_weights[cell_type];
        }
    }

    addcelltype(cell, cell_type) {
        if (typeof (cell) == 'string')
            cell = document.getElementById(cell);
        cell.classList.add(cell_type);
    }

    static addcelltype(cell, cell_type) {
        if (typeof (cell) == 'string')
            cell = document.getElementById(cell);
        cell.classList.add(cell_type);
    }

    removecelltype(cell, cell_type) {
        if (typeof (cell) == 'string')
            cell = document.getElementById(cell);
        cell.classList.remove(cell_type);
    }

    static removecelltype(cell, cell_type) {
        if (typeof (cell) == 'string')
            cell = document.getElementById(cell);
        cell.classList.remove(cell_type);
    }

    make_path(paint_flag=false) {
        for (let p of this.path)
            this.removecelltype(p.getstr, 'cell-path');
        for (let arr of this.visorder)
            for (let p of arr)
                this.removecelltype(p.getstr, 'cell-vis');
        this.path = undefined;
        switch (current_algo) {
            case 'dijistra':
                [this.path, this.visorder] = this.dijistra(start, end);
                break;
            case 'a*':
                [this.path, this.visorder] = this.astar(start, end);
                break;
            case 'bfs':
                [this.path, this.visorder] = this.bfs(start, end);
                break;
            case 'dfs':
                [this.path, this.visorder] = this.dfs(start, end);
                break;
        }

        if (this.path == undefined) {
            this.path = [];
            return;
        }
        if(paint_flag)
            this.paint();
        else{
            for (let arr of this.visorder)
                for (let p of arr)
                    this.addcelltype(p.getstr, 'cell-vis');
            this.removecelltype(end.getstr, 'cell-vis');
            for (let p of this.path) {
                this.removecelltype(p.getstr, 'cell-vis');
                this.addcelltype(p.getstr, 'cell-path');
            }
        }
    }

    paint(){
        let visorder_dup = this.visorder.slice();
        let path_dup = this.path.slice();
        
        function paint_callback_path(){
            if(path_dup.length == 0){
                document.body.style.pointerEvents = '';
                return;
            }
            let front = path_dup.shift();
            Map.removecelltype(front.getstr, 'cell-vis');
            Map.addcelltype(front.getstr, 'cell-path');
            window.requestAnimationFrame(paint_callback_path);
        }
        
        function paint_callback_vis(){
            if(visorder_dup.length == 0){
                Map.removecelltype(end.getstr, 'cell-vis');
                window.requestAnimationFrame(paint_callback_path);
                return;
            }
            let front = visorder_dup.shift();
            for (let p of front)
                Map.addcelltype(p.getstr, 'cell-vis');
            window.requestAnimationFrame(paint_callback_vis);    
        }
        document.body.style.pointerEvents = 'none';
        window.requestAnimationFrame(paint_callback_vis);
    }
}

function create(evt) {
    current_algo = document.getElementById('algoselection').value;
    current_cell_type = document.getElementById('cellselection').value;
    if (evt == undefined) {
        map.make_path(true);
        return;
    }
    if (!evt.target.classList.contains('cell')) return;
    let cell = evt.target;
    if (start.equals(map.getcoordinates(cell.id))) {
        map.make_path();
        map_wrapper.onmouseover = (evt) => {
            let cell = evt.target;
            if (!cell.classList.contains('cell')) return;
            if (end.equals(map.getcoordinates(cell.id))) return;
            map.toggle_cell(start.getstr, 'cell-free');
            [start.x, start.y] = map.getcoordinates(cell.id);
            map.toggle_cell(cell, 'cell-start');
            map.make_path();
        };
    }
    else if (end.equals(map.getcoordinates(cell.id))) {
        map.make_path();
        map_wrapper.onmouseover = (evt) => {
            let cell = evt.target;
            if (!cell.classList.contains('cell')) return;
            if (start.equals(map.getcoordinates(cell.id))) return;
            map.toggle_cell(end.getstr, 'cell-free');
            [end.x, end.y] = map.getcoordinates(cell.id);
            map.toggle_cell(cell, 'cell-end');
            map.make_path();
        };
    }
    else {
        map.toggle_cell(cell, current_cell_type);
        map.make_path();
        map_wrapper.onmouseover = (evt) => {
            let cell = evt.target;
            if (!cell.classList.contains('cell') || start.equals(map.getcoordinates(cell.id)) || end.equals(map.getcoordinates(cell.id))) return;
            map.toggle_cell(cell, current_cell_type);
            map.make_path();
        };
    }
    return false;
}

function reset() {
    map_wrapper.innerHTML = "";
    var n = (window.innerHeight - document.getElementById('nav').offsetHeight) / 20 | 0;
    var m = window.innerWidth / 20 | 0;
    map = new Map(n, m);
    map_wrapper.appendChild(map.content);
    start = new Point(n / 3 | 0, m / 3 | 0);
    end = new Point(2 * n / 3 | 0, 2 * m / 3 | 0);
    map.toggle_cell(start.getstr, 'cell-start');
    map.toggle_cell(end.getstr, 'cell-end');
}

Map.cell_weights = {
    'cell-free': 0.1,
    'cell-obs-s': 0.25,
    'cell-obs-m': 0.5,
    'cell-obs-l': 1,
    'cell-wall': Infinity,
    'cell-start': 0.1,
    'cell-end': 0.1,
    'cell-path': 0.1,
}

document.addEventListener("DOMContentLoaded", () => { 
    document.getElementById('go').onclick = () => create();
    document.getElementById('reset').onclick = reset;
    map_wrapper = document.getElementById('map');
    reset();
    map_wrapper.onmousedown = create;
    map_wrapper.onmouseup = () => map_wrapper.onmouseover = null;
});
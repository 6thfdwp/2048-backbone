var app = app || {};

app.Grid = Backbone.Collection.extend({
    size:       4,
    startTiles: 2,
    score:      0,
    won:        false,
    over:       false,
    model:      app.Tile,

    initialize: function(modeldata, options) {
        var num = this.size* this.size;
        //console.info(options);
        for (var i=0; i<num; i++) {
            this.add({idx: i, grid:this });
        }
    },

    setup: function() {
        for (var j=0; j<this.startTiles; j++) {
            this.randomTile();
        }
        this.score = 0;
        this.won = false;
        this.over= false;
        // notify view to repaint
        this.trigger('tileschange', this);
        this.trigger('scorechange', 0, 0);
    },

    restart: function() {
        this.each(function(tile) {
            tile.free();
        });
        this.setup();
    },

    getFreeTiles: function() {
        return this.filter(function(tile) {
            return tile.isfree();
        });
    },

    getOccupiedTiles: function() {
        return this.filter(function(tile) {
            return !tile.isfree();
        });
    },
    // randomly choose one free tile, put value on it
    randomTile: function() {
        var tiles = this.getFreeTiles();
        if (tiles.length != 0) {
            var value = Math.random() < 0.9 ? 2 : 4;
            var free = tiles[Math.floor(Math.random() * tiles.length)];
            free.put(value);
            free.set({isNew: true});
        }
    },

    movable: function() {
        //check if any tile can still be moved
        //when whole grid is occupied
        if (this.getFreeTiles().length != 0) {
            return true;
        }
        var dir = _(['up','down','right','left']).find(function(direction) {
            var moved = this.find(function(tile, i) {
                var other = tile[direction]();
                return other && other.equals(tile);
            });
            return moved !== undefined;
        }, this);
        return dir;
    },
    
    moveTile: function(tile, direction) {
        var moved = false, gained = 0;
        var next = tile.findNext(direction);
        var farthest = next.farthest;
        var sibling = next.sibling;
        // mergedFrom used to prevent continuous merge in one row or col
        if (sibling && sibling.equals(tile) && !sibling.isMerged()) {
            moved = true;
            tile.mergeTo(sibling); //tile is merged to sibling which becomes occupied
            gained = sibling.get('value');
            if (sibling.get('value') == 2048) {
                this.won = true;
            }
        }
        else if (!tile.equals(farthest) ) { // farthest is another free tile
            moved = true;
            tile.moveTo(farthest);
        }
        //console.info(this.getOccupiedTiles());
        return {moved:moved, gained:gained};
    },

    prepareTiles: function() {
        //set each tile state for next move
        this.each(function(tile, i, list) {
            tile.set({
                mergedFrom: false, isNew: false,
                prev: null
            });
        });
    },

    buildTraversal: function(direction) {
        var otiles = this.getOccupiedTiles();
        //need to first move tiles with higher indexes if it is right or down
        return (direction == 'up' || direction == 'left') ?
            otiles : otiles.reverse();
    },

    move: function(direction) {
        var moved = false;
        var gained = 0; //total gain in the new move
        //set tile initial state for the next move (prev, mergeFrom etc.)
        this.prepareTiles();

        _(this.buildTraversal(direction)).each(function(tile, i) {
            var r = this.moveTile(tile, direction);
            // moved should be true if one tile moved
            if (!moved) moved = r.moved; 
            gained += r.gained;
        }, this);

        if (!moved) return;
        // move done, random a new tile and trigger view to repaint 
        this.randomTile(); 
        //console.info(_(this.getOccupiedTiles()).pluck('attributes') );
        if (!this.movable()) this.over = true;
        this.trigger('tileschange', this);
        if (gained != 0) {
            this.score += gained;
            this.trigger('scorechange', this.score, gained);
        }
    },
});
app.grid = new app.Grid();
//console.info(grid);

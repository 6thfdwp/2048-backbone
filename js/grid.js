var app = app || {};

app.Grid = Backbone.Collection.extend({
    size: 4,
    startTiles: 2,
    model: app.Tile,

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
        // notify view to repaint
        this.trigger('tileschange', this);
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
            //return free.attributes;
        }
    },

    moveTile: function(tile, direction) {
        var moved = false;
        //var next = this.findNext(tile, direction);
        var next = tile.findNext(direction);
        var farthest = next.farthest;
        var sibling = next.sibling;
        // mergedFrom used to prevent continuous merge in one row or col
        if (sibling && sibling.equals(tile) && !sibling.isMerged()) {
            moved = true;
            tile.mergeTo(sibling);
        }
        else if (!tile.equals(farthest) ) { // farthest is another free tile
            moved = true;
            farthest.put(tile.get('value'));
            tile.free();
        }
        //console.info(this.getOccupiedTiles());
        //this.trigger('tileschange', this);
        return moved;
    },

    resetMergedTiles: function() {
        this.each(function(tile, i, list) {
            tile.set({mergedFrom: false});
        });
    },

    buildTraversal: function(direction) {
        var otiles = this.getOccupiedTiles();
        return (direction == 'up' || direction == 'left') ?
            otiles : otiles.reverse();
    },

    move: function(direction) {
        var moved = false;
        _(this.buildTraversal(direction)).each(function(tile, i) {
            var r = this.moveTile(tile, direction);
            // moved should be true if one tile moved
            if (!moved) moved = r 
        }, this);
        if (moved) { // move done, random a new one and trigger view to repaint 
            this.randomTile(); 
            console.info(_(this.getOccupiedTiles()).pluck('attributes') );
            this.trigger('tileschange', this);
            this.resetMergedTiles();
        }
    },
});
app.grid = new app.Grid();
//console.info(grid);

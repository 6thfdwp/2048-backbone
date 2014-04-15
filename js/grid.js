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

    pos_to_idx: function(x, y) {
        return y * this.size + x
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
            //var pos = this.idx_to_pos(idx);
            //return {x:pos.x, y:pos.y, idx:idx, value:value};
        }
    },

    moveTile: function(tile, direction) {
        var moved = false;
        var next = this.findNext(tile, direction);
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

    // find next as far as possible following the direction
    // return this tile and its sibling along with the direction
    findNext: function(tile, direction) {
        var farthest;
        do {
            farthest = tile;
            tile = tile[direction]();
        } while (tile && tile.isfree());
        return {farthest:farthest, sibling:tile};
    },

    resetMergedTiles: function() {
        this.each(function(tile, i, list) {
            tile.set({mergedFrom: false});
        });
    },

    move: function(direction) {
        var moved = false;
        // up or left, iterate forward
        if (direction =='up' || direction =='left') {
            this.each(function(tile) {
                if (!tile.isfree()) {
                    var r = this.moveTile(tile, direction);
                    if (!moved) moved = r // moved should be true if one tile moved
                }
            }, this);
        }
        // down or right, iterate backward
        if (direction =='down' || direction =='right') {
            var num = this.size * this.size;
            for (var i=num-1; i>=0; i--) {
                var tile = this.at(i);
                if (!tile.isfree()) {
                    var r = this.moveTile(tile, direction);
                    if (!moved) moved = r // moved should be true if one tile moved
                }
            }
        }
        if (moved) { // move done, random a new one and trigger view to repaint 
            this.randomTile(); 
            console.info(_(this.getOccupiedTiles()).pluck('attributes') );
            this.trigger('tileschange', this);
            this.resetMergedTiles();
        }
    },

    draw: function() {
    },
});
app.grid = new app.Grid();
//console.info(grid);

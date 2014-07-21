var app = app || {};

app.Grid = Backbone.Collection.extend({
    size:       4,
    startTiles: 2,
    score:      0,
    won:        false,
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
            free.set({isNew: true});
            //return free.attributes;
        }
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
            if (sibling.get('value')) {
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
        if (moved) { 
            // move done, random a new tile and trigger view to repaint 
            this.randomTile(); 
            //console.info(_(this.getOccupiedTiles()).pluck('attributes') );
            this.trigger('tileschange', this);
            if (gained != 0) {
                this.score += gained;
                this.trigger('scorechange', this.score, gained);
            }
        }
    },
});
app.grid = new app.Grid();
//console.info(grid);

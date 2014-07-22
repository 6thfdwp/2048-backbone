var app = app || {};

(function() {
    app.Tile = Backbone.Model.extend({
        defaults: {
            x: null, y: null,
            idx:        null,
            value:      0,
            mergedFrom: false,
            isNew:      false,
            prev:       null
        },

        initialize: function() {
            var pos = this.initPos();
            this.set({x:pos.x, y:pos.y});
        },

        initPos: function() {
            //initialze tile pos when game started
            var idx = this.get('idx');
            var size = this.get('grid').size;
            var y = Math.floor(idx / size);
            var x = idx % size;
            return {x:x+1, y:y+1};
        },
        getPos: function() {
            return {x:this.get('x'), y:this.get('y')};
        },

        put: function(value) {
            this.set({value: value});
        },

        isfree: function() {
            //return this.get('x') == null && this.get('y') == null;
            return this.get('value') == 0;
        },

        free: function() {
            //this.set({value: 0, mergedFrom: false});
            this.set({value: 0});
        },

        up: function() {
            var idx = this.get('idx');
            var size = this.get('grid').size;
            var up = idx - size;
            return up < 0 ? null : this.get('grid').at(up);
        },
        down: function() {
            var idx = this.get('idx');
            var size = this.get('grid').size;
            var down = idx + size;
            return down >= size*size ? null : this.get('grid').at(down);
        },
        left: function() {
            var idx = this.get('idx');
            var size = this.get('grid').size;
            var left = idx - 1;
            return idx % size == 0 ? null : this.get('grid').at(left);
        },
        right: function() {
            var idx = this.get('idx');
            var size = this.get('grid').size;
            var right = idx + 1;
            return idx % size == size-1 ? null : this.get('grid').at(right);
        },

        // find next available tiles as far as possible following the direction
        // return this tile and its sibling
        findNext: function(direction) {
            var farthest;
            var tile = this;
            //keep moving until hit grid boundary or another tile
            do {
                farthest = tile;
                tile = tile[direction]();
            } while (tile && tile.isfree());
            return {farthest:farthest, sibling:tile};
        },

        equals: function(other) {
            return this.get('value') == other.get('value');
        },

        isMerged: function() {
            return this.get('mergedFrom');
        },
        isNew: function() {
            return this.get('isNew');
        },

        mergeTo: function(other) {
            var value = this.get('value');
            other.put(value*2);
            //mergedFrom = [this, other];
            var c = this.clone(); //for animation
            other.set({prev: c});
            other.set({mergedFrom: true});
            this.free();
        },

        moveTo: function(other) {
            other.put(this.get('value'));
            var c = this.clone();
            other.set({prev: c});
            this.free();
        }

    });
}) ();

app.GameBoard = Backbone.View.extend({
    el: $(document),
    events: {},
    template: _.template($('#game-board-template').html() ),
    tileTpl: _.template($('#game-tile-template').html()),
    
    initialize: function() {
        //this.listenTo(app.grid, 'tileschange', this.rePaint);
        this.listenTo(app.grid, 'tileschange', this.log);
        this.render();
        // set up random tiles when game starts
        app.grid.setup();
    },

    render: function() {
        this.$('.grid-container')
            .html( this.template({size: this.model.size }) );
        return this;
    },
    
    _normalizePos: function(x, y) {
        return {x:x+1, y:y+1};
    },

    clear: function() {
        $('.tile-container').removeChildren();
    },

    rePaint: function(grid) {
        var tiles = grid.getOccupiedTiles();
        console.info(tiles);
        _(tiles).each(function(tile, i) {
            var pos = this._normalizePos(tile.get('x'), tile.get('y'));
            var tplstr = this.tileTpl({x:pos.x, y:pos.y, value:tile.get('value')});
            $('.tile-container').append($(tplstr));
        }, this);
    },

    log: function(grid) {
        var padding = '      '
        var row = [];
        grid.each(function(tile, i, list) {
            if (tile.isfree())
                row.push(padding);
            else
                row.push( (padding + tile.get('value')).slice(-6) );
            if (i % grid.size == grid.size-1) {
                console.info(row.join(' | '));
                row = [];
            }
        });
    }
});

var gameboard = new app.GameBoard({model: app.grid});
//var gameboard = new app.GameBoard({grid: grid});

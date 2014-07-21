app.GameBoard = Backbone.View.extend({
    el: $(document),
    events: {
        'keydown': 'move'
    },
    keyMap: {
        38: 'up',
        39: 'right',
        40: 'down',
        37: 'left'
    },
    template: _.template($('#game-board-template').html() ),
    tileTpl: _.template($('#game-tile-template').html()),
    
    initialize: function() {
        this.listenTo(this.model, 'tileschange', this.rePaint);
        this.listenTo(this.model, 'scorechange', this.updateScore);
        //for debug 
        //this.listenTo(app.grid, 'tileschange', this.log);
        this.render();
        // set up random tiles when game starts
        this.model.setup();
    },

    render: function() {
        this.$('.grid-container')
            .html( this.template({size: this.model.size }) );
        return this;
    },
    
    move: function(event) {
        //Backbone ensure 'this' point to view object in event delegate
        var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
            event.shiftKey;
        var dir    = this.keyMap[event.which];
        if (!modifiers && dir != undefined) {
            event.preventDefault();
            app.grid.move(dir);
        }
    },

    _normalizePos: function(x, y) {
        return {x:x+1, y:y+1};
    },

    clearTiles: function() {
        $('.tile-container').empty();
    },

    _positionClass: function(pos) {
        return 'tile-position-' + pos.x + '-' + pos.y;
    },
    addTiles: function(tiles) {
        var r = [];
        _(tiles).each(function(tile, i) {
            var prev = tile.get('prev');
            var tilePos = this._normalizePos(tile.get('x'), tile.get('y'));
            var tilePosClass = this._positionClass(tilePos);
            //var classes = [posClass];
            var tplstr = this.tileTpl({
                value:tile.get('value')
            });
            var tileEl = $(tplstr);
            //if a tile moved, first apply its previous position
            //otherwise apply its original position
            var pos = prev ? this._normalizePos(prev.get('x'), prev.get('y')) : tilePos;
            var posClass = this._positionClass(pos);
            tileEl.addClass(posClass);
            if (prev) {
                window.requestAnimationFrame(function() {
                    tileEl.removeClass(posClass);
                    tileEl.addClass(tilePosClass);
                });
            }
            else if (tile.isNew())
                //classes.push('tile-new');
                tileEl.addClass('tile-new');
            else if (tile.isMerged())
                //classes.push('tile-merged');
                tileEl.addClass('tile-merged');
            //tileEl.addClass(classes.join(' '));
            r.push(tileEl);
            $('.tile-container').append(tileEl);
        }, this);
    },

    rePaint: function(grid) {
        var tiles = grid.getOccupiedTiles();
        var self = this;
        window.requestAnimationFrame(function() {
            self.clearTiles();
            self.addTiles(tiles);
        });
    },

    updateScore: function(score, gained) {
        //$('.score-container:first-child').remove();
        var gainEl = $('<div class="score-addition"></div>');
        gainEl.text('+' + gained);
        $('.score-container').text(score);
        $('.score-container').append(gainEl);
    },

    log: function(grid) {
        var padding = '      ';
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

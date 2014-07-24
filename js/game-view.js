app.GameBoard = Backbone.View.extend({
    el: $(document),
    events: {
        'keydown'               :  'move',
        'click .restart-button ':  'restart'
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
    
    restart: function() {
        this.model.restart();
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

    clearTiles: function() {
        $('.tile-container').empty();
    },

    _positionClass: function(pos) {
        return 'tile-position-' + pos.x + '-' + pos.y;
    },

    _findTileEl: function(idx) {
        return $('#' + idx);
    },
    _new: function(tile) {
        var tplstr = this.tileTpl({
            idx:   tile.get('idx'),
            value: tile.get('value'),
            x:tile.get('x'), y:tile.get('y')
        });
        var tileEl = $(tplstr);
        return tileEl;
        //$('.tile-container').append(tileEl);
    },

    renderTiles: function(tiles) {
        var r = [];
        _(tiles).each(function(tile, i) {
            var prev = tile.get('prev');
            var tilePos = tile.getPos();
            var tilePosClass = this._positionClass(tilePos);
            //for moved and merged tiles, need to render prev first
            //and change position class later for sliding effect
            var tileEl = prev ? this._new(prev) : this._new(tile);
            r.push(tileEl);
            if (prev) {
                var prevClass = this._positionClass(prev.getPos());
                window.requestAnimationFrame(function() {
                    tileEl.removeClass(prevClass);
                    tileEl.addClass(tilePosClass);
                });
            }
            if (tile.isMerged()) {
                var mergedEl = this._new(tile).addClass('tile-merged');
                r.push(mergedEl);
            }
            if (tile.isNew()) {
                tileEl.addClass('tile-new');
            }
        }, this);
        $('.tile-container').append(r);
    },

    rePaint: function(grid) {
        var tiles = grid.getOccupiedTiles();
        var self = this;
        window.requestAnimationFrame(function() {
            self.clearTiles();
            self.renderTiles(tiles);
        });
    },

    updateScore: function(score, gained) {
        //$('.score-container:first-child').remove();
        $('.score-container').text(score);
        if (gained != 0) {
            var gainEl = $('<div class="score-addition"></div>');
            gainEl.text('+' + gained);
            $('.score-container').append(gainEl);
        }
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

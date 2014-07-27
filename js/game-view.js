app.GameBoard = Backbone.View.extend({
    el: $(document),
    events: {
        'keydown'               :  'move',
        'click .restart-button ':  'restart',
        'click .autorun-button ':  'autorun'
    },
    keyMap: {
        38: 'up',
        39: 'right',
        40: 'down',
        37: 'left'
    },
    template: _.template($('#game-board-template').html() ),
    tileTpl: _.template($('#game-tile-template').html() ),
    
    running         : false,
    animationDelay  : 150,
    $runbtn         : $('.autorun-button'),

    initialize: function() {
        this.listenTo(this.model, 'tileschange', this.rePaint);
        this.listenTo(this.model, 'scorechange', this.updateScore);
        //for debug 
        //this.listenTo(this.model, 'tileschange', this.log);
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
        this.stoprun();
        this.clearMessage();
        this.model.restart();
    },

    _randomdir: function() {
        var i = Math.floor(Math.random() * 4);
        return ['up','down','right','left'][i];
    },
    run: function() {
        var self = this;
        var grid = this.model;
        var direction = this._randomdir();
        grid.move(direction);
        if (this.running && !grid.over && !grid.won) {
            setTimeout(function() {
                self.run();
            }, this.animationDelay)
        }
        if (grid.over || grid.won) {
            this.stoprun();
        }
    },
    autorun: function() {
        if (this.running) {
            this.stoprun();
        }
        else {
            this.running = true;
            this.$runbtn.text('Stop');
            this.run();
        }
    },

    stoprun: function() {
        this.$runbtn.text('Auto Run');
        this.running = false;
    },

    move: function(event) {
        //Backbone ensure 'this' point to view object in event delegate
        var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
            event.shiftKey;
        var dir    = this.keyMap[event.which];
        if (!modifiers && dir !== undefined) {
            event.preventDefault();
            this.model.move(dir);
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
            if (grid.won) {
                self.message(true);
            }
            else if (grid.over) {
                self.message(false);
            }
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

    message: function(won) {
        var style = won ? 'game-won' : 'game-over';
        var msg = won ? 'You win:)' : 'You lose:(';
        $('.game-message').addClass(style);
        $('.game-message p').text(msg);
    },
    clearMessage: function() {
        $('.game-message').removeClass('game-won game-over');
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
        if (grid.won) {
            console.info('You win:)');
        }
        else if (grid.over) {
            console.info('Game over:(');
        }
    }
});

var gameboard = new app.GameBoard({model: app.grid});
//var gameboard = new app.GameBoard({grid: grid});

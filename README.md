2048-backbone
=============
The original repository is [here](https://github.com/gabrielecirulli/2048).

Reimplement game [2048](http://gabrielecirulli.github.io/2048/) made by [Gabriele Cirulli](http://gabrielecirulli.com/) for learning purpose. Inspired by [WilliamLP version](https://github.com/WilliamLP/2048v2)

Backbone's collection and model are very suitable to represent the game internal structure. By combining them we transform original 2-D array to 1-D collection to manage a set of tile instances. Each move is to find the next position (the index in the collection) for each tile via simple calculation and update its value property (no need to create and destroy instances). 

Its built-in event-driven also allows to render UI based on model state change which ends up with cleaner, more efficient and loose coupling code. Once we get the new state of all occupied tiles for current move, using template engine to build html markups for those tiles and insert them into the page once.

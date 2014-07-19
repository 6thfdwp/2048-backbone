2048-backbone
=============

Reimplement game [2048](https://github.com/gabrielecirulli/2048) for learning purpose. Inspired by [WilliamLP version](https://github.com/WilliamLP/2048v2)

Backbone's collection and model are very suitable to represent the game internal structure. By combining them we transform 2-D grid to 1-D collection including a set of tile instances. Each move can be implemented as for finding correct tile and update the value property (no instance creation)

View is easy to subscribe the custome event triggered in each move and reflect those changes in the page through template engine.

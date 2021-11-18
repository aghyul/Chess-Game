var T = {
	PAWN:   { name: "Pawn",		img: "&#9823;" },
	KNIGHT: { name: "Knight",	img: "&#9822;" },
	BISHOP: { name: "Bishop", 	img: "&#9821;" },
	ROOK:	{ name: "Rook", 	img: "&#9820;" },
	QUEEN:	{ name: "Queen", 	img: "&#9819;" },
	KING:	{ name: "King", 	img: "&#9818;" }
} ;

function Player(name, color){
	this.name = name ;
	this.color = color ;
	
	this.pieces = [] ;
	
	this.hasTurn = (this.color === "white") ? true : false ;
	
	this.move = function(piece, point){
		
	}
}

function Piece(type, player){
	var self = this ;
	this.player = player ;
	this.player.pieces.push(self) ;
	
	this.type = type ;

	this.square ;
	this.point = {} ;
	this.moved = false ;
	this.alive = true ;
	this.selected = false ;
	this.jq = $("<div> " + this.type.img + " </div>") ;
	this.jq.addClass("piece "+this.player.color) ;

	
	this.toggleSelect = function(on){
		if (typeof on === "boolean"){
			this.selected = on ;
			this.jq.toggleClass("selected", on) ;
		}
		else if (this.selected){
			this.selected = false ;
			this.jq.toggleClass("selected", false) ;
		} else {
			this.selected = true ;
			this.jq.toggleClass("selected", true) ;
		}
	}	
	this.jq.click(function() { game.engine.SelectPiece(self) ; }) ;
	
	this.bindClick = function(){
		this.jq.click(function() { game.engine.SelectPiece(self) ; }) ;
	}
	
	this.unbindClick = function(){
		this.jq.unbind() ;
	}
}

function Square(point, jq){
	var self = this ;
	this.color = ((point.y+point.x)%2 == 0) ? "white" : "black" ;
	this.jq = jq.addClass("square " + this.color) ;
	
	//this.jq.append("y: "+point.y+ " x: "+point.x) ;

	this.piece = null 
	this.point = point ;
	
	this.updatePiece = function(piece){
		this.jq.empty() ;
		if (piece && piece instanceof Piece){
			this.piece = piece ;
			this.piece.point = this.point ;
			this.jq.append(piece.jq) ;
		} else {
			this.piece = null ;
		}
	}
	
	this.toggleMove = function(on){
		this.jq.toggleClass("move", on) ;
	}
	
	this.toggleAttack = function(on){
		this.jq.toggleClass("attack", on) ;
	}
}
// @param field - HTML table
function Board(field){
	self = this ;
	this.grid = [[],[],[],[],[],[],[],[]] ;
	this.field = field ;
	$(this.field).empty() ;
	
	this.create = function(pieces){ //alert(pieces) ;
		for (var y = 0 ; y <= 7 ; y++){
		var row = field.insertRow(y) ;
			for (var x = 0 ; x <= 7 ; x++){
				var cell = $(row.insertCell(x)) ;
				var square = new Square({x:x , y:y}, cell) ; 
				if (pieces[y][x] instanceof Piece){
					pieces[y][x].point = {x:x , y:y} ;
					square.updatePiece(pieces[y][x]) ;
				}
				self.grid[y][x] = square ;
			}
		}
	
	}
	
	this.update = function(table){
		for (var y = 0 ; y <= 7 ; y++){
			for (var x = 0 ; x <= 7 ; x++){
				var square = this.grid[y][x] ;
				square.jq.empty() ;
				if (square.piece)
					square.jq.append(square.piece) ;
			}
		}
	}
	
		
	this.Rotate = function(){
		$(this.field).toggleClass("rotate") ;
	}
}

function Engine(grid){
	var self = this ;
	
	this.GetPaths = function(piece){
		if (piece.selected /*&& piece.player.hasTurn*/){
			var yDir = (piece.player.color === "white") ? -1 : 1 ;
			var yMin = (piece.player.color === "white") ? 7 : 0 ;
			var yMax = 7 - yMin ;
			var xMin = 0 ;
			var xMax = 7 ;
			var potential = [] ;
			var real =  [] ;
			if (piece.type === T.PAWN){
				potential = [
					{type: "move", x: piece.point.x, y: piece.point.y + 1*yDir},
					{type: "attack", x: piece.point.x-1, y: piece.point.y + 1*yDir},
					{type: "attack", x: piece.point.x+1, y: piece.point.y + 1*yDir}
				];
				if (!piece.moved && !grid[piece.point.y + 1*yDir][piece.point.x].piece)
					potential.push({type: "move", x: piece.point.x, y: piece.point.y + 2*yDir}) ;
					
			} else if (piece.type === T.KNIGHT){
				potential = [
					{type: "mixed", x: piece.point.x-2, y: piece.point.y-1},
					{type: "mixed", x: piece.point.x-2, y: piece.point.y+1},
					{type: "mixed", x: piece.point.x-1, y: piece.point.y-2},
					{type: "mixed", x: piece.point.x-1, y: piece.point.y+2},
					{type: "mixed", x: piece.point.x+1, y: piece.point.y-2},
					{type: "mixed", x: piece.point.x+1, y: piece.point.y+2},
					{type: "mixed", x: piece.point.x+2, y: piece.point.y-1},		
					{type: "mixed", x: piece.point.x+2, y: piece.point.y+1}	
				] ;
			} else if (piece.type === T.BISHOP){
				var directions = {
					LeftUp: 	{ distance: 8, dx: -1, dy: -1 },
					LeftDown: 	{ distance: 8, dx: -1, dy: 1 },
					RightUp: 	{ distance: 8, dx: 1,  dy: -1 },
					RightDown: 	{ distance: 8, dx: 1,  dy:  1 }
				} ;
				
				for (var i in directions){
					for (var d = 1  ; d <= directions[i].distance ; d++){
						var aim = {x: piece.point.x + directions[i].dx*d, y: piece.point.y + directions[i].dy*d } ;
						if (aim.x >= 0 && aim.x <= 7 && aim.y >= 0 && aim.y <= 7){
							potential.push({type: "mixed", x: aim.x, y: aim.y}) ;
							if (grid[aim.y][aim.x].piece)
								break ;
						}
					}
				}
			} else if (piece.type === T.ROOK){
				var directions = {
					Left: 	{ distance: 8, dx: -1, dy: 0  },
					Right: 	{ distance: 8, dx: 1,  dy: 0  },
					Up: 	{ distance: 8, dx: 0,  dy: -1 },
					Down: 	{ distance: 8, dx: 0,  dy:  1 }
				} ;
				
				for (var i in directions){
					for (var d = 1  ; d <= directions[i].distance ; d++){
						var aim = {x: piece.point.x + directions[i].dx*d, y: piece.point.y + directions[i].dy*d } ;
						potential.push({type: "mixed", x: aim.x, y: aim.y}) ;
						if (aim.x >= 0 && aim.x <= 7 && aim.y >= 0 && aim.y <= 7){
							potential.push({type: "mixed", x: aim.x, y: aim.y}) ;
							if (grid[aim.y][aim.x].piece)
								break ;
						}
					}
				}
			} else if (piece.type === T.QUEEN){
				var directions = {
					Left: 	{ distance: 8, dx: -1, dy: 0  },
					Right: 	{ distance: 8, dx: 1,  dy: 0  },
					Up: 	{ distance: 8, dx: 0,  dy: -1 },
					Down: 	{ distance: 8, dx: 0,  dy:  1 },
					LeftUp: 	{ distance: 8, dx: -1, dy: -1 },
					LeftDown: 	{ distance: 8, dx: -1, dy: 1 },
					RightUp: 	{ distance: 8, dx: 1,  dy: -1 },
					RightDown: 	{ distance: 8, dx: 1,  dy:  1 }
				} ;
				
				for (var i in directions){
					for (var d = 1  ; d <= directions[i].distance ; d++){
						var aim = {x: piece.point.x + directions[i].dx*d, y: piece.point.y + directions[i].dy*d } ;
						potential.push({type: "mixed", x: aim.x, y: aim.y}) ;
						if (aim.x >= 0 && aim.x <= 7 && aim.y >= 0 && aim.y <= 7){
							potential.push({type: "mixed", x: aim.x, y: aim.y}) ;
							if (grid[aim.y][aim.x].piece)
								break ;
						}
					}
				}
			} else if (piece.type === T.KING){
				var directions = {
					Left: 	{ distance: 1, dx: -1, dy: 0  },
					Right: 	{ distance: 1, dx: 1,  dy: 0  },
					Up: 	{ distance: 1, dx: 0,  dy: -1 },
					Down: 	{ distance: 1, dx: 0,  dy:  1 },
					LeftUp: 	{ distance: 1, dx: -1, dy: -1 },
					LeftDown: 	{ distance: 1, dx: -1, dy: 1 },
					RightUp: 	{ distance: 1, dx: 1,  dy: -1 },
					RightDown: 	{ distance: 1, dx: 1,  dy:  1 }
				} ;
				
				for (var i in directions){
					for (var d = 1  ; d <= directions[i].distance ; d++){
						var aim = {x: piece.point.x + directions[i].dx*d, y: piece.point.y + directions[i].dy*d } ;
						potential.push({type: "mixed", x: aim.x, y: aim.y}) ;
						if (aim.x >= 0 && aim.x <= 7 && aim.y >= 0 && aim.y <= 7){
							potential.push({type: "mixed", x: aim.x, y: aim.y}) ;
							if (grid[aim.y][aim.x].piece)
								break ;
						}
					}
				}
			}
			
			for (var i = 0 ; i < potential.length ; i++){
				var path = potential[i] ;
				if (path.x >= xMin && path.x <= xMax && path.y*yDir >= yMin*yDir && path.y*yDir <= yMax*yDir){
				var square = grid[path.y][path.x] ;
					switch (path.type){
						case "move":
							if (!square.piece)
								real.push(path) ;
							break ;
						case "attack":
							if (square.piece && square.piece.player !== piece.player)
								real.push(path) ;
							break ;
						case "mixed":
							if (square.piece){
								if (square.piece.player !== piece.player){
									path.type = "attack" ;
									real.push(path) ;
								}
							} else {
								path.type = "move" ;
								real.push(path) ;
							}
							break ;
					}
				}
			}
			return real ;
		}
		return [] ;
	}
	
	this.SelectPiece = function(piece){
		for (var y = 0 ; y <= 7 ; y++){
			for (var x = 0 ; x <= 7 ; x++){
				if (grid[y][x].piece instanceof Piece){
					if (grid[y][x].piece === piece){
						piece.toggleSelect() ;
						if (piece.selected){
							var paths = this.GetPaths(piece) ;
							this.TogglePath(paths, piece) ;
						} else 
							this.TogglePath() ;
					} else {
						grid[y][x].piece.toggleSelect(false) ;
					}
				}
			}
		}
	}
	
	this.TogglePath = function(paths, piece){
		for (var y = 0 ; y <= 7 ; y++){
			for (var x = 0 ; x <= 7 ; x++){
				grid[y][x].toggleMove(false) ;
				grid[y][x].toggleAttack(false) ;
				grid[y][x].jq.unbind() ;
			}
		}	
		
		if (paths && piece){
			for (var i = 0 ; i < paths.length ; i++){
				var x = paths[i].x ;
				var y = paths[i].y ;
				var square = grid[y][x] ;
				if (paths[i].type === "move")
					square.toggleMove(true) ;
				else if (paths[i].type === "attack")
					square.toggleAttack(true) ;
				(function(){
					var square1 = square ;
					square.jq.bind("click", function(){ self.MovePiece(piece, square1) ; }) ;
				})() ;
			}
		}
	}
	
	this.MovePiece = function(piece, square){ 
		if (piece.player.hasTurn){
			var paths = this.GetPaths(piece) ;
			for (var i = 0 ; i < paths.length ; i++){
				if (paths[i].x === square.point.x && paths[i].y === square.point.y){
					if (square.piece){
						game.stats.displayDeadPiece(square.piece) ;
					}
					game.stats.commentMove(grid[piece.point.y][piece.point.x], square, piece.player) ;
					grid[piece.point.y][piece.point.x].updatePiece() ;
					square.updatePiece(piece) ;
					piece.moved = true ;
					piece.bindClick() ;
					piece.toggleSelect(false) ;
					this.TogglePath() ;
					game.switchTurn() ;
					return true ;
				}
			}
		}
	}
}

function Stats(field){
	this.field = $(field) ;
	this.whiteInd = this.field.find(".hasTurn.white") ;
	this.blackInd = this.field.find(".hasTurn.black") ;
	this.whitePieces =  this.field.find(".loss.white") ;
	this.blackPieces = 	this.field.find(".loss.black") ;
	this.timeline = this.field.find(".timeline textarea") ;
	
	this.blackPieces.empty() ;
	this.whitePieces.empty() ;
	this.timeline.val("") ;
	
	this.updateTurn = function(player1, player2){
		if (player1.hasTurn){
			this.whiteInd.html("Turn") ;
			this.blackInd.html("") ;
		} else {
			this.whiteInd.html("") ;
			this.blackInd.html("Turn") ;
		}
	}
	
	this.displayDeadPiece = function(piece){
		if (piece.player.color === "white"){
			this.whitePieces.append(piece.type.img) ;
		} else {
			this.blackPieces.append(piece.type.img) ;
		}
	}
	
	this.commentMove = function(s1, s2, player){
		var d = new Date() ;
		var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() ;
		var text = time + " " + player.color + " moves from (" + s1.point.x + "," + s1.point.y + ") to (" + s2.point.x + "," + s2.point.y + ") \n" ;
		this.timeline.val(this.timeline.val() + text) ;
	}
}
function Chess(player1, player2, field, statfield){
	this.board = new Board(field) ;
	this.engine = new Engine(this.board.grid) ;
	this.stats = new Stats(statfield) ;
	
	this.player1 = player1 ;
	this.player2 = player2 ;
	
	this.startPieces = [
		[
			new Piece(T.ROOK, 	player2),
			new Piece(T.KNIGHT, player2),
			new Piece(T.BISHOP, player2),
			new Piece(T.QUEEN, 	player2),
			new Piece(T.KING, 	player2),
			new Piece(T.BISHOP, player2),
			new Piece(T.KNIGHT, player2),
			new Piece(T.ROOK, 	player2)
		],
		[
			new Piece(T.PAWN, player2),
			new Piece(T.PAWN, player2),
			new Piece(T.PAWN, player2),
			new Piece(T.PAWN, player2),
			new Piece(T.PAWN, player2),
			new Piece(T.PAWN, player2),
			new Piece(T.PAWN, player2),
			new Piece(T.PAWN, player2)
		],
		[0,0,/*new Piece(T.PAWN, player2)*/0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[
			new Piece(T.PAWN, player1),
			new Piece(T.PAWN, player1),
			new Piece(T.PAWN, player1),
			new Piece(T.PAWN, player1),
			new Piece(T.PAWN, player1),
			new Piece(T.PAWN, player1),
			new Piece(T.PAWN, player1),
			new Piece(T.PAWN, player1)
		],
		[
			new Piece(T.ROOK, 	player1),
			new Piece(T.KNIGHT, player1),
			new Piece(T.BISHOP, player1),
			new Piece(T.QUEEN, 	player1),
			new Piece(T.KING, 	player1),
			new Piece(T.BISHOP, player1),
			new Piece(T.KNIGHT, player1),
			new Piece(T.ROOK, 	player1)
		]
	] ;

	this.board.create(this.startPieces) ;
	
	this.switchTurn = function(){
		this.player1.hasTurn = !this.player1.hasTurn ;
		this.player2.hasTurn = !this.player2.hasTurn ;
		
		this.stats.updateTurn(player1, player2) ;
	}
	this.stats.updateTurn(player1, player2) ;
}
/*
	this.field = field ;
	this.grid = 
	]	;*/
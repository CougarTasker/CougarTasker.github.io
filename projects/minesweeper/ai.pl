hiden_bomb((1,1)).
hiden_bomb((10,11)).
hiden_bomb((2,3)).
hiden_bomb((2,4)).
hiden_bomb((3,2)).
hiden_bomb((9,4)).


width(16).
height(16).

withinBounds((X,Y)) :- X >= 0, Y>= 0, height(H), width(W), X < W, Y < H.


adjecentCell((X,Y),up,(X,Yn)) :- Y > 0, Yn is Y - 1.
adjecentCell((X,Y),down,(X,Yn)) :- height(H), Y < H, Yn is Y + 1.
adjecentCell((X,Y),left,(Xn,Y)) :- X > 0 , Xn is X - 1.
adjecentCell((X,Y),right,(Xn,Y)) :- width(W), X < W, Xn is X + 1.


adjecentCell(I,up_left,O) :- adjecentCell(I,up,M),adjecentCell(M,left,O).
adjecentCell(I,up_right,O) :- adjecentCell(I,up,M),adjecentCell(M,right,O).
adjecentCell(I,down_left,O) :- adjecentCell(I,down,M),adjecentCell(M,left,O).
adjecentCell(I,down_right,O) :- adjecentCell(I,down,M),adjecentCell(M,right,O).

stage(C,Count) :- findall(S,(adjecentCell(C,_,S),hiden_bomb(S)),Surrond), length(Surrond,Count), withinBounds(C).




holds(start,cellState((6,2),safe)).


% safe and unsafe cells remain that way
holds(step(S),cellState(C,safe)) :- holds(S,cellState(C,safe)).
holds(step(S),cellState(C,unsafe)) :- holds(S,cellState(C,unsafe)).


% a range can be computed from previous cell states in this state 
holds(step(S),range(UnknownCells,RangeBombCount)) :- 
  holds(S,cellState(C,safe)),
  stage(C,Count),
  findall(A,adjecentCell(C,_,A),Surrond),
  splitSurrond(Surrond,UnknownCells,KnownBombCount,S),
  RangeBombCount is Count-KnownBombCount.

% sub ranges are computed within the state too
holds(step(S),range(UnknownCells,RangeBombCount)) :-  
  holds(S,range(BiggerCells,BiggerCount)),
  holds(S,range(SmallerCells,SmallerCount)),
  length(BiggerCells, BiggerSize), 
  length(SmallerCells, SmallerSize),
  BiggerSize > SmallerSize,
  subset(SmallerCells,BiggerCells),
  subtract(BiggerCells,SmallerCells, UnknownCells),
  RangeBombCount is BiggerCount-SmallerCount.
% an unsafe square can be created from an unkown square if it is in a range where this must be a bomb 
holds(step(S),cellState(C,unsafe)) :-  
  holds(step(S),range(Cells,Count)),
  length(Cells,Count),
  member(C, Cells),
  unknown(C, S).
  

% a cell can be marked as safe in the like the above unsafe 
holds(step(S),cellState(C,safe)) :-  
  unknown(C,S), 
  holds(step(S),range(Cells,0)),
  member(C, Cells).

unknown(Cell,State) :- 
  \+holds(State,cellState(Cell,safe)),
  \+holds(State,cellState(Cell,unsafe)).

splitSurrond([],[],0,_).
splitSurrond([Head|Tail],UnknownCells,KnownBombCount,S) :- 
  holds(S,cellState(Head,unsafe)),
  splitSurrond(Tail,UnknownCells,OldKnownBombCount,S),
  KnownBombCount is OldKnownBombCount +1.
splitSurrond([Head|Tail],UnknownCells,KnownBombCount,S) :- 
  unknown(Head, S).
  splitSurrond(Tail,OldUnknownCells,KnownBombCount,S),
  UnknownCells = [Head | OldUnknownCells].











% stage((x,y),count).
% cellState(c,state).
% isBomb((X,Y)).
% range([cells],numerofBombs).



% adjecentBombCount(C,N) :- adjecentBombCount(C,N,0).



















  



$(document).ready(function(){
			//start();
			create(3);
		});
		$(window).on("load resize",function(){
		  var outer = $(".canvas");
		  var inner = $("canvas");
		  	w = outer.width();
		  	h = w/3;
		    inner.attr("height",h);
		    inner.attr("width",w);
		});
		var number
		function create(n){
			number = n;
			var b = new block(number,0,0);
			var c = new canvasWrapper(3,b);
			var s = new startHandeler(b);
			count = [number,0,0];
			c.start();
			$("a.button").click(s.start);
			$(".slider").on("input",function(event){
				s.end(function(){
					number = Number($(event.target).val());
					count = [0,0,0];
					nb = new block(number,s.b.x.get(),0);
					c.updateBlocks(nb);
					s.b = nb;
					
					count[nb.x.get()] = number;
				});
			});

		}
		function startHandeler(blocks){
			this.b = blocks;
			this.fun = function(){}
			this.stoping = false;
			var self = this;
			this.start = function(){
			//b.move(2,function(){b.move(0,function(){})});
					if(self.b.moving){
						self.end(self.start);
					}else{
						self.fun=function(){
							self.start();
						};
						self.b.move(self.b.other(1)).then(self.stop);
					}
				}
			this.end = function(done){
					if(self.b.moving && !self.stoping){
						self.fun = function(){
							self.b.move(self.b.x.get()).then(function(){
								self.b.toggleSpeed();
								self.stoping = false;
								done();
							});
						}
						self.b.toggleSpeed();
						self.b.stopMove();
						self.stoping = true;
					}else if(!self.stoping){
						done();
					}
			}
			this.stop = function(){
				self.fun();

			}
		}
		var count;
		function canvasWrapper(col,b){
			this.n = b.size;
			this.row = this.n+3;
			this.col = col;
			this.blocks = b;
			var self = this
			this.canvas = $("canvas")[0];
			this.ctx = this.canvas.getContext("2d");
			this.update = function(){

				self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
				self.ctx.fillStyle = "#292e1e";
				for(i =0; i<self.col;i++){
					self.drawRect(i,0,0,self.n+1);
				}
				
				var grd = self.ctx.createLinearGradient(0, 0, self.canvas.width, self.canvas.height);
				grd.addColorStop(0, "#9cde9f");
				grd.addColorStop(0.5, "#48a9a6");
				grd.addColorStop(1, "#9cde9f");
				self.ctx.fillStyle = grd;

				self.blocks.draw(self);
			}
			this.updateBlocks =function(b){
				self.blocks = b;
				self.n = b.size;
				self.row = self.n+3;
			};
			this.drawRect = function(x,y,width,height){
				twidth = Math.floor(((width+1)/(this.n+1))*(this.canvas.width/this.col));
				theight = height*Math.floor(this.canvas.height/this.row);
				tx = Math.floor((x+0.5)*this.canvas.width/this.col-0.5*twidth);
				ty = this.canvas.height-(theight+Math.floor(this.canvas.height/this.row)*y);

				var small = twidth;
				if(theight<twidth){
					small = theight;
				}
				this.ctx.lineWidth=small/3*2

				this.ctx.strokeStyle = this.ctx.fillStyle;
				tx += this.ctx.lineWidth/2;
				ty += this.ctx.lineWidth/2;
				twidth -= this.ctx.lineWidth;
				theight -= this.ctx.lineWidth;
				this.ctx.lineJoin = "round";
				this.ctx.lineCap = "round";
				this.ctx.beginPath();
				this.ctx.moveTo(tx,ty);
				this.ctx.lineTo(tx+twidth,ty);
				this.ctx.lineTo(tx+twidth,ty+theight);
				this.ctx.lineTo(tx,ty+theight);
				this.ctx.closePath();
				this.ctx.stroke();
			}
			this.start = function(){
				setInterval(this.update,1000/60);
			}
		};
		function anim(v){
			this.val = v;
			this.newval = v;
			this.start = -1;
			this.end = null;
			this.nduration = 5000;
			this.fduration = 1000;
			this.fast = false;
			this.duration = function(){
				if(this.fast){
					return this.fduration/(Math.pow(2,number)-1)/3;
				}else{
					l =this.nduration/(Math.pow(2,number)-1);
					min = 250;
					if(l < min){
						return min/3;
					}
					return l/3;
				}
			};
			this.set = function(v){
				this.val = v;
			}
			this.get = function(){
				if(this.start < 0){
					return this.val
				}else{
					if(Date.now() - this.start > this.duration()){
						this.start = -1;
						this.val = this.newval;
						this.end();
						return this.val;
					}else{
						n = (Date.now() - this.start)/this.duration();
						n= 3*Math.pow(n,2)-2*Math.pow(n,3);
						return  n*(this.newval - this.val) + this.val;
					}
				}
			}
			this.stop = function(){
				this.start = 0;
			}

			this.toggle = function(){
				this.fast = !this.fast;
			}
			this.done = function(){
				return start<0;
			}
			this.begin = function(value,end){
				this.newval = value;
				this.end = end;
				this.start = Date.now();
			}
		};
		
		function block(size,x,y){
			this.size = size;
			this.x = new anim(x);
			this.y = new anim(y);
			this.moving=false;
			this.movedone = function(){};
			var self = this;
			if(size > 1){
				this.above = new block(size-1,x,y+1)
			}else{
				this.above = null;
			}
			this.toggleSpeed =function(){
				this.x.toggle();
				this.y.toggle();
				if(this.above!= null){
					this.above.toggleSpeed();
				}
			}
			this.stopMove = function(){
				this.moving = false;
				if(this.above!= null){
					this.above.stopMove();
				}

			}
			this.move = async function(location){
				self.moving=true;
				if(location!= self.x.get()){
							if(self.above != null){
								//move the towers ontop out of the way
								await self.above.move(self.other(location));
							}
							if(!self.moving){
								return;
							}
							count[self.x.get()]-=1;
							count[location]+=1;
							
							await new Promise(function(r,j){
								self.y.begin(number+1.5,function(){//up
									self.x.begin(location,function(){//along
										self.y.begin(count[location]-1,r);//down
									});
								});
							});
							if(!self.moving){
								return;
							}
				}
				if(this.above != null){
						//move the towers that should be ontop to the correct position
						await self.above.move(location);
				}
				this.moving=false;
			}
			this.draw = function(canvas){
				
				if(this.above != null){
					this.above.draw(canvas);
				}
				canvas.drawRect(this.x.get(),this.y.get(),this.size,1);
			}
			this.other = function(location){
				options = new Set([0,1,2]);
				options.delete(location);
				options.delete(this.x.get());
				return options.values().next().value;
			}
		}
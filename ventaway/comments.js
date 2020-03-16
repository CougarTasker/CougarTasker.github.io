var comments = {
	id:-1,
	text:"",
	sub:[{
	id:0,
	text:"this is a comment",
	sub:[{id:1,text:"this is a sub comment",sub:[]},{id:2,text:"this is another sub comment",sub:[{id:3,text:"this is a sub comment",sub:[]},{id:4,text:"this is another sub comment",sub:[]}]}]
}]
}

var small = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Odio euismod lacinia at quis risus sed vulputate. Vitae et leo duis ut diam quam nulla. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Ante metus dictum at tempor commodo ullamcorper a. Phasellus faucibus scelerisque eleifend donec pretium vulputate sapien nec. Facilisis leo vel fringilla est ullamcorper eget nulla facilisi. A scelerisque purus semper eget duis. Sed turpis tincidunt id aliquet risus. Mi quis hendrerit dolor magna. Volutpat consequat mauris nunc congue nisi vitae suscipit tellus mauris. Ornare quam viverra orci sagittis eu volutpat odio facilisis mauris. Quis ipsum suspendisse ultrices gravida dictum fusce ut."
var med = small+"<br /><br />" + "Tellus cras adipiscing enim eu. Purus semper eget duis at tellus at urna condimentum. Varius vel pharetra vel turpis nunc. Nibh sed pulvinar proin gravida hendrerit. Erat pellentesque adipiscing commodo elit at imperdiet dui accumsan sit. Nisi porta lorem mollis aliquam. Dis parturient montes nascetur ridiculus mus mauris vitae. Sed arcu non odio euismod lacinia at quis risus sed. Facilisis gravida neque convallis a cras semper auctor neque. Pellentesque diam volutpat commodo sed egestas egestas fringilla. Risus in hendrerit gravida rutrum quisque non tellus orci. Tortor vitae purus faucibus ornare. Luctus accumsan tortor posuere ac ut consequat. Massa ultricies mi quis hendrerit dolor magna eget. Ut etiam sit amet nisl. Fermentum et sollicitudin ac orci phasellus egestas tellus. Eu sem integer vitae justo.";
var long = med +"<br /><br />" + "Platea dictumst quisque sagittis purus sit amet. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper. Id venenatis a condimentum vitae. Dictum at tempor commodo ullamcorper a lacus. Quis auctor elit sed vulputate mi sit amet mauris. Quis vel eros donec ac odio tempor orci dapibus. Consequat id porta nibh venenatis cras. Netus et malesuada fames ac turpis egestas maecenas pharetra convallis. Feugiat sed lectus vestibulum mattis ullamcorper velit sed. Quis enim lobortis scelerisque fermentum dui faucibus in ornare. Sapien nec sagittis aliquam malesuada. Porttitor massa id neque aliquam vestibulum morbi."
var comments2 = {id:10,text:"",sub:[{id:11,text:"diffrent comments",sub:[]},{id:12,text:small,sub:[{id:13,text:"that was a long one",sub:[]}]},{id:14,text:"like this one",sub:[]}]}
vents = [{text:small,image:"img_chania.jpg",alt:"Flowers in Chania",comments:comments},{text:med,image:"",comments:comments2},{text:long,image:"img_chania.jpg",alt:"Flowers in Chania",comments:comments}];
$(document).ready(function(){
	for(vent in vents){
		var v = new ventWrapper(vents[vent]);
		$(".container").append(v.generate());
		v.addHandelers();
	}
	autosize($('textarea'));
});
function commentWrapper(comments){
	this.comments = comments
	this.expandClick = function(event){
		var t = $(event.target);
		t.hide();
		t.parents(".comment").removeClass("hidden");
	};
	this.controlClick = function(event){
	var elem =  $(event.target);
	switch(elem.text()){
		case "mode_comment":

		break;
		case "arrow_downward":
			elem.toggleClass("forange");
		break;
		case "arrow_upward":
			elem.toggleClass("forange");
		break;
		}
	}
	this.addHandelers = function(){
		$(".expand>a").click(this.expandClick);
		$(".controls a").click(this.controlClick);
	}
	this.controls = `<div class="controls egreyd">
						<div class="left"></div>
						<div class="center">
							<a><i class="material-icons">mode_comment</i></a>
						</div>
						<div class="right">
							<a><i class="material-icons">arrow_downward</i></a>
							<a><i class="material-icons">arrow_upward</i></a>
						</div>
					</div>`;
	this.expand = 	`<div class="expand forange">
						<a class="bblack">click to expand</a>
					</div>`;
	this.generate = function(comment){
		var hidden= comment.sub.length > 0 && !(comment.text == "" && !comment.sub.length > 1);
		var message = '<div class="comment';
		if(hidden){
			message	+= ' hidden';
		}
		message	+= '" commentID="'+comment.id+'"">';
		if(comment.text.trim() != ""){
			message	+='<p>';
			message += comment.text;
			message +='</p>';
		}
		message += this.controls;
		for(x in comment.sub){
			message += this.generate(comment.sub[x]);
		}
		if(hidden){
		message += this.expand;
		}
		message +='</div>';
		return message;
	};
}
function ventWrapper(vent){
	this.vent = vent;
	this.comments = new commentWrapper(vent.comments);
	this.generate = function(){
		var message = `<div class="post bgreyl round">
							<div class="message">`;
		if(vent.image != ""){
			message += `<div class="round">
				<img class="blur" src="`;
			message += vent.image;
			message += `" alt="`;
			message += vent.alt;
			message += `" />
			</div>`;
		}
		message += vent.text;
		message += `</div>
					<div class="comments">`
		message += this.comments.generate(vent.comments);
		message +=	`</div>
				</div>`;
		return message
	};
	this.addHandelers = function(){
		this.comments.addHandelers();
		$(".message>div").click(function(event){
			$(event.target).toggleClass("blur");
		});
	}
}

			
		
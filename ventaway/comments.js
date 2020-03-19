var vents = [{id:"0",text:"one vent",image:"img_chania.jpg",alt:"some corona",comments:{id:"0_0",text:"",sub:[]}}]
var input = new usrInput();
var ventWrappers = []
$(document).ready(function(){
	for(vent in vents){
		var v = new ventWrapper(vents[vent]);
		$(".container").append(v.generate());
			v.addHandelers();
		ventWrappers.push(v);
	}
	autosize($('textarea'));
	input.addHandelers();
});
function usrInput(){
	this.addHandelers = function(){
		$(".userinput #submitForm").click(this.sendHandler);
		$(".userinput #attachImg").click(this.attachHandler);
		$(".userinput #responce").change(this.modeChange);
	};
	this.modeChange = function(event){
		var mode = $(event.target);
		var txt = mode.siblings("textarea");
		txt.val("");
		txt.focus();
		if(mode.val() < 0){
			txt.attr("placeholder","Send your vent");
		}else{
			txt.attr("placeholder","Comment");
		}

	}
	this.sendHandler = function(){
		var message = $(".userinput textarea").val().trim();
		if(message != ""){
			var url = ".";
		    $.ajax({
		           type: "POST",
		           url: url,
		           data: $(".userinput>form").serialize(),
		           success: function(data)
		           {
		               alert(data); 
		           }
		         });
		    var res = $(".userinput #responce").val()
		    if(res > 0){
			    new commentWrapper({text:"",id:"",sub:[]}).addComment($(".userinput #responce").val(),message);
		 	   $(".userinput textarea").val("");
		 	   $(".userinput #responce").val("-1").change();
		    }else{
		    	//new ventWrapper({text:"",id:"",image:"",alt:"",comments:[]}).addVent(message)
		    }

		}
    	return false; // avoid to execute the actual submit of the form.
	}
	this.attachHandler = function(){
		$("#img").click();
	}
}
function commentWrapper(comments){
	this.comments = comments
	this.expandClick = function(event){
		var t = $(event.target);
		t.hide();
		t.parents(".comment").removeClass("hidden");
	};
	this.addComment = function(parent,message){
		$("#COM"+parent).append(this.generate({text:message,id:parent+"_"+(this.max(parent)),sub:[]}));
		this.addHandelers();
	}
	this.max = function(id){
		return $("#COM"+id).children(".comment").length;
	}
	this.controlClick = function(event){
	var elem =  $(event.target);
	switch(elem.text()){
		case "mode_comment":
			$(".userinput #responce").val(elem.closest(".comment").attr('id').substring(3)).change();
		break;
		case "arrow_downward":
			
			elem.parent().toggleClass("forange");
		break;
		case "arrow_upward":
			elem.parent().toggleClass("forange");
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
		message	+= '" id="COM'+comment.id+'">';
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
	this.addVent = function(parent,message){
		$("#COM"+parent).append(this.generate({text:message,id:parent+"_"+(this.max(parent)),sub:[]}));
		this.addHandelers();
	}
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

var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var locations = ["Kingswood","Campus","Egham station"];
function Data(startday,endday,from,to,departtimes) {
	this.startday = startday;
	this.endday = endday;
	this.from = from;
	this.departtimes = departtimes;
	this.to = to;
	this.torides = function(){
		var out = [];
		for (var i = 0; i < this.departtimes.length; i++) {
			out.push(new ride(this.from,this.to,this.departtimes[i]));
		}
		return out
	}
}
function DataSet(from,to){
	var DataGroup = [];
	DataGroup.push(new Data(1,5,1,[2],["08:14","08:34","08:54","09:14","09:34","09:54","10:14","10:34","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:20","16:40","17:00","17:20","17:40","18:00","18:20","18:40","19:10","19:40"]));
	//weekday campus to egham station
	DataGroup.push(new Data(1,5,2,[1],["08:05","08:25","08:45","09:05","09:25","09:45","10:05","10:25","10:45","11:15","11:45","12:15","12:45","13:15","13:45","14:15","14:45","15:15","15:45","16:10","16:30","16:50","17:10","17:30","17:50","18:10","18:30","19:00","19:30"]));
	//weekday egham station to campus
	DataGroup.push(new Data(1,5,0,[1],["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30"]));
	//weekday kingswwod to campus 
	DataGroup.push(new Data(1,5,1,[0],["08:15","08:45","09:15","09:45","10:15","10:45","11:15","11:45","12:15","12:45","13:15","13:45","14:15","14:45","15:15","15:45","16:15","16:45","17:15","17:45","18:15","18:45","19:15"]));
	//weekday campus to kingswood 
	DataGroup.push(new Data(1,5,2,[0,1],["20:45","21:45","22:45","23:45","00:45"]));
	DataGroup.push(new Data(1,5,1,[0],["20:53","21:53","22:53","23:53","00:52"]));
	//evavnings egham station to campus to kingswood 
	DataGroup.push(new Data(1,5,0,[1,2],["21:15","22:15","23:15","00:15"]));
	DataGroup.push(new Data(1,5,1,[2],["21:34","22:34","23:34","00:34"]));
	//evenigs kingswood to campus to egham sation 
	DataGroup.push(new Data(6,0,2,[0,1],["11:30","12:30","13:30","15:30","16:30","17:30","18:30","19:32","20:45","21:45","22:45","23:45","00:45"]));
	DataGroup.push(new Data(6,0,1,[0],["11:46","12:46","13:46","14:46","15:46","16:46","17:46","18:46","19:44","20:53","21:53","22:53","23:53","00:53"]));	
	//weekend egham station to campus to kingswood 
	DataGroup.push(new Data(6,0,0,[1,2],["11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","21:15","22:15","23:15","00:15"]));
	DataGroup.push(new Data(6,0,1,[2],["11:15","12:15","13:15","15:15","16:15","17:15","18:15","19:15","21:34","22:34","23:34","00:34"]));
	//weekend kingswood to campus to egham station	
	var temp = [];
	for(x=0;x<DataGroup.length;x+=1){
		var n = DataGroup[x];
		if(test(n)){
			if (from == n.from&& n.to.includes(to)){
				temp.push(n);
			}
		}
	}
	DataGroup = [];
	for (var i = 0; i < temp.length; i++) {
		 DataGroup = DataGroup.concat(temp[i].torides());
	}
	DataGroup.sort(function(a,b){timeparser(a.time) - timeparser(b.time)});
	return DataGroup;
}
function test(n){
	if (n.startday<=n.endday){
		if(n.startday<= day() && day() <= n.endday ) {
			return true
		}else{
			return false
		}
	}else{
		if(n.endday >= day() || day() >= n.startday){
			return true
		}else{
			return false
		}
	}
}
function day(){
	return $("#day").prop('selectedIndex');
}
function Today(){
	var d = new Date();
	return day() == d.getDay();
}
function ride(from,to,time){
	this.from = from;
	this.to = to;
	this.time = time;
	this.display = function(now){
		var dest = "Going to: "
		for (var i = 0; i < this.to.length; i++) {
			dest+=locations[this.to[i]];
			if(i < this.to.length -1){
				dest += ","
			}
		}
		var string = dest;
		if(now){
			var time = TimeToText(timeparser(this.time)-GetTime())
			string+= "<br/>"+time + " untill arrival";
			if(time != -1){
				CreateContiner("Leaving at: "+this.time,string);
			}
		}else{
			CreateContiner("Leaving at: "+this.time,string);
		}
		
	}
}

function GetTime(){
	var d = new Date()
	var t = d.getSeconds();
	t+= d.getHours()*60*60;
	t+= d.getMinutes()*60;
	return t
}
Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}
function TimeToText(time){

	var hours = Math.floor(time/60/60);
	time -= hours *60*60;
	var minutes = Math.floor(time/60);
	if (hours > 0){
		return hours.pad(2) +":"+minutes.pad(2)
	}else if(hours<0){
		return -1
	}else if(minutes > 1){
		return minutes +" minutes"
	}else if(minutes = 1){
		return "1 minute"	
	}
}
function clearContiner(){
	$("#rides").empty();
}
function CreateContiner(titletext,text){
	var ele = $("<div></div>");
	ele.addClass("card yellow darken-3");
	var inner = $("<div></div>");
	inner.addClass("white-text card-content");

	var title = $("<span></span>");
	title.addClass("card-title");
	title.text(titletext);
	inner.append(title);
	inner.append(text);
	ele.append(inner);
	$("#rides").append(ele);
}
function timeparser(time){//string time to 24 hour time in seconds
	var hours = Number(time.substring(0,2));
	if(hours == 0){
		hours += 24;
	}
	var min = Number(time.substring(3,5));
	min+= hours*60;
	return min*60;
}
function addOption(selector,i,type){
	var ele = $("#"+selector);
	var optionBox = $("<option></option>");
	if(type){
		var text = locations[i];
	}else{
		var text = days[i];
		d = new Date();
		if(i==d.getDay()){
			text+= " - Today"
		}
	}
	optionBox.text(text);
	ele.append(optionBox);
}
function createoptions(selector,type,defult){
	if(type){
		var max = locations.length
	}else{
		var max = days.length
	}
	for (var i = 0; i < max; i++) {
		addOption(selector,i,type)
	}
	$("#"+selector).prop("selectedIndex",defult)

}
var live = true



function UpdateDetails(){
	var f = $("#from").prop('selectedIndex');
	var t = $("#to").prop('selectedIndex');
	var d = DataSet(f,t);
	clearContiner();
	for (var i = 0; i < d.length; i++) {
		d[i].display(live);
	}
	 arrcont();
}
 SelectorIndex ={
	Get:function(id){
		return $("#"+id).prop("selectedIndex");
	},
	Set:function(id,value){
		var ob = $("#"+id);
		ob.prop("selectedIndex",value);
		ob.formSelect();
	},
	object:function(id){
		return $("#"+id).parent().parent();
	}
}

function togglelive(){
		live = !live;
		
	 if(live){
	 	$("#live").html('<i class="material-icons left">calendar_today</i>All');
	 	$(".tiny").css("overflow","hidden");
	 	$(".tiny").animate({height:"0"},500);
	 $("#rides").animate({marginTop:($(".navbar").outerHeight()-55)+"px"},500);

	 	d = new Date();
	 	SelectorIndex.Set("day",d.getDay());
	 }else{
	 	$("#live").html('<i class="material-icons left">watch</i>Live');
	 	$(".tiny").animate({height:"55px"},500,function(){$(".tiny").css("overflow","unset");});
	 	
	 	$("#rides").animate({marginTop:($(".navbar").outerHeight()+55)+"px"},500);
	 }
	 UpdateDetails();
	 
}
$(".input-field").change(function(){UpdateDetails();});
$("document").ready(function(){
	live = true;
	 
	 $("#live").html('<i class="material-icons left">calendar_today</i>All');
	$("#live").click(function(){togglelive();});
	createoptions("from",true,0);
	createoptions("to",true,1);
	var d = new Date();
	createoptions("day",false,d.getDay());
	 $('select').formSelect();
	 UpdateDetails();
	 arrcont();
	});
$(window).resize(function(){arrcont();});
function arrcont(){
	$("#rides").css("margin-top",($(".navbar").outerHeight())+"px");
	if ($(window).height() - $('.pgfooter').outerHeight() > $('#rides')[0].getBoundingClientRect().bottom){
		$('.pgfooter').css("position","fixed");
	}else{
		$('.pgfooter').css("position","relative");
	}
}
$("#swap").click(function(){
	var t = SelectorIndex.Get("from");
	SelectorIndex.Set("from",SelectorIndex.Get("to"));
	SelectorIndex.Set("to",t);
	 UpdateDetails();
});
setInterval(UpdateDetails,30000);




var zindex=1;
var SelectDIV=function(name/*名字*/,css/*样式*/,clew/*图片提示内容*/){
	this.DIVvalue="";
	this.name=name;
	this.css=css;//是否有样式
	this.owidth = "50px"; //option的宽度
	this.cwidth = "30px"	//checkbox的宽度
	//判断对象是否存在
	var tmpdivobj=document.getElementById("div_list");
	 if (!tmpdivobj){
		//实例化下拉框（DIV）
		var divInit = new SelectDIV.StringBuild();
		divInit.push("<div id='d1"+name+"' style='position:absolute;display:none;z-index:50;width:120px; background: #e7f6fd;' align='left'>");
		divInit.push("<div id='d2"+name+"' style='font-size:12'>");
		divInit.push("</div>");
		divInit.push("<div id='d3"+name+"' style='height:25px;width:120px;margin-top:2px;margin-bottom:1px;' align='right'>");
		divInit.push(" <input style='width:60px' class='input' type='button' id='but"+name+"' value='确  定'/>");
		divInit.push("</div></div>");
		var divObj = document.createElement("div");		
		divObj.innerHTML = divInit.toString();
		divObj.id="div_list";
		//alert(divObj.innerHTML);
		document.body.appendChild(divObj);	
	}	
		this.setCheck();
	};
//字符串连接类
SelectDIV.StringBuild = function(){
	this.arr = new Array();
	this.push = function(str){
		this.arr.push(str);
	};
	this.toString = function(){
		return this.arr.join("");
	};
};
//存储DIV到数组
SelectDIV.ArrayD = new Array();
//存储对象到数组
SelectDIV.ArrayName=new Array();
//事件
SelectDIV.IsOK=function(bdiv,tdiv,checks,nname,but,img,nvalue,tname){
		but.onclick=img.onclick=function (){
		bdiv.style.zIndex=zindex;
		if(bdiv.style.display==""){
			bdiv.style.display='none'
			oldvalue=","+nname.value+",";
			nname.value=oldvalue;
			//alert(nname.value)
			//nvalue.value="";
			var length=tdiv.getElementsByTagName("input");
			if(length==null){
				return;
			}
			for(i=0;i<length.length;i++){
				var a=length[i].value;
				var aa=document.getElementById("o"+tname+a);
				if   (length[i].checked ==1){				
					if(oldvalue.indexOf(","+aa.value+",")==-1)
					nname.value+=aa.value+",";	
				}
				else{//如果未选中，应在列表中去掉
					if(oldvalue.indexOf(","+aa.value+",")!=-1){
						//alert("删除"+i+"==="+aa.value);
						nname.value=nname.value.replace(","+aa.value+",",",");
					}
					}
			}
				nname.value=nname.value.substr(1,nname.value.length-2);			
				nvalue.value=nname.value;	
			//}
			
			curTask.setProperty("Responser",nname.value);
		}
		else{
			var tt=nname;
			var  ttop    =  tt.offsetTop;          //TT控件的定位点高
			var  thei    =  tt.clientHeight;    //TT控件本身的高
			var  tleft  =  tt.offsetLeft;        //TT控件的定位点宽
			while  (tt  =  tt.offsetParent){ttop+=tt.offsetTop;  tleft+=tt.offsetLeft;}
			bdiv.style.top=ttop+thei+6;
			bdiv.style.left=tleft  +  1;
			//document.all.d1.style.width=document.all.textfield.width;
			var a=tdiv.getElementsByTagName("input");;
			//document.all.d1.style.z-index='1';
			if(a.length > 7){
				tdiv.style.overflowY = "scroll";
				tdiv.style.height = 150;
			}
			else{
				tdiv.style.overflowY = "hidden";
				tdiv.style.height = null;
			}
			bdiv.style.display="";
		}
		};
};
//设置事件
SelectDIV.prototype.setCheck=function (){
		var bdiv=document.getElementById("d1"+this.name);
		var tdiv=document.getElementById("d2"+this.name);
		var checks=document.getElementById("a1"+this.name);
		var nname=document.getElementById("n"+this.name);
		var but=document.getElementById("but"+this.name);
		var img=document.getElementById("img"+this.name);
		var nvalue=document.getElementById("id"+this.name);
		//return true;
		new SelectDIV.IsOK(bdiv,tdiv,checks,nname,but,img,nvalue,this.name);
	};
//添加元素
SelectDIV.prototype.addOption=function (name,value){
	var tdiv=document.getElementById("d2"+this.name);
	var divInit = new SelectDIV.StringBuild();
	divInit.push("<input type='checkbox' name='a1"+this.name+"' id='a1"+this.name+"' style='width:20px;' value='"+value+"'> <option name='o"+this.name+"' id='o"+this.name+value+"' value='"+name+"'  style='");
	divInit.push("width: "+this.owidth+";'>"+name+"</option><br/>");
	tdiv.insertAdjacentHTML("beforeEnd",divInit.toString());
};
//获取值
SelectDIV.prototype.getValue=function (){
	return document.getElementById("id"+this.name).value;
};
//初始化设置图片
SelectDIV.prototype.setImg=function (){
	if(typeof this.css != "undefined"){
	if(typeof this.css.img != "undefined")
		var img=document.getElementById("img"+this.name).src=this.css.img;	
	}
};
//设置样式
SelectDIV.prototype.setCss=function (){
		var obj = document.getElementById("d1"+this.name);
		var tdiv=document.getElementById("d2"+this.name);
		var thdiv=document.getElementById("d3"+this.name);
		var nname=document.getElementById("n"+this.name);
		var but=document.getElementById("but"+this.name);
		var img=document.getElementById("img"+this.name);
	if(typeof this.css != "undefined"){	
		if(typeof this.css.width != "undefined"){
			var nwidth=parseInt(this.css.width);
			var widthdw=this.css.width.substring(this.css.width.length-2);
			obj.style.width = nwidth*0.9+widthdw;	
			tdiv.style.width = nwidth*0.9+widthdw;
			thdiv.style.width = nwidth*0.9+widthdw;
			nname.style.width = nwidth*0.9+widthdw;
			//but.style.width = nwidth*0.2+widthdw;
			//img.style.width = nwidth*0.2+widthdw;
			this.cwidth=nwidth*0.25+widthdw;
			this.owidth=nwidth*0.7+widthdw;
		}
		if(typeof this.css.height != "undefined"){
			var nheight=parseInt(this.css.height);
			var heightdw=this.css.height.substring(this.css.height.length-2)
			obj.style.height = this.css.height; 
			tdiv.style.height = this.css.height;
			nname.style.height = nheight*0.9+heightdw;
			//but.style.height = nheight*0.2+heightdw;
		}
		if(typeof this.css.zindex != "undefined"){
			obj.style.zIndex=this.css.zindex;
		}
	}
};

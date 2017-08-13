	/**
	本文件是地图上的VML画笔对象。
	因为VML本身的性能和效果很不错，因此需要尽量用VML显示，因此克服了如下问题：
	1.如果用户没有添加V命名空间，则自动添加
	2.不需要用户在CSS之中注册VML,所有的V命名空间采用样式表直接指定
	3.通过直接的测试判断能不能使用VML
	@private
	@extends SFGraphics
	@class
	*/
	function SFGraphicsVml()
	{
		//注意，通过下面添加behavior样式表的支持，避免了强制要求页面添加VML样式的指定
		//<style type="text/css">v\:*{behavior:url(#default#VML);}</style>
		//使VML兼容性更高
		var div=this.div=document.createElement("v:shape");
		SFGlobal.setProperty(div,{unselectable:'on',filled:'true'});
		var stroke=this.stroke=document.createElement("v:stroke");
		SFGlobal.setProperty(stroke,{joinstyle:'round',endcap:'round'});
		div.appendChild(stroke);
		var fill=this.fill=document.createElement("v:fill");
		div.appendChild(fill);
		stroke.style.cssText=fill.style.cssText=div.style.cssText="behavior:url(#default#VML)";
		stroke.style.behavior=fill.style.behavior=div.style.behavior="url(#default#VML)";
		div.style.position='absolute';
		div.style.zIndex='420';
	}
	/**
	返回浏览器是否支持此画笔
	@returns {Bool} 如果支持返回true,否则返回false
	*/
	SFGraphicsVml.isSupport=function()
	{
		//先检查VML的支持
		if(typeof(SFGraphicsVml._isSupport)=="undefined")
		{
			//在这里通过直接测试的方式得到浏览器是不是支持VML的最权威数据
			//如果仅仅通过浏览器类型判断是不对的，就算用户使用了IE，假如通过以下语句来禁用VML,也是不支持VML的
			//regsvr32 /u "%CommonProgramFiles%\Microsoft Shared\VGX\vgx.dll
			try{
				//如果可能，先主动给页面添加命名空间数据
				//<html xmlns:v="urn:schemas-microsoft-com:vml">
				if(document.namespaces)
				{
					if(!document.namespaces.v){document.namespaces.add("v","urn:schemas-microsoft-com:vml");}
					var div=document.createElement("v:shape");
					div.style.cssText="behavior:url(#default#VML)"
					div.style.behavior="url(#default#VML)"
					document.body.appendChild(div);
					//下面判断这个对象是不是存在Path属性
					SFGraphicsVml._isSupport=typeof(div.Path)=="object";
					div.parentNode.removeChild(div);
				}
				else
				{
					SFGraphicsVml._isSupport=false;
				}
			}
			catch(e){SFGraphicsVml._isSupport=false;}
		}
		return SFGraphicsVml._isSupport;
	}
	SFGraphicsVml.prototype=new SFGraphics();
	/**
	设置绘制内容的显示位置
	@param {SFPoint} position
	*/
	SFGraphicsVml.prototype.setPosition=function(position)
	{
		var div=this.div;
		div.style.position="absolute"
		div.style.left=position.x+"px"
		div.style.top=position.y+"px"
	}
	/**
	开始绘制过程
	@param {SFPoint} origin 绘制的原点位置
	@param {Number} scale 当前地图的缩放比例
	@param {Point} size 绘制区域的大小
	*/
	SFGraphicsVml.prototype.start=function(origin,scale,size)
	{
		SFGlobal.setProperty(this,{origin:origin,size:size,scale:scale,pathArr:[]});
		this.div.coordsize=parseInt(size.x*256/scale)+","+parseInt(size.y*256/scale)
	}
	/**
	将绘制点移动到指定的点
	@param {SFPoint} point
	*/
	SFGraphicsVml.prototype.moveTo=function(point)
	{
		var pathArr=this.pathArr,scale=this.scale,origin=this.origin;
		pathArr.push("m");
		pathArr.push(parseInt((point.x-origin.x)*256/scale));
		pathArr.push(parseInt((point.y-origin.y)*256/scale));
	}
	/**
	从绘制点划线到指定的点
	@param {SFPoint} point
	*/
	SFGraphicsVml.prototype.lineTo=function(point)
	{
		var pathArr=this.pathArr,scale=this.scale,origin=this.origin;
		pathArr.push("l");
		pathArr.push(parseInt((point.x-origin.x)*256/scale));
		pathArr.push(parseInt((point.y-origin.y)*256/scale));
	}
	/**
	结束绘制过程
	*/
	SFGraphicsVml.prototype.finish=function()
	{
		var pathArr=this.pathArr;
		pathArr.push("e");
		this.div.path=this.pathArr.join(" ");
		this.setScale(this.scale);
	}
	/**
	清除绘制的内容
	*/
	SFGraphicsVml.prototype.clear=function()
	{
		this.div.style.display='none'
		this.div.path="e";
		this.div.style.display=''
	}
	/**
	设置绘制内容的缩放比例
	@param {Number} scale 缩放比例
	*/
	SFGraphicsVml.prototype.setScale=function(scale)
	{
		var div=this.div,size=this.size;
		div.style.width=size.x/scale+"px"
		div.style.height=size.y/scale+"px"
	}
	/**
	设置线条的颜色
	@param {String} color 颜色字符串，可以为"blue"或"#FFFF00"
	*/
	SFGraphicsVml.prototype.setLineColor=function(color)
	{
		var div=this.div;
		if(color=="transparent" || color=="")
		{
			div.stroked=false;
		}
		else
		{
			div.stroked=true;
			div.strokecolor=color;
		}
	}
	/**
	设置填充区域的颜色
	@param {String} color 颜色字符串，可以为"blue"或"#FFFF00"
	*/
	SFGraphicsVml.prototype.setFillColor=function(color)
	{
		var div=this.div;
		if(color=="transparent" || color=="")
		{
			div.filled=false;
		}
		else
		{
			div.filled=true;
			div.fillcolor=color;
		}
	}
	/**
	设置显示不透明度
	@param {Number} opacity 不透明度(0-1的小数，0代表完全透明，1代表完全不透明)
	*/
	SFGraphicsVml.prototype.setOpacity=function(opacity)
	{
		this.stroke.opacity=opacity;
		this.fill.opacity=opacity;
	}
	/**
	设置线条显示的线宽
	@param {Number} weight 线条粗细
	*/
	SFGraphicsVml.prototype.setLineWeight=function(weight){this.div.strokeweight=weight;}
	/**
	设置线条显示的样式
	@param {String} style 线条样式名称，支持如下几种："solid"(实线),"dotted"(点线),"dashed"(虚线)
	*/
	SFGraphicsVml.prototype.setLineStyle=function(style)
	{
		switch(style.toLowerCase())
		{
			case "dotted":
				style="ShortDot";
				break;
			case "dashed":
				style="ShortDash";
				break;
		}
		//vml支持的线型列表(不区分大小写)：
		//Solid (default) ,ShortDash ,ShortDot ,ShortDashDot ,ShortDashDotDot ,Dot ,Dash ,LongDash ,DashDot ,LongDashDot ,LongDashDotDot
		this.stroke.dashstyle=style;
	}
	window.SFGraphicsVml=SFGraphicsVml
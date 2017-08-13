	/**
	使用SVG技术实现的画笔
	@private
	@extends SFGraphics
	@class
	*/
	function SFGraphicsSvg()
	{
		var svgNs='http://www.w3.org/2000/svg';
		var div=this.div=document.createElementNS(svgNs,'svg');
		SFGlobal.setProperty(div.style,{position:'absolute',zIndex:420});
		var path=this.path=document.createElementNS(svgNs,'path');
		div.appendChild(path);
	}
	/**
	返回浏览器是否支持此画笔
	@returns {Bool} 如果支持返回true,否则返回false
	*/
	SFGraphicsSvg.isSupport=function()
	{
		if(typeof(SFGraphicsSvg._isSupport)=="undefined")
		{
			if(document.createElementNS)
			{
				var svgNs='http://www.w3.org/2000/svg';
				var div=document.createElementNS(svgNs,'svg');
				SFGraphicsSvg._isSupport=typeof(div.ownerSVGElement)=="object";
			}
			else
			{
				SFGraphicsSvg._isSupport=false;
			}
		}
		return SFGraphicsSvg._isSupport;
	}
	SFGraphicsSvg.prototype=new SFGraphics();
	/**
	开始绘制过程
	@param {SFPoint} origin 绘制的原点位置
	@param {Number} scale 当前地图的缩放比例
	@param {SFPoint} size 绘制区域的大小
	*/
	SFGraphicsSvg.prototype.start=function(origin,scale,size)
	{
		SFGlobal.setProperty(this,{origin:origin,size:size,scale:scale,pathArr:[]});
	}
	/**
	将绘制点移动到指定的点
	@param {SFPoint} point
	*/
	SFGraphicsSvg.prototype.moveTo=function(point)
	{
		var pathArr=this.pathArr,scale=this.scale,origin=this.origin;
		pathArr.push("M");
		pathArr.push((point.x-origin.x)/scale);
		pathArr.push((point.y-origin.y)/scale);
	}
	/**
	从绘制点划线到指定的点
	@param {SFPoint} point
	*/
	SFGraphicsSvg.prototype.lineTo=function(point)
	{
		var pathArr=this.pathArr,scale=this.scale,origin=this.origin;
		pathArr.push("L");
		pathArr.push((point.x-origin.x)/scale);
		pathArr.push((point.y-origin.y)/scale);
	}
	/**
	结束绘制过程
	*/
	SFGraphicsSvg.prototype.finish=function()
	{
		var pathArr=this.pathArr;
		this.path.setAttribute("d",this.pathArr.join(" "));
		this.setScale(this.scale);
	}
	/**
	清除绘制的内容
	*/
	SFGraphicsSvg.prototype.clear=function(){this.path.setAttribute("d","");}
	/**
	设置绘制内容的缩放比例
	@param {Number} scale 缩放比例
	*/
	SFGraphicsSvg.prototype.setScale=function(scale)
	{
		var size=this.size,lineWeight=this.lineWeight;
		if(!size){return;}
		SFGlobal.setProperty(this.div.style,{width:size.x/scale+lineWeight*2+"px",height:size.y/scale+lineWeight*2+"px"});
		this.path.setAttribute("transform","scale("+(this.scale/scale)+") translate("+(lineWeight)+","+(lineWeight)+")");
		this.lastScale=scale;
		this.path.setAttribute("style",this.getStyle());
	}
	/**
	设置绘制内容的显示位置
	@param {__Point} position
	*/
	SFGraphicsSvg.prototype.setPosition=function(position)
	{
		if(!position){return;}
		this.lastPosition=position;
		var lineWeight=this.lineWeight;
		SFGlobal.setProperty(this.div.style,{position:'absolute',left:(position.x-lineWeight)+"px",top:(position.y-lineWeight)+"px"});
	}
	/**
	设置线条的颜色
	@param {String} color 颜色字符串，可以为"blue"或"#FFFF00"
	*/
	SFGraphicsSvg.prototype.setLineColor=function(color)
	{
		if(color=="transparent" || !color){color="none"}
		this.lineColor=color;
		this.path.setAttribute("style",this.getStyle());
	}
	/**
	设置填充区域的颜色
	@param {String} color 颜色字符串，可以为"blue"或"#FFFF00"
	*/
	SFGraphicsSvg.prototype.setFillColor=function(color)
	{
		if(color=="transparent" || !color){color="none"}
		this.bgcolor=color;
		this.path.setAttribute("style",this.getStyle());
	}
	/**
	设置显示不透明度
	@param {Number} opacity 不透明度(0-1的小数，0代表完全透明，1代表完全不透明)
	*/
	SFGraphicsSvg.prototype.setOpacity=function(opacity)
	{
		this.opacity=opacity;
		this.path.setAttribute("style",this.getStyle());
	}
	/**
	设置线条显示的线宽
	@param {Number} weight 线条粗细
	*/
	SFGraphicsSvg.prototype.setLineWeight=function(weight)
	{
		this.lineWeight=weight;
		//这里不能直接设置scale
		this.setScale(this.lastScale);
		this.setPosition(this.lastPosition);
		//this.path.setAttribute("style",this.getStyle());
	}
	/**
	设置线条显示的样式
	@param {String} style 线条样式名称，支持如下几种："solid"(实线),"dotted"(点线),"dashed"(虚线)
	*/
	SFGraphicsSvg.prototype.setLineStyle=function(style)
	{
		var dashArray;
		switch(style.toLowerCase())
		{
			case "dotted":
				dashArray=[1,6];
				break;
			case "dashed":
				dashArray=[6,6];
				break;
			default:
				break;
		}
		this.dashArray=dashArray;
		this.path.setAttribute("style",this.getStyle());
	}
	/**
	根据设置获取SVG的样式字符串
	@private
	@returns {String}
	*/
	SFGraphicsSvg.prototype.getStyle=function()
	{
		var arr=[];
		arr.push("fill:none");
		arr.push("opacity:"+this.opacity);
		arr.push("stroke:"+this.lineColor);
		arr.push("stroke-linecap:round");
		arr.push("stroke-linejoin:round");
		arr.push("stroke-dasharray:"+this.dashArray);
		arr.push("stroke-width:"+this.lineWeight/this.scale*this.lastScale);
		arr.push("fill:"+this.bgcolor);
		return arr.join(";");
	}
	window.SFGraphicsSvg=SFGraphicsSvg
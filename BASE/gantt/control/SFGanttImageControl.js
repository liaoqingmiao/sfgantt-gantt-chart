	/**
	这是一个甘特图功能控件，本控件用来管理甘特图上所有图片的加载，从而实现图片分块加载的功能
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttImageControl()
	{
		this.sprites={
			icon:{imageSize:[128,48],path:'icon/icon_default'},
			symbol:{imageSize:[36,168],path:'symbol/symbol_000000',autoColor:1},
			scroll:{imageSize:[48,86],path:'scroll/scroll'}
		}
		this.images={
			tab_left:{size:[2,23]},
			tab_right:{size:[2,23]},
			tab_bg:{size:[1,23]},
			tab_f_right:{size:[2,23]},
			tab_f_bg:{size:[1,23]},
			tab_bg:{size:[1,23]},
			tab_bg:{size:[1,23]},
			collapse_open:{size:[9,9]},
			collapse_close:{size:[9,9]},
			map_mask:{size:[4,2]},
			scroll_barbg:{sprite:'scroll',spritePoint:[0,51],spriteSize:[48,17]},
			scroll_barright:{sprite:'scroll',spritePoint:[28,0],spriteSize:[3,17]},
			scroll_barcenter:{sprite:'scroll',spritePoint:[20,0],spriteSize:[8,17]},
			scroll_barleft:{sprite:'scroll',spritePoint:[17,0],spriteSize:[3,17]},
			scroll_barbg1:{sprite:'scroll',spritePoint:[0,34],spriteSize:[48,17]},
			scroll_barright1:{sprite:'scroll',spritePoint:[28,17],spriteSize:[3,17]},
			scroll_barcenter1:{sprite:'scroll',spritePoint:[20,17],spriteSize:[8,17]},
			scroll_barleft1:{sprite:'scroll',spritePoint:[17,17],spriteSize:[3,17]},
			scroll_left:{sprite:'scroll',spritePoint:[0,0],spriteSize:[17,17]},
			scroll_right:{sprite:'scroll',spritePoint:[31,0],spriteSize:[17,17]},
			scroll_left1:{sprite:'scroll',spritePoint:[0,17],spriteSize:[17,17]},
			scroll_right1:{sprite:'scroll',spritePoint:[31,17],spriteSize:[17,17]},
			scroll_bg:{sprite:'scroll',spritePoint:[0,68],spriteSize:[48,18]},
			dragflag_right:{size:[3,21]},
			dragflag_left:{size:[2,21]},
			logo:{size:[36,36]},
			task_head_1:{sprite:'symbol',spritePoint:[0,0],spriteSize:[11,11]},
			task_head_2:{sprite:'symbol',spritePoint:[12,0],spriteSize:[11,11]},
			task_head_3:{sprite:'symbol',spritePoint:[24,0],spriteSize:[11,11]},
			task_head_3_hollow:{sprite:'symbol',spritePoint:[0,12],spriteSize:[11,11]},
			task_head_4:{sprite:'symbol',spritePoint:[12,12],spriteSize:[11,11]},
			task_head_5:{sprite:'symbol',spritePoint:[24,12],spriteSize:[11,11]},
			task_head_6:{sprite:'symbol',spritePoint:[0,24],spriteSize:[11,11]},
			task_head_7:{sprite:'symbol',spritePoint:[12,24],spriteSize:[11,11]},
			task_head_8:{sprite:'symbol',spritePoint:[24,24],spriteSize:[11,11]},
			task_head_9:{sprite:'symbol',spritePoint:[0,36],spriteSize:[11,11]},
			task_head_10:{sprite:'symbol',spritePoint:[12,36],spriteSize:[11,11]},
			task_head_11:{sprite:'symbol',spritePoint:[24,36],spriteSize:[11,11]},
			task_head_12:{sprite:'symbol',spritePoint:[0,48],spriteSize:[11,11]},
			task_head_13:{sprite:'symbol',spritePoint:[12,48],spriteSize:[11,11]},
			task_head_14:{sprite:'symbol',spritePoint:[24,48],spriteSize:[11,11]},
			task_head_15:{sprite:'symbol',spritePoint:[0,60],spriteSize:[11,11]},
			task_head_16:{sprite:'symbol',spritePoint:[12,60],spriteSize:[11,11]},
			task_head_17:{sprite:'symbol',spritePoint:[24,60],spriteSize:[11,11]},
			task_head_18:{sprite:'symbol',spritePoint:[0,72],spriteSize:[11,11]},
			task_head_19:{sprite:'symbol',spritePoint:[12,72],spriteSize:[11,11]},
			task_head_19_hollow:{sprite:'symbol',spritePoint:[24,72],spriteSize:[11,11]},
			task_head_20:{sprite:'symbol',spritePoint:[0,84],spriteSize:[11,11]},
			arrow_down:{sprite:'symbol',spritePoint:[13,84],spriteSize:[9,5]},
			arrow_left:{sprite:'symbol',spritePoint:[24,85],spriteSize:[5,9]},
			arrow_right:{sprite:'symbol',spritePoint:[30,85],spriteSize:[5,9]},
			arrow_up:{sprite:'symbol',spritePoint:[13,90],spriteSize:[9,5]},
			grid_1:{sprite:'symbol',spritePoint:[0,96],spriteSize:[36,36]},
			grid_2:{sprite:'symbol',spritePoint:[0,132],spriteSize:[36,36]},
			icon_finished:{sprite:'icon',spritePoint:[0,16],spriteSize:[16,16]},
			icon_constraint2:{sprite:'icon',spritePoint:[0,0],spriteSize:[16,16]},
			icon_constraint3:{sprite:'icon',spritePoint:[16,0],spriteSize:[16,16]},
			icon_constraint4:{sprite:'icon',spritePoint:[32,0],spriteSize:[16,16]},
			icon_constraint5:{sprite:'icon',spritePoint:[48,0],spriteSize:[16,16]},
			icon_constraint6:{sprite:'icon',spritePoint:[64,0],spriteSize:[16,16]},
			icon_constraint7:{sprite:'icon',spritePoint:[80,0],spriteSize:[16,16]},
			icon_notes:{sprite:'icon',spritePoint:[32,16],spriteSize:[16,16]},
			icon_hyperlink:{sprite:'icon',spritePoint:[16,16],spriteSize:[16,16]},
			icon_taskstatus:{sprite:'icon',spritePoint:[112,16],spriteSize:[16,16]},
			icon_taskinfo:{sprite:'icon',spritePoint:[80,16],spriteSize:[16,16]},
			icon_taskgoto:{sprite:'icon',spritePoint:[64,16],spriteSize:[16,16]},
			icon_print:{sprite:'icon',spritePoint:[48,16],spriteSize:[16,16]},
			icon_zoomin:{sprite:'icon',spritePoint:[0,32],spriteSize:[16,16]},
			icon_zoomout:{sprite:'icon',spritePoint:[16,32],spriteSize:[16,16]},
			resize:{sprite:'icon',spritePoint:[32,32],spriteSize:[16,16]}
		};
	}
	SFGanttImageControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttImageControl.prototype.initialize=function(gantt)
	{
		this.gantt=gantt;
		gantt.createImage=SFEvent.getCallback(this,SFGanttImageControl.createImage);
		gantt.setImageSrc=SFEvent.getCallback(this,SFGanttImageControl.setImageSrc);
		gantt.setBackgroundImage=SFEvent.getCallback(this,SFGanttImageControl.setBackgroundImage);
		return true;
	}
	/**
	创建图片
	@private
	@name SFGantt.prototype.createImage
	@function
	@param {String} name
	@param {Json} config
	@returns {HtmlElement}
	*/
	SFGanttImageControl.createImage=function(name,config)
	{
		config=config||{};
		config.doc=this.gantt.container?this.gantt.container.ownerDocument:document;
		var imgConfig=this.images[name],style={};
		if(!imgConfig){return SFGlobal.createImage(name,config);}
		if(imgConfig.sprite)
		{
			var sprite=this.sprites[imgConfig.sprite],path=sprite.path;
			SFGlobal.setProperty(style,sprite);
			SFGlobal.setProperty(style,imgConfig);
			SFGlobal.setProperty(style,config);
			if(sprite.autoColor && config.color)
			{
				path=path.replace("000000",config.color.substring(1).toUpperCase());
			}
			return SFGlobal.createImage(this.gantt.imgPath+path+this.gantt.imgType,style);
		}
		SFGlobal.setProperty(style,this.images[name]);
		SFGlobal.setProperty(style,config);
		return SFGlobal.createImage(this.gantt.imgPath+name+this.gantt.imgType,style);
	}
	/**
	设置图片的URL地址
	@private
	@name SFGantt.prototype.setImageSrc
	@function
	@param {HtmlElement} img
	@param {String} name
	*/
	SFGanttImageControl.setImageSrc=function(img,name)
	{
		var imgConfig=this.images[name];
		if(imgConfig)
		{
			if(imgConfig.sprite)
			{
				SFGlobal.setProperty(img.firstChild.style,{left:-imgConfig.spritePoint[0]+'px',top:-imgConfig.spritePoint[1]+'px'});
				return;
			}
			SFGlobal.setImageSrc(img,this.gantt.imgPath+name+this.gantt.imgType);
		}
	}
	/**
	设置背景图片
	@private
	@name SFGantt.prototype.setBackgroundImage
	@function
	@param {HtmlElement} div
	@param {String} name
	@param {Json} config
	@returns {HtmlElement}
	*/
	SFGanttImageControl.setBackgroundImage=function(div,name,config)
	{
		var imgConfig=this.images[name];
		if(imgConfig)
		{
			if(imgConfig.sprite)
			{
				var style={},sprite=this.sprites[imgConfig.sprite],path=sprite.path;
				SFGlobal.setProperty(style,sprite);
				SFGlobal.setProperty(style,imgConfig);
				SFGlobal.setProperty(style,config);
				if(sprite.autoColor && config && config.color)
				{
					path=path.replace("000000",config.color.substring(1).toUpperCase());
				}
				SFGlobal.setBackgroundImage(div,this.gantt.imgPath+path+this.gantt.imgType,style);
				return;
			}
			SFGlobal.setBackgroundImage(div,this.gantt.imgPath+name+this.gantt.imgType,this.images[name]);
		}
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttImageControl.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.createImage;
		delete gantt.setImageSrc;
		delete gantt.setBackgroundImage;
		delete this.gantt
	}
	window.SFGanttImageControl=SFGanttImageControl;
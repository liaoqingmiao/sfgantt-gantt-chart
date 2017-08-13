	/**
	甘特图之中一些公用函数，这些函数都是静态函数
	@class
	*/
	function SFGlobal(){}
	/**
	将pro的所有属性设置给obj
	@private
	@param {Object} obj	对象
	@param {Json} pro	需要设置的属性集合
	*/
	SFGlobal.setProperty=function(obj,pro)
	{
		if(typeof(obj.cssText)!='undefined')
		{
			var text=[obj.cssText];
			var key;
			for(key in pro)
			{
				var cssKey=key.replace(new RegExp("[A-Z]","g"),function(a){return "-"+a.toLowerCase()});
				cssKey=cssKey.replace(/^ms-/,"-ms-");
				text.push(cssKey+":"+pro[key]);
			}
			obj.cssText=text.join(";");
			return;
		}
		var key;
		for(key in pro)
		{
			obj[key]=pro[key];
		}
	}
	/**
	判断浏览器是否是兼容性模式(这一项是临时解决方案，因此还不很清晰)
	@returns {Bool} 如果是兼容性模式，返回true
	@private
	*/
	SFGlobal.isCompatible=function()
	{
		if(!document.all){return false;}
		var reg=new RegExp("MSIE\\s*([0-9]+)");
		var result;
		if(result=reg.exec(navigator.userAgent))
		{
			if(parseInt(result[0])<7){return false}
		}
		return true;
	}
	/**
	根据时间字符串返回需要的时间
	@param {String} str 日期时间字符串
	@returns {Date} 返回JavaScript的Date对象
	*/
	SFGlobal.getDate=function(str)
	{
		var rep,result;
		rep=new RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})[ t]([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})(?:\\.[0-9]{1,3})?(?:[\\+\\-][0-9]{1,2}:[0-9]{1,2})?$","ig");
		var result=rep.exec(str);
		if(result)
		{
			return new Date(result[1],result[2]-1,result[3],result[4],result[5],result[6]);
		}
		return new Date(str);
	}
	/**
	通过在前面添加字符的方法得到指定大小的串
	@private
	@param {String} str 原字符串
	@param {Number} length 指定的长度
	@param {String} [initStr=" "] 在前面添加的字符，默认为一个空格
	@returns {Date} 返回添加后的字符串
	*/
	SFGlobal.getLengthStr=function(str,length,initStr)
	{
		if(!str){str=' ';}
		if(!initStr){initStr="";}
		initStr=initStr.toString();
		while(initStr.length<length)
		{
			initStr=str+initStr;
		}
		return initStr;
	}
	/**
	根据时间对象返回指定格式的时间字符串，通常用在事件的输出和显示上
	@param {Date} time JavaScript语言的Date对象
	@param {String} format 返回值格式，支持以下格式：
	<ul>
		<li>	ddd	:		当前星期几的数字，从0到6，0代表星期天，如果在配置参数之中指定了weekStrs，则使用weekStrs数组的对应值；</li>
		<li>	dd	:		以有前导零的数字来显示日 (01 – 31)；</li>
		<li>	d	:		以没有前导零的数字来显示日 (1 – 31)；</li>
		<li>	yyyy:		以四位数来表示年 ，例如2009；</li>
		<li>	yy	:		以二位数来表示年 ，例如09；</li>
		<li>	MM	:		 以有前导零的数字来显示月 (01 – 12)；</li>
		<li>	M	:		 以没有前导零的数字来显示月 (1 – 12)；</li>
		<li>	hhh	:		 1代表上半年，2代表下半年。</li>
		<li>	HH	:		  以有前导零的数字来显示小时 (00– 23)；</li>
		<li>	H	:		  以没有前导零的数字来显示小时 (0 – 23)；</li>
		<li>	mm	:		  以有前导零的数字来显示分钟数 (01 – 59)；</li>
		<li>	m	:		  以没有前导零的数字来显示分钟数 (1 – 12)；</li>
		<li>	ss	:		  以有前导零的数字来显示秒 (00 – 59)；</li>
		<li>	s	:		  以没有前导零的数字来显示秒 (0 – 59)；</li>
		<li>	q	:		  将一年中的季以数值表示 (1 – 4)；</li>
		<li>	\*	:		假如要在输出结果之中直接使用上面的字符，应该在前面加反斜杠</li>
	</ul>
	@returns {String} 返回日期时间字符串
	@param {Json} config  输出的其他配置信息
	@param {Array} config.weekStrs  显示星期的替代字符串数组，例如
	@example
	SFGlobal.getDateString(new Date(),"yyyy-MM-dd HH:mm:ss")
	SFGlobal.getDateString(new Date(),"yyyy-MM-dd HH:mm:ss 星期ddd",{weekStrs:['日','一','二','三','四','五','六']})
	*/
	SFGlobal.getDateString=function(time,format,config)
	{
		if(!time){return "";}
		config=config?config:{};
		if(format=='s'){format='yyyy-MM-ddTHH:mm:ss';}
		var year=time.getYear();
		if(year<1900){year+=1900;}

		var arr=[];
		var rep=function (str)
		{
			switch(str)
			{
				case "ddd":
					return config.weekStrs?config.weekStrs[time.getDay()]:time.getDay();
				case "dd":
					return SFGlobal.getLengthStr('0',2,time.getDate());
				case "d":
					return time.getDate();
				case "yyyy":
					return SFGlobal.getLengthStr('0',4,year);
				case "yy":
					return SFGlobal.getLengthStr('0',2,year%100);
				case "MM":
					return SFGlobal.getLengthStr('0',2,time.getMonth()+1);
				case "M":
					return time.getMonth()+1;
				case "hhh":
					return Math.ceil((time.getMonth()+1)/6);
				case "HH":
					return SFGlobal.getLengthStr('0',2,time.getHours());
				case "H":
					return time.getHours();
				case "mm":
					return SFGlobal.getLengthStr('0',2,time.getMinutes());
				case "m":
					return time.getMinutes();
				case "ss":
					return SFGlobal.getLengthStr('0',2,time.getSeconds());
				case "s":
					return time.getSeconds();
				case "q":
					return Math.ceil((time.getMonth()+1)/3);
			}
			return str;
		}
		format=format.replace(new RegExp('\\\\([a-zA-Z])','g'),function(a,b){arr.push(b);return '\\';});
		format=format.replace(new RegExp('([a-zA-Z])\\1*','g'),rep);
		format=format.replace(new RegExp('\\\\','g'),function(a){return arr.shift();});
		return format;
	}
	/**
	替换字符串之中的参数项，参数使用%aaa的形式指定，替换成params集合之中的aaa项的值
	@private
	@param {String} format 原字符串
	@param {Json} params 替换的值集合
	@returns {String} 返回替换后的字符串
	*/
	SFGlobal.formatString=function(format,params)
	{
		if(typeof(params)!="object"){params=[params]}
		/**
		对正则表达式结果进行替换的函数
		@ignore
		@private
		@param {String} p1 正则表达式匹配结果0
		@param {String} p2 正则表达式匹配结果1
		@returns {String} 替换后的字符串
		*/
		function rep(p1,p2){return params[p2];}
		return format.replace(new RegExp("%([0-9a-zA-Z_]+)","gi"),rep);
	}
	/**
	设置层的鼠标样式
	@private
	@param {HtmlElement} obj 指定的层
	@param {String} style 鼠标样式名称或.cur文件的路径
	*/
	SFGlobal.setCursor=function(obj,style)
	{
		if(style.indexOf(",")>0)
		{
			var styles=style.split(",");
			for(var i=0;i<styles.length;i++)
			{
				if(SFGlobal.setCursor(obj,styles[i])){return true;}
			}
			return false;
		}
		try
		{
			if(style.toLowerCase().indexOf(".cur")>0)
			{
				style="url("+style+"),auto";
			}
			style=style.toLowerCase();
			if(style=="hand" && !document.all)
			{
				style="pointer";
			}
			obj.style.cursor = style;
			return true;
		}
		catch(e){return false;}
	}
	/**
	设置层的不透明度
	@private
	@param {HtmlElement} obj 指定的层
	@param {Number} opacity 不透明度参数0-1之间的浮点数，0代表完全透明，1代表完全不透明
	*/
	SFGlobal.setOpacity=function(obj,opacity)
	{
		obj.style.filter="progid:DXImageTransform.Microsoft.Alpha(opacity="+parseInt(opacity*100)+")";
		obj.style.MozOpacity =opacity;
		obj.style.opacity=opacity;
	}
	/**
	在数组之中查找指定的项
	@private
	@param {Array} array 数组
	@param {Object} item 被查找的项
	@param {Function} [func] 如果搜寻的时候需要使用函数处理结果再和item比较，则传递此函数
	@param {Bool} [all=false] 默认只查找一项就退出，如果要查找所有符合的项，可设置为true
	@returns {Object|Object[]} 在all参数为false时，返回被删除的项,否则返回找到的所有项数组
	*/
	SFGlobal.findInArray=function(array,item,func,all)
	{
		if(!array){return}
		var result=all?[]:null;
		/**
		比较数组之中的项是否匹配的函数
		@ignore
		@private
		@param {Object} p1 正则表达式匹配结果0
		@param {Object} p2 正则表达式匹配结果1
		@returns {Bool} 如果匹配，返回true
		*/
		func=func?func:function(a,b){return a==b};
		for(var i=array.length-1;i>=0;i--)
		{
			if(func(array[i],item))
			{
				if(all)
				{
					result.push(result);
				}
				else
				{
					return array[i];
				}
			}
		}
		return result;
	}
	/**
	在数组之中删除指定的项
	@private
	@param {Array} array 数组
	@param {Object} item 需要被删除的项
	@param {Bool} [all=false] 默认只删除一项就退出，如果要删除所有符合的项，可设置为true
	@returns {Object} 在all参数为false时，返回被删除的项
	*/
	SFGlobal.deleteInArray=function(array,item,all)
	{
		if(!array){return}
		for(var i=array.length-1;i>=0;i--)
		{
			if(array[i]==item)
			{
				array.splice(i,1)
				if(!all){return array[i];}
			}
		}
	}
	/**
	设置层的大小
	@private
	@param {HtmlElement} obj 指定的层
	@param {[x,y]} size 指定的大小
	*/
	SFGlobal.setElementSize=function(obj,size)
	{
		SFGlobal.setProperty(obj.style,{width:size[0]+"px",height:size[1]+"px"});
	}
	/**
	获取层的显示大小
	@private
	@param {HtmlElement} obj 指定的层
	@returns {[x,y]} 返回层的大小
	*/
	SFGlobal.getElementSize=function(obj)
	{
		var viewSize=[obj.offsetWidth,obj.offsetHeight]
		if(obj.clientHeight && !document.all){viewSize[1]=obj.clientHeight;}
		if(!viewSize[0])
		{
			viewSize[0]=obj.clientWidth;
		}
		if(!viewSize[0])
		{
			viewSize[0]=parseInt(obj.style.width);
		}
		if(!viewSize[1])
		{
			viewSize[1]=obj.clientHeight;
		}
		if(!viewSize[1])
		{
			viewSize[1]=parseInt(obj.style.height);
		}
		if(!viewSize[0] || !viewSize[1])
		{
			obj=obj.parentElement;
			while(obj)
			{
				if(!viewSize[0] && obj.offsetWidth)
				{
					viewSize[0]=obj.offsetWidth;
				}
				if(!viewSize[1] && obj.offsetHeight)
				{
					viewSize[1]=obj.offsetHeight;
				}
				if(viewSize[0] && viewSize[1])
				{
					break;
				}
				obj=obj.parentElement;
			}
		}
		return viewSize;
	}
	/**
	旋转HTML对象
	@param {HtmlElement} div 需要旋转的层
	@param {Number} rotate 旋转角度数0-360
	@returns {Bool}	如果旋转成功，返回true,否则返回false
	*/
	SFGlobal.setRotate=function(div,rotate)
	{
		rotate=Math.round(rotate%360);//先转化为0-360的整数
		var rad=rotate*Math.PI/180,style=div.style;
		//如果支持任意类型的Transform
		var proName,typeName="string";
		if(
		//	typeof(style[(proName="msTransform")])==typeName || 	//旋转之后不支持打印
			typeof(style[(proName="WebkitTransform")])==typeName || 
			typeof(style[(proName="MozTransform")])==typeName || 
			typeof(style[(proName="transform")])==typeName)
		{
			var transform=(rotate==0)?"":"rotate("+rotate+"deg)",obj={};
			obj[proName]=transform
			SFGlobal.setProperty(div.style,obj);
			return true;
		}
		//如果支持滤镜(IE模式)
		if(typeof(style.filter)=="string" && document.body.filters)
		{
			//使用Matrix滤镜实现旋转
			SFGlobal.setProperty(div.style,{filter:(rotate==0)?"":"progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',M11="+Math.cos(rad)+",M12="+(-Math.sin(rad))+",M21="+Math.sin(rad)+",M22="+Math.cos(rad)+")"});
			return true;
		}
		return false;
	}
	/**
	设置层在打印时隐藏
	@private
	@param {HtmlElement} obj 指定的层
	*/
	SFGlobal.setNoPrint=function(obj)
	{/*
		if(!SFGlobal._NoPrint)
		{
			var style=obj.ownerDocument.createStyleSheet();
			style.media="print";
			style.addRule(".SF_NoPrint","display:none",-1);
			SFGlobal._NoPrint=style;
		}
		var claName=obj.className;
		if(!claName){claName="";}
		obj.className+=" SF_NoPrint";*/
	}
	/**
	创建一个图片实例，提供这个方法是因为一般的Image对象在IE6以下不支持PNG透明，因此需要有一个公用的方法来以各个浏览器兼容的模式显示图片
	@private
	@param {String} src	图片的url地址
	@param {Json} [config]	图片创建选项
	@param {[x,y]} [config.spritePoint]	如果使用CSS Sprites来组合图片，这里指定图片的在整张图片上的位置
	@param {[x,y]} [config.spriteSize]	如果使用CSS Sprites来组合图片，这里指定图片的在整张图片上的大小
	@param {[x,y]} [config.imageSize]	如果使用CSS Sprites来组合图片，这里指定整张图片的大小
	@param {[x,y]} [config.position]	图片的定位
	@param {[x,y]} [config.size]	图片的大小
	@returns {HtmlElement}
	*/
	SFGlobal.createImage=function(src,config)
	{
		config=config?config:{};
		var img,doc=config.doc||document;
		if(config.spritePoint && (config.spriteSize || config.size))
		{//如果使用CSS Sprites来组合图片
			if(!config.spriteSize){config.spriteSize=config.size;}
			if(!config.size){config.size=config.spriteSize;}
			img=doc.createElement("div");
			SFGlobal.setProperty(img.style,{overflow:'hidden',display:'inline-block'});
			if(img.style.position!="absolute"){img.style.position="relative";}
			var size=config.imageSize?[config.imageSize[0]*config.size[0]/config.spriteSize[0],config.imageSize[1]*config.size[1]/config.spriteSize[1]]:null;
			var spriteImg=SFGlobal.createImage(src,{position:[-config.spritePoint[0]*config.size[0]/config.spriteSize[0],-config.spritePoint[1]*config.size[1]/config.spriteSize[1]],size:size,doc:doc});
			SFGlobal.setProperty(spriteImg.style,{position:'absolute'});
			img.appendChild(spriteImg);
		}
		else
		{
			img=doc.createElement("img");
			//在IE7(某些版本)下，有些图片默认有hspace，因此会造成布局问题
			//所以在这里将所有图片的hspace设置为0
			img.hspace=0;
			SFGlobal.setProperty(img.style,{border:'0px'});
		}
		if(!config.noLoad){SFGlobal.setImageSrc(img,src);}
		if(config.position){SFGlobal.setProperty(img.style,{left:config.position[0]+'px',top:config.position[1]+'px'});}
		if(config.size){SFGlobal.setProperty(img.style,{width:config.size[0]+'px',height:config.size[1]+'px'});}
		return img;
	}
	/**
	设置图片的src，提供这个方法是因为有些时候图片是通过div+滤镜实现的
	@private
	@param {HtmlElement} img 图片实例
	@param {String} src url地址
	*/
	SFGlobal.setImageSrc=function(img,src)
	{
		img.src=src;
		var firstChild=img.firstChild;
		while(firstChild)
		{
			if(firstChild.nodeName!="IMG")
			{
				firstChild=firstChild.nextSibling
				continue;
			}
			firstChild.src=src;
			break;
		}
	}
	/**
	设置层的背景图，提供这个方法是考虑到拿半透明的PNG做背景的时候部分浏览器不支持
	@private
	@param {HtmlElement} div 需要设置背景的层
	@param {String} src 背景图片URL地址
	@param {Json} [config]	背景设置选项
	@param {[x,y]} [config.spritePoint]	如果使用CSS Sprites来组合图片，这里指定图片的在整张图片上的位置
	@param {Bool} [config.spriteDouble]	如果需要使用两个背景交替的方式实现，则为true
	@param {[x,y]} [config.imageSize]	如果使用CSS Sprites来组合图片，这里指定整张图片的大小
	@param {Bool} [config.repeat]	背景的重复方法
	@param {Bool} [config.canPrint=false] 是不是为了让背景在打印状态下也能显示而做处理
	*/
	SFGlobal.setBackgroundImage=function(div,src,config)
	{
		if(!src)
		{
			SFGlobal.setImageSrc(div,"");
			SFGlobal.setProperty(div.style,{backgroundImage:''});
			return;
		}
		config=config?config:{};
		if(config.canPrint)
		{
			var img=SFGlobal.createImage(src),sizeDiv=img;
			if(config.spritePoint && config.imageSize)
			{
				sizeDiv=document.createElement("div");
				var isHor=config.repeat=="repeat-x" || config.repeat=="repeat";
				var isVer=config.repeat=="repeat-y" || config.repeat=="repeat";
				SFGlobal.setProperty(img.style,{position:'relative',border:'0px',width:(isHor?'100%':(config.imageSize[0]+"px")),height:(isVer?'100%':(config.imageSize[1]+"px")),left:(isHor?(100*config.spritePoint[0]/config.imageSize[0]+'%'):(-config.spritePoint[0]+"px")),top:(isVer?(100*config.spritePoint[1]/config.imageSize[1]+'%'):(-config.spritePoint[1]+"px")),zIndex:-1});
				sizeDiv.appendChild(img);
			}
			SFGlobal.setProperty(sizeDiv.style,{position:'absolute',border:'0px',width:'100%',height:'100%',left:"0px",top:"0px",zIndex:-1,overflow:'hidden'});
			div.appendChild(sizeDiv);
		}
		else
		{
			SFGlobal.setProperty(div.style,{backgroundImage:'url('+src+')'});
			if(config.spritePoint)
			{
				SFGlobal.setProperty(div.style,{backgroundPosition:(-config.spritePoint[0])+"px "+(-config.spritePoint[1])+"px"});
			}
		}
		if(config.spriteDouble)
		{
			var bar=document.createElement("div");
			SFGlobal.setProperty(bar.style,{position:'absolute',fontSize:'0px',left:'0px',top:'0px',width:'100%',height:'100%',overflow:'hidden'});
			SFGlobal.setBackgroundImage(bar,src,{canPrint:config.canPrint,spritePoint:(config.repeat=="repeat-x"?{x:config.imageSize[0]/2,y:config.spritePoint[1]}:{x:config.spritePoint[0],y:config.imageSize[1]/2}),imageSize:config.imageSize,repeat:config.repeat});
			div.appendChild(bar);
		}
	}
/*
	SFGlobal.getBase64Char=function(code)
	{
		var ascii=code;
		if(ascii<26){ascii+=65;}//大写字母
		else if(ascii<52){ascii+=71;}//小写字母
		else if(ascii<62){ascii-=6;}//数字
		else if(ascii==63){ascii=47;}
		else{ascii=43;}
		return String.fromCharCode(ascii);
	}
	SFGlobal.getBase64Code=function(chr)
	{
		var ascii=chr.charCodeAt(0);
		if(ascii<44){return 62;}//	字符+
		if(ascii<48){return 63;}//	字符/
		if(ascii<58){return ascii+6;}//数字
		if(ascii<91){return ascii-65;}//大写字母
		return ascii-71;//小写字母
	}
	SFGlobal.getColorByRgb=function(arr)
	{
		var colorStr="#";
		for(var j=0;j<3;j++)
		{
			if(arr[j]<128){colorStr+="0";}
			colorStr+=arr[j].toString(16);
		}
		return colorStr.toUpperCase();
	}
	SFGlobal.getRgbByColor=function(colorStr)
	{
		return [parseInt(colorStr.substr(1,2),16),parseInt(colorStr.substr(3,2),16),parseInt(colorStr.substr(5,2),16)];
	}
	创建一个图片实例
	@private
	@param {String} data	图片的数据
	@param {String} url		如果浏览器不支持uri data，则需要在这里指定图片地址
	@param {String} color	如果需要进行颜色替换，在这里指定替换的颜色
	@returns {HtmlElement}

	SFGlobal.createDataImage=function(data,src,colorReg)
	{
		var img=document.createElement("img");
		if(data && false)
		{
			if(colorReg)
			{
				var width,height,flag,colorIndex,index=8,ratio;
				var code=SFGlobal.getBase64Code(data.charAt(index++));
				width=code<<2;
				code=SFGlobal.getBase64Code(data.charAt(index++));
				width+=code>>4+((code&15)<<4);
				code=SFGlobal.getBase64Code(data.charAt(index++));
				width+=(code>>2)<<8;
				height=(code>>4)<<6;
				code=SFGlobal.getBase64Code(data.charAt(index++));
				height+=code;
				code=SFGlobal.getBase64Code(data.charAt(index++));
				height+=code<<10;
				code=SFGlobal.getBase64Code(data.charAt(index++));
				height+=(code>>4)<<8;
				flag=(code&15)<<4;
				code=SFGlobal.getBase64Code(data.charAt(index++));
				flag+=code>>4;
				colorIndex=(code&3)<<6;
				code=SFGlobal.getBase64Code(data.charAt(index++));
				colorIndex+=code;
				code=SFGlobal.getBase64Code(data.charAt(index++));
				ratio=code<<2;
				code=SFGlobal.getBase64Code(data.charAt(index++));
				ratio+=(code>>4);
				if(flag>>7)//如果存在颜色表
				{
					//取得颜色表个数
					var tabSize=1<<(((flag>>4)&7)+1),colorTab=[],chr2=(code>>4);
					for(var i=0;i<tabSize;i++)
					{
						var color=[0,0,0];
						color[0]=(code&15)<<4;
						code=SFGlobal.getBase64Code(data.charAt(index));
						color[0]+=code>>2;
						color[1]=(code&3)<<6;
						code=SFGlobal.getBase64Code(data.charAt(index+1));
						color[1]+=code;
						code=SFGlobal.getBase64Code(data.charAt(index+2));
						color[2]=code<<2;
						code=SFGlobal.getBase64Code(data.charAt(index+3));
						color[2]+=(code>>4);
						colorTab.push(color);
						if(colorReg[SFGlobal.getColorByRgb(color)])
						{//如果需要替换颜色
							var rgb=SFGlobal.getRgbByColor(colorReg[SFGlobal.getColorByRgb(color)]),regStr="";
							regStr+=SFGlobal.getBase64Char((chr2<<4)+(rgb[0]>>4));
							regStr+=SFGlobal.getBase64Char(((rgb[0]&15)<<2)+(rgb[1]>>6));
							regStr+=SFGlobal.getBase64Char(rgb[1]&63);
							regStr+=SFGlobal.getBase64Char(rgb[2]>>2);
							regStr+=SFGlobal.getBase64Char(((rgb[2]&3)<<4)+(code&15));
							data=data.substr(0,index-1)+regStr+data.substr(index-1+regStr.length)
						}
						chr2=(code>>4);
						index+=4;
					}
				}
			}
			img.src="data:image/gif;base64,"+data;
		}
		else
		{
			img.src="symbol_000000.gif";
			img.style.filter="Mask(color=green)";
		}
		return img;
	}
	*/
	window.SFGlobal=SFGlobal;
	/**
	向日葵甘特图(SFGantt JavaScript API)之中用用来进行Xml下载和处理的方法,包含ajax方式功能，该类的所有方法都是静态方法，因此不需要构造该类的实例而直接使用方法即可，例如
	@example
	SFAjax.loadXml(url,handle);
	@class
	*/
	function SFAjax(){}
	/**
	以跨浏览器支持的方式创建一个HttpRequest对象。
	@returns	{HTTPRequest}	返回Http请求实例
	*/
	SFAjax.createHttpRequest=function()
	{
		if(window.XMLHttpRequest)
		{
			return new window.XMLHttpRequest();
		}
		else if(typeof(ActiveXObject)!="undefined")
		{
			return new ActiveXObject("Microsoft.XMLHTTP");
		}
	}
	/**
	加载指定本地路径的XML文件，并在加载完成后回调handle函数，回调函数handle的参数是返回的Xml文档对象XmlDocument,该方法会通过创建XmlHttpRequest(HTTP GET )来访问XML数据，因此，当访问不在同一个域的资源时，会引起<b>跨域</b>问题，因此，确保仅仅访问和当前页面同域的资源。
	@param	{String}	path	XML文件的URL地址
	@param	{Function}	handle	执行成功后回调此函数。
	@param	{Bool}	[async=false]	如果为true，则执行同步请求，默认为异步请求
	@param	{String}	[data]	如果需要执行POST请求，此参数是POST请求的参数,用于大量数据向后台发送。
	*/
	SFAjax.loadXml=function(path,handle,async,data)
	{
		var doc;
		if(location.protocol.indexOf("http")!=0 && path.indexOf("http://")!=0)
		{//这种加载类型只在非http访问的时候使用
		
			try
			{
				doc=SFAjax.createDocument();
				doc.load(path);
			}
			catch(e){}
			if(doc && doc.documentElement)
			{
				if(handle)
				{
					handle.apply(null,[doc]);
				}
				doc=null;
				return;
			}
		}
		var request=SFAjax.createHttpRequest(),triggered=false;
		var onReadyStateChange=SFEvent.getCallback(this,function()
		{
			triggered=true;
			if(request.readyState==4)
			{
				var doc=request.responseXML;
				if(!doc.documentElement)
				{
					doc=SFAjax.createDocument(request.responseText);
				}
				if(!doc ||!doc.documentElement)
				{
					handle();//不管是否成功，都调用此函数
					return;
				}
				if(handle)
				{
					handle.apply(null,[doc]);
				}
				doc=null;
				SFEvent.clearListeners(request);
				request=null;
			}
		});
		request.onreadystatechange=onReadyStateChange;
		request.open(data?"POST":"GET",path,!!async);
		request.send(data?data:null);
		if(!async && !triggered)
		{
			onReadyStateChange();
		}
	}
	/**
	通过指定Xml字符串创建Xml文档对象XmlDocument，如果没有指定字符串或者指定的字符串为空，则直接返回一个空内容的XmlDocument
	@param	{String} xmlStr	xml内容字符串
	@returns {XmlDocument}	返回转化后的XML文档对象
	*/
	SFAjax.createDocument=function(xmlStr)
	{
		var doc;
		if(typeof(ActiveXObject)!="undefined")//如果支持ActiveXObject(IE)
		{
			try{doc=new ActiveXObject("Msxml2.DOMDocument");}
			catch(e){doc=new ActiveXObject("Msxml.DOMDocument");}//创建文档对象
			if(xmlStr)
			{
				doc.loadXML(xmlStr);	//加载字符串
			}
		}
		else
		{
			if(xmlStr)
			{
				if(typeof DOMParser!="undefined")	//如果存在DOMParser解析器
				{
					doc=new DOMParser().parseFromString(xmlStr,"text/xml")
				}
			}
			else
			{
				if(document.implementation && document.implementation.createDocument)
				{
					doc=document.implementation.createDocument("","",null);
				}
			}
		}
		return doc;
	}
	/**
	在指定节点的全部有下级节点之中检索一个xpath条件的节点，类似于IE浏览器之中的selectSingleNode,这个方法能同时在更多浏览器之中兼容
	@param	{XmlNode|XmlDocument}	node	XML文档或文档节点
	@param	{String}	xpath	路径字符串
	@returns	{XmlNode}	返回找到的节点，如果没有找到，则返回空数组
	*/
	SFAjax.selectSingleNode=function(node,xpath)
	{
		var paths=xpath.split("/");
		for(var i=0;i<paths.length;i++)
		{
			if(!node){return node;}
			var path=paths[i];
			if(path=="..")
			{
				node=node.parentNode;
				continue;
			}
			var child;
			for(child=node.firstChild;child;child=child.nextSibling){if(path=="*" || path==child.nodeName){break;}}
			node=child;
			continue;
		}
		return node;
	}
	/**
	获取节点的内容，例如对于&lt;node>TEXT&lt;/node>,返回字符串"TEXT",相当于IE之中的node.text,这个方法能同时在更多浏览器之中兼容
	@param	{XmlNode}	node	XML节点
	@returns	{String}	返回节点内容字符串
	*/
	SFAjax.getNodeValue=function(node)
	{
		if(!node || typeof(node)!="object"){return node;}
		return node.text?node.text:(node.childNodes[0]?node.childNodes[0].nodeValue:"");
	}
	/**
	设置节点的内容
	@param	{XmlNode}	node	XML节点
	@param	{String}	value	节点内容字符串
	*/
	SFAjax.setNodeValue=function(node,value)
	{
		while(node.firstChild){node.removeChild(node.firstChild)}
		node.appendChild(node.ownerDocument.createTextNode(value));
	}
	/**
	获取一个XMLDocument的XML内容字符串，这个功能用在需要将XMLDocument内容发送到服务端的时候
	@param	{XmlDocument}	doc XML文档
	@returns {String} XML字符串
	*/
	SFAjax.getXmlString=function(doc)
	{
		return doc.xml?doc.xml:new window.XMLSerializer().serializeToString(doc);
	}
	/**
	在指定节点的后续统计节点之中查找指定名称的的节点，并返回第一个找到的节点
	@param	{XmlNode}	child XML节点
	@param	{String}	nodeName 节点名称
	@returns {XmlNode} 返回找到的第一个节点
	*/
	SFAjax.getNextSibling=function(child,nodeName)
	{
		while(child)
		{
			if(!nodeName || nodeName==child.nodeName)
			{
				return child;
			}
			child=child.nextSibling;
		}
		return null;
	}
	/**
	进行字符串编码的函数
	@private
	@param	{String}	str 需要编码的字符串
	@param	{String}	[password] 编码的密码
	@returns {String} 返回编码的结果
	*/
	SFAjax.encode=function(str,password)
	{
		password=password==false?password:_OBS_Password;
		var passIndex,passLength;
		if(password)
		{
			passIndex=0;
			passLength=password.length;
		}
		var num=0,byt=0;
		var len=str.length;
		var resultStr="";
		for(var i=0;i<len;i++)
		{
			var code=str.charCodeAt(i);
			if(code>=2048)		//0800 - FFFF 1110xxxx 10xxxxxx 10xxxxxx 
			{
				byt=(byt<<24)+(((code>>12)|0xe0)<<16)+((((code&0xfff)>>6)|0x80)<<8)+((code&0x3f)|0x80);
				num+=24;
			}
			else if(code>=128)	//0080 - 07FF 110xxxxx 10xxxxxx 
			{
				byt=(byt<<16)+(((code>>6)|0xc0)<<8)+((code&0x3f)|0x80);
				num+=16;
			}
			else			//0000 - 007F 0xxxxxxx 
			{
				num+=8;
				byt=(byt<<8)+code;
			}
			while(num>=6)
			{
				var b=byt>>(num-6);
				byt=byt-(b<<(num-6));
				num-=6;
				if(password)
				{
					b=(b+password.charCodeAt(passIndex++))%64;
					passIndex=passIndex%passLength;
				}
				/*
					b	0-9		数字0-9		b+48
					b	10-35	字母A-Z		b+65-10=b+55
					b	36-61	字母a-z		b+97-36=b+61
					b	62		字符,		44
					b	63		字符_		95
				*/
				var code=(b<=9)?(b+48):((b<=35)?(b+55):((b<=61)?(b+61):((b==62)?44:95)));
				resultStr+=String.fromCharCode(code);
			}
		}
		if(num>0)
		{
			var b=byt<<(6-num);
			if(password)
			{
				b=(b+password.charCodeAt(passIndex++))%64;
				passIndex=passIndex%passLength;
			}

			resultStr+=String.fromCharCode((b<=9)?(b+48):((b<=35)?(b+55):((b<=61)?(b+61):((b==62)?44:95))));
		}
		return resultStr;
	}
	/**
	进行字符串解码的函数
	@private
	@param	{String}	str 需要解码的字符串
	@param	{String}	[password] 编码的密码
	@returns {String} 返回解码的结果
	*/
	SFAjax.decode=function(str,password)
	{
		password=password==false?password:_OBS_Password;
		var passIndex,passLength;
		if(password)
		{
			passIndex=0;
			passLength=password.length;
		}
		var num=0,byt=0;
		var len=str.length;
		var resultStr=new String();
		var preNum=-1;
		var preIndex=0;
		for(var i=0;i<len;i++)
		{
			var code=str.charCodeAt(i);
			code=(code==95)?63:((code==44)?62:((code>=97)?(code-61):((code>=65)?(code-55):(code-48))));
			if(password)
			{
				code=(code-password.charCodeAt(passIndex++)+128)%64;
				passIndex=passIndex%passLength;
			}

			byt=(byt<<6)+code;
			num+=6;
			while(num>=8)
			{
				var b=byt>>(num-8);
				if(preIndex>0)
				{
					preNum=(preNum<<6)+(b&(0x3f));
					preIndex--;
					if(preIndex==0){resultStr+=String.fromCharCode(preNum);}
				}
				else
				{
					if(b>=224)
					{
						preNum=b&(0xf);
						preIndex=2;
					}
					else if(b>=128)
					{
						preNum=b&(0x1f);
						preIndex=1;
					}
					else
					{
						resultStr+=String.fromCharCode(b);
					}
				}
				byt=byt-(b<<(num-8));
				num-=8;
			}
		}
		return resultStr;
	}
	window.SFAjax=SFAjax;
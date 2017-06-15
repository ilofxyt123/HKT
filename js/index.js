/**
 * Created by Administrator on 2017/6/14.
 */
(function(win){
    $.fn.extend({
        fiHandler:function(e){
            e.stopPropagation();
            this.removeClass("opacity "+this.tp.cls);
            if(this.tp.cb){this.tp.cb();};
            this.off("webkitAnimationEnd");
            this.tp.cb = undefined;
            this.tp.duration = this.tp.cls = "";
        },
        foHandler:function(e){
            e.stopPropagation();
            this.addClass("none").removeClass(this.tp.cls);
            if(this.tp.cb){this.tp.cb();};
            this.off("webkitAnimationEnd");
            this.tp.cb = undefined;
            this.tp.duration = this.tp.cls = "";
        },
        fi:function(cb){
            this.tp = {
                cb:undefined,
                duration:"",
                cls:"",
            };
            this.tp.cls = "ani-fadeIn";
            if(arguments){
                for(var prop in arguments){
                    switch(typeof arguments[prop]){
                        case "function":
                            this.tp.cb = arguments[prop];
                            break;
                        case "number":
                            this.tp.duration = arguments[prop];
                            this.tp.cls += this.tp.duration;
                            break;
                    }
                }
            }
            this.on("webkitAnimationEnd", this.fiHandler.bind(this)).addClass("opacity " + this.tp.cls).removeClass("none");
            return this;
        },
        fo:function(cb){
            this.tp = {
                cb:undefined,
                duration:"",
                cls:"",
            };
            this.tp.cls = "ani-fadeOut";
            if(arguments){
                for(var prop in arguments){
                    switch(typeof arguments[prop]){
                        case "function":
                            this.tp.cb = arguments[prop];
                            break;
                        case "number":
                            this.tp.duration = arguments[prop];
                            this.tp.cls += this.tp.duration;
                    }
                }
            }
            this.on("webkitAnimationEnd",this.foHandler.bind(this)).addClass(this.tp.cls);
            return this;
        }
    });
    var Utils = new function(){
        this.preloadImage = function(ImageURL,callback,realLoading){
            var rd = realLoading||false;
            var i,j,haveLoaded = 0;
            for(i = 0,j = ImageURL.length;i<j;i++){
                (function(img, src) {
                    img.onload = function() {
                        haveLoaded+=1;
                        var num = Math.ceil(haveLoaded / ImageURL.length* 100);
                        if(rd){
                            $(".num").html("- "+num + "% -");
                        }
                        if (haveLoaded == ImageURL.length && callback) {
                            setTimeout(callback, 500);
                        }
                    };
                    img.onerror = function() {};
                    img.onabort = function() {};

                    img.src = src;
                }(new Image(), ImageURL[i]));
            }
        },//图片列表,图片加载完后回调函数，是否需要显示百分比
            this.lazyLoad = function(){
                var a = $(".lazy");
                var len = a.length;
                var imgObj;
                var Load = function(){
                    for(var i=0;i<len;i++){
                        imgObj = a.eq(i);
                        imgObj.attr("src",imgObj.attr("data-src"));
                    }
                };
                Load();
            },//将页面中带有.lazy类的图片进行加载
            this.browser = function(t){
                var u = navigator.userAgent;
                var u2 = navigator.userAgent.toLowerCase();
                var p = navigator.platform;
                var browserInfo = {
                    trident: u.indexOf('Trident') > -1, //IE内核
                    presto: u.indexOf('Presto') > -1, //opera内核
                    webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                    gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                    mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                    android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
                    iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                    iPad: u.indexOf('iPad') > -1, //是否iPad
                    webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
                    iosv: u.substr(u.indexOf('iPhone OS') + 9, 3),
                    weixin: u2.match(/MicroMessenger/i) == "micromessenger",
                    taobao: u.indexOf('AliApp(TB') > -1,
                    win: p.indexOf("Win") == 0,
                    mac: p.indexOf("Mac") == 0,
                    xll: (p == "X11") || (p.indexOf("Linux") == 0),
                    ipad: (navigator.userAgent.match(/iPad/i) != null) ? true : false
                };
                return browserInfo[t];
            },//获取浏览器信息
            this.g=function(id){
                return document.getElementById(id);
            },
            this.E=function(selector,type,handle){
                $(selector).on(type,handle);
            }
        this.limitNum=function(obj){//限制11位手机号
            var value = $(obj).val();
            var length = value.length;
            //假设长度限制为10
            if(length>11){
                //截取前10个字符
                value = value.substring(0,11);
                $(obj).val(value);
            }
        };
    };
    var Media = new function(){
        this.mutedEnd = false;
        this.WxMediaInit=function(){
            var _self = this;
            if(!Utils.browser("weixin")){
                this.mutedEnd = true;
                return;
            }
            if(!Utils.browser("iPhone")){
                _self.mutedEnd = true;
                return;
            }
            document.addEventListener("WeixinJSBridgeReady",function(){
                var $media = $(".iosPreload");
                $.each($media,function(index,value){
                    _self.MutedPlay(value["id"]);
                    if(index+1==$media.length){
                        _self.mutedEnd = true;
                    }
                });
            },false)
        },
            this.MutedPlay=function(string){
                var str = string.split(",");//id数组
                var f = function(id){
                    var media = Utils.g(id);
                    media.volume = 0;
                    media.play();
                    // setTimeout(function(){
                    media.pause();
                    media.volume = 1;
                    media.currentTime = 0;
                    // },100)
                };
                if(!(str.length-1)){
                    f(str[0]);
                    return 0;
                }
                str.forEach(function(value,index){
                    f(value);
                })
            },
            this.playMedia=function(id){
                var _self = this;
                var clock = setInterval(function(){
                    if(_self.mutedEnd){
                        Utils.g(id).play()
                        clearInterval(clock);
                    }
                },20)
            }
    };
    Media.WxMediaInit();

    var main =  new function(){
        this.V = {//视频
            id:"video",
            currentTime:0,
            isPlay:false,
            obj:document.getElementById("video")
        };
        this.ios = Utils.browser("ios");
    };
    main.top = function(){
        $(".top").removeClass("none");
    };
    main.loadleave = function(){
        $(".P_loading").fo();
    };
    main.p1 = function(){};
    main.p1leave = function(){};
    main.p2 = function(){};
    main.p2leave = function(){};
    main.p3 = function(){};
    main.p3leave = function(){};
    main.pvideo = function(){
        $(".P_video").fi();
    };
    main.pvideoleave = function(){};
    main.addEvent = function(){
        document.body.ontouchmove = function(e){
            e.preventDefault();
        };
        $(window).on("orientationchange",function(e){
            if(window.orientation == 0 || window.orientation == 180 )
            {
                // $(".hp").hide();
            }
            else if(window.orientation == 90 || window.orientation == -90)
            {
                if(main.ios){
                    main.loadleave();
                    main.pvideo();
                    main.V.obj.play();
                }
                // $(".hp").show();
            }
        });

        $(".play-btn").on("touchend",function(){
            main.loadleave();
            main.pvideo();
            main.V.obj.play();
        });

    };
    win.main = main;
}(window));
$(function(){
    if(main.ios){
        $(".play-btn").remove();
    };
    main.addEvent();
});
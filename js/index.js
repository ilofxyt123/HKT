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
                            imgBar.css("transform","translateX("+num+"%)");
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
                var a = document.getElementsByClassName("lazy");
                var len = a.length;
                var imgObj;
                var Load = function(){
                    for(var i=0;i<len;i++){
                        imgObj = a[i];
                        imgObj.setAttribute("src",imgObj.getAttribute("data-src"));
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
        this.limitNum=function(obj){//限制11位手机号
            var value = obj.value;
            var length = value.length;
            //假设长度限制为10
            if(length>11){
                //截取前10个字符
                value = value.substring(0,11);
                obj.value = value;
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
            // if(!Utils.browser("iPhone")){
            //     _self.mutedEnd = true;
            //     return;
            // }
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
    var imgBar = $(Utils.g("bar"));
    Media.WxMediaInit();

    var main =  new function(){
        this.V = {//视频
            id:"video",
            currentTime:0,
            isPlay:false,
            obj:document.getElementById("video"),
            isEnd:false
        };
        this.ios = Utils.browser("ios");

        this.picUrl = "images/";//图片路径
        this.ImageList = [
            this.picUrl+"inputbg.png",
            this.picUrl+"p1_img_0.jpg",
            this.picUrl+"p1_img_1.png",
            this.picUrl+"p1_img_2.png",
            this.picUrl+"p1_img_2_1.png",
            this.picUrl+"p1_img_3.png",
            this.picUrl+"p1_img_4.png",
            this.picUrl+"p2_img_1.png",
            this.picUrl+"p3_img_1.jpg",
            this.picUrl+"p3_img_2.jpg",
            this.picUrl+"p3_img_2.png",
            this.picUrl+"p3_img_3.png",
            this.picUrl+"p3_img_3_1.png",
            this.picUrl+"p3_img_3_2.png",
            this.picUrl+"p3_img_4.png",
            this.picUrl+"p3_img_5.png",
            this.picUrl+"p3_img_6.png",
            this.picUrl+"p3_img_7.png",
            this.picUrl+"p3_img_8.png",
            this.picUrl+"p4_img_0.png",
            this.picUrl+"p4_img_1.png",
            this.picUrl+"p4_img_2.png",
            this.picUrl+"p4_img_3.png",
            this.picUrl+"p4_img_5.png",
            this.picUrl+"p4_img_6.png",
            this.picUrl+"p4_img_7.png",
            this.picUrl+"p4_img_8.png",
            this.picUrl+"p4_img_9.png",
            this.picUrl+"p5_img_1.png",
            this.picUrl+"p5_img_3.png",
            this.picUrl+"p5_img_4.png",
            this.picUrl+"p5_img_5.png",
            this.picUrl+"p6_img_0.png",
            this.picUrl+"p6_img_1.png",
            this.picUrl+"p6_img_3.png",
            this.picUrl+"p6_img_4.png",
            this.picUrl+"p6_img_5.png",
            this.picUrl+"p6_img_6.png",
            this.picUrl+"p7_img_2.png",
            this.picUrl+"p8_img_1.png",
            this.picUrl+"p8_img_2.png",
            this.picUrl+"phone.png",
            this.picUrl+"submitTip.png",
            this.picUrl+"ticket480.png",
            this.picUrl+"ticket1380.png",
            this.picUrl+"ticket2500.png",
            this.picUrl+"weile.png",

        ];
        this.barPercent = (window.screen.height-window.innerHeight)/window.screen.height;
        this.w = window.screen.width;
        this.h = window.screen.height;
        this.landscape = {
            z:{
                w:this.w,
                h:this.h*(1-this.barPercent)
            },
            h:{
                w:this.h,
                h:this.w*(1-this.barPercent)
            }
        };
        this.bgm ={
            obj:document.getElementById("bgm"),
            id:"bgm",
            isPlay:false,
            // button:$(".music-btn")
        };

        this.prizeType = undefined;//中奖类型
        this.ticketType = undefined;//奖券类型
        this.needgetPrize = undefined;//有未领取的奖励

        this.prizeNumber = 3;

        this.haveFill = false;

        this.NeverP1 = true;

        this.touch ={
            ScrollObj:undefined,
            isScroll:false,
            limitUp:0,
            limitDown:undefined,
            overlimit:false,
            StartY:0,
            NewY:0,
            addY:0,
            scrollY:0,
            touchAllow:true
        };
    };
    main.limitNum = function(obj){//限制11位手机号
        var value = $(obj).val();
        var length = value.length;
        //假设长度限制为10
        if(length>11){
            //截取前10个字符
            value = value.substring(0,11);
            $(obj).val(value);
        }
    };//限制手机号长度
    main.scrollInit=function(selector){
        this.touch.ScrollObj = $(selector);
        this.touch.container = $(selector).parent();
        this.touch.StartY = 0;
        this.touch.NewY = 0;
        this.touch.addY = 0;
        this.touch.scrollY = 0;
        this.touch.limitDown = this.touch.ScrollObj.height() < this.touch.container.height() ? 0 :(this.touch.container.height()-this.touch.ScrollObj.height());
    };
    main.init = function(){
        this.prizeNumber = parseInt($("#prizeNumber").val());
        this.needgetPrize = !(parseInt($("#is_get_coupon").val()));
    };
    main.start = function(){
        $("#video").css({
            "transform-origin":"0 0 0",
            "transform":"translate3d(6.4rem,0,0) rotateZ(90deg)",
            "width":"11.36rem",
            "height":"6.4rem",
        });
        Utils.preloadImage(this.ImageList,function(){
            Utils.lazyLoad();

            if(main.needgetPrize){//跳出领奖页面
                $(".bg-pic1").addClass("none");
                $(".bg-pic2").removeClass("none").addClass("blur");
                main.prizeType = 1;
                main.presult();
                main.loadleave();
            }else{
                if(!main.ios){
                    setTimeout(function(){
                        $(".ori-tip").fi();
                        $(".play-btn").fi();
                    },800);
                }
                else{
                    main.loadleave();
                    main.pvideo();
                    main.V.obj.play();
                }
            }

        },true)
    };
    main.top = function(){
        $(".top").removeClass("none");
    };
    main.loadleave = function(){
        $(".P_loading").fo();
    };
    main.p1 = function(){
        $(".P1").fi();
    };
    main.p1leave = function(){
        $(".P1").fo();
    };
    main.prule = function(){
        main.scrollInit(".rule");
        $(".P_rule").fi();
    };
    main.pruleleave = function(){
        $(".P_rule").fo(function(){
            $(".rule")[0].style.webkitTransform="translate3d(0,0,0)";
        });
    };
    main.p3 = function(){};
    main.p3leave = function(){};
    main.pvideo = function(){
        $(".P_video").fi();
    };
    main.pvideoleave = function(){
        $(".P_video").fo(function(){
            if(!window.orientation){
                $(".bg-pic2").addClass("blur");
            }
        });
    };
    main.prize = function () {
        if(this.prizeNumber == 0){
            this.prizeType = undefined;
            $(".noChance").removeClass("none");
            return;
        }
        this.prizeNumber -= 1;
        $(".times").html(this.prizeNumber);


        setTimeout(function(){//回调
            main.prizeType = 1;//fun礼包
            // main.prizeType = 2;//券

            if(main.prizeType == 2){
                main.ticketType = 1;//480
                // main.ticketType = 2;//1380
                // main.ticketType = 3;//2500
            }
            main.p1leave();
            main.presult();
            main.touch.touchAllow =  true;
        },500);


    };
    main.pmask = function(){
        $(".P_mask").removeClass("none");
    };
    main.pmaskleave = function(){
        $(".P_mask").fo();
    };
    main.presult = function(){
        switch (main.prizeType){
            case 1:
                $(".prize1").removeClass("none");
                break;
            case 2:
                $(".prize2").removeClass("none");
                $(".prize2 .title"+main.ticketType).removeClass("none");
                break;
        }

        $(".P_result").fi();
    };
    main.addEvent = function(){
        document.body.ontouchmove = function(e){
            e.preventDefault();
        };
        $(".rule-box").on({
            touchstart:function(e){
                main.touch.StartY = e.originalEvent.changedTouches[0].pageY;
            },
            touchmove:function(e){
                main.touch.NewY = e.originalEvent.changedTouches[0].pageY;
                main.touch.addY = 1.5*(main.touch.NewY-main.touch.StartY);
                main.touch.StartY = main.touch.NewY;
                if(main.touch.scrollY+main.touch.addY<0){
                    if(main.touch.scrollY+main.touch.addY>main.touch.limitDown){
                        main.touch.scrollY+=main.touch.addY;
                    }
                    else{
                        main.touch.scrollY = main.touch.limitDown;
                    }
                }
                else{
                    main.touch.scrollY=0;
                }
                main.touch.ScrollObj[0].style.webkitTransform="translate3d(0,"+main.touch.scrollY+"px,0)";
            },
            touchend:function(e){

            }
        });
        $(".rule-btn").on("touchend",function(){
           main.prule();
           main.p1leave();
        });
        $(".rule-xx").on("touchend",function(){
            main.pruleleave();
            main.p1();
        });
        $(".play-btn").on("touchend",function(){
            main.loadleave();
            main.pvideo();
            main.V.obj.play();
        });

        $("#video").on({
            play:function(){
                main.V.isPlay = true;
                $(window).on("orientationchange",main.oriHandle1);
            },
            ended:main.onVideoEnd
        });

        $(".p1-btn").on("touchend",function(){
            if(!main.touch.touchAllow){return;}
            main.touch.touchAllow = false;
            main.prize();
        });

        $(".skip").on("touchend",function(){
            main.V.obj.pause();
            main.V.obj.isPlay = false;
            main.V.isEnd = true;
            main.pvideoleave();
            $(".bg-pic1").addClass("none");
            $(".bg-pic2").removeClass("none");
            if(window.orientation != undefined && window.orientation != 0 ){
                $(".hp").show();
            }
            else{
                setTimeout(function(){
                    $(".bg-pic2").addClass("blur");
                },500);
                $(".bg-pic2").on("webkitTransitionEnd",function(){
                    main.p1();
                });
            }



                $(window).on("orientationchange",main.oriHandle3);

        });



        var url_fun = "http://mp.weixin.qq.com/s/pJzFodraujCdDwbcRkI4lg";
        var music_day = "http://mp.weixin.qq.com/s/OBg0Ezq0TAsveoY3Lchvzg";
        ////////noChance////////
        $(".noChance .btn1").on("touchend",function(){
            $(".P_mask").addClass("none");
            $(".noChance").addClass("none");
        });
        $(".noChance .btn2").on("touchend",function(){//fun外链
            window.location.href = url_fun;
        });
        $(".noChance .btn3").on("touchend",function(){//音乐节外链
            window.location.href = music_day;
        });
        ////////noChance////////

        ////////getPrize////////
        $(".getPrize .btn1").on("touchend",function(){
            $(".P_mask,.getPrize").addClass("none");
        });
        ////////getPrize////////

        ////////success////////
        $(".success .btn1").on("touchend",function(){

            if(main.prizeNumber == 0){
                $(".success").addClass("none");
                $(".noChance .btn1").remove();
                $(".noChance").removeClass("none");
            }
            else{
                $(".P_mask").addClass("none");
                $(".success").addClass("none");

                $(".P_result").addClass("none");
                $(".prize2").addClass("none");
                $(".prize2 .title").addClass("none");


                var clearInput = function(){
                    $("#name,#phone").val("");
                };
                clearInput();
                main.p1();
            }

        });
        $(".success .btn2").on("touchend",function(){});
        $(".success .btn3").on("touchend",function(){});
        ////////success////////

        ////////prize2 券填信息////////
        $(".submit").on("touchend",function(){
            var number = $("#phone").val();
            var name = $("#name").val();
            var patt = /^1(3|4|5|7|8)\d{9}$/;

            if(name == ""){alert("请输入姓名");return;};
            if(!(patt.test(number))){alert("请输入正确的手机号!");return;};


            $(".success").removeClass("none");
            $(".P_mask").removeClass("none");
        });

        $("#phone").on("input",function(){
            main.limitNum($(this)[0]);
        });
        ////////prize2 券填信息////////

        ////////prize1礼包////////
        $(".prize1 .btn1").on("touchend",function(){

        });//领取大礼包
        $(".prize1 .btn2").on("touchend",function(){
            if(main.prizeNumber == 0 ){
                $(".noChance").removeClass("none");
                $(".P_mask").fi();
            }else{
                $(".getPrize").removeClass("none");
                main.pmask();
            }
        });//再玩一次
        ////////prize1礼包////////

    };

    main.onVideoEnd = function(){
        main.V.isPlay = false;
        main.V.isEnd = true;
        $(".bg-pic1").addClass("none");
        $(".bg-pic2").removeClass("none");
        main.pvideoleave();

        $(window).off("orientationchange",main.oriHandle1);
        $(window).on("orientationchange",main.oriHandle3);
        if(window.orientation != undefined && window.orientation != 0 ){
            $(".hp").show();
        }
        else{
            setTimeout(function(){
                $(".bg-pic2").addClass("blur");
            },500);
            $(".bg-pic2").on("webkitTransitionEnd",function(){
                main.p1();
            });
        }


    };
    main.oriHandle1 = function(e){
        if(window.orientation == 0 || window.orientation == 180 ) {//纵向
            $("#video").css({
                "transform-origin":"0 0 0",
                "transform":"translate3d(6.4rem,0,0) rotateZ(90deg)",
                "width":"11.36rem",
                "height":"6.4rem",
            });
            $(".skip").css({
                "width":"",
                "right":"",
                "bottom":"",
                "transform":""
            }).addClass("v");
        }
        else if(window.orientation == 90 || window.orientation == -90){//横向
            $("#video").css({
                "transform-origin":"",
                "transform":"",
                "width":"100%",
                "height":"6.4rem",
            });
            // $(".hp").show();

            $(".skip").removeClass("v");
            $(".skip").css({
                // "width":"0.2025rem",
                "right":"0.6rem",
                "bottom":"-0.1rem",
                "transform":"rotateZ(-90deg)"
            })
        }
    };
    main.oriHandle2 = function(e){
        if(window.orientation == 0 ) {
            $(".bg-pic2").addClass("blur");
            $(window).off("orientationchange",main.oriHandle2);
        }
    };
    main.oriHandle3 = function(){
        if(main.NeverP1){
            setTimeout(function(){
                $(".bg-pic2").addClass("blur");
            },500);
            $(".bg-pic2").on("webkitTransitionEnd",function(){
                main.p1();
            });
            main.NeverP1 = false;
        }
        if(window.orientation == 0 || window.orientation == 180 ) {
            $(".hp").hide();
        }
        else if(window.orientation == 90 || window.orientation == -90) {
            $(".hp").show();
        }
    };
    win.main = main;
}(window));
$(function(){
    main.init();
    main.addEvent();
    main.start();

});
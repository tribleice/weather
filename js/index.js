// 显示加载提示
$('.tip').show();

$(function() {

    // 获取城市历史记录
    var cities = localStorage.getItem('cities');

    cities = cities ? JSON.parse(cities) : [];

    // 配置对象收编变量
    var weather = {

        // 配置星期几
        weekDay: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],

        // 设置数据不重复获取
        isGet: false,

        // 标记下拉菜单中的内容是否变更
        isChange: false,

        // 配置请求参数
        parame: {
            key: '9ff6298ba54e49c88c1f88f431f971a1',
            url: 'https://devapi.qweather.com/v7/weather',
        },

        // 获取城市信息
        getCityinfo: function(city) {

            var self = this;

            $.ajax({
                type: 'GET',
                url: 'https://geoapi.qweather.com/v2/city/lookup',
                data: {
                    key: self.parame.key,
                    location: city,
                },
                success: function(data) {
                    // console.log('data ==>', data);
                    var cityLat = data.location[0].lat;
                    var cityLng = data.location[0].lon;

                    // 加载提示
                    $('.tip').show();

                    // 清空上次数据（动态创建的标签）
                    $('.hours-weather').html('');
                    $('.future-weather-box').html('');
                    $('.icon-content-icon').html('');
                    $('.air-life-list').html('');

                    self.getCurrentWeather(cityLat, cityLng);
                }
            })
        },

        // 获取实况天气
        getCurrentWeather: function(lat, lng) {

            var self = this;

            $.ajax({
                type: 'GET',
                url: self.parame.url + '/now',
                data: {
                    key: self.parame.key,
                    location: lng + ',' + lat,
                },
                success: function(result) {
                    // console.log('result ==>', result);
                    var result1 = result.now;

                    // 观测时间
                    var date1 = new Date().toLocaleDateString();
                    $('.date1').text(date1);

                    var date2 = new Date().getDay();
                    $('.date2').text(weather.weekDay[date2]);

                    //实时温度 
                    var tem = result1.temp + '℃';
                    $('.tem').text(tem);

                    // 天气状况
                    var weatherText = result1.text;
                    $('.icon-content-text').text(weatherText);

                    // 风向
                    var windDir = result1.windDir;
                    $('.wind-direction').text(windDir);

                    // 风速
                    var windSpeed = '风速：' + result1.windSpeed + 'km/h';
                    $('.wind-speed').text(windSpeed);

                    // 风力
                    var windScale = '风力：' + result1.windScale + '级';
                    $('.wind-force').text(windScale);

                    // 天气图标
                    var $embed = $(`<embed id="icon-content-icon"
                    type="image/svg+xml" 
                    src="./Image/icons/${result1.icon}.svg">`);

                    $('.icon-content-icon').append($embed);

                    self.getHoursWeather(lat, lng);
                },
            })
        },

        // 获取24小时天气
        getHoursWeather: function(lat, lng) {

            var self = this;

            $.ajax({
                type: 'GET',
                url: self.parame.url + '/24h',
                data: {
                    key: self.parame.key,
                    location: lng + ',' + lat,
                },
                success: function(result) {

                    // 获取24小时天气数据
                    var hourlyData = result.hourly;
                    // console.log('hourlyData ==>', hourlyData);

                    for (let i = 0; i < hourlyData.length; i++) {

                        // 截取时间
                        var time = new Date(hourlyData[i].fxTime);
                        time = time.toTimeString();
                        time = time.split(' ')[0].split(':').slice(0, 2).join(':');


                        var $li = $(` <li>
                        <div>${time}</div>
                        <div><embed src="./Image/icons/${hourlyData[i].icon}.svg" type="image/svg+xml"> </div>
                        <div>${hourlyData[i].temp}℃</div>
                        <div>${hourlyData[i].windDir}</div>
                    </li>`);

                        $('#hours-weather').append($li);

                    }
                    self.getFutureWeather(lat, lng);
                },
            })
        },

        // 获取未来7天天气
        getFutureWeather: function(lat, lng) {

            var self = this;

            $.ajax({
                type: 'GET',
                url: self.parame.url + '/7d',
                data: {
                    key: self.parame.key,
                    location: lng + ',' + lat,
                },
                success: function(result) {
                    // console.log('day ==>', result);

                    var futureWeather = result.daily;

                    for (let i = 0; i < futureWeather.length; i++) {

                        // 截取日期
                        var date = futureWeather[i].fxDate.split('-').slice(1).join('/');

                        var $div = $(` <div class="future-item">
                        <span class="future-date">${date}</span>
                        <span class="future-icon">
                            <embed class="f-icon" src="./Image/icons/${futureWeather[i].iconDay}.svg" type="image/svg+xml">
                        </span>
                        <span class="future-tem">${futureWeather[i].tempMin}℃~${futureWeather[i].tempMax}℃</span>
                        <span class="future-wind">${futureWeather[i].windDirDay}</span>
                    </div>`)

                        $('.future-weather-box').append($div);
                    }

                    weather.isGet = true;
                    self.getAIRquality(lat, lng);

                },
            })

        },

        // 获取空气质量
        getAIRquality: function(lat, lng) {

            var self = this;

            $.ajax({
                type: 'GET',
                url: 'https://devapi.qweather.com/v7/air/now',
                data: {
                    key: self.parame.key,
                    location: lng + ',' + lat,
                },
                success: function(result) {
                    // console.log('airquality ==>', result);

                    // 合并空气质量数据
                    for (let i = 0; i < air_life_data.ari_now_city.length; i++) {
                        var current = air_life_data.ari_now_city[i];
                        current.value = result.now[current.key];

                        var $li = $(`<li>
                        <span class="t1">${current.title}</span>
                        <span class="t2">${current.value}</span>
                    </li>`);

                        $('.air-life-list').append($li);
                    }
                    self.getLifequality(lat, lng);
                },
            })
        },

        // 获取生活指数
        getLifequality: function(lat, lng) {

            $.ajax({
                type: 'GET',
                url: 'https://devapi.qweather.com/v7/indices/1d',
                data: {
                    key: weather.parame.key,
                    location: lng + ',' + lat,
                    type: '0',
                },
                success: function(result) {
                    console.log('lifequality ==>', result);

                    for (let i = 0; i < air_life_data.life_style.length; i++) {

                        var current = air_life_data.life_style[i];

                        for (let j = 0; j < result.daily.length; j++) {

                            var currentData = result.daily[j];

                            if (current.key == currentData.type) {

                                current.value = currentData.category;
                                break;
                            }
                        }

                        var $li = $(`<li>
                        <span class="t1">${current.title}</span>
                        <span class="t2">${current.value}</span>
                    </li>`);

                        $('.air-life-list').append($li);
                    }
                    $('.tip').hide();
                    // console.log('da2 ==>', air_life_data.life_style);
                },

            })
        }
    }

    // 获取用户位置
    $.ajax({
        type: 'GET',
        url: 'https://apis.map.qq.com/ws/location/v1/ip',
        dataType: 'jsonp',
        data: {

            key: 'KKBBZ-3EHKW-PAERJ-RFDQI-35E2T-N4F2G',
            output: 'jsonp',

        },
        success: function(data) {
            // console.log('data ==>', data);

            // 获取城市
            var city = data.result.ad_info.city.replace(/市/, '');
            // 城市经纬度信息
            var cityLat = data.result.location.lat;
            var cityLng = data.result.location.lng;

            // 绑定用户位置数据
            $('#location-city').text(city);
            weather.getCurrentWeather(cityLat, cityLng);
        }
    })

    // 切换城市天气数据
    $('#search-icon').on('click', function() {

        // 获取定位城市
        var city = $('#search-box').val().replace(/市$/, '');
        // console.log('city ==>', city);

        // 拦截调用同一城市数据
        var currentCity = $('#location-city').text();

        if (city == currentCity) {
            return;
        }

        // 搜索框为空时禁止搜索
        if (city.trim() == '') {
            return;
        }

        $('#location-city').text(city);

        // 清空原先页面内容
        $('.air-life-list').html('');

        $('#search-box').val('');

        var c = city.replace(/市$/, '');

        // 防止重复存储数据
        if (cities.indexOf(c) == -1) {

            // 缓存城市历史记录
            cities.unshift(c);

            // 将cities写入本地存储
            var citiesString = JSON.stringify(cities);
            localStorage.setItem('cities', citiesString);
        }

        weather.getCityinfo(city);

        $('#list').hide();

        weather.isChange = false;

    })

    // 打开下拉菜单
    $('#search-box').on('focus', function() {

        // 若缓存数据没有变化，则不继续执行函数
        if (weather.isChange) {
            $('#list').show();
            return;
        }

        // 绑定缓存城市数据
        var citiesData = localStorage.getItem('cities');

        // 如果没有缓存数据，不显示下拉菜单
        citiesData = citiesData ? JSON.parse(citiesData) : [];

        if (citiesData.length == 0) {
            return;
        }

        weather.isChange = true;

        $('#list-tag').html('');

        for (let i = 0; i < citiesData.length; i++) {
            var $span = $(`<span>${citiesData[i]}<i class="close-icon"></i></span>`);
            $('#list-tag').append($span);
        }
        $('#list').show();
    })

    // 关闭下拉菜单
    $('#close').on('click', function() {
        $('#list').hide();
    })

    // 单个删除城市历史记录
    $('#list-tag').on('click', '.close-icon', function(e) {

        // 阻止事件冒泡
        e.stopPropagation();

        // 获取要删除的城市名
        var city = $(this).parent().text();

        // 获取缓存数据
        var citiesData = JSON.parse(localStorage.getItem('cities'));

        // 查找元素
        var index = citiesData.indexOf(city);

        citiesData.splice(index, 1);

        // 在本地缓存删除数据
        localStorage.setItem('cities', JSON.stringify(citiesData));

        // 移除页面历史记录
        $(this).parent().remove();

        // 若页面内无数据记录，则关闭菜单
        if (citiesData.length == 0) {
            $('#list').hide();
        }
    })

    // 全部删除
    $('.all-delete').on('click', function() {
        localStorage.setItem('cities', JSON.stringify([]));
        $('#list-tag').html('');
        $('#list').hide();
        weather.isChange = false;
    })

    // 为动态生成的下拉菜单标签绑定事件
    $('#list-tag').on('click', 'span', function() {

        // 获取标签内容
        var city = $(this).text();

        // 判断是否同一城市
        var currentCity = $('#location-city').text();
        if (city == currentCity) {
            console.log('目前一是');
            return;
        }

        // 显示加载提示
        $('#tip').show();

        $('#location-city').text(city);
        $('#search-box').val('');

        // 获取数据内容
        weather.getCityinfo(city);

        $('#list').hide();

    })


    // 配置空气质量与生活指数数据
    var air_life_data = {
        // 空气质量
        ari_now_city: [{
                title: '空气质量指数',
                key: 'aqi',
            },
            {
                title: '空气质量指数等级',
                key: 'level',
            },
            {
                title: '空气质量指数级别',
                key: 'category',
            },
            {
                title: '空气质量的主要污染物',
                key: 'primary',
            },
            {
                title: 'PM2.5',
                key: 'pm2p5',
            },
            {
                title: 'PM10',
                key: 'pm10',
            },
            {
                title: '一氧化碳',
                key: 'co',
            },
            {
                title: '二氧化氮',
                key: 'no2',
            },
            {
                title: '臭氧',
                key: 'o3',
            },
            {
                title: '二氧化硫',
                key: 'so2',
            },
        ],

        // 生活指数
        life_style: [{
                title: '运动指数',
                key: '1',
            },
            {
                title: '穿衣指数',
                key: '3',
            },
            {
                title: '紫外线指数',
                key: '5',
            },
            {
                title: '旅游指数',
                key: '6',
            },
            {
                title: '舒适度指数',
                key: '8',
            },
            {
                title: '感冒指数',
                key: '9',
            },
            {
                title: '晾晒指数',
                key: '14',
            },
        ]
    }

    // 空气质量与生活指数

    // 点击打开页面
    $('.weather-status').on('click', function() {

        $('.air-life-box').show().animate({
            top: 0
        }, 300)
    })

    // 点击关闭页面
    $('.air-life-box').on('click', function(e) {

        if (e.target == this) {

            $(this).animate({
                top: '100%'
            }, 300, function() {
                $(this).hide();
            })
        }
    })

})
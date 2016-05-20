/* Nite-d3 v1.0
 * A tiny library to create a night overlay on d3 maps
 * Author: Rossen Georgiev @ https://github.com/rossengeorgiev for google maps
 *         Jeremy Whitbred (@pazrul) d3 conversion
 * Requires: d3.geo
 */

var nite = {
    map: null,
    date: null,
    marker_sun: null,
    marker_shadow: null,
    marker_shadow_lite: null,
    shadow_radius: parseInt(6371 * Math.PI * 500),
    sun_position: null,
    path: null,
    circle: d3.geo.circle(),
    twilightAngle: 90,
    nightAngle: 87,
    color: '#000',
    opacity: '0.25',

    init: function (map, config) {
        this.map = map;
        config = config || {};
        this.sun_position = this.calculatePositionOfSun();
        this.color = config.color || this.color;
        this.opacity = config.opacity || this.opacity;
        this.path = d3.geo.path().projection(projection);

        this.marker_shadow = svg.selectAll('path.nite-shadow-twilight')
            .data([this.getShadowPosition()])
          .enter().append('path')
            .datum(function (d) {
                return nite.circle
                   .origin([d[0], d[1]])
                   .angle(nite.twilightAngle)();
            })
            .attr('class', 'nite-shadow-twilight')
            .attr('display', 'block')
            .attr('d', nite.path)
            .attr('fill', nite.color)
            .attr('opacity', nite.opacity);

        this.marker_shadow_lite = svg.selectAll('path.nite-shadow-night')
            .data([this.getShadowPosition()])
          .enter().append('path')
            .datum(function (d) {
               return nite.circle
                   .origin([d[0], d[1]])
                   .angle(nite.nightAngle)();
            })
            .attr('class', 'nite-shadow-night')
            .attr('display', 'block')
            .attr('d', nite.path)
            .attr('fill', nite.color)
            .attr('opacity', nite.opacity);
    },
    getSunPosition: function () {
        return [this.sun_position.lng, this.sun_position.lat];
    },
    getShadowPosition: function () {
        return (this.sun_position) ? [this.sun_position.lng + 180, -this.sun_position.lat] : null;
    },
    refresh: function () {
        if (!this.isVisible()) return;
        this.sun_position = this.calculatePositionOfSun(this.date);

        this.marker_shadow = svg.selectAll('path.nite-shadow-twilight').data([this.getShadowPosition()])
            .datum(function (d) {
                return nite.circle
                   .origin([d[0], d[1]])
                   .angle(nite.twilightAngle)();
            })
            .attr('d', nite.path);

        this.marker_shadow_lite = svg.selectAll('path.nite-shadow-night').data([this.getShadowPosition()])
            .datum(function (d) {
                return nite.circle
                    .origin([d[0], d[1]])
                    .angle(nite.nightAngle)();
            })
            .attr('d', nite.path);



    },
    jday: function (date) {
        return (date.getTime() / 86400000.0) + 2440587.5;
    },
    calculatePositionOfSun: function (date) {
        date = (date instanceof Date) ? date : new Date();

        var rad = 0.017453292519943295;

        // based on NOAA solar calculations
        var mins_past_midnight = (date.getUTCHours() * 60 + date.getUTCMinutes()) / 1440;
        var jc = (this.jday(date) - 2451545) / 36525;
        var mean_long_sun = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
        var mean_anom_sun = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
        var sun_eq = Math.sin(rad * mean_anom_sun) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) + Math.sin(rad * 2 * mean_anom_sun) * (0.019993 - 0.000101 * jc) + Math.sin(rad * 3 * mean_anom_sun) * 0.000289;
        var sun_true_long = mean_long_sun + sun_eq;
        var sun_app_long = sun_true_long - 0.00569 - 0.00478 * Math.sin(rad * 125.04 - 1934.136 * jc);
        var mean_obliq_ecliptic = 23 + (26 + ((21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813)))) / 60) / 60;
        var obliq_corr = mean_obliq_ecliptic + 0.00256 * Math.cos(rad * 125.04 - 1934.136 * jc);

        var lat = Math.asin(Math.sin(rad * obliq_corr) * Math.sin(rad * sun_app_long)) / rad;

        var eccent = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
        var y = Math.tan(rad * (obliq_corr / 2)) * Math.tan(rad * (obliq_corr / 2));
        var rq_of_time = 4 * ((y * Math.sin(2 * rad * mean_long_sun) - 2 * eccent * Math.sin(rad * mean_anom_sun) + 4 * eccent * y * Math.sin(rad * mean_anom_sun) * Math.cos(2 * rad * mean_long_sun) - 0.5 * y * y * Math.sin(4 * rad * mean_long_sun) - 1.25 * eccent * eccent * Math.sin(2 * rad * mean_anom_sun)) / rad);
        var true_solar_time = (mins_past_midnight * 1440 + rq_of_time) % 1440;
        var lng = -((true_solar_time / 4 < 0) ? true_solar_time / 4 + 180 : true_solar_time / 4 - 180);

        return {lng: lng, lat: lat};
    },
    setDate: function (date) {
        this.date = date;
        this.refresh();
    },
    setMap: function (map) {
        this.map = map;
        // This needs to change
        // this.marker_shadow.setMap(this.map);
        // this.marker_shadow_lite.setMap(this.map);
    },
    show: function () {
        this.marker_shadow.attr('display', 'block');
        this.marker_shadow_lite.attr('display', 'block');
        this.refresh();

    },
    hide: function () {
        this.marker_shadow.attr('display', 'none');
        this.marker_shadow_lite.attr('display', 'none');

    },
    isVisible: function () {
        return this.marker_shadow.attr('display') !== 'none';
    }
}
